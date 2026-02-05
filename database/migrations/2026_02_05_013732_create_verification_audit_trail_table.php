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
        Schema::create('verification_audit_trail', function (Blueprint $table) {
            $table->id();
            $table->foreignId('registry_id')->nullable()->constrained('registry')->onDelete('cascade');
            $table->foreignId('registry_batch_id')->nullable()->constrained()->onDelete('cascade');
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('action'); // 'created', 'updated', 'deleted', 'submitted', 'verified', 'approved', 'rejected'
            $table->text('description')->nullable();
            $table->json('old_values')->nullable();
            $table->json('new_values')->nullable();
            $table->string('ip_address')->nullable();
            $table->text('user_agent')->nullable();
            $table->timestamp('action_at')->useCurrent();
            $table->timestamps();
            
            $table->index(['registry_id', 'action']);
            $table->index(['registry_batch_id', 'action']);
            $table->index(['user_id', 'action_at']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('verification_audit_trail');
    }
};
