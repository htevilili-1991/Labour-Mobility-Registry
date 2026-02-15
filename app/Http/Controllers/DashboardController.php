<?php

namespace App\Http\Controllers;

use App\Models\Registry;
use App\Models\RegistryBatch;
use Carbon\Carbon;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;
use Inertia\Inertia;

class DashboardController extends Controller
{
    public function index()
    {
        try {
            DB::connection()->getPdo();

            $totalRecords = Registry::count();
            $recordsThisMonth = Registry::whereMonth('created_at', Carbon::now()->month)
                ->whereYear('created_at', Carbon::now()->year)
                ->count();
            $uniqueNationalities = Registry::distinct('nationality')->count('nationality');

            // Returnee metrics (records with return_date set)
            $returnsBase = Registry::whereNotNull('return_date');
            $returnsLast30 = (clone $returnsBase)->where('return_date', '>=', Carbon::now()->subDays(30))->count();
            $returnsLast90 = (clone $returnsBase)->where('return_date', '>=', Carbon::now()->subDays(90))->count();
            $returnsTotal = (clone $returnsBase)->count();
            $returnsMatched = (clone $returnsBase)->where('match_status', 'matched')->count();
            $returnsUnmatched = (clone $returnsBase)->where(function ($q) {
                $q->whereNull('match_status')->orWhere('match_status', 'unmatched');
            })->count();
            $returnsPendingReview = (clone $returnsBase)->where('match_status', 'pending_review')->count();
            $returnMatchRate = $returnsTotal > 0 ? round(($returnsMatched / $returnsTotal) * 100, 1) : 0;

            // Batches by status
            $batchesByStatus = RegistryBatch::select('status', DB::raw('COUNT(*) as count'))
                ->groupBy('status')
                ->get()
                ->map(fn ($r) => ['name' => ucfirst(str_replace('_', ' ', $r->status)), 'y' => (int) $r->count])
                ->toArray();

            $draftBatches = RegistryBatch::where('status', 'draft')->count();
            $pendingVerification = RegistryBatch::whereIn('status', ['submitted', 'under_review'])->count();
            $approvedBatches = RegistryBatch::where('status', 'approved')->count();
            $totalBatches = RegistryBatch::count();

            // Records by direction
            $directionRecords = Registry::select('direction', DB::raw('COUNT(*) as count'))
                ->whereNotNull('direction')
                ->groupBy('direction')
                ->orderByDesc('count')
                ->get()
                ->map(fn ($r) => ['name' => ucfirst($r->direction ?? 'Unknown'), 'y' => (int) $r->count])
                ->toArray();

            // Top destinations (last 12 months)
            $topDestinations = Registry::select('destination_coming_from', DB::raw('COUNT(*) as count'))
                ->whereNotNull('destination_coming_from')
                ->where('destination_coming_from', '!=', '')
                ->groupBy('destination_coming_from')
                ->orderByDesc('count')
                ->take(8)
                ->get()
                ->map(fn ($r) => ['name' => $r->destination_coming_from, 'y' => (int) $r->count])
                ->toArray();

            // Monthly records by travel_date
            $monthlyRecordsTravel = Registry::whereNotNull('travel_date')
                ->get()
                ->groupBy(fn ($item) => Carbon::parse($item->travel_date)->format('Y-m'))
                ->mapWithKeys(fn ($group, $key) => [$key => $group->count()])
                ->toArray();

            $monthsTravel = [];
            for ($i = 11; $i >= 0; $i--) {
                $month = Carbon::now()->subMonths($i)->format('Y-m');
                $monthsTravel[$month] = $monthlyRecordsTravel[$month] ?? 0;
            }

            // Records by travel_reason (chart format)
            $travelReasonRecords = Registry::select('travel_reason', DB::raw('COUNT(*) as count'))
                ->whereNotNull('travel_reason')
                ->groupBy('travel_reason')
                ->orderByDesc('count')
                ->get()
                ->map(fn ($item) => ['name' => $item->travel_reason, 'y' => (int) $item->count])
                ->toArray();

            // Records by sex
            $sexRecords = Registry::select('sex', DB::raw('COUNT(*) as count'))
                ->whereNotNull('sex')
                ->groupBy('sex')
                ->orderByDesc('count')
                ->get()
                ->map(fn ($item) => ['name' => $item->sex ?? 'Unknown', 'y' => (int) $item->count])
                ->toArray();

            // Month-over-month change
            $lastMonth = Registry::whereMonth('created_at', Carbon::now()->subMonth()->month)
                ->whereYear('created_at', Carbon::now()->subMonth()->year)
                ->count();
            $momChange = $lastMonth > 0
                ? round((($recordsThisMonth - $lastMonth) / $lastMonth) * 100, 1)
                : ($recordsThisMonth > 0 ? 100 : 0);

            // Recent records
            $recentRecords = Registry::select(['id', 'surname', 'given_name', 'nationality', 'travel_date', 'created_at', 'direction'])
                ->orderBy('created_at', 'desc')
                ->take(8)
                ->get()
                ->map(fn ($item) => [
                    'id' => $item->id,
                    'surname' => $item->surname ?? 'N/A',
                    'given_name' => $item->given_name ?? 'N/A',
                    'nationality' => $item->nationality ?? 'N/A',
                    'travel_date' => $item->travel_date?->format('Y-m-d'),
                    'created_at' => $item->created_at?->toIso8601String(),
                    'direction' => $item->direction ?? 'N/A',
                ])
                ->toArray();

            return Inertia::render('dashboard', [
                'metrics' => [
                    'total_records' => (int) $totalRecords,
                    'records_this_month' => (int) $recordsThisMonth,
                    'unique_nationalities' => (int) $uniqueNationalities,
                    'mom_change' => $momChange,
                    'draft_batches' => $draftBatches,
                    'pending_verification' => $pendingVerification,
                    'approved_batches' => $approvedBatches,
                    'total_batches' => $totalBatches,
                    'returns_last_30' => $returnsLast30,
                    'returns_last_90' => $returnsLast90,
                    'returns_total' => $returnsTotal,
                    'returns_matched' => $returnsMatched,
                    'returns_unmatched' => $returnsUnmatched,
                    'returns_pending_review' => $returnsPendingReview,
                    'return_match_rate' => $returnMatchRate,
                ],
                'monthly_records_travel' => $monthsTravel,
                'travel_reason_records' => $travelReasonRecords,
                'sex_records' => $sexRecords,
                'direction_records' => $directionRecords,
                'batches_by_status' => $batchesByStatus,
                'top_destinations' => $topDestinations,
                'recent_records' => $recentRecords,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching dashboard data: '.$e->getMessage(), ['trace' => $e->getTraceAsString()]);

            return Inertia::render('dashboard', [
                'metrics' => [
                    'total_records' => 0,
                    'records_this_month' => 0,
                    'unique_nationalities' => 0,
                    'mom_change' => 0,
                    'draft_batches' => 0,
                    'pending_verification' => 0,
                    'approved_batches' => 0,
                    'total_batches' => 0,
                    'returns_last_30' => 0,
                    'returns_last_90' => 0,
                    'returns_total' => 0,
                    'returns_matched' => 0,
                    'returns_unmatched' => 0,
                    'returns_pending_review' => 0,
                    'return_match_rate' => 0,
                ],
                'monthly_records_travel' => [],
                'travel_reason_records' => [],
                'sex_records' => [],
                'direction_records' => [],
                'batches_by_status' => [],
                'top_destinations' => [],
                'recent_records' => [],
                'error' => 'Unable to load dashboard data: '.$e->getMessage(),
            ]);
        }
    }
}
