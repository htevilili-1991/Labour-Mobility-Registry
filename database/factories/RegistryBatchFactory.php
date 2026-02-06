<?php

namespace Database\Factories;

use App\Models\RegistryBatch;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\RegistryBatch>
 */
class RegistryBatchFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = RegistryBatch::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $batchTypes = ['inbound', 'outbound', 'earnings', 'returns'];
        $schemes = ['RSE', 'SWP', 'PALM'];
        $statuses = ['draft', 'submitted', 'under_review', 'approved', 'rejected'];
        
        $periodStart = $this->faker->dateTimeBetween('-6 months', '-1 month');
        $periodEnd = (clone $periodStart)->modify('+1 month');
        
        $status = $this->faker->randomElement($statuses);
        $submittedBy = User::inRandomOrder()->first()?->id;
        
        return [
            'name' => $this->faker->monthName() . ' ' . $periodStart->format('Y') . ' ' . ucfirst($this->faker->randomElement($batchTypes)) . ' Batch',
            'batch_type' => $this->faker->randomElement($batchTypes),
            'scheme' => $this->faker->randomElement($schemes),
            'period_start' => $periodStart->format('Y-m-d'),
            'period_end' => $periodEnd->format('Y-m-d'),
            'status' => $status,
            'description' => $this->faker->optional(0.7)->sentence(10),
            'record_count' => $this->faker->numberBetween(10, 500),
            'submitted_by' => $submittedBy,
            'verified_by' => in_array($status, ['under_review', 'approved', 'rejected']) ? User::inRandomOrder()->first()?->id : null,
            'approved_by' => $status === 'approved' ? User::inRandomOrder()->first()?->id : null,
            'submitted_at' => in_array($status, ['submitted', 'under_review', 'approved', 'rejected']) ? $this->faker->dateTimeBetween('-2 months', '-1 week') : null,
            'verified_at' => in_array($status, ['under_review', 'approved', 'rejected']) ? $this->faker->dateTimeBetween('-1 month', '-3 days') : null,
            'approved_at' => $status === 'approved' ? $this->faker->dateTimeBetween('-2 weeks', '-1 day') : null,
            'rejection_reason' => $status === 'rejected' ? $this->faker->sentence() : null,
            'verification_notes' => in_array($status, ['under_review', 'approved', 'rejected']) ? $this->faker->optional()->sentence() : null,
            'approval_notes' => $status === 'approved' ? $this->faker->optional()->sentence() : null,
            'metadata' => [
                'source' => $this->faker->randomElement(['csv_upload', 'manual_entry', 'api_import']),
                'import_date' => $this->faker->dateTimeBetween('-6 months', '-1 month')->format('Y-m-d'),
                'validation_errors' => $this->faker->numberBetween(0, 5),
                'processing_time' => $this->faker->numberBetween(30, 300) . ' seconds',
            ],
        ];
    }
}
