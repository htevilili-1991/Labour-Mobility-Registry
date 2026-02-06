<?php

namespace Database\Factories;

use App\Models\Registry;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends \Illuminate\Database\Eloquent\Factories\Factory<\App\Models\Registry>
 */
class RegistryFactory extends Factory
{
    /**
     * The name of the factory's corresponding model.
     *
     * @var string
     */
    protected $model = Registry::class;

    /**
     * Define the model's default state.
     *
     * @return array<string, mixed>
     */
    public function definition(): array
    {
        $nationalities = ['Vanuatu', 'Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Papua New Guinea', 'Samoa', 'Tonga'];
        $countries = ['Vanuatu', 'Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Papua New Guinea'];
        $documentTypes = ['Passport', 'National ID', 'Driver License', 'Birth Certificate'];
        $travelReasons = ['Work', 'Business', 'Tourism', 'Education', 'Medical', 'Family Visit', 'Transit'];
        $borderPosts = ['Port Vila', 'Luganville', 'Whitegrass Airport', 'Santo-Pekoa Airport'];
        $destinations = ['Australia', 'New Zealand', 'Fiji', 'Solomon Islands', 'Papua New Guinea', 'Vanuatu'];
        
        $dob = $this->faker->dateTimeBetween('-65 years', '-18 years');
        $travelDate = $this->faker->dateTimeBetween('-2 years', 'now');
        $age = $travelDate->diff($dob)->y;

        return [
            'surname' => $this->faker->lastName(),
            'given_name' => $this->faker->firstName(),
            'nationality' => $this->faker->randomElement($nationalities),
            'country_of_residence' => $this->faker->randomElement($countries),
            'national_id_number' => $this->faker->optional(0.7)->numberBetween(100000, 999999),
            'document_type' => $this->faker->randomElement($documentTypes),
            'document_no' => $this->faker->regexify('[A-Z0-9]{6,9}'),
            'dob' => $dob->format('Y-m-d'),
            'age' => $age,
            'sex' => $this->faker->randomElement(['Male', 'Female']),
            'travel_date' => $travelDate->format('Y-m-d'),
            'direction' => $this->faker->randomElement(['Inbound', 'Outbound']),
            'accommodation_address' => $this->faker->address(),
            'note' => $this->faker->optional(0.3)->sentence(),
            'travel_reason' => $this->faker->randomElement($travelReasons),
            'border_post' => $this->faker->randomElement($borderPosts),
            'destination_coming_from' => $this->faker->randomElement($destinations),
            'registry_batch_id' => null,
            'is_locked' => false,
            'locked_at' => null,
            'locked_by' => null,
        ];
    }
}
