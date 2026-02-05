<?php

namespace App\Http\Controllers\Api;

use App\Models\RegistryBatch;
use App\Models\RegistryBatchApproval;
use App\Models\VerificationAuditTrail;
use Illuminate\Http\Request;
use Illuminate\Http\JsonResponse;
use Illuminate\Support\Facades\Auth;
use App\Http\Resources\RegistryBatchResource;
use App\Http\Resources\RegistryBatchCollection;
use App\Http\Resources\ApprovalCollection;
use App\Http\Resources\AuditTrailCollection;

class VerificationController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
        $this->middleware('permission:batches.verify')->only(['index', 'show', 'verify']);
        $this->middleware('permission:batches.approve')->only(['approve']);
        $this->middleware('permission:batches.reject')->only(['reject']);
        $this->middleware('permission:batches.audit')->only(['auditTrail']);
    }

    /**
     * Display a listing of batches for verification.
     */
    public function index(Request $request): JsonResponse
    {
        $query = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy'])
            ->whereIn('status', ['submitted', 'under_review', 'approved', 'rejected']);

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
     * Display the specified batch for verification.
     */
    public function show(RegistryBatch $batch): JsonResponse
    {
        $batch->load([
            'submittedBy', 
            'verifiedBy', 
            'approvedBy', 
            'registryEntries',
            'approvals' => function ($query) {
                $query->with('user')->orderBy('created_at', 'desc');
            },
            'auditTrail' => function ($query) {
                $query->with('user')->orderBy('action_at', 'desc');
            }
        ]);

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Verify a batch.
     */
    public function verify(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeVerified()) {
            return response()->json([
                'message' => 'This batch cannot be verified.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
            'discrepancies' => 'nullable|array',
            'discrepancies.*.description' => 'required|string',
            'discrepancies.*.severity' => 'required|in:low,medium,high',
            'checklist' => 'nullable|array',
            'checklist.*.item' => 'required|string',
            'checklist.*.completed' => 'required|boolean',
        ]);

        $verificationData = [
            'notes' => $validated['notes'] ?? null,
            'discrepancies' => $validated['discrepancies'] ?? [],
            'checklist' => $validated['checklist'] ?? [],
        ];

        $batch->verify($verificationData);

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Approve a batch.
     */
    public function approve(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeApproved()) {
            return response()->json([
                'message' => 'This batch cannot be approved.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'notes' => 'nullable|string',
        ]);

        $approvalData = [
            'notes' => $validated['notes'] ?? null,
        ];

        $batch->approve($approvalData);

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Reject a batch.
     */
    public function reject(Request $request, RegistryBatch $batch): JsonResponse
    {
        if (!$batch->canBeRejected()) {
            return response()->json([
                'message' => 'This batch cannot be rejected.',
                'status' => 'error'
            ], 403);
        }

        $validated = $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $batch->reject($validated['reason']);

        return response()->json(new RegistryBatchResource($batch));
    }

    /**
     * Get audit trail for a batch.
     */
    public function auditTrail(RegistryBatch $batch): JsonResponse
    {
        $auditTrail = $batch->auditTrail()
            ->with('user')
            ->orderBy('action_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json(new AuditTrailCollection($auditTrail));
    }

    /**
     * Get approval history for a batch.
     */
    public function approvals(RegistryBatch $batch): JsonResponse
    {
        $approvals = $batch->approvals()
            ->with('user')
            ->orderBy('created_at', 'desc')
            ->paginate($request->get('per_page', 50));

        return response()->json(new ApprovalCollection($approvals));
    }

    /**
     * Get verification dashboard statistics.
     */
    public function dashboard(): JsonResponse
    {
        $stats = [
            'total_batches' => RegistryBatch::count(),
            'draft_batches' => RegistryBatch::where('status', 'draft')->count(),
            'submitted_batches' => RegistryBatch::where('status', 'submitted')->count(),
            'under_review_batches' => RegistryBatch::where('status', 'under_review')->count(),
            'approved_batches' => RegistryBatch::where('status', 'approved')->count(),
            'rejected_batches' => RegistryBatch::where('status', 'rejected')->count(),
        ];

        // Recent batches
        $recentBatches = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy'])
            ->whereIn('status', ['submitted', 'under_review', 'approved', 'rejected'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        // Pending verification
        $pendingVerification = RegistryBatch::where('status', 'submitted')
            ->with('submittedBy')
            ->orderBy('submitted_at', 'asc')
            ->get();

        // Urgent batches (submitted more than 7 days ago)
        $urgentBatches = RegistryBatch::where('status', 'submitted')
            ->where('submitted_at', '<', now()->subDays(7))
            ->with('submittedBy')
            ->orderBy('submitted_at', 'asc')
            ->get();

        return response()->json([
            'stats' => $stats,
            'recentBatches' => new RegistryBatchCollection($recentBatches),
            'pendingVerification' => new RegistryBatchCollection($pendingVerification),
            'urgentBatches' => new RegistryBatchCollection($urgentBatches),
        ]);
    }

    /**
     * Get verification metrics.
     */
    public function metrics(): JsonResponse
    {
        $metrics = [
            // Average verification time
            'avg_verification_time' => RegistryBatch::whereNotNull('verified_at')
                ->whereNotNull('submitted_at')
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (verified_at - submitted_at))/3600) as avg_hours')
                ->value('avg_hours'),

            // Average approval time
            'avg_approval_time' => RegistryBatch::whereNotNull('approved_at')
                ->whereNotNull('verified_at')
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (approved_at - verified_at))/3600) as avg_hours')
                ->value('avg_hours'),

            // Total approval time
            'avg_total_time' => RegistryBatch::whereNotNull('approved_at')
                ->whereNotNull('submitted_at')
                ->selectRaw('AVG(EXTRACT(EPOCH FROM (approved_at - submitted_at))/3600) as avg_hours')
                ->value('avg_hours'),

            // Approval rate
            'approval_rate' => RegistryBatch::whereIn('status', ['approved', 'rejected'])->count() > 0
                ? RegistryBatch::where('status', 'approved')->count() / RegistryBatch::whereIn('status', ['approved', 'rejected'])->count() * 100
                : 0,

            // Rejection rate
            'rejection_rate' => RegistryBatch::whereIn('status', ['approved', 'rejected'])->count() > 0
                ? RegistryBatch::where('status', 'rejected')->count() / RegistryBatch::whereIn('status', ['approved', 'rejected'])->count() * 100
                : 0,
        ];

        // Monthly trends
        $monthlyTrends = RegistryBatch::selectRaw(
                'DATE_TRUNC("month", created_at) as month, '
                . 'COUNT(*) as total, '
                . 'SUM(CASE WHEN status = "approved" THEN 1 ELSE 0 END) as approved, '
                . 'SUM(CASE WHEN status = "rejected" THEN 1 ELSE 0 END) as rejected'
            )
            ->where('created_at', '>=', now()->subMonths(12))
            ->groupBy('month')
            ->orderBy('month')
            ->get();

        $metrics['monthly_trends'] = $monthlyTrends;

        return response()->json($metrics);
    }
}
