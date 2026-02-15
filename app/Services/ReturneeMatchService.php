<?php

namespace App\Services;

use App\Models\Registry;
use Illuminate\Support\Str;

class ReturneeMatchService
{
    public const MIN_CONFIDENCE = 80.0;

    /**
     * Find best matching outbound registry entry for a returnee row.
     * Searches by direction=Outbound, matches on surname+given_name+DOB+document_no.
     *
     * @param  array{surname: string, given_name: string, dob: ?string, document_no: string}  $returneeRow
     * @return array{matched: Registry|null, confidence: float, status: string}
     */
    public function findOutboundMatch(array $returneeRow): array
    {
        $docNo = trim($returneeRow['document_no'] ?? '');
        $surname = trim($returneeRow['surname'] ?? '');
        $givenName = trim($returneeRow['given_name'] ?? '');
        $dob = $this->normalizeDate($returneeRow['dob'] ?? null);

        if (empty($docNo) && empty($surname) && empty($givenName)) {
            return ['matched' => null, 'confidence' => 0.0, 'status' => 'unmatched'];
        }

        $outboundQuery = Registry::query()
            ->where('direction', 'Outbound')
            ->whereNull('linked_outbound_id');

        $candidates = $outboundQuery->get();

        $bestMatch = null;
        $bestScore = 0.0;

        foreach ($candidates as $candidate) {
            $score = $this->computeSimilarity(
                $surname,
                $givenName,
                $dob,
                $docNo,
                $candidate->surname,
                $candidate->given_name,
                $this->normalizeDate($candidate->dob),
                $candidate->document_no
            );

            if ($score >= self::MIN_CONFIDENCE && $score > $bestScore) {
                $bestScore = $score;
                $bestMatch = $candidate;
            }
        }

        $status = $bestMatch ? 'matched' : 'unmatched';
        if ($bestMatch && $bestScore < 95.0) {
            $status = 'pending_review';
        }

        return [
            'matched' => $bestMatch,
            'confidence' => round($bestScore, 2),
            'status' => $status,
        ];
    }

    /**
     * Compute similarity score 0-100 based on name, DOB, document.
     */
    protected function computeSimilarity(
        string $s1Surname,
        string $s1Given,
        ?string $s1Dob,
        string $s1Doc,
        string $s2Surname,
        string $s2Given,
        ?string $s2Dob,
        string $s2Doc
    ): float {
        $scores = [];

        if (! empty($s1Doc) && ! empty($s2Doc)) {
            $docSim = Str::lower($s1Doc) === Str::lower($s2Doc) ? 100.0 : 0.0;
            $scores['doc'] = $docSim;
        }

        $surnameSim = $this->stringSimilarity(Str::lower($s1Surname), Str::lower($s2Surname));
        $givenSim = $this->stringSimilarity(Str::lower($s1Given), Str::lower($s2Given));
        $scores['name'] = ($surnameSim + $givenSim) / 2;

        if ($s1Dob && $s2Dob) {
            $dobSim = $s1Dob === $s2Dob ? 100.0 : 0.0;
            $scores['dob'] = $dobSim;
        }

        if (empty($scores)) {
            return 0.0;
        }

        $weights = [
            'doc' => 0.5,
            'name' => 0.35,
            'dob' => 0.15,
        ];

        $total = 0.0;
        $div = 0.0;
        foreach ($scores as $k => $v) {
            $w = $weights[$k] ?? 0.25;
            $total += $v * $w;
            $div += $w;
        }

        return $div > 0 ? ($total / $div) * 100 : 0.0;
    }

    protected function stringSimilarity(string $a, string $b): float
    {
        if (empty($a) && empty($b)) {
            return 100.0;
        }
        if (empty($a) || empty($b)) {
            return 0.0;
        }
        similar_text($a, $b, $pct);

        return (float) $pct;
    }

    protected function normalizeDate(?string $value): ?string
    {
        if (empty($value)) {
            return null;
        }
        $clean = trim(str_replace(['"', "'"], '', $value));
        if (preg_match('/^(\d{1,2})[\/\-](\d{1,2})[\/\-](\d{4})$/', $clean, $m)) {
            return sprintf('%04d-%02d-%02d', (int) $m[3], (int) $m[2], (int) $m[1]);
        }
        if (preg_match('/^(\d{4})[\/\-](\d{2})[\/\-](\d{2})$/', $clean, $m)) {
            return sprintf('%04d-%02d-%02d', (int) $m[1], (int) $m[2], (int) $m[3]);
        }

        return $clean;
    }
}
