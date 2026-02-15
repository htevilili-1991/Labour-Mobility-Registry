<?php

namespace App\Notifications;

use App\Models\RegistryBatch;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class BatchNearingDeadline extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public RegistryBatch $batch,
        public int $hoursRemaining
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
        $hours = $this->hoursRemaining;
        $timeStr = $hours >= 24 ? round($hours / 24).' days' : "{$hours} hours";

        return [
            'type' => 'batch_nearing_deadline',
            'batch_id' => $this->batch->id,
            'batch_name' => $this->batch->name,
            'hours_remaining' => $this->hoursRemaining,
            'submitted_at' => $this->batch->submitted_at?->toIso8601String(),
            'url' => route('verification.show', $this->batch),
            'message' => "Batch \"{$this->batch->name}\" verification due in {$timeStr}",
        ];
    }
}
