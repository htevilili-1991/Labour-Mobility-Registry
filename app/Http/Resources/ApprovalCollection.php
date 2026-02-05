<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class ApprovalCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($approval) {
                return [
                    'id' => $approval->id,
                    'registry_batch_id' => $approval->registry_batch_id,
                    'user_id' => $approval->user_id,
                    'action' => $approval->action,
                    'comments' => $approval->comments,
                    'discrepancies_found' => $approval->discrepancies_found,
                    'verification_checklist' => $approval->verification_checklist,
                    'ip_address' => $approval->ip_address,
                    'user_agent' => $approval->user_agent,
                    'action_at' => $approval->action_at,
                    'created_at' => $approval->created_at,
                    'updated_at' => $approval->updated_at,
                    'user' => [
                        'id' => $approval->user->id,
                        'name' => $approval->user->name,
                        'email' => $approval->user->email,
                    ],
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
