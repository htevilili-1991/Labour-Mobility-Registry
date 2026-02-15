<?php

namespace App\Http\Controllers;

use App\Models\Registry;
use App\Models\RegistryBatch;
use App\Models\User;
use App\Notifications\BatchSubmittedForVerification;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class RegistryBatchController extends Controller
{
    public function index(Request $request)
    {
        $batches = RegistryBatch::with(['submittedBy', 'verifiedBy', 'approvedBy'])
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
        $statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];

        return Inertia::render('batches/Index', [
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

    public function create()
    {
        $schemes = ['RSE', 'SWP', 'PALM'];
        $batchTypes = ['inbound', 'outbound', 'earnings', 'returns'];

        return Inertia::render('batches/Create', [
            'schemes' => $schemes,
            'batchTypes' => $batchTypes,
        ]);
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'batch_type' => 'required|in:inbound,outbound,earnings,returns',
            'scheme' => 'required|in:RSE,SWP,PALM',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'description' => 'nullable|string',
        ]);

        $batch = RegistryBatch::create([
            'name' => $request->name,
            'batch_type' => $request->batch_type,
            'scheme' => $request->scheme,
            'period_start' => $request->period_start,
            'period_end' => $request->period_end,
            'description' => $request->description,
            'status' => 'draft',
            'submitted_by' => auth()->id(),
        ]);

        return redirect()->route('batches.show', $batch)
            ->with('success', 'Batch created successfully.');
    }

    public function show(RegistryBatch $batch)
    {
        $batch->load(['submittedBy', 'verifiedBy', 'approvedBy', 'registryEntries']);

        return Inertia::render('batches/Show', [
            'batch' => $batch,
            'registryEntries' => $batch->registryEntries,
        ]);
    }

    public function edit(RegistryBatch $batch)
    {
        if (! $batch->canBeEdited()) {
            return back()->with('error', 'This batch cannot be edited.');
        }

        $schemes = ['RSE', 'SWP', 'PALM'];
        $batchTypes = ['inbound', 'outbound', 'earnings', 'returns'];

        return Inertia::render('batches/Edit', [
            'batch' => $batch,
            'schemes' => $schemes,
            'batchTypes' => $batchTypes,
        ]);
    }

    public function update(Request $request, RegistryBatch $batch)
    {
        if (! $batch->canBeEdited()) {
            return back()->with('error', 'This batch cannot be edited.');
        }

        $request->validate([
            'name' => 'required|string|max:255',
            'batch_type' => 'required|in:inbound,outbound,earnings,returns',
            'scheme' => 'required|in:RSE,SWP,PALM',
            'period_start' => 'required|date',
            'period_end' => 'required|date|after_or_equal:period_start',
            'description' => 'nullable|string',
        ]);

        $batch->update($request->only(['name', 'batch_type', 'scheme', 'period_start', 'period_end', 'description']));

        return redirect()->route('batches.show', $batch)
            ->with('success', 'Batch updated successfully.');
    }

    public function submit(RegistryBatch $batch)
    {
        if (! $batch->canBeSubmitted()) {
            return back()->with('error', 'This batch cannot be submitted.');
        }

        $batch->submit();
        $batch->load('submittedBy');

        // Notify Labour Verification team via database notifications
        try {
            $verificationStaff = User::withPermission('batches.verify')->get();
            foreach ($verificationStaff as $staff) {
                $staff->notify(new BatchSubmittedForVerification($batch));
            }
        } catch (\Exception $e) {
            Log::error('Error sending batch submission notifications: '.$e->getMessage());
        }

        return redirect()->route('batches.show', $batch)
            ->with('success', 'Batch submitted for verification. Verification staff have been notified.');
    }

    public function destroy(RegistryBatch $batch)
    {
        if (! $batch->canBeEdited()) {
            return back()->with('error', 'This batch cannot be deleted.');
        }

        $batch->delete();

        return redirect()->route('batches.index')
            ->with('success', 'Batch deleted successfully.');
    }

    public function addRegistryEntries(Request $request, RegistryBatch $batch)
    {
        if (! $batch->canBeEdited()) {
            return back()->with('error', 'This batch cannot be modified.');
        }

        $request->validate([
            'registry_ids' => 'required|array',
            'registry_ids.*' => 'exists:registry,id',
        ]);

        // Update registry entries to belong to this batch
        Registry::whereIn('id', $request->registry_ids)
            ->whereNull('registry_batch_id')
            ->update(['registry_batch_id' => $batch->id]);

        // Update batch record count
        $batch->record_count = $batch->registryEntries()->count();
        $batch->save();

        return redirect()->route('batches.show', $batch)
            ->with('success', 'Registry entries added to batch.');
    }

    public function removeRegistryEntries(Request $request, RegistryBatch $batch)
    {
        if (! $batch->canBeEdited()) {
            return back()->with('error', 'This batch cannot be modified.');
        }

        $request->validate([
            'registry_ids' => 'required|array',
            'registry_ids.*' => 'exists:registry,id',
        ]);

        // Remove registry entries from this batch
        Registry::whereIn('id', $request->registry_ids)
            ->where('registry_batch_id', $batch->id)
            ->update(['registry_batch_id' => null]);

        // Update batch record count
        $batch->record_count = $batch->registryEntries()->count();
        $batch->save();

        return redirect()->route('batches.show', $batch)
            ->with('success', 'Registry entries removed from batch.');
    }
}
