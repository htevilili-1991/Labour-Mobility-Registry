<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class AuditTrailCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($audit) {
                return [
                    'id' => $audit->id,
                    'registry_id' => $audit->registry_id,
                    'registry_batch_id' => $audit->registry_batch_id,
                    'user_id' => $audit->user_id,
                    'action' => $audit->action,
                    'description' => $audit->description,
                    'old_values' => $audit->old_values,
                    'new_values' => $audit->new_values,
                    'ip_address' => $audit->ip_address,
                    'user_agent' => $audit->user_agent,
                    'action_at' => $audit->action_at,
                    'created_at' => $audit->created_at,
                    'updated_at' => $audit->updated_at,
                    'user' => [
                        'id' => $audit->user->id,
                        'name' => $audit->user->name,
                        'email' => $audit->user->email,
                    ],
                    'registry' => $audit->when($audit->registry, function () {
                        return [
                            'id' => $audit->registry->id,
                            'surname' => $audit->registry->surname,
                            'given_name' => $audit->registry->given_name,
                        ];
                    }),
                    'registry_batch' => $audit->when($audit->registryBatch, function () {
                        return [
                            'id' => $audit->registryBatch->id,
                            'name' => $audit->registryBatch->name,
                            'status' => $audit->registryBatch->status,
                        ];
                    }),
                ];
            }),
            'meta' => $this->when($this->resource instanceof \Illuminate\Pagination\LengthAwarePaginator, function () {
                return [
                    'current_page' => $this->resource->currentPage(),
                    'from' => $this->resource->firstItem(),
                    'last_page' => $this->resource->lastPage(),
                    'per_page' => $this->resource->perPage(),
                    'to' => $this->resource->lastItem(),
                    'total' => $this->resource->total(),
                ];
            }),
        ];
    }
}
