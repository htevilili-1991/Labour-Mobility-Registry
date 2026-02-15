<?php

use App\Models\ScheduleConfig;
use Illuminate\Foundation\Inspiring;
use Illuminate\Support\Facades\Artisan;
use Illuminate\Support\Facades\Schedule;
use Illuminate\Support\Facades\Schema;

Artisan::command('inspire', function () {
    $this->comment(Inspiring::quote());
})->purpose('Display an inspiring quote');

if (app()->runningInConsole() && Schema::hasTable('schedule_configs')) {
    ScheduleConfig::query()
        ->where('enabled', true)
        ->get()
        ->each(function (ScheduleConfig $config) {
            $event = Schedule::command(
                $config->command,
                $config->parameters ?? []
            );

            match ($config->frequency_type) {
                'hourly' => $event->hourly(),
                'daily' => $event->daily(),
                'daily_at' => $event->dailyAt($config->frequency_value ?? '08:00'),
                'weekly' => $event->weekly(),
                'cron' => $event->cron($config->frequency_value ?? '* * * * *'),
                default => $event->daily(),
            };
        });
}
