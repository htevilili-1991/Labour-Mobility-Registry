<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class RegistryBatch extends Model
{
    use HasFactory;

    protected $fillable = [
        'name',
        'batch_type',
        'scheme',
        'period_start',
        'period_end',
        'status',
        'description',
        'record_count',
        'submitted_by',
        'verified_by',
        'approved_by',
        'submitted_at',
        'verified_at',
        'approved_at',
        'rejection_reason',
        'verification_notes',
        'approval_notes',
        'metadata',
    ];

    protected $casts = [
        'period_start' => 'date',
        'period_end' => 'date',
        'submitted_at' => 'datetime',
        'verified_at' => 'datetime',
        'approved_at' => 'datetime',
        'metadata' => 'array',
    ];

    public function submittedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'submitted_by');
    }

    public function verifiedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'verified_by');
    }

    public function approvedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'approved_by');
    }

    public function registryEntries(): HasMany
    {
        return $this->hasMany(Registry::class, 'registry_batch_id');
    }

    public function approvals(): HasMany
    {
        return $this->hasMany(RegistryBatchApproval::class);
    }

    public function auditTrail(): HasMany
    {
        return $this->hasMany(VerificationAuditTrail::class);
    }

    public function canBeEdited(): bool
    {
        return in_array($this->status, ['draft']);
    }

    public function canBeSubmitted(): bool
    {
        return in_array($this->status, ['draft']) && $this->record_count > 0;
    }

    public function canBeVerified(): bool
    {
        return in_array($this->status, ['submitted']);
    }

    public function canBeApproved(): bool
    {
        return in_array($this->status, ['under_review']);
    }

    public function canBeRejected(): bool
    {
        return in_array($this->status, ['submitted', 'under_review']);
    }

    public function submit(): void
    {
        $this->status = 'submitted';
        $this->submitted_by = auth()->id();
        $this->submitted_at = now();
        $this->save();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'submitted',
            'description' => "Batch '{$this->name}' submitted for verification",
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Create approval record
        RegistryBatchApproval::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'submitted',
            'comments' => 'Batch submitted for verification',
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function verify(array $verificationData): void
    {
        $this->status = 'under_review';
        $this->verified_by = auth()->id();
        $this->verified_at = now();
        $this->verification_notes = $verificationData['notes'] ?? null;
        $this->save();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'verified',
            'description' => "Batch '{$this->name}' verified",
            'new_values' => [
                'verification_notes' => $verificationData['notes'] ?? null,
                'discrepancies_found' => $verificationData['discrepancies'] ?? [],
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Create approval record
        RegistryBatchApproval::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'verified',
            'comments' => $verificationData['notes'] ?? null,
            'discrepancies_found' => $verificationData['discrepancies'] ?? [],
            'verification_checklist' => $verificationData['checklist'] ?? [],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function approve(array $approvalData): void
    {
        $this->status = 'approved';
        $this->approved_by = auth()->id();
        $this->approved_at = now();
        $this->approval_notes = $approvalData['notes'] ?? null;
        $this->save();

        // Lock all registry entries in this batch
        $this->registryEntries()->update([
            'is_locked' => true,
            'locked_at' => now(),
            'locked_by' => auth()->id(),
        ]);

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'approved',
            'description' => "Batch '{$this->name}' approved and locked",
            'new_values' => [
                'approval_notes' => $approvalData['notes'] ?? null,
                'records_locked' => $this->registryEntries()->count(),
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Create approval record
        RegistryBatchApproval::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'approved',
            'comments' => $approvalData['notes'] ?? null,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }

    public function reject(string $reason): void
    {
        $this->status = 'rejected';
        $this->rejection_reason = $reason;
        $this->save();

        // Create audit trail entry
        VerificationAuditTrail::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'rejected',
            'description' => "Batch '{$this->name}' rejected",
            'new_values' => [
                'rejection_reason' => $reason,
            ],
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        // Create approval record
        RegistryBatchApproval::create([
            'registry_batch_id' => $this->id,
            'user_id' => auth()->id(),
            'action' => 'rejected',
            'comments' => $reason,
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);
    }
}
