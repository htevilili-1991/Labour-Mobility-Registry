<?php

namespace Database\Seeders;

use App\Models\Registry;
use App\Models\RegistryBatch;
use App\Models\User;
use Illuminate\Database\Seeder;

class RegistrySeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Create registry entries without batches first
        $individualEntries = Registry::factory()->count(150)->create();
        
        // Create some batches
        $batches = RegistryBatch::factory()->count(12)->create();
        
        // Create registry entries for batches
        foreach ($batches as $batch) {
            $entriesCount = rand(20, 100);
            $entries = Registry::factory()->count($entriesCount)->create([
                'registry_batch_id' => $batch->id,
            ]);
            
            // Update batch record count
            $batch->update(['record_count' => $entries->count()]);
            
            // If batch is approved, lock the entries
            if ($batch->status === 'approved') {
                $entries->each(function ($entry) use ($batch) {
                    $entry->update([
                        'is_locked' => true,
                        'locked_at' => $batch->approved_at,
                        'locked_by' => $batch->approved_by,
                    ]);
                });
            }
        }
        
        // Create some recent entries for testing
        Registry::factory()->count(50)->create([
            'travel_date' => now()->subDays(rand(1, 30)),
            'created_at' => now()->subDays(rand(1, 30)),
            'updated_at' => now()->subDays(rand(0, 5)),
        ]);
        
        // Create some specific test data for common scenarios
        $this->createTestScenarios();
        
        $this->command->info('Registry seeded successfully!');
        $this->command->info('Created ' . Registry::count() . ' registry entries');
        $this->command->info('Created ' . RegistryBatch::count() . ' batches');
    }
    
    /**
     * Create specific test scenarios for common use cases
     */
    private function createTestScenarios(): void
    {
        // Create a draft batch for testing bulk operations
        $draftBatch = RegistryBatch::factory()->create([
            'name' => 'Test Draft Batch',
            'status' => 'draft',
            'record_count' => 0,
        ]);
        
        // Add some entries to the draft batch
        Registry::factory()->count(15)->create([
            'registry_batch_id' => $draftBatch->id,
        ]);
        
        $draftBatch->update(['record_count' => 15]);
        
        // Create a submitted batch for verification testing
        $submittedBatch = RegistryBatch::factory()->create([
            'name' => 'Test Submitted Batch',
            'status' => 'submitted',
            'record_count' => 0,
        ]);
        
        Registry::factory()->count(25)->create([
            'registry_batch_id' => $submittedBatch->id,
        ]);
        
        $submittedBatch->update(['record_count' => 25]);
        
        // Create some entries with validation issues for testing
        Registry::factory()->create([
            'surname' => 'TestValidationError',
            'given_name' => 'InvalidAge',
            'document_no' => '123', // Too short - should fail validation
            'dob' => '1990-01-01',
            'age' => 50, // Wrong age for DOB
            'travel_date' => '2025-13-45', // Invalid date
        ]);
        
        // Create duplicate entries for testing duplicate detection
        $baseData = [
            'surname' => 'Duplicate',
            'given_name' => 'Test',
            'nationality' => 'Vanuatu',
            'document_no' => 'DUP123456',
            'dob' => '1985-05-15',
        ];
        
        Registry::factory()->create($baseData);
        Registry::factory()->create(array_merge($baseData, [
            'given_name' => 'Test2',
            'travel_date' => now()->subDays(5)->format('Y-m-d'),
        ]));
        
        // Create entries with various travel reasons for filtering tests
        $travelReasons = ['Work', 'Business', 'Tourism', 'Education', 'Medical'];
        foreach ($travelReasons as $reason) {
            Registry::factory()->count(5)->create([
                'travel_reason' => $reason,
                'travel_date' => now()->subDays(rand(1, 60)),
            ]);
        }
        
        // Create entries for different border posts
        $borderPosts = ['Port Vila', 'Luganville', 'Whitegrass Airport', 'Santo-Pekoa Airport'];
        foreach ($borderPosts as $post) {
            Registry::factory()->count(8)->create([
                'border_post' => $post,
                'travel_date' => now()->subDays(rand(1, 90)),
            ]);
        }
    }
}
