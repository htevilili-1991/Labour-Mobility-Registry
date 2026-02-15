<?php

namespace App\Notifications;

use App\Models\RegistryBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BatchSubmittedForVerification extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public RegistryBatch $batch
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
        return [
            'type' => 'batch_submitted',
            'batch_id' => $this->batch->id,
            'batch_name' => $this->batch->name,
            'submitted_by' => $this->batch->submittedBy?->name ?? 'Unknown',
            'record_count' => $this->batch->record_count,
            'scheme' => $this->batch->scheme,
            'batch_type' => $this->batch->batch_type,
            'url' => route('verification.show', $this->batch),
            'message' => "Batch \"{$this->batch->name}\" submitted for verification by {$this->batch->submittedBy?->name}",
        ];
    }
}
