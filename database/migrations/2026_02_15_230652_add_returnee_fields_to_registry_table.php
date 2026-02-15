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
            $table->date('return_date')->nullable()->after('travel_date');
            $table->string('flight_number')->nullable()->after('return_date');
            $table->foreignId('linked_outbound_id')->nullable()->after('registry_batch_id')
                ->constrained('registry')->nullOnDelete();
            $table->string('reintegration_status')->nullable()->after('linked_outbound_id');
            $table->text('self_reported_issues')->nullable()->after('reintegration_status');
            $table->decimal('match_confidence', 5, 2)->nullable()->after('self_reported_issues');
            $table->string('match_status')->nullable()->after('match_confidence'); // matched, unmatched, pending_review
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::table('registry', function (Blueprint $table) {
            $table->dropForeign(['linked_outbound_id']);
            $table->dropColumn([
                'return_date', 'flight_number', 'linked_outbound_id',
                'reintegration_status', 'self_reported_issues', 'match_confidence', 'match_status',
            ]);
        });
    }
};
