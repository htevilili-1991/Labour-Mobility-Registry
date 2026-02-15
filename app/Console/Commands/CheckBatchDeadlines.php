<?php

namespace App\Console\Commands;

use App\Models\RegistryBatch;
use App\Models\User;
use App\Notifications\BatchNearingDeadline;
use Illuminate\Console\Command;

class CheckBatchDeadlines extends Command
{
    protected $signature = 'batches:check-deadlines {--hours=48}';

    protected $description = 'Notify verification team when batches are nearing verification deadline (default 48h)';

    public function handle(): int
    {
        $hoursThreshold = (int) $this->option('hours');
        $warningHours = 2;
        $cutoff = now()->subHours($hoursThreshold - $warningHours);

        $batches = RegistryBatch::where('status', 'submitted')
            ->whereNotNull('submitted_at')
            ->where('submitted_at', '<=', $cutoff)
            ->get();

        $verificationStaff = User::withPermission('batches.verify')->get();

        foreach ($batches as $batch) {
            $hoursRemaining = max(0, (int) ($hoursThreshold - now()->diffInHours($batch->submitted_at, false)));
            foreach ($verificationStaff as $staff) {
                $staff->notify(new BatchNearingDeadline($batch, $hoursRemaining));
            }
        }

        $this->info("Checked {$batches->count()} batches nearing deadline. Notified verification staff.");

        return self::SUCCESS;
    }
}
