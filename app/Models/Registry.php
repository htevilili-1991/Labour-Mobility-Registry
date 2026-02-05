<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use OwenIt\Auditing\Contracts\Auditable;

class Registry extends Model implements Auditable
{
    use \OwenIt\Auditing\Auditable;
    use HasFactory;

    protected $table = 'registry';

    protected $fillable = [
        'surname', 'given_name', 'nationality', 'country_of_residence','national_id_number',
        'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date',
        'direction', 'accommodation_address', 'note', 'travel_reason',
        'border_post', 'destination_coming_from', 'registry_batch_id',
        'is_locked', 'locked_at', 'locked_by',
    ];

    protected $casts = [
        'travel_date' => 'date',
        'dob' => 'date',
        'is_locked' => 'boolean',
        'locked_at' => 'datetime',
    ];

    public function registryBatch(): BelongsTo
    {
        return $this->belongsTo(RegistryBatch::class);
    }

    public function lockedBy(): BelongsTo
    {
        return $this->belongsTo(User::class, 'locked_by');
    }

    public function canBeEdited(): bool
    {
        return !$this->is_locked;
    }

    public function canBeDeleted(): bool
    {
        return !$this->is_locked;
    }
}
