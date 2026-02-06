<?php

namespace Database\Seeders;

use App\Models\User;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;

class UserSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // Ensure default admin user from migration gets proper role
        $defaultAdmin = User::where('email', 'htevilili@vanuatu.gov.vu')->first();
        if ($defaultAdmin) {
            $defaultAdmin->assignRole('admin');
        }

        // Create users with different roles for testing
        
        // VBoS Data Entry User
        $vbosUser = User::firstOrCreate(
            ['email' => 'vbos@vanuatu.gov.vu'],
            [
                'name' => 'VBoS Data Entry',
                'password' => Hash::make('password'),
            ]
        );
        $vbosUser->assignRole('vbos-data-entry');

        // Labour Department Verification User
        $labourUser = User::firstOrCreate(
            ['email' => 'labour@vanuatu.gov.vu'],
            [
                'name' => 'Labour Department Verifier',
                'password' => Hash::make('password'),
            ]
        );
        $labourUser->assignRole('labour-verification');

        // Admin User
        $adminUser = User::firstOrCreate(
            ['email' => 'admin@vanuatu.gov.vu'],
            [
                'name' => 'System Administrator',
                'password' => Hash::make('password'),
            ]
        );
        $adminUser->assignRole('admin');

        // Additional VBoS Staff
        for ($i = 1; $i <= 3; $i++) {
            $user = User::firstOrCreate(
                ['email' => "vbos{$i}@vanuatu.gov.vu"],
                [
                    'name' => "VBoS Staff {$i}",
                    'password' => Hash::make('password'),
                ]
            );
            $user->assignRole('vbos-data-entry');
        }

        // Additional Labour Department Staff
        for ($i = 1; $i <= 2; $i++) {
            $user = User::firstOrCreate(
                ['email' => "labour{$i}@vanuatu.gov.vu"],
                [
                    'name' => "Labour Verifier {$i}",
                    'password' => Hash::make('password'),
                ]
            );
            $user->assignRole('labour-verification');
        }

        // Labour Oversight Staff
        for ($i = 1; $i <= 2; $i++) {
            $user = User::firstOrCreate(
                ['email' => "oversight{$i}@vanuatu.gov.vu"],
                [
                    'name' => "Labour Oversight {$i}",
                    'password' => Hash::make('password'),
                ]
            );
            $user->assignRole('labour-oversight');
        }

        // Create some regular users without specific roles
        User::factory(5)->create();

        $this->command->info('Users seeded successfully!');
        $this->command->info('Created test users:');
        $this->command->info('- Default Admin: htevilili@vanuatu.gov.vu (password: Admin123!)');
        $this->command->info('- VBoS User: vbos@vanuatu.gov.vu (password: password)');
        $this->command->info('- Labour User: labour@vanuatu.gov.vu (password: password)');
        $this->command->info('- Additional Admin: admin@vanuatu.gov.vu (password: password)');
    }
}
