<?php

namespace App\Http\Resources;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\ResourceCollection;

class RegistryEntryCollection extends ResourceCollection
{
    public function toArray(Request $request): array
    {
        return [
            'data' => $this->collection->map(function ($entry) {
                return [
                    'id' => $entry->id,
                    'surname' => $entry->surname,
                    'given_name' => $entry->given_name,
                    'nationality' => $entry->nationality,
                    'national_id_number' => $entry->national_id_number,
                    'document_type' => $entry->document_type,
                    'document_no' => $entry->document_no,
                    'dob' => $entry->dob,
                    'age' => $entry->age,
                    'sex' => $entry->sex,
                    'travel_date' => $entry->travel_date,
                    'direction' => $entry->direction,
                    'accommodation_address' => $entry->accommodation_address,
                    'note' => $entry->note,
                    'travel_reason' => $entry->travel_reason,
                    'border_post' => $entry->border_post,
                    'destination_coming_from' => $entry->destination_coming_from,
                    'registry_batch_id' => $entry->registry_batch_id,
                    'is_locked' => $entry->is_locked,
                    'locked_at' => $entry->locked_at,
                    'locked_by' => $entry->locked_by,
                    'created_at' => $entry->created_at,
                    'updated_at' => $entry->updated_at,
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
