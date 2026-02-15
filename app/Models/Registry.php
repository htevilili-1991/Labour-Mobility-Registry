<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class Registry extends Model implements Auditable
{
    use HasFactory;
    use \OwenIt\Auditing\Auditable;

    public const REINTEGRATION_STATUSES = [
        'Pending' => 'Pending',
        'In Progress' => 'In Progress',
        'Completed' => 'Completed',
        'No Support Needed' => 'No Support Needed',
    ];

    protected $table = 'registry';

    protected $fillable = [
        'surname', 'given_name', 'nationality', 'country_of_residence', 'national_id_number',
        'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date',
        'direction', 'accommodation_address', 'note', 'travel_reason',
        'border_post', 'destination_coming_from', 'registry_batch_id',
        'return_date', 'flight_number', 'linked_outbound_id',
        'reintegration_status', 'self_reported_issues', 'match_confidence', 'match_status',
        'is_locked', 'locked_at', 'locked_by',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'dob' => 'date',
        'return_date' => 'date',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
    ];

    public function registryBatch(): BelongsTo
    {
        return $this->belongsTo(RegistryBatch::class);
    }

    public function linkedOutbound(): BelongsTo
    {
        return $this->belongsTo(Registry::class, 'linked_outbound_id');
    }

    public function returnRecords(): \Illuminate\Database\Eloquent\Relations\HasMany
    {
        return $this->hasMany(Registry::class, 'linked_outbound_id');
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function canBeEdited(): bool
    {
        return ! $this->is_locked;
    }

    public function canBeDeleted(): bool
    {
        return ! $this->is_locked;
    }
}
