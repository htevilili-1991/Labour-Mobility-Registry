<?php

namespace App\Notifications;

use App\Models\Registry;
use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Notification;

class RegistryEntryChanged extends Notification implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public Registry $registry,
        public string $action,
        public bool $flaggedForReview = false
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
        $label = trim("{$this->registry->surname} {$this->registry->given_name}") ?: "ID {$this->registry->id}";
        $flagged = $this->flaggedForReview ? ' (flagged for review)' : '';

        return [
            'type' => 'registry_entry_changed',
            'registry_id' => $this->registry->id,
            'action' => $this->action,
            'entry_label' => $label,
            'flagged_for_review' => $this->flaggedForReview,
            'url' => route('registry.show', $this->registry),
            'message' => "Registry entry {$label} was {$this->action}{$flagged}",
        ];
    }
}
