<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class ReportAvailable extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $reportType,
        public string $reportName,
        public ?string $url = null,
        public ?string $thresholdHit = null
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
        $msg = "New report available: {$this->reportName}";
        if ($this->thresholdHit) {
            $msg .= " - {$this->thresholdHit}";
        }

        return [
            'type' => 'report_available',
            'report_type' => $this->reportType,
            'report_name' => $this->reportName,
            'url' => $this->url ?? route('reports.dashboard'),
            'threshold_hit' => $this->thresholdHit,
            'message' => $msg,
        ];
    }
}
