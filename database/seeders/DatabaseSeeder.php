<?php

namespace Database\Seeders;

use App\Models\User;
// use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    /**
     * Seed the application's database.
     */
    public function run(): void
    {
        // Run role and permission seeder first
        $this->call([
            RolePermissionSeeder::class,
        ]);

        // Create users with roles
        $this->call([
            UserSeeder::class,
        ]);

        // Create additional regular users
        User::factory(5)->create();

        User::firstOrCreate(
            ['email' => 'test@example.com'],
            ['name' => 'Test User']
        );

        // Create registry and batch data
        $this->call([
            RegistrySeeder::class,
        ]);

        // Schedule config for cron jobs
        $this->call([
            ScheduleConfigSeeder::class,
        ]);
    }
}
