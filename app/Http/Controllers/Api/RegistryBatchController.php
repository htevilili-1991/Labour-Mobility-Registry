<?php

namespace App\Http\Controllers\Api;

use App\Models\RegistryBatch;
use App\Models\Registry;
use App\Models\VerificationAuditTrail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Illuminate\Validation\Rule;
use App\Http\Resources\RegistryBatchResource;
use App\Http\Resources\RegistryBatchCollection;
use App\Http\Resources\RegistryEntryCollection;
use App\Http\Resources\AuditTrailCollection;

class RegistryBatchController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('permission:batches.view')->only(['index', 'show']);
        $this->middleware('permission:batches.create')->only(['store']);
        $this->middleware('permission:batches.edit')->only(['update', 'destroy']);
        $this->middleware('permission:batches.submit')->only(['submit']);
    }

    /**
     * Display a listing of registry batches.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy']);

        // Apply filters
        if ($request->scheme) {
            $query->where('scheme', $request->scheme);
        }
        if ($request->status) {
            $query->where('status', $request->status);
        }
        if ($request->batch_type) {
            $query->where('batch_type', $request->batch_type);
        }
        if ($request->period_start) {
            $query->where('period_start', '>=', $request->period_start);
        }
        if ($request->period_end) {
            $query->where('period_end', '<=', $request->period_end);
        }
        if ($request->search) {
            $query->where('name', 'like', '%' . $request->search . '%');
        }

        $batches = $query->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 15));

        return response()->json(new RegistryBatchCollection($batches));
    }

    /**
     * Store a newly created registry batch.
     */
    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'batch_type' => 'required|in:inbound,outbound,earnings,returns',
            'scheme' => 'required|in:RSE,SWP,PALM',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'description' => 'nullable|string',
        ]);

        $batch = RegistryBatch::create([
            'name' => $validated['name'],
            'batch_type' => $validated['batch_type'],
            'scheme' => $validated['scheme'],
            'period_start' => $validated['period_start'],
            'period_end' => $validated['period_end'],
            'description' => $validated['description'],
            'status' => 'draft',
            'submitted_by' => Auth::id(),
        ]);

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $batch->id,
            'user_id' => Auth::id(),
            'action' => 'created',
            'description' => "Batch '{$batch->name}' created via API",
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(new RegistryBatchResource($batch), 201);
    }

    /**
     * Display the specified registry batch.
     */
    public function show(RegistryBatch $batch): JsonResponse
    {
        $batch->load(['submittedBy', 'verifiedBy', 'approvedBy', 'registryEntries', 'approvals', 'auditTrail']);
        
        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Update the specified registry batch.
     */
    public function update(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeEdited()) {
            return response()->json([
                'message' => 'This batch cannot be edited.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'batch_type' => 'sometimes|required|in:inbound,outbound,earnings,returns',
            'scheme' => 'sometimes|required|in:RSE,SWP,PALM',
            'period_start' => 'sometimes|required|date',
            'period_end' => 'sometimes|required|date|after_or_equal:period_start',
            'description' => 'nullable|string',
        ]);

        $oldValues = $batch->only(['name', 'batch_type', 'scheme', 'period_start', 'period_end', 'description']);
        
        $batch->update($validated);

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $batch->id,
            'user_id' => Auth::id(),
            'action' => 'updated',
            'description' => "Batch '{$batch->name}' updated via API",
            'old_values' => $oldValues,
            'new_values' => $validated,
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Remove the specified registry batch.
     */
    public function destroy(RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeEdited()) {
            return response()->json([
                'message' => 'This batch cannot be deleted.',
                'status' => 'error'
            ], 403);
        }

        $batch->delete();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $batch->id,
            'user_id' => Auth::id(),
            'action' => 'deleted',
            'description' => "Batch '{$batch->name}' deleted via API",
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json(null, 204);
    }

    /**
     * Submit a batch for verification.
     */
    public function submit(RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeSubmitted()) {
            return response()->json([
                'message' => 'This batch cannot be submitted.',
                'status' => 'error'
            ], 403);
        }

        $batch->submit();

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Add registry entries to a batch.
     */
    public function addEntries(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeEdited()) {
            return response()->json([
                'message' => 'This batch cannot be modified.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'registry_ids' => 'required|array',
            'registry_ids.*' => 'exists:registry,id',
        ]);

        // Update registry entries to belong to this batch
        Registry::whereIn('id', $validated['registry_ids'])
            ->whereNull('registry_batch_id')
            ->update(['registry_batch_id' => $batch->id]);

        // Update batch record count
        $batch->record_count = $batch->registryEntries()->count();
        $batch->save();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $batch->id,
            'user_id' => Auth::id(),
            'action' => 'entries_added',
            'description' => count($validated['registry_ids']) . ' entries added to batch via API',
            'new_values' => ['registry_ids' => $validated['registry_ids']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Registry entries added successfully',
            'batch' => new RegistryBatchResource($batch)
        ]);
    }

    /**
     * Remove registry entries from a batch.
     */
    public function removeEntries(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeEdited()) {
            return response()->json([
                'message' => 'This batch cannot be modified.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'registry_ids' => 'required|array',
            'registry_ids.*' => 'exists:registry,id',
        ]);

        // Remove registry entries from this batch
        Registry::whereIn('id', $validated['registry_ids'])
            ->where('registry_batch_id', $batch->id)
            ->update(['registry_batch_id' => null]);

        // Update batch record count
        $batch->record_count = $batch->registryEntries()->count();
        $batch->save();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $batch->id,
            'user_id' => Auth::id(),
            'action' => 'entries_removed',
            'description' => count($validated['registry_ids']) . ' entries removed from batch via API',
            'new_values' => ['registry_ids' => $validated['registry_ids']],
            'ip_address' => $request->ip(),
            'user_agent' => $request->userAgent(),
        ]);

        return response()->json([
            'message' => 'Registry entries removed successfully',
            'batch' => new RegistryBatchResource($batch)
        ]);
    }

    /**
     * Get registry entries for a batch.
     */
    public function entries(RegistryBatch $batch): JsonResponse
    {
        $entries = $batch->registryEntries()->get();
        
        return response()->json(new RegistryEntryCollection($entries));
    }

    /**
     * Get batch statistics.
     */
    public function statistics(): JsonResponse
    {
        $stats = [
            'total_batches' => RegistryBatch::count(),
            'draft_batches' => RegistryBatch::where('status', 'draft')->count(),
            'submitted_batches' => RegistryBatch::where('status', 'submitted')->count(),
            'under_review_batches' => RegistryBatch::where('status', 'under_review')->count(),
            'approved_batches' => RegistryBatch::where('status', 'approved')->count(),
            'rejected_batches' => RegistryBatch::where('status', 'rejected')->count(),
            'total_records' => Registry::count(),
            'batched_records' => Registry::whereNotNull('registry_batch_id')->count(),
            'unbatched_records' => Registry::whereNull('registry_batch_id')->count(),
        ];

        // Stats by scheme
        $stats['by_scheme'] = [
            'RSE' => RegistryBatch::where('scheme', 'RSE')->count(),
            'SWP' => RegistryBatch::where('scheme', 'SWP')->count(),
            'PALM' => RegistryBatch::where('scheme', 'PALM')->count(),
        ];

        // Stats by type
        $stats['by_type'] = [
            'inbound' => RegistryBatch::where('batch_type', 'inbound')->count(),
            'outbound' => RegistryBatch::where('batch_type', 'outbound')->count(),
            'earnings' => RegistryBatch::where('batch_type', 'earnings')->count(),
            'returns' => RegistryBatch::where('batch_type', 'returns')->count(),
        ];

        return response()->json($stats);
    }
}
