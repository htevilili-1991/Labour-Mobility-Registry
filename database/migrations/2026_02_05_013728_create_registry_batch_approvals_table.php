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
        Schema::create('registry_batch_approvals', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registry_batch_id')->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->enum('action', ['submitted', 'verified', 'approved', 'rejected']);
            $table->text('comments')->nullable();
            $table->json('discrepancies_found')->nullable(); // Store identified discrepancies
            $table->json('verification_checklist')->nullable(); // Checklist of items verified
            $table->timestamp('action_at')->useCurrent();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamps();
            
            $table->index(['registry_batch_id', 'action']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('registry_batch_approvals');
    }
};
