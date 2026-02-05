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
        Schema::table('registry', function (Blueprint $table) {
            $table->foreignId('registry_batch_id')->nullable()->constrained()->onDelete('set null');
            $table->boolean('is_locked')->default(false); // Lock approved records
            $table->timestamp('locked_at')->nullable();
            $table->foreignId('locked_by')->nullable()->constrained('users')->onDelete('set null');
            
            $table->index(['registry_batch_id', 'is_locked']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registry', function (Blueprint $table) {
            $table->dropForeign(['registry_batch_id']);
            $table->dropForeign(['locked_by']);
            $table->dropColumn(['registry_batch_id', 'is_locked', 'locked_at', 'locked_by']);
        });
    }
};
