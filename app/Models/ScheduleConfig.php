<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class ScheduleConfig extends Model
{
    protected $fillable = [
        'command',
        'name',
        'description',
        'enabled',
        'frequency_type',
        'frequency_value',
        'parameters',
    ];

    protected $casts = [
        'enabled' => 'boolean',
        'parameters' => 'array',
        'last_run_at' => 'datetime',
    ];

    public const FREQUENCY_TYPES = [
        'hourly' => 'Every hour',
        'daily' => 'Daily (midnight)',
        'daily_at' => 'Daily at specific time',
        'weekly' => 'Weekly',
        'cron' => 'Custom cron expression',
    ];
}
