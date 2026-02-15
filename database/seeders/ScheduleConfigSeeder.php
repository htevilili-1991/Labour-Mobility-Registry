<?php

namespace Database\Seeders;

use App\Models\ScheduleConfig;
use Illuminate\Database\Seeder;

class ScheduleConfigSeeder extends Seeder
{
    public function run(): void
    {
        $jobs = [
            [
                'command' => 'batches:check-deadlines',
                'name' => 'Batch Deadline Checker',
                'description' => 'Notifies verification team when batches are nearing their verification deadline (default 48h).',
                'enabled' => true,
                'frequency_type' => 'daily_at',
                'frequency_value' => '08:00',
                'parameters' => ['--hours' => 48],
            ],
        ];

        foreach ($jobs as $job) {
            ScheduleConfig::updateOrCreate(
                ['command' => $job['command']],
                $job
            );
        }
    }
}
