<?php

use App\Models\Registry;
use App\Models\RegistryBatch;
use App\Models\User;
use Illuminate\Http\UploadedFile;

beforeEach(function () {
    $this->user = User::factory()->create();
});

test('returnee preview returns match results', function () {
    Registry::factory()->create([
        'surname' => 'Tevili',
        'given_name' => 'Herman',
        'document_no' => 'PA1234567',
        'dob' => '1990-03-15',
        'direction' => 'Outbound',
    ]);

    $csv = "family_name,given_names,passport_no,dob,nationality,arrival_date,flight_number,port_of_entry,gender\n";
    $csv .= "Tevili,Herman,PA1234567,15/03/1990,Vanuatu,10/02/2026,NZ123,Bauerfield Airport (VLI),Male\n";

    $file = UploadedFile::fake()->createWithContent('returnees.csv', $csv);

    $response = $this->actingAs($this->user)->post(route('registry.previewReturneeWizard'), [
        'csv_file' => $file,
    ], [
        'Accept' => 'application/json',
        'X-Requested-With' => 'XMLHttpRequest',
    ]);

    $response->assertOk();
    $data = $response->json();
    expect($data)->toHaveKeys(['rows', 'matches', 'totalRows', 'matchedCount']);
    expect($data['totalRows'])->toBe(1);
    expect($data['matchedCount'])->toBeGreaterThanOrEqual(0);
});

test('returnee store creates batch and registry entries', function () {
    $csv = "family_name,given_names,passport_no,dob,nationality,arrival_date,flight_number,port_of_entry,gender\n";
    $csv .= "Tevili,Herman,PA1234567,15/03/1990,Vanuatu,10/02/2026,NZ123,Bauerfield Airport (VLI),Male\n";

    $file = UploadedFile::fake()->createWithContent('returnees.csv', $csv);

    $response = $this->actingAs($this->user)->post(route('registry.storeReturneeWizard'), [
        'csv_file' => $file,
        'batch_name' => 'Test Returns Batch',
    ]);

    $response->assertRedirect();
    $response->assertSessionHas('success');

    $batch = RegistryBatch::where('name', 'Test Returns Batch')->first();
    expect($batch)->not->toBeNull();
    expect($batch->batch_type)->toBe('returns');
    expect($batch->record_count)->toBe(1);

    $entry = Registry::where('registry_batch_id', $batch->id)->first();
    expect($entry)->not->toBeNull();
    expect($entry->surname)->toBe('Tevili');
    expect($entry->direction)->toBe('Inbound');
});
