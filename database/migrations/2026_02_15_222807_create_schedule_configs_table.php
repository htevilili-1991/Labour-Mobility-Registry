<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('schedule_configs', function (Blueprint $table) {
            $table->id();
            $table->string('command')->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->boolean('enabled')->default(true);
            $table->string('frequency_type'); // hourly, daily, daily_at, weekly, cron
            $table->string('frequency_value')->nullable(); // e.g. "08:00" for daily_at, cron expression
            $table->json('parameters')->nullable(); // command options
            $table->timestamp('last_run_at')->nullable();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('schedule_configs');
    }
};
