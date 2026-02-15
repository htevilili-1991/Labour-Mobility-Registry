<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class SystemWideAlert extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public string $title,
        public string $message,
        public string $level = 'info',
        public ?string $url = null,
        public ?string $actionLabel = null
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
            'type' => 'system_alert',
            'title' => $this->title,
            'message' => $this->message,
            'level' => $this->level,
            'url' => $this->url,
            'action_label' => $this->actionLabel,
        ];
    }
}
