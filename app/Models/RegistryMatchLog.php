<?php

namespace App\Models;

use App\Models\User;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistryMatchLog extends Model
{
    protected $fillable = [
        'return_registry_id',
        'matched_outbound_id',
        'confidence',
        'status',
        'notes',
        'user_id',
    ];

    protected $casts = [
        'confidence' => 'float',
    ];

    public function returnRegistry(): BelongsTo
    {
        return $this->belongsTo(Registry::class, 'return_registry_id');
    }

    public function matchedOutbound(): BelongsTo
    {
        return $this->belongsTo(Registry::class, 'matched_outbound_id');
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
