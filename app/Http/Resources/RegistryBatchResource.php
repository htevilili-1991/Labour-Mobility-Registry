<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class RegistryBatchResource extends JsonResource
{
    /**
     * Transform the resource into an array.
     *
     * @return array<string, mixed>
     */
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'batch_type' => $this->batch_type,
            'scheme' => $this->scheme,
            'period_start' => $this->period_start,
            'period_end' => $this->period_end,
            'status' => $this->status,
            'description' => $this->description,
            'record_count' => $this->record_count,
            'submitted_by' => $this->submitted_by,
            'verified_by' => $this->verified_by,
            'approved_by' => $this->approved_by,
            'submitted_at' => $this->submitted_at,
            'verified_at' => $this->verified_at,
            'approved_at' => $this->approved_at,
            'rejection_reason' => $this->rejection_reason,
            'verification_notes' => $this->verification_notes,
            'approval_notes' => $this->approval_notes,
            'metadata' => $this->metadata,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
            
            // Relationships
            'submittedBy' => $this->when($this->submittedBy, function () {
                return [
                    'id' => $this->submittedBy->id,
                    'name' => $this->submittedBy->name,
                    'email' => $this->submittedBy->email,
                ];
            }),
            'verifiedBy' => $this->when($this->verifiedBy, function () {
                return [
                    'id' => $this->verifiedBy->id,
                    'name' => $this->verifiedBy->name,
                    'email' => $this->verifiedBy->email,
                ];
            }),
            'approvedBy' => $this->when($this->approvedBy, function () {
                return [
                    'id' => $this->approvedBy->id,
                    'name' => $this->approvedBy->name,
                    'email' => $this->approvedBy->email,
                ];
            }),
            
            // Computed properties
            'can_be_edited' => $this->canBeEdited(),
            'can_be_submitted' => $this->canBeSubmitted(),
            'can_be_verified' => $this->canBeVerified(),
            'can_be_approved' => $this->canBeApproved(),
            'can_be_rejected' => $this->canBeRejected(),
            
            // Formatted dates
            'formatted_period' => $this->when($this->period_start && $this->period_end, function () {
                $start = \Carbon\Carbon::parse($this->period_start);
                $end = \Carbon\Carbon::parse($this->period_end);
                return $start->format('M j, Y') . ' - ' . $end->format('M j, Y');
            }),
            
            // Registry entries count (when loaded)
            'registry_entries_count' => $this->when($this->whenLoaded('registryEntries'), function () {
                return $this->registryEntries->count();
            }),
            
            // Registry entries (when loaded)
            'registry_entries' => $this->when($this->whenLoaded('registryEntries'), function () {
                return $this->registryEntries->map(function ($entry) {
                    return [
                        'id' => $entry->id,
                        'surname' => $entry->surname,
                        'given_name' => $entry->given_name,
                        'nationality' => $entry->nationality,
                        'travel_date' => $entry->travel_date,
                        'direction' => $entry->direction,
                        'border_post' => $entry->border_post,
                        'is_locked' => $entry->is_locked,
                        'locked_at' => $entry->locked_at,
                    ];
                });
            }),
            
            // Approvals (when loaded)
            'approvals' => $this->when($this->whenLoaded('approvals'), function () {
                return $this->approvals->map(function ($approval) {
                    return [
                        'id' => $approval->id,
                        'action' => $approval->action,
                        'comments' => $approval->comments,
                        'discrepancies_found' => $approval->discrepancies_found,
                        'verification_checklist' => $approval->verification_checklist,
                        'action_at' => $approval->action_at,
                        'user' => [
                            'id' => $approval->user->id,
                            'name' => $approval->user->name,
                            'email' => $approval->user->email,
                        ],
                    ];
                });
            }),
            
            // Audit trail (when loaded)
            'audit_trail' => $this->when($this->whenLoaded('auditTrail'), function () {
                return $this->auditTrail->map(function ($audit) {
                    return [
                        'id' => $audit->id,
                        'action' => $audit->action,
                        'description' => $audit->description,
                        'old_values' => $audit->old_values,
                        'new_values' => $audit->new_values,
                        'action_at' => $audit->action_at,
                        'user' => [
                            'id' => $audit->user->id,
                            'name' => $audit->user->name,
                            'email' => $audit->user->email,
                        ],
                    ];
                });
            }),
        ];
    }
}
