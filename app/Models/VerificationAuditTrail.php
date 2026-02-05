<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class VerificationAuditTrail extends Model
{
    use HasFactory;

    protected $table = 'verification_audit_trail';

    protected $fillable = [
        'registry_id',
        'registry_batch_id',
        'user_id',
        'action',
        'description',
        'old_values',
        'new_values',
        'ip_address',
        'user_agent',
    ];

    protected $casts = [
        'old_values' => 'array',
        'new_values' => 'array',
        'action_at' => 'datetime',
    ];

    public function registry(): BelongsTo
    {
        return $this->belongsTo(Registry::class);
    }

    public function registryBatch(): BelongsTo
    {
        return $this->belongsTo(RegistryBatch::class);
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }
}
