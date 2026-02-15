<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class AuditFlagOrComplianceIssue extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $issueType,
        public string $description,
        public ?string $url = null,
        public array $metadata = []
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
            'type' => 'audit_flag',
            'issue_type' => $this->issueType,
            'description' => $this->description,
            'url' => $this->url,
            'metadata' => $this->metadata,
            'message' => $this->description,
        ];
    }
}
