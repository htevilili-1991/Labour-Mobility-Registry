<?php

namespace App\Http\Controllers;

use App\Models\Registry;
use Illuminate\Http\Request;
use Illuminate\Support\Arr;
use Illuminate\Support\Facades\Log;
use Illuminate\Support\Facades\Redirect;
use Illuminate\Support\Facades\Storage;
use Inertia\Inertia;

class RegistryController extends Controller
{
    /**
     * Display a listing of the resource.
     */
    public function index(Request $request)
    {
        try {
            $perPage = $request->input('per_page', 10);
            $page = $request->input('page', 1);
            $sort = $request->input('sort', 'id:asc');
            $search = $request->input('search', '');
            $filters = json_decode($request->input('filters', '[]'), true);
            $years = Arr::wrap($request->input('years', [])); // Normalize to array

            Log::info('Registry index request', [
                'search' => $search,
                'years' => $years,
                'per_page' => $perPage,
                'page' => $page,
                'sort' => $sort,
                'filters' => $filters,
            ]);

            $query = Registry::query();

            // Apply global search
            if ($search) {
                $search = trim($search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(surname) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(given_name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(nationality) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(sex) LIKE ?', ["%{$search}%"])
                        ->orWhere('travel_date', 'like', "%{$search}%")
                        ->orWhere('dob', 'like', "%{$search}%")
                        ->orWhereRaw('LOWER(travel_reason) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(destination_coming_from) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('CAST(national_id_number AS TEXT) LIKE ?', ["%{$search}%"]);
                });
            }

            // Apply year filter on travel_date
            if (! empty($years) && ! in_array('all', $years)) {
                try {
                    $query->where(function ($q) use ($years) {
                        foreach ($years as $year) {
                            $q->orWhereRaw("RIGHT(COALESCE(travel_date, ''), 4) = ?", [$year]);
                        }
                    });
                } catch (\Exception $e) {
                    Log::error('Error applying year filter', [
                        'years' => $years,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    // Fallback: skip year filter to prevent breaking the query
                }
            }

            // Apply column filters
            foreach ($filters as $filter) {
                if (! empty($filter['id']) && ! empty($filter['value'])) {
                    $query->where($filter['id'], 'like', "%{$filter['value']}%");
                }
            }

            // Apply sorting
            if ($sort) {
                [$sortColumn, $sortDirection] = explode(':', $sort);
                $validColumns = [
                    'surname', 'given_name', 'nationality', 'national_id_number', 'sex', 'travel_date',
                    'travel_reason', 'destination_coming_from', 'id', 'dob',
                ];
                if (in_array($sortColumn, $validColumns) && in_array($sortDirection, ['asc', 'desc'])) {
                    $query->orderBy($sortColumn, $sortDirection);
                } else {
                    Log::warning('Invalid sort parameter', ['sort' => $sort]);
                    $query->orderBy('id', 'asc');
                }
            }

            // Log the raw query for debugging
            Log::info('Raw query', ['sql' => $query->toSql(), 'bindings' => $query->getBindings()]);

            // Paginate results
            $registry = $query->paginate($perPage, ['*'], 'page', $page);

            // Fetch distinct years for the dropdown
            $distinctYears = [];
            try {
                $distinctYears = Registry::selectRaw("RIGHT(COALESCE(travel_date, ''), 4) as year")
                    ->distinct()
                    ->pluck('year')
                    ->filter(fn ($year) => ! empty($year) && is_numeric($year)) // Remove empty or invalid years
                    ->sort()
                    ->values()
                    ->map(fn ($year) => (string) $year);
            } catch (\Exception $e) {
                Log::error('Error fetching distinct years', [
                    'error' => $e->getMessage(),
                    'trace' => $e->getTraceAsString(),
                ]);
                // Fallback: empty years list
            }

            Log::info('Pagination details', [
                'total' => $registry->total(),
                'last_page' => $registry->lastPage(),
                'current_page' => $registry->currentPage(),
                'per_page' => $registry->perPage(),
                'to' => $registry->lastItem(),
                'from' => $registry->firstItem(),
                'response_status' => http_response_code(),
                'data_count' => count($registry->items()),
                'distinct_years' => $distinctYears,
            ]);

            // Get draft batches for bulk add functionality
            $draftBatches = \App\Models\RegistryBatch::where('status', 'draft')
                ->orderBy('created_at', 'desc')
                ->get(['id', 'name', 'scheme', 'batch_type']);

            return Inertia::render('registry/index', [
                'registry' => [
                    'data' => $registry->items(),
                    'links' => $registry->links(),
                    'meta' => [
                        'current_page' => $registry->currentPage(),
                        'last_page' => $registry->lastPage(),
                        'per_page' => $registry->perPage(),
                        'total' => $registry->total(),
                    ],
                ],
                'distinctYears' => $distinctYears,
                'draftBatches' => $draftBatches,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registry data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return Inertia::render('Error', [
                'message' => 'Unable to load registry data. Check logs for details.',
            ]);
        }
    }

    /**
     * Export all filtered records as JSON for CSV generation.
     */
    public function export(Request $request)
    {
        try {
            $sort = $request->input('sort', 'id:asc');
            $search = $request->input('search', '');
            $filters = json_decode($request->input('filters', '[]'), true);
            $years = Arr::wrap($request->input('years', [])); // Normalize to array

            Log::info('Export request', [
                'search' => $search,
                'years' => $years,
                'sort' => $sort,
                'filters' => $filters,
            ]);

            $query = Registry::query();

            // Apply global search
            if ($search) {
                $search = trim($search);
                $query->where(function ($q) use ($search) {
                    $q->whereRaw('LOWER(surname) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(given_name) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(nationality) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(sex) LIKE ?', ["%{$search}%"])
                        ->orWhere('travel_date', 'like', "%{$search}%")
                        ->orWhereRaw('LOWER(travel_reason) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('LOWER(destination_coming_from) LIKE ?', ["%{$search}%"])
                        ->orWhereRaw('CAST(national_id_number AS TEXT) LIKE ?', ["%{$search}%"]);
                });
            }

            // Apply year filter
            if (! empty($years) && ! in_array('all', $years)) {
                try {
                    $query->where(function ($q) use ($years) {
                        foreach ($years as $year) {
                            $q->orWhereRaw("RIGHT(COALESCE(travel_date, ''), 4) = ?", [$year]);
                        }
                    });
                } catch (\Exception $e) {
                    Log::error('Error applying year filter in export', [
                        'years' => $years,
                        'error' => $e->getMessage(),
                        'trace' => $e->getTraceAsString(),
                    ]);
                    // Fallback: skip year filter
                }
            }

            // Apply column filters
            foreach ($filters as $filter) {
                if (! empty($filter['id']) && ! empty($filter['value'])) {
                    $query->where($filter['id'], 'like', "%{$filter['value']}%");
                }
            }

            // Apply sorting
            if ($sort) {
                [$sortColumn, $sortDirection] = explode(':', $sort);
                $validColumns = [
                    'surname', 'given_name', 'nationality', 'national_id_number', 'sex', 'travel_date',
                    'travel_reason', 'destination_coming_from', 'id',
                ];
                if (in_array($sortColumn, $validColumns) && in_array($sortDirection, ['asc', 'desc'])) {
                    $query->orderBy($sortColumn, $sortDirection);
                } else {
                    $query->orderBy('id', 'asc');
                }
            }

            // Fetch all matching records
            $data = $query->get([
                'surname', 'given_name', 'nationality', 'country_of_residence', 'national_id_number',
                'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date',
                'direction', 'accommodation_address', 'note', 'travel_reason',
                'border_post', 'destination_coming_from',
            ]);

            return response()->json([
                'registry' => [
                    'data' => $data,
                ],
            ]);
        } catch (\Exception $e) {
            Log::error('Error exporting registry data', [
                'error' => $e->getMessage(),
                'trace' => $e->getTraceAsString(),
                'request' => $request->all(),
            ]);

            return response()->json([
                'error' => 'Unable to export registry data.',
            ], 500);
        }
    }

    /**
     * Show the form for creating a new resource.
     */
    public function create()
    {
        try {
            return Inertia::render('registry/create', [
            ]);
        } catch (\Exception $e) {
            Log::error('Error rendering create form: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to load the create form.',
            ]);
        }
    }

    /**
     * Store a newly created resource in storage.
     */
    public function store(Request $request)
    {
        try {
            Log::info('Store request data', $request->all());
            $validated = $request->validate([
                'surname' => 'required|string|max:255',
                'given_name' => 'required|string|max:255',
                'nationality' => 'required|string|max:255',
                'country_of_residence' => 'required|string|max:255',
                'national_id_number' => 'nullable|integer',
                'document_type' => 'required|string|max:255',
                'document_no' => 'required|string|max:255|unique:registry,document_no',
                'dob' => 'required|string|regex:/^\d{2}-\d{2}-\d{2}$/', // Validate MM-DD-YY
                'age' => 'required|integer|min:0',
                'sex' => 'required|string|max:50',
                'travel_date' => 'required|string|regex:/^\d{1,2}\/\d{1,2}\/\d{4}$/', // Validate D/M/YYYY or DD/MM/YYYY
                'direction' => 'required|string|max:255',
                'accommodation_address' => 'required|string|max:255',
                'note' => 'nullable|string|max:1000',
                'travel_reason' => 'required|string|max:255',
                'border_post' => 'required|string|max:255',
                'destination_coming_from' => 'required|string|max:255',
            ]);
            Log::info('Validated data', $validated);
            $registry = Registry::create($validated);
            Log::info('Registry record created', ['id' => $registry->id]);

            return Redirect::route('registry.index')->with('success', 'Record created successfully.');
        } catch (\Exception $e) {
            Log::error('Error creating Registry record: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to create registry record.',
            ]);
        }
    }

    /**
     * Display the specified resource.
     */
    public function show(string $id)
    {
        try {
            $registry = Registry::findOrFail($id);

            return Inertia::render('registry/show', [
                'registry' => $registry,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registry record: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to load registry record.',
            ]);
        }
    }

    /**
     * Show the form for editing the specified resource.
     */
    public function edit(string $id)
    {
        try {
            $registry = Registry::findOrFail($id);

            return Inertia::render('registry/edit', [
                'registry' => $registry,
            ]);
        } catch (\Exception $e) {
            Log::error('Error fetching registry record for edit: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to load the edit form.',
            ]);
        }
    }

    /**
     * Update the specified resource in storage.
     */
    public function update(Request $request, string $id)
    {
        try {
            Log::info('Update request data for Registry ID '.$id, $request->all());
            $registry = Registry::findOrFail($id);
            $validated = $request->validate([
                'surname' => 'required|string|max:255',
                'given_name' => 'required|string|max:255',
                'nationality' => 'required|string|max:255',
                'country_of_residence' => 'required|string|max:255',
                'national_id_number' => 'nullable|integer|unique:registry,national_id_number,'.($registry->national_id_number ?: 'NULL'),
                'document_type' => 'required|string|max:255',
                'document_no' => 'required|string|max:255|unique:registry,document_no,'.$registry->id,
                'dob' => 'required|string|regex:/^\d{2}-\d{2}-\d{2}$/', // Validate MM-DD-YY
                'age' => 'required|integer|min:0',
                'sex' => 'required|string|max:50',
                'travel_date' => 'required|string|regex:/^\d{1,2}\/\d{1,2}\/\d{4}$/', // Validate D/M/YYYY or DD/MM/YYYY
                'direction' => 'required|string|max:255',
                'accommodation_address' => 'required|string|max:255',
                'note' => 'nullable|string|max:1000',
                'travel_reason' => 'required|string|max:255',
                'border_post' => 'required|string|max:255',
                'destination_coming_from' => 'required|string|max:255',
            ]);
            Log::info('Validated data for Registry ID '.$id, $validated);
            $registry->update($validated);
            Log::info('Registry record updated', ['id' => $registry->id, 'changes' => $registry->getChanges()]);

            return Redirect::route('registry.index')->with('success', 'Record updated successfully.');
        } catch (\Exception $e) {
            Log::error('Error updating Registry record ID '.$id.': '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to update registry record.',
            ]);
        }
    }

    /**
     * Remove the specified resource from storage.
     */
    public function destroy(string $id)
    {
        try {
            $registry = Registry::findOrFail($id);
            Log::info('Deleting Registry record', ['id' => $id]);
            $registry->delete();
            Log::info('Registry record deleted', ['id' => $id]);

            return Redirect::route('registry.index')->with('success', 'Record deleted successfully.');
        } catch (\Exception $e) {
            Log::error('Error deleting Registry record ID '.$id.': '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to delete registry record.',
            ]);
        }
    }

    /**
     * Show the form for uploading a CSV file.
     */
    public function upload()
    {
        try {
            return Inertia::render('registry/upload', [
            ]);
        } catch (\Exception $e) {
            Log::error('Error rendering CSV upload form: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to load the CSV upload form.',
            ]);
        }
    }

    /**
     * Process and store the uploaded CSV file.
     */
    public function storeCsv(Request $request)
    {
        try {
            // Validate the uploaded file
            $request->validate([
                'csv_file' => 'required|file|mimes:csv,txt|max:10240', // 10MB max
            ]);

            $file = $request->file('csv_file');
            $path = $file->store('uploads', 'local');
            $handle = fopen(Storage::disk('local')->path($path), 'r');
            $header = fgetcsv($handle); // Read header row

            // Expected headers
            $expectedHeaders = [
                'surname', 'given_name', 'nationality', 'country_of_residence', 'national_id_number',
                'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date',
                'direction', 'accommodation_address', 'note', 'travel_reason',
                'border_post', 'destination_coming_from',
            ];

            // Validate headers
            if ($header !== $expectedHeaders) {
                Storage::disk('local')->delete($path);

                return Redirect::back()->withErrors(['csv_file' => 'Invalid CSV headers. Expected: '.implode(', ', $expectedHeaders)]);
            }

            $recordsCreated = 0;
            while (($row = fgetcsv($handle)) !== false) {
                // Handle national_id_number as nullable integer
                $nationalIdNumber = trim($row[4] ?? '');
                $nationalIdNumber = empty($nationalIdNumber) ? null : filter_var($nationalIdNumber, FILTER_VALIDATE_INT);
                if (! empty($nationalIdNumber) && $nationalIdNumber === false) {
                    Log::warning('Skipping row due to invalid national_id_number: '.$row[4], ['row' => $row]);

                    continue;
                }

                // Skip if national_id_number or document_no already exists
                $existsCondition = Registry::where('document_no', $row[6] ?? '');
                if ($nationalIdNumber !== null) {
                    $existsCondition->orWhere('national_id_number', $nationalIdNumber);
                }
                if ($existsCondition->exists()) {
                    Log::warning('Skipping duplicate national_id_number or document_no: '.($nationalIdNumber ?? 'null').' or '.($row[6] ?? ''));

                    continue;
                }

                // Create record with validation
                try {
                    Registry::create([
                        'surname' => $row[0] ?? '',
                        'given_name' => $row[1] ?? '',
                        'nationality' => $row[2] ?? '',
                        'country_of_residence' => $row[3] ?? '',
                        'national_id_number' => $nationalIdNumber,
                        'document_type' => $row[5] ?? '',
                        'document_no' => $row[6] ?? '',
                        'dob' => $row[7] ?? '',
                        'age' => (int) ($row[8] ?? 0),
                        'sex' => $row[9] ?? '',
                        'travel_date' => $row[10] ?? '',
                        'direction' => $row[11] ?? '',
                        'accommodation_address' => $row[12] ?? '',
                        'note' => ! empty($row[13]) ? $row[13] : null,
                        'travel_reason' => $row[14] ?? '',
                        'border_post' => $row[15] ?? '',
                        'destination_coming_from' => $row[16] ?? '',
                    ]);
                    $recordsCreated++;
                } catch (\Exception $e) {
                    Log::warning('Failed to create Registry record from CSV row: '.$e->getMessage(), ['row' => $row]);

                    continue;
                }
            }
            fclose($handle);
            Storage::disk('local')->delete($path);

            Log::info('CSV uploaded successfully', [
                'file' => $file->getClientOriginalName(),
                'records_created' => $recordsCreated,
            ]);

            return Redirect::route('registry.index')->with('success', "CSV uploaded, $recordsCreated records created.");
        } catch (\Exception $e) {
            Log::error('Error processing CSV: '.$e->getMessage());

            return Redirect::back()->withErrors(['csv_file' => 'Error processing CSV: '.$e->getMessage()]);
        }
    }

    /**
     * Show the upload wizard page.
     */
    public function uploadWizard()
    {
        try {
            return Inertia::render('registry/upload-wizard', [
            ]);
        } catch (\Exception $e) {
            Log::error('Error rendering upload wizard: '.$e->getMessage());

            return Inertia::render('Error', [
                'message' => 'Unable to load the upload wizard.',
            ]);
        }
    }

    /**
     * Process wizard upload - creates batch and imports CSV.
     */
    public function storeWizard(Request $request)
    {
        try {
            $request->validate([
                'csv_file' => 'required|file|mimes:csv,txt|max:10240',
                'batch_name' => 'required|string|max:255',
                'batch_type' => 'required|in:inbound,outbound,earnings,returns',
            ]);

            // Create batch first
            $batch = \App\Models\RegistryBatch::create([
                'name' => $request->batch_name,
                'batch_type' => $request->batch_type,
                'scheme' => 'RSE', // Default, can be made configurable
                'period_start' => now()->startOfMonth(),
                'period_end' => now()->endOfMonth(),
                'status' => 'draft',
            ]);

            // Process CSV file
            $file = $request->file('csv_file');
            $path = $file->store('uploads', 'local');
            $handle = fopen(Storage::disk('local')->path($path), 'r');
            $header = fgetcsv($handle);

            $expectedHeaders = [
                'surname', 'given_name', 'nationality', 'country_of_residence', 'national_id_number',
                'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date',
                'direction', 'accommodation_address', 'note', 'travel_reason',
                'border_post', 'destination_coming_from',
            ];

            if ($header !== $expectedHeaders) {
                Storage::disk('local')->delete($path);
                $batch->delete();

                return Redirect::back()->withErrors(['csv_file' => 'Invalid CSV headers. Expected: '.implode(', ', $expectedHeaders)]);
            }

            $recordsCreated = 0;
            while (($row = fgetcsv($handle)) !== false) {
                $nationalIdNumber = trim($row[4] ?? '');
                $nationalIdNumber = empty($nationalIdNumber) ? null : filter_var($nationalIdNumber, FILTER_VALIDATE_INT);
                if (! empty($nationalIdNumber) && $nationalIdNumber === false) {
                    continue;
                }

                $existsCondition = Registry::where('document_no', $row[6] ?? '');
                if ($nationalIdNumber !== null) {
                    $existsCondition->orWhere('national_id_number', $nationalIdNumber);
                }
                if ($existsCondition->exists()) {
                    continue;
                }

                try {
                    $registry = Registry::create([
                        'surname' => $row[0] ?? '',
                        'given_name' => $row[1] ?? '',
                        'nationality' => $row[2] ?? '',
                        'country_of_residence' => $row[3] ?? '',
                        'national_id_number' => $nationalIdNumber,
                        'document_type' => $row[5] ?? '',
                        'document_no' => $row[6] ?? '',
                        'dob' => $row[7] ?? '',
                        'age' => (int) ($row[8] ?? 0),
                        'sex' => $row[9] ?? '',
                        'travel_date' => $row[10] ?? '',
                        'direction' => $row[11] ?? '',
                        'accommodation_address' => $row[12] ?? '',
                        'note' => ! empty($row[13]) ? $row[13] : null,
                        'travel_reason' => $row[14] ?? '',
                        'border_post' => $row[15] ?? '',
                        'destination_coming_from' => $row[16] ?? '',
                        'registry_batch_id' => $batch->id,
                    ]);
                    $recordsCreated++;
                } catch (\Exception $e) {
                    Log::warning('Failed to create Registry record from CSV row: '.$e->getMessage());

                    continue;
                }
            }
            fclose($handle);
            Storage::disk('local')->delete($path);

            // Update batch record count
            $batch->record_count = $recordsCreated;
            $batch->save();

            Log::info('Wizard CSV uploaded successfully', [
                'file' => $file->getClientOriginalName(),
                'records_created' => $recordsCreated,
                'batch_id' => $batch->id,
            ]);

            return Redirect::route('batches.show', $batch)
                ->with('success', "Batch created and $recordsCreated records imported successfully.");
        } catch (\Exception $e) {
            Log::error('Error processing wizard CSV: '.$e->getMessage());

            return Redirect::back()->withErrors(['csv_file' => 'Error processing CSV: '.$e->getMessage()]);
        }
    }
}
