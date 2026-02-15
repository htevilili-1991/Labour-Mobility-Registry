<?php

namespace App\Notifications;

use App\Models\Registry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReturneeReturned extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Registry $returnRecord
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
        $outbound = $this->returnRecord->linkedOutbound;
        $batch = $outbound?->registryBatch;

        return [
            'type' => 'returnee_matched',
            'return_registry_id' => $this->returnRecord->id,
            'worker_name' => trim($this->returnRecord->surname.' '.$this->returnRecord->given_name),
            'return_date' => $this->returnRecord->travel_date?->format('Y-m-d'),
            'outbound_batch_id' => $batch?->id,
            'url' => $batch ? route('batches.show', $batch) : null,
            'message' => "Worker {$this->returnRecord->surname} {$this->returnRecord->given_name} returned – schedule follow-up.",
        ];
    }
}
