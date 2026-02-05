<?php

namespace App\Http\Controllers;

use App\Models\RegistryBatch;
use App\Models\RegistryBatchApproval;
use App\Models\VerificationAuditTrail;
use Illuminate\Http\Request;
use Inertia\Inertia;

class VerificationController extends Controller
{
    public function index(Request $request)
    {
        $batches = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy'])
            ->whereIn('status', ['submitted', 'under_review', 'approved', 'rejected'])
            ->when($request->scheme, function ($query, $scheme) {
                $query->where('scheme', $scheme);
            })
            ->when($request->status, function ($query, $status) {
                $query->where('status', $status);
            })
            ->when($request->batch_type, function ($query, $type) {
                $query->where('batch_type', $type);
            })
            ->orderBy('created_at', 'desc')
            ->get();

        $schemes = ['RSE', 'SWP', 'PALM'];
        $batchTypes = ['inbound', 'outbound', 'earnings', 'returns'];
        $statuses = ['submitted', 'under_review', 'approved', 'rejected'];

        return Inertia::render('Verification/Index', [
            'batches' => $batches,
            'filters' => [
                'scheme' => $request->scheme,
                'batch_type' => $request->batch_type,
                'status' => $request->status,
            ],
            'schemes' => $schemes,
            'batchTypes' => $batchTypes,
            'statuses' => $statuses,
        ]);
    }

    public function show(RegistryBatch $batch)
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

        return Inertia::render('Verification/Show', [
            'batch' => $batch,
            'registryEntries' => $batch->registryEntries,
            'approvals' => $batch->approvals,
            'auditTrail' => $batch->auditTrail,
        ]);
    }

    public function verify(Request $request, RegistryBatch $batch)
    {
        if (!$batch->canBeVerified()) {
            return back()->with('error', 'This batch cannot be verified.');
        }

        $request->validate([
            'notes' => 'nullable|string',
            'discrepancies' => 'nullable|array',
            'discrepancies.*.description' => 'required|string',
            'discrepancies.*.severity' => 'required|in:low,medium,high',
            'checklist' => 'nullable|array',
            'checklist.*.item' => 'required|string',
            'checklist.*.completed' => 'required|boolean',
        ]);

        $verificationData = [
            'notes' => $request->notes,
            'discrepancies' => $request->discrepancies ?? [],
            'checklist' => $request->checklist ?? [],
        ];

        $batch->verify($verificationData);

        return redirect()->route('verification.show', $batch)
            ->with('success', 'Batch verified successfully.');
    }

    public function approve(Request $request, RegistryBatch $batch)
    {
        if (!$batch->canBeApproved()) {
            return back()->with('error', 'This batch cannot be approved.');
        }

        $request->validate([
            'notes' => 'nullable|string',
        ]);

        $approvalData = [
            'notes' => $request->notes,
        ];

        $batch->approve($approvalData);

        return redirect()->route('verification.show', $batch)
            ->with('success', 'Batch approved and locked successfully.');
    }

    public function reject(Request $request, RegistryBatch $batch)
    {
        if (!$batch->canBeRejected()) {
            return back()->with('error', 'This batch cannot be rejected.');
        }

        $request->validate([
            'reason' => 'required|string|min:10',
        ]);

        $batch->reject($request->reason);

        return redirect()->route('verification.show', $batch)
            ->with('success', 'Batch rejected successfully.');
    }

    public function auditTrail(RegistryBatch $batch)
    {
        $auditTrail = $batch->auditTrail()
            ->with('user')
            ->orderBy('action_at', 'desc')
            ->get();

        return Inertia::render('Verification/AuditTrail', [
            'batch' => $batch,
            'auditTrail' => $auditTrail,
        ]);
    }

    public function dashboard()
    {
        $stats = [
            'total_batches' => RegistryBatch::count(),
            'draft_batches' => RegistryBatch::where('status', 'draft')->count(),
            'submitted_batches' => RegistryBatch::where('status', 'submitted')->count(),
            'under_review_batches' => RegistryBatch::where('status', 'under_review')->count(),
            'approved_batches' => RegistryBatch::where('status', 'approved')->count(),
            'rejected_batches' => RegistryBatch::where('status', 'rejected')->count(),
        ];

        $recentBatches = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy'])
            ->whereIn('status', ['submitted', 'under_review', 'approved', 'rejected'])
            ->orderBy('created_at', 'desc')
            ->limit(10)
            ->get();

        $pendingVerification = RegistryBatch::where('status', 'submitted')
            ->with('submittedBy')
            ->orderBy('submitted_at', 'asc')
            ->get();

        return Inertia::render('Verification/Dashboard', [
            'stats' => $stats,
            'recentBatches' => $recentBatches,
            'pendingVerification' => $pendingVerification,
        ]);
    }
}
