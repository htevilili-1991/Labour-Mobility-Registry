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
        Schema::create('registry_batches', function (Blueprint $table) {
            $table->id();
            $table->string('name'); // e.g., "January 2026 RSE Departures"
            $table->string('batch_type'); // 'inbound', 'outbound', 'earnings', etc.
            $table->string('scheme'); // 'RSE', 'SWP', 'PALM'
            $table->date('period_start'); // Start of reporting period
            $table->date('period_end'); // End of reporting period
            $table->enum('status', ['draft', 'submitted', 'under_review', 'approved', 'rejected'])->default('draft');
            $table->text('description')->nullable();
            $table->integer('record_count')->default(0);
            $table->foreignId('submitted_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('verified_by')->nullable()->constrained('users')->onDelete('set null');
            $table->foreignId('approved_by')->nullable()->constrained('users')->onDelete('set null');
            $table->timestamp('submitted_at')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('approved_at')->nullable();
            $table->text('rejection_reason')->nullable();
            $table->text('verification_notes')->nullable();
            $table->text('approval_notes')->nullable();
            $table->json('metadata')->nullable(); // Store additional batch information
            $table->timestamps();
            
            $table->index(['status', 'scheme']);
            $table->index(['period_start', 'period_end']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registry_batches');
    }
};
