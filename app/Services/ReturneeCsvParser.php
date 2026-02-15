<?php

namespace App\Services;

use Carbon\Carbon;

class ReturneeCsvParser
{
    /** @var array<string, int> Map normalized header => column index */
    protected array $headerMap = [];

    protected array $returneeAliases = [
        'surname' => ['family_name', 'surname', 'last_name', 'familyname'],
        'given_name' => ['given_names', 'given_name', 'first_name', 'firstname', 'givennames'],
        'document_no' => ['passport_no', 'document_no', 'passport_number', 'passportno'],
        'dob' => ['dob', 'date_of_birth', 'dateofbirth', 'birth_date'],
        'nationality' => ['nationality'],
        'travel_date' => ['arrival_date', 'travel_date', 'date_of_arrival', 'arrivaldate'],
        'flight_number' => ['flight_number', 'flight_no', 'flightnumber'],
        'border_post' => ['port_of_entry', 'border_post', 'port', 'portofentry'],
        'sex' => ['gender', 'sex'],
        'accommodation_address' => ['address', 'address_vanuatu', 'accommodation', 'accommodation_address'],
        'note' => ['occupation', 'note', 'remarks'],
        'destination_coming_from' => ['origin', 'coming_from', 'destination_coming_from', 'country_of_origin'],
    ];

    /**
     * Parse returnee CSV rows into normalized registry-ready rows.
     *
     * @return array<int, array<string, mixed>>
     */
    public function parse(string $csvContent): array
    {
        $lines = array_map('str_getcsv', explode("\n", $csvContent));
        $lines = array_values(array_filter($lines, fn ($r) => ! empty(array_filter($r))));

        if (empty($lines)) {
            return [];
        }

        $header = array_map(fn ($h) => trim(str_replace('"', '', $h ?? '')), $lines[0]);
        $this->buildHeaderMap($header);

        $rows = [];
        foreach (array_slice($lines, 1) as $i => $raw) {
            $row = $this->mapRow($raw);
            if ($row !== null) {
                $rows[] = $row;
            }
        }

        return $rows;
    }

    protected function buildHeaderMap(array $header): void
    {
        $this->headerMap = [];
        foreach ($header as $idx => $h) {
            $normalized = strtolower(trim(preg_replace('/\s+/', '_', $h ?? '')));
            if ($normalized !== '') {
                $this->headerMap[$normalized] = $idx;
            }
        }
    }

    protected function getColumn(array $row, string $field): ?string
    {
        foreach ($this->returneeAliases[$field] ?? [$field] as $alias) {
            $idx = $this->headerMap[$alias] ?? $this->headerMap[str_replace('_', '', $alias)] ?? null;
            if ($idx !== null && isset($row[$idx])) {
                $v = trim(str_replace('"', '', (string) $row[$idx]));
                if ($v !== '') {
                    return $v;
                }
            }
        }

        return null;
    }

    protected function mapRow(array $raw): ?array
    {
        $surname = $this->getColumn($raw, 'surname');
        $givenName = $this->getColumn($raw, 'given_name');
        $documentNo = $this->getColumn($raw, 'document_no');

        if (empty($surname) && empty($givenName) && empty($documentNo)) {
            return null;
        }

        $dob = $this->getColumn($raw, 'dob');
        $travelDate = $this->getColumn($raw, 'travel_date') ?? $dob;
        $age = $this->calculateAge($dob);

        $borderPost = $this->getColumn($raw, 'border_post') ?: 'Bauerfield Airport (VLI)';
        $destination = $this->getColumn($raw, 'destination_coming_from') ?: 'Australia';

        return [
            'surname' => $surname ?? '',
            'given_name' => $givenName ?? '',
            'nationality' => $this->getColumn($raw, 'nationality') ?: 'Vanuatu',
            'country_of_residence' => 'Vanuatu',
            'national_id_number' => null,
            'document_type' => 'Passport',
            'document_no' => $documentNo ?? '',
            'dob' => $dob,
            'age' => $age ?? 0,
            'sex' => $this->getColumn($raw, 'sex') ?: 'Unknown',
            'travel_date' => $travelDate,
            'direction' => 'Inbound',
            'accommodation_address' => $this->getColumn($raw, 'accommodation_address') ?: 'N/A',
            'note' => $this->getColumn($raw, 'note'),
            'travel_reason' => 'Return',
            'border_post' => $borderPost,
            'destination_coming_from' => $destination,
            'flight_number' => $this->getColumn($raw, 'flight_number'),
            'return_date' => $travelDate,
        ];
    }

    protected function calculateAge(?string $dob): ?int
    {
        if (empty($dob)) {
            return null;
        }
        try {
            $parsed = Carbon::parse($dob);

            return $parsed->age;
        } catch (\Throwable) {
            return null;
        }
    }
}
