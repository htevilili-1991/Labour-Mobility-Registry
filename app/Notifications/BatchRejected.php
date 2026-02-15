<?php

namespace App\Notifications;

use App\Models\RegistryBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BatchRejected extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public RegistryBatch $batch,
        public string $reason
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
        $rejectedBy = $this->batch->approvedBy?->name ?? $this->batch->verifiedBy?->name ?? 'Unknown';

        return [
            'type' => 'batch_rejected',
            'batch_id' => $this->batch->id,
            'batch_name' => $this->batch->name,
            'rejected_by' => $rejectedBy,
            'reason' => $this->reason,
            'url' => route('batches.show', $this->batch),
            'message' => "Batch \"{$this->batch->name}\" was rejected by {$rejectedBy}. Reason: {$this->reason}",
        ];
    }
}
