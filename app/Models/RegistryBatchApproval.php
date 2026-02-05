<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class RegistryBatchApproval extends Model
{
    use HasFactory;

    protected $fillable = [
        'registry_batch_id',
        'user_id',
        'action',
        'comments',
        'discrepancies_found',
        'verification_checklist',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'discrepancies_found' => 'array',
        'verification_checklist' => 'array',
        'action_at' => 'datetime',
    ];

    public function registryBatch(): BelongsTo
    {
        return $this->belongsTo(RegistryBatch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
