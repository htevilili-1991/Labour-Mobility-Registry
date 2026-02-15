<?php

namespace App\Notifications;

use App\Models\RegistryBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BatchApproved extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public RegistryBatch $batch,
        public ?string $notes = null
    ) {}

    /**
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['database'];
    }

    /**
     * @return array<string, mixed>
     */
    public function toArray(object $notifiable): array
    {
        $approvedBy = $this->batch->approvedBy?->name ?? 'Unknown';

        return [
            'type' => 'batch_approved',
            'batch_id' => $this->batch->id,
            'batch_name' => $this->batch->name,
            'approved_by' => $approvedBy,
            'notes' => $this->notes,
            'url' => route('batches.show', $this->batch),
            'message' => "Batch \"{$this->batch->name}\" has been approved by {$approvedBy}"
                .($this->notes ? ". Notes: {$this->notes}" : ''),
        ];
    }
}
