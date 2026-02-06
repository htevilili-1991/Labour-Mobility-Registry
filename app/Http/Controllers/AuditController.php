<?php

namespace App\Http\Controllers;

use OwenIt\Auditing\Models\Audit;
use Inertia\Inertia;
use Illuminate\Http\RedirectResponse;

class AuditController extends Controller
{
    public function index()
    {
        $audits = Audit::with('user')
            ->where('auditable_type', \App\Models\Registry::class)
            ->orderBy('created_at', 'desc')
            ->paginate(10)
            ->through(function ($audit) {
                return [
                    'id' => $audit->id,
                    'user_id' => $audit->user_id,
                    'user' => $audit->user ? ['name' => $audit->user->name] : null,
                    'event' => $audit->event,
                    'auditable_type' => $audit->auditable_type,
                    'auditable_id' => $audit->auditable_id,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'created_at' => $audit->created_at->toISOString(),
                ];
            });

        return Inertia::render('audits/index', [
            'audits' => [
                'data' => $audits->items(),
                'links' => $audits->links()->toHtml(),
                'meta' => [
                    'current_page' => $audits->currentPage(),
                    'last_page' => $audits->lastPage(),
                    'per_page' => $audits->perPage(),
                    'total' => $audits->total(),
                ],
            ],
        ]);
    }

    public function clear(): RedirectResponse
    {
        try {
            Audit::where('auditable_type', \App\Models\Registry::class)->delete();
            return redirect()->route('audits.index')->with('success', 'Audit logs cleared successfully.');
        } catch (\Exception $e) {
            return redirect()->route('audits.index')->with('error', 'Failed to clear audit logs.');
        }
    }
}
