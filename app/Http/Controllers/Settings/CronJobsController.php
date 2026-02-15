<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Models\ScheduleConfig;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Inertia\Inertia;
use Inertia\Response;

class CronJobsController extends Controller
{
    public function index(): Response
    {
        $jobs = ScheduleConfig::orderBy('name')->get();

        return Inertia::render('settings/CronJobs', [
            'jobs' => $jobs,
            'frequencyTypes' => ScheduleConfig::FREQUENCY_TYPES,
        ]);
    }

    public function update(Request $request, ScheduleConfig $scheduleConfig): RedirectResponse
    {
        $validated = $request->validate([
            'enabled' => 'required|boolean',
            'frequency_type' => 'required|in:hourly,daily,daily_at,weekly,cron',
            'frequency_value' => 'nullable|string|max:100',
            'parameters' => 'nullable|array',
        ]);

        if ($validated['frequency_type'] === 'daily_at' && empty($validated['frequency_value'])) {
            $validated['frequency_value'] = '08:00';
        }
        if ($validated['frequency_type'] === 'cron' && empty($validated['frequency_value'])) {
            return back()->withErrors(['frequency_value' => 'Cron expression is required when using custom cron.']);
        }

        $scheduleConfig->update($validated);

        return back()->with('success', 'Cron job updated successfully.');
    }
}
