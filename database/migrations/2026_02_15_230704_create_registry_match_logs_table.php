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
        Schema::create('registry_match_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('return_registry_id')->constrained('registry')->cascadeOnDelete();
            $table->foreignId('matched_outbound_id')->nullable()->constrained('registry')->nullOnDelete();
            $table->decimal('confidence', 5, 2)->nullable();
            $table->string('status'); // matched, unmatched, pending_review
            $table->text('notes')->nullable();
            $table->foreignId('user_id')->nullable()->constrained()->nullOnDelete();
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registry_match_logs');
    }
};
