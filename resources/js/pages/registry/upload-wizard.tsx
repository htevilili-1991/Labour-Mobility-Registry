import { Head, useForm, usePage, router } from '@inertiajs/react';
import { PageProps, User, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Upload, Users, XCircle, Pencil, Download, Wand2, FileDown, Link2 } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface ReturneeMatch {
    matched: { id: number; surname: string; given_name: string; travel_date: string } | null;
    confidence: number;
    status: string;
}

interface ReturneePreview {
    rows: Record<string, unknown>[];
    matches: Record<number, ReturneeMatch>;
    totalRows: number;
    matchedCount: number;
    unmatchedCount: number;
    pendingReviewCount: number;
}

interface Props extends PageProps {
    auth: {
        user: User | null;
    };
    errors?: {
        csv_file?: string;
        entries?: string;
    };
    success?: string;
    returneePreview?: ReturneePreview;
}

interface UploadStep {
    id: string;
    title: string;
    description: string;
    icon: React.ComponentType<any>;
    completed: boolean;
    errors?: string[];
}

interface CsvPreview {
    headers: string[];
    rows: string[][];
    totalRows: number;
    validRows: number;
    duplicates: number;
    validationDetails?: {
        row: number;
        errors: string[];
    }[];
}

const STORAGE_KEY = 'upload-wizard-progress';

const UploadWizard: React.FC = () => {
    const { errors, success, auth, returneePreview: initialReturneePreview } = usePage<Props>().props;
    const fileInputRef = useRef<HTMLInputElement>(null);
    const dropZoneRef = useRef<HTMLDivElement>(null);
    const [isDragging, setIsDragging] = useState(false);
    
    // Load saved progress from localStorage
    const loadSavedProgress = useCallback(() => {
        try {
            const saved = localStorage.getItem(STORAGE_KEY);
            if (saved) {
                const parsed = JSON.parse(saved);
                return {
                    batch_name: parsed.batch_name || '',
                    batch_type: parsed.batch_type || '',
                    currentStep: parsed.currentStep || 1,
                };
            }
        } catch (e) {
            console.error('Failed to load saved progress:', e);
        }
        return { batch_name: '', batch_type: '', currentStep: 1 };
    }, []);

    const savedProgress = loadSavedProgress();
    
    const form = useForm({
        csv_file: null as File | null,
        batch_name: savedProgress.batch_name,
        batch_type: savedProgress.batch_type,
        entries: [] as any[],
    });

    const { post, setData, processing, data } = form;

    const [currentStep, setCurrentStep] = useState(1);
    const [importMode, setImportMode] = useState<'standard' | 'returnee'>('standard');
    const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
    const [returneePreview, setReturneePreview] = useState<ReturneePreview | null>(initialReturneePreview ?? null);
    const [returneePreviewLoading, setReturneePreviewLoading] = useState(false);
    const [returneePreviewError, setReturneePreviewError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showCsvEditor, setShowCsvEditor] = useState(false);
    const [editableRows, setEditableRows] = useState<string[][]>([]);

    // Always start at step 1 on mount (overrides any stale state from bfcache/localStorage)
    useEffect(() => {
        setCurrentStep(1);
    }, []);

    // Auto-save progress to localStorage
    useEffect(() => {
        const progress = {
            batch_name: data.batch_name,
            batch_type: data.batch_type,
            currentStep,
        };
        localStorage.setItem(STORAGE_KEY, JSON.stringify(progress));
    }, [data.batch_name, data.batch_type, currentStep]);

    // Clear saved progress on successful submission
    const clearSavedProgress = useCallback(() => {
        localStorage.removeItem(STORAGE_KEY);
    }, []);

    const steps: UploadStep[] = [
        {
            id: 'select',
            title: 'Select CSV File',
            description: 'Choose and preview your CSV file before uploading',
            icon: Upload,
            completed: false,
        },
        {
            id: 'validate',
            title: 'Validate Data',
            description: 'Review data quality and fix any issues',
            icon: CheckCircle,
            completed: false,
        },
        {
            id: 'create',
            title: 'Create Batch',
            description: 'Create a batch and add entries',
            icon: Users,
            completed: false,
        },
    ];

    // Enhanced validation functions
    const validatePassportFormat = (docNo: string, docType: string): string | null => {
        if (!docNo) return null;
        // Common passport formats: alphanumeric, 6-9 characters
        const passportRegex = /^[A-Z0-9]{6,9}$/i;
        if (docType?.toLowerCase().includes('passport') && !passportRegex.test(docNo)) {
            return 'Passport number should be 6-9 alphanumeric characters';
        }
        return null;
    };

    const calculateAge = (dob: string): number | null => {
        if (!dob) return null;
        try {
            // Try to parse various date formats
            const dateStr = dob.replace(/-/g, '/');
            const date = new Date(dateStr);
            if (isNaN(date.getTime())) return null;
            const today = new Date();
            let age = today.getFullYear() - date.getFullYear();
            const monthDiff = today.getMonth() - date.getMonth();
            if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < date.getDate())) {
                age--;
            }
            return age >= 0 ? age : null;
        } catch {
            return null;
        }
    };

    const validateDateLogic = (travelDate: string, direction: string): string | null => {
        // This would need return_date field to fully validate
        // For now, just validate date format
        if (!travelDate) return null;
        
        const cleanDate = travelDate.trim().replace(/"/g, '');
        const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;

        if (ddmmyyyyRegex.test(cleanDate) || yyyymmddRegex.test(cleanDate)) {
            return null;
        }

        return 'Travel date should be in format DD/MM/YYYY or YYYY-MM-DD';
    };

    /**
     * Parse various date formats and return DD/MM/YYYY or null if unparseable.
     * Handles: MM-DD-YYYY, MM-DD-YY, DD-MM-YYYY, DD-MM-YY, DD/MM/YYYY, MM/DD/YYYY, YYYY-MM-DD.
     */
    const parseAndFormatDate = (value: string): string | null => {
        if (!value) return null;
        const clean = value.trim().replace(/"/g, '');
        if (!clean) return null;
        // Already valid DD/MM/YYYY
        if (/^\d{1,2}\/\d{1,2}\/\d{4}$/.test(clean)) return clean;
        if (/^\d{4}-\d{2}-\d{2}$/.test(clean)) {
            const [y, m, d] = clean.split('-');
            return `${d}/${m}/${y}`;
        }
        // A-B-C with - or / : disambiguate MM-DD vs DD-MM (first > 12 => day, second > 12 => day)
        const match = clean.match(/^(\d{1,2})[-\/](\d{1,2})[-\/](\d{2,4})$/);
        if (match) {
            let [, a, b, y] = match;
            const nA = parseInt(a, 10);
            const nB = parseInt(b, 10);
            const year = y.length === 2 ? (parseInt(y, 10) < 50 ? `20${y}` : `19${y}`) : y;
            let month: string;
            let day: string;
            if (nA > 12 && nB <= 12) {
                day = a.padStart(2, '0');
                month = b.padStart(2, '0');
            } else if (nA <= 12 && nB > 12) {
                month = a.padStart(2, '0');
                day = b.padStart(2, '0');
            } else {
                month = a.padStart(2, '0');
                day = b.padStart(2, '0');
            }
            return `${day}/${month}/${year}`;
        }
        const d = new Date(clean);
        if (!isNaN(d.getTime())) {
            return `${String(d.getDate()).padStart(2, '0')}/${String(d.getMonth() + 1).padStart(2, '0')}/${d.getFullYear()}`;
        }
        return null;
    };

    // Run validation on headers + rows and return CsvPreview (reused after file load and after edit)
    const runValidation = useCallback((headers: string[], rows: string[][]): CsvPreview => {
        const validationDetails: { row: number; errors: string[] }[] = [];
        const validRows: string[][] = [];
        const duplicates = new Map<string, number[]>();

        rows.forEach((row, index) => {
            const rowNum = index + 2;
            const errors: string[] = [];
            if (row.length < headers.length) {
                errors.push(`Row ${rowNum}: Missing columns (expected ${headers.length}, got ${row.length})`);
            }
            const [surname, givenName, nationality, countryOfResidence, nationalIdNumber, documentType, documentNo, dob, age, sex, travelDate, direction, accommodationAddress, note, travelReason, borderPost, destinationComingFrom] = row;
            if (!surname || !givenName || !nationality || !documentType || !documentNo) {
                errors.push(`Row ${rowNum}: Missing required fields`);
            }
            const passportError = validatePassportFormat(documentNo ?? '', documentType ?? '');
            if (passportError) errors.push(`Row ${rowNum}: ${passportError}`);
            if (dob && age) {
                const calculatedAge = calculateAge(dob);
                if (calculatedAge !== null && calculatedAge !== parseInt(age)) {
                    errors.push(`Row ${rowNum}: Age mismatch (calculated: ${calculatedAge}, provided: ${age})`);
                }
            }
            const dateError = validateDateLogic(travelDate ?? '', direction ?? '');
            if (dateError) errors.push(`Row ${rowNum}: ${dateError}`);
            const docKey = `${nationality}-${documentNo}`;
            if (duplicates.has(docKey)) {
                duplicates.get(docKey)!.push(rowNum);
            } else {
                duplicates.set(docKey, [rowNum]);
            }
            if (errors.length === 0) {
                validRows.push(row);
            } else {
                validationDetails.push({ row: rowNum, errors });
            }
        });

        const duplicateRows = Array.from(duplicates.entries())
            .filter(([, rowNums]) => rowNums.length > 1)
            .flatMap(([, rowNums]) => rowNums);

        return {
            headers,
            rows,
            totalRows: rows.length,
            validRows: validRows.length,
            duplicates: duplicateRows.length,
            validationDetails,
        };
    }, []);

    const handleAutoFixDates = useCallback(() => {
        if (!csvPreview) return;
        const { headers, rows } = csvPreview;
        const normalizedHeaders = headers.map((h) => (h || '').toLowerCase().replace(/\s/g, '_').replace(/"/g, ''));
        let travelDateIdx = normalizedHeaders.findIndex((h) =>
            h === 'travel_date' || h === 'traveldate' || (h && h.includes('travel') && h.includes('date'))
        );
        let dobIdx = normalizedHeaders.findIndex((h) =>
            h === 'dob' || h === 'date_of_birth' || h === 'dateofbirth'
        );
        if (travelDateIdx === -1 && headers.length >= 11) travelDateIdx = 10;
        if (dobIdx === -1 && headers.length >= 9) dobIdx = 7;
        if (travelDateIdx === -1 && dobIdx === -1) return;

        const fixedRows = rows.map((row) => {
            const next = [...row];
            if (travelDateIdx >= 0 && row[travelDateIdx]) {
                const fixed = parseAndFormatDate(String(row[travelDateIdx]));
                if (fixed) next[travelDateIdx] = fixed;
            }
            if (dobIdx >= 0 && row[dobIdx]) {
                const fixed = parseAndFormatDate(String(row[dobIdx]));
                if (fixed) next[dobIdx] = fixed;
            }
            return next;
        });

        const nextPreview = runValidation(headers, fixedRows);
        setCsvPreview(nextPreview);
        setValidationErrors((nextPreview.validationDetails ?? []).map((d) => d.errors.join('; ')).flat());

        const escapeCsv = (val: unknown) => {
            const s = String(val ?? '');
            return s.includes(',') || s.includes('"') || s.includes('\n') ? `"${s.replace(/"/g, '""')}"` : s;
        };
        const numCols = headers.length;
        const csvLines = [headers.map(escapeCsv).join(',')].concat(
            fixedRows.map((r) => r.slice(0, numCols).map(escapeCsv).concat(Array(Math.max(0, numCols - r.length)).fill('')).join(','))
        );
        const blob = new Blob([csvLines.join('\n')], { type: 'text/csv' });
        const file = new File([blob], data.csv_file?.name || 'registry-data.csv', { type: 'text/csv' });
        setData('csv_file', file);
    }, [csvPreview, runValidation, data.csv_file?.name, setData]);

    const hasDateValidationErrors = useCallback(() => {
        if (!csvPreview?.validationDetails) return false;
        const dateMsg = 'travel date should be';
        return csvPreview.validationDetails.some((d) =>
            d.errors.some((e) => e.toLowerCase().includes(dateMsg))
        );
    }, [csvPreview]);

    const openCsvEditor = useCallback(() => {
        if (!csvPreview) return;
        const numCols = csvPreview.headers.length;
        const padded = csvPreview.rows.map((row) =>
            [...row].concat(Array(Math.max(0, numCols - row.length)).fill(''))
        );
        setEditableRows(padded);
        setShowCsvEditor(true);
    }, [csvPreview]);

    const updateEditableCell = useCallback((rowIndex: number, colIndex: number, value: string) => {
        setEditableRows((prev) => {
            const next = prev.map((r) => [...r]);
            if (!next[rowIndex]) return prev;
            next[rowIndex] = [...next[rowIndex]];
            next[rowIndex][colIndex] = value;
            return next;
        });
    }, []);

    const applyEditedCsv = useCallback(() => {
        if (!csvPreview) return;
        const numCols = csvPreview.headers.length;
        const normalized = editableRows.map((row) =>
            [...row].slice(0, numCols).concat(Array(Math.max(0, numCols - row.length)).fill(''))
        );
        const nextPreview = runValidation(csvPreview.headers, normalized);
        setCsvPreview(nextPreview);
        setValidationErrors(
            (nextPreview.validationDetails ?? []).map((d) => d.errors.join('; ')).flat()
        );
        setShowCsvEditor(false);
    }, [csvPreview, editableRows, runValidation]);

    const processCsvFile = useCallback((file: File) => {
        setData('csv_file', file);
        if (importMode === 'returnee') {
            setReturneePreview(null);
            setReturneePreviewError(null);
            return;
        }

        const reader = new FileReader();
        reader.onload = async (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
            const rows = lines.slice(1).map(line => {
                // Handle CSV with quoted fields
                const cells: string[] = [];
                let current = '';
                let inQuotes = false;
                for (let i = 0; i < line.length; i++) {
                    const char = line[i];
                    if (char === '"') {
                        inQuotes = !inQuotes;
                    } else if (char === ',' && !inQuotes) {
                        cells.push(current.trim());
                        current = '';
                    } else {
                        current += char;
                    }
                }
                cells.push(current.trim());
                return cells;
            });

            const result = runValidation(headers, rows);
            setValidationErrors(
                (result.validationDetails ?? []).map((d) => d.errors.join('; ')).flat()
            );
            setCsvPreview(result);
        };
        reader.readAsText(file);
    }, [setData, runValidation, importMode]);

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (file && file.type === 'text/csv' || file.name.endsWith('.csv')) {
            processCsvFile(file);
        }
    }, [processCsvFile]);

    // Drag and drop handlers
    const handleDragEnter = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(true);
    }, []);

    const handleDragLeave = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
    }, []);

    const handleDrop = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.stopPropagation();
        setIsDragging(false);

        const files = Array.from(e.dataTransfer.files);
        const csvFile = files.find(f => f.type === 'text/csv' || f.name.endsWith('.csv'));
        if (csvFile) {
            processCsvFile(csvFile);
        }
    }, [processCsvFile]);

    const handleReturneePreview = useCallback(async () => {
        if (!data.csv_file) return;
        setReturneePreviewLoading(true);
        setReturneePreviewError(null);
        const formData = new FormData();
        formData.append('csv_file', data.csv_file);
        try {
            const res = await fetch(route('registry.previewReturneeWizard'), {
                method: 'POST',
                body: formData,
                headers: {
                    'Accept': 'application/json',
                    'X-Requested-With': 'XMLHttpRequest',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                },
            });
            const json = await res.json().catch(() => ({}));
            if (res.ok) {
                setReturneePreview(json);
                setCurrentStep(2);
            } else {
                const msg = json?.message ?? json?.errors?.csv_file?.[0] ?? 'Failed to preview';
                setReturneePreviewError(msg);
            }
        } catch (e) {
            setReturneePreviewError(e instanceof Error ? e.message : 'Network error');
        } finally {
            setReturneePreviewLoading(false);
        }
    }, [data.csv_file]);

    const handleStepComplete = useCallback(() => {
        if (importMode === 'returnee' && currentStep === 1 && data.csv_file) {
            handleReturneePreview();
            return;
        }
        const nextStep = Math.min(currentStep + 1, steps.length);
        setCurrentStep(nextStep);
    }, [currentStep, importMode, data.csv_file, handleReturneePreview]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();

        if (currentStep < steps.length) {
            handleStepComplete();
            return;
        }

        if (importMode === 'returnee') {
            const fd = new FormData();
            fd.append('csv_file', data.csv_file!);
            fd.append('batch_name', data.batch_name);
            fd.append('_token', document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '');
            router.post(route('registry.storeReturneeWizard'), fd, {
                onSuccess: () => {
                    setData('csv_file', null);
                    setData('batch_name', '');
                    setReturneePreview(null);
                    setCurrentStep(1);
                    clearSavedProgress();
                },
            });
            return;
        }

        post(route('registry.storeWizard'), {
            onSuccess: () => {
                setData('csv_file', null);
                setData('batch_name', '');
                setData('batch_type', '');
                setData('entries', []);
                setCurrentStep(1);
                setCsvPreview(null);
                clearSavedProgress();
            },
        });
    }, [currentStep, importMode, data.csv_file, data.batch_name]);

    // Derive completed state for each step (1-based index)
    const isStepCompleted = useCallback((stepIndex: number) => {
        const oneBased = stepIndex + 1;
        if (importMode === 'returnee') {
            if (oneBased === 1) return !!(data.csv_file && (returneePreview || currentStep > 1));
            if (oneBased === 2) return currentStep > 2;
            return false;
        }
        if (oneBased === 1) return !!csvPreview;
        if (oneBased === 2) return currentStep > 2;
        return false;
    }, [csvPreview, currentStep, importMode, data.csv_file, returneePreview]);

    // Step has validation errors (show red, hide Next button)
    const isStepHasError = useCallback((stepIndex: number) => {
        const oneBased = stepIndex + 1;
        const isCurrentStep = currentStep === oneBased;
        if (!isCurrentStep) return false;
        if (importMode === 'returnee') {
            if (oneBased === 1) return !data.csv_file;
            if (oneBased === 2) return !returneePreview || returneePreview.totalRows === 0;
            if (oneBased === 3) return !data.batch_name?.trim();
            return false;
        }
        if (oneBased === 1) return !csvPreview;
        if (oneBased === 2) return !csvPreview || csvPreview.validRows === 0;
        if (oneBased === 3) return !data.batch_name?.trim() || !data.batch_type;
        return false;
    }, [currentStep, csvPreview, data.batch_name, data.batch_type, importMode, data.csv_file, returneePreview]);

    const getStepIcon = (step: UploadStep, stepIndex: number) => {
        const Icon = step.icon;
        const completed = isStepCompleted(stepIndex);
        const hasError = isStepHasError(stepIndex);
        if (hasError) return <XCircle className="w-6 h-6 text-red-600 shrink-0" aria-hidden />;
        if (completed) return <CheckCircle className="w-6 h-6 text-green-600 shrink-0" aria-hidden />;
        return (
            <Icon className={`w-6 h-6 ${currentStep === stepIndex + 1 ? 'text-blue-600' : 'text-gray-400'}`} />
        );
    };

    const getStepColor = (stepIndex: number) => {
        const hasError = isStepHasError(stepIndex);
        const completed = isStepCompleted(stepIndex);
        const isCurrent = currentStep === stepIndex + 1;
        if (hasError) return 'border-red-400 bg-red-50';
        if (completed) return 'border-green-300 bg-green-50';
        if (isCurrent) return 'border-blue-300 bg-blue-50';
        return 'border-gray-200 bg-gray-50';
    };

    // Current step is valid (no errors) — show Next/Continue/Submit button
    const isCurrentStepValid = isStepHasError(currentStep - 1) === false;

    // Step is unlocked (user can click to go to it). Only current step or completed steps are clickable.
    const isStepUnlocked = useCallback((stepIndex: number) => {
        return currentStep >= stepIndex + 1;
    }, [currentStep]);

    const breadcrumbs: BreadcrumbItem[] = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/registry/upload-wizard', label: 'Upload Wizard' },
    ];

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Upload Registry Data - Wizard" />
            <div className="mx-auto max-w-7xl py-12 sm:px-6 lg:px-8">
                <div className="overflow-hidden rounded-lg border border-gray-200 bg-white shadow-sm">
                    <div className="border-b border-gray-200 bg-white p-6">
                        <div className="mb-6 flex items-center justify-between">
                            <h1 className="text-2xl font-bold text-gray-900">Upload Registry Data - Wizard</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Step {currentStep} of {steps.length}</Badge>
                            </div>
                        </div>

                        {/* Import Mode Selector */}
                        <div className="mb-6 flex gap-4">
                            <Button
                                type="button"
                                variant={importMode === 'standard' ? 'default' : 'outline'}
                                onClick={() => {
                                    setImportMode('standard');
                                    setCsvPreview(null);
                                    setReturneePreview(null);
                                    setData('csv_file', null);
                                    setCurrentStep(1);
                                }}
                            >
                                Standard Import
                            </Button>
                            <Button
                                type="button"
                                variant={importMode === 'returnee' ? 'default' : 'outline'}
                                onClick={() => {
                                    setImportMode('returnee');
                                    setCsvPreview(null);
                                    setReturneePreview(null);
                                    setData('csv_file', null);
                                    setCurrentStep(1);
                                }}
                            >
                                <Link2 className="w-4 h-4 mr-2" />
                                Returnee from Arrival Cards
                            </Button>
                        </div>

                        {success && (
                            <div className="mb-4 rounded p-4 bg-green-100 text-green-700">
                                {success}
                            </div>
                        )}

                        {errors?.csv_file && (
                            <div className="mb-4 rounded p-4 bg-red-100 text-red-700">
                                {errors.csv_file}
                            </div>
                        )}

                        {/* Step Progress */}
                        <div className="mb-8">
                            <div className="flex justify-between gap-2">
                                {steps.map((step, index) => {
                                    const completed = isStepCompleted(index);
                                    const hasError = isStepHasError(index);
                                    const unlocked = isStepUnlocked(index);
                                    return (
                                        <div
                                            key={step.id}
                                            className={`flex-1 text-center p-4 border-2 rounded-lg transition-all duration-200 ${getStepColor(index)} ${
                                                completed ? 'ring-2 ring-green-400/50 ring-offset-2' : ''
                                            } ${hasError ? 'ring-2 ring-red-400/50 ring-offset-2' : ''} ${
                                                unlocked
                                                    ? 'cursor-pointer'
                                                    : 'cursor-not-allowed opacity-60 pointer-events-none'
                                            }`}
                                            onClick={() => unlocked && setCurrentStep(index + 1)}
                                            aria-disabled={!unlocked}
                                        >
                                            {getStepIcon(step, index)}
                                            <h3 className={`font-semibold mt-2 ${
                                                completed ? 'text-green-800' : ''
                                            } ${hasError ? 'text-red-800' : ''} ${
                                                !unlocked ? 'text-gray-500' : ''
                                            }`}>
                                                {step.title}
                                            </h3>
                                            <p className="mt-1 text-sm text-gray-600">{step.description}</p>
                                            {!unlocked && (
                                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-gray-500">
                                                    Locked
                                                </span>
                                            )}
                                            {completed && unlocked && (
                                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-green-700">
                                                    <CheckCircle className="w-3.5 h-3.5" />
                                                    Completed
                                                </span>
                                            )}
                                            {hasError && (
                                                <span className="inline-flex items-center gap-1 mt-2 text-xs font-medium text-red-700">
                                                    <XCircle className="w-3.5 h-3.5" />
                                                    Fix issues to continue
                                                </span>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Step Content */}
                        <div className="p-6">
                            {currentStep === 1 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Upload className="w-5 h-5" />
                                            Select CSV File
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {/* CSV Template Download - Prominent Position */}
                                            <div className="rounded-lg border-2 border-blue-300 bg-blue-100 p-4">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="mb-1 text-lg font-bold text-blue-900">
                                                            {importMode === 'returnee' ? '📋 Returnee Arrival Card Template' : '📋 Need a CSV Template?'}
                                                        </h4>
                                                        <p className="text-sm text-blue-800">
                                                            {importMode === 'returnee'
                                                                ? 'Use arrival card format: family_name, given_names, passport_no, dob, arrival_date, flight_number, port_of_entry, gender, etc.'
                                                                : 'Download our template to ensure your data is formatted correctly before uploading.'}
                                                        </p>
                                                    </div>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => {
                                                            const csvContent = importMode === 'returnee'
                                                                ? `family_name,given_names,passport_no,dob,nationality,arrival_date,flight_number,port_of_entry,gender,address_vanuatu,destination_coming_from
Tevili,Herman,PA1234567,15/03/1990,Vanuatu,10/02/2026,NZ123,Bauerfield Airport (VLI),Male,Port Vila,Australia`
                                                                : `surname,given_name,nationality,country_of_residence,national_id_number,document_type,document_no,dob,age,sex,travel_date,direction,accommodation_address,note,travel_reason,border_post,destination_coming_from
Besv,Dom,PapuaNewGuinea,Australia,594375,National ID,9CQDZhJF,25/04/1995,30,Male,06/10/2025,Exit,633 Walter Stravenue Suite 010 Benjaminside KS 17375-4713,N/A,Medical,Luganville,New Zealand
Tevili,Herman,Vanuatu,Vanuatu,,Passport,PA1234567,15/03/1990,35,Male,10/02/2026,Entry,Port Vila,N/A,Return,Bauerfield Airport (VLI),Australia`;
                                                            const blob = new Blob([csvContent], { type: 'text/csv' });
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = importMode === 'returnee' ? 'returnee-arrival-template.csv' : 'registry-template.csv';
                                                            document.body.appendChild(a);
                                                            a.click();
                                                            document.body.removeChild(a);
                                                            window.URL.revokeObjectURL(url);
                                                        }}
                                                        className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700"
                                                    >
                                                        <Download className="w-4 h-4" />
                                                        Download Template
                                                    </Button>
                                                </div>
                                            </div>
                                            
                                            {/* Drag and Drop Zone */}
                                            <div
                                                ref={dropZoneRef}
                                                onDragEnter={handleDragEnter}
                                                onDragOver={handleDragOver}
                                                onDragLeave={handleDragLeave}
                                                onDrop={handleDrop}
                                                className={`rounded-lg border-2 border-dashed p-8 text-center transition-colors ${
                                                    isDragging
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                                }`}
                                            >
                                                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                                <p className="text-lg font-medium mb-2">
                                                    {isDragging ? 'Drop CSV file here' : 'Drag and drop CSV file here'}
                                                </p>
                                                <p className="mb-4 text-sm text-gray-500">or</p>
                                                <Input
                                                    ref={fileInputRef}
                                                    type="file"
                                                    id="csv_file"
                                                    accept=".csv"
                                                    onChange={handleFileSelect}
                                                    className="hidden"
                                                />
                                                <Button
                                                    type="button"
                                                    onClick={() => fileInputRef.current?.click()}
                                                    variant="outline"
                                                >
                                                    Choose File
                                                </Button>
                                            </div>
                                            
                                            {(csvPreview || (importMode === 'returnee' && data.csv_file)) && (
                                                <div className="mt-4 rounded-lg bg-gray-50 p-4">
                                                    {importMode === 'returnee' ? (
                                                        <>
                                                            <h4 className="mb-2 font-semibold text-gray-900">File Selected</h4>
                                                            <p className="text-sm text-gray-600 mb-4">
                                                                {data.csv_file?.name} – Click &quot;Preview &amp; Match&quot; to validate and match against outbound records.
                                                            </p>
                                                            {returneePreviewError && (
                                                                <Alert variant="destructive" className="mb-4">
                                                                    <AlertDescription>{returneePreviewError}</AlertDescription>
                                                                </Alert>
                                                            )}
                                                        </>
                                                    ) : (
                                                        <>
                                                    <h4 className="mb-2 font-semibold text-gray-900">CSV Preview</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium">Total Rows:</span>
                                                            <span className="text-blue-600">{csvPreview!.totalRows}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Valid Rows:</span>
                                                            <span className="text-green-600">{csvPreview!.validRows}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Duplicates:</span>
                                                            <span className={csvPreview!.duplicates > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                {csvPreview!.duplicates}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {csvPreview!.duplicates > 0 && (
                                                        <Alert className="mt-4">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                <strong>Duplicate Detection:</strong> Found {csvPreview!.duplicates} duplicate entries by document number. These will be automatically skipped during import.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}

                                                    <div className="mt-4">
                                                        <h5 className="font-medium mb-2">Headers Found:</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {csvPreview!.headers.map((header, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {header || `Column ${index + 1}`}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                        </>
                                                    )}
                                                    <div className="mt-6">
                                                        {importMode === 'returnee' ? (
                                                            <Button
                                                                onClick={handleStepComplete}
                                                                disabled={!data.csv_file || returneePreviewLoading}
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                            >
                                                                {returneePreviewLoading ? 'Matching...' : 'Preview & Match'}
                                                            </Button>
                                                        ) : isCurrentStepValid ? (
                                                            <Button
                                                                onClick={handleStepComplete}
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                            >
                                                                Next: Validate Data
                                                            </Button>
                                                        ) : (
                                                            <p className="text-center text-sm text-gray-500 py-2">
                                                                Select a CSV file to continue.
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 2 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <CheckCircle className="w-5 h-5" />
                                            {importMode === 'returnee' ? 'Match Preview' : 'Validate Data'}
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {importMode === 'returnee' && returneePreview ? (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                                        <div className="p-4 bg-green-50 rounded-lg">
                                                            <h4 className="font-semibold text-green-800">Matched</h4>
                                                            <p className="text-2xl font-bold text-green-600">{returneePreview.matchedCount}</p>
                                                        </div>
                                                        <div className="p-4 bg-amber-50 rounded-lg">
                                                            <h4 className="font-semibold text-amber-800">Pending Review</h4>
                                                            <p className="text-2xl font-bold text-amber-600">{returneePreview.pendingReviewCount}</p>
                                                        </div>
                                                        <div className="p-4 bg-red-50 rounded-lg">
                                                            <h4 className="font-semibold text-red-800">Unmatched</h4>
                                                            <p className="text-2xl font-bold text-red-600">{returneePreview.unmatchedCount}</p>
                                                        </div>
                                                        <div className="p-4 bg-gray-50 rounded-lg">
                                                            <h4 className="font-semibold text-gray-800">Total</h4>
                                                            <p className="text-2xl font-bold text-gray-600">{returneePreview.totalRows}</p>
                                                        </div>
                                                    </div>
                                                    <div className="mt-4 max-h-96 overflow-auto border rounded-lg">
                                                        <Table>
                                                            <TableHeader>
                                                                <TableRow>
                                                                    <TableHead>Name</TableHead>
                                                                    <TableHead>Document</TableHead>
                                                                    <TableHead>Arrival Date</TableHead>
                                                                    <TableHead>Status</TableHead>
                                                                    <TableHead>Matched Outbound</TableHead>
                                                                </TableRow>
                                                            </TableHeader>
                                                            <TableBody>
                                                                {returneePreview.rows.map((row, i) => {
                                                                    const m = returneePreview.matches[i] ?? { status: 'unmatched', confidence: 0, matched: null };
                                                                    return (
                                                                        <TableRow key={i}>
                                                                            <TableCell>{row.surname} {row.given_name}</TableCell>
                                                                            <TableCell>{row.document_no}</TableCell>
                                                                            <TableCell>{String(row.travel_date || '')}</TableCell>
                                                                            <TableCell>
                                                                                <Badge variant={m.status === 'matched' ? 'default' : m.status === 'pending_review' ? 'secondary' : 'destructive'}>
                                                                                    {m.status.replace('_', ' ')} {m.confidence ? `(${m.confidence}%)` : ''}
                                                                                </Badge>
                                                                            </TableCell>
                                                                            <TableCell>{m.matched ? `${m.matched.surname} ${m.matched.given_name} (${m.matched.travel_date})` : '—'}</TableCell>
                                                                        </TableRow>
                                                                    );
                                                                })}
                                                            </TableBody>
                                                        </Table>
                                                    </div>
                                                    <div className="mt-6">
                                                        <Button onClick={() => setCurrentStep(3)} className="w-full bg-green-600 hover:bg-green-700">
                                                            Continue to Create Batch
                                                        </Button>
                                                    </div>
                                                </>
                                            ) : csvPreview && (
                                                <>
                                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                        <div className="p-4 bg-green-50 rounded-lg">
                                                            <h4 className="font-semibold text-green-800">✅ Valid Entries</h4>
                                                            <p className="text-2xl font-bold text-green-600">{csvPreview.validRows}</p>
                                                            <p className="text-sm text-green-700">Ready to import</p>
                                                        </div>
                                                        {csvPreview.totalRows - csvPreview.validRows > 0 && (
                                                            <div className="p-4 bg-red-50 rounded-lg">
                                                                <h4 className="font-semibold text-red-800">❌ Invalid Entries</h4>
                                                                <p className="text-2xl font-bold text-red-600">{csvPreview.totalRows - csvPreview.validRows}</p>
                                                                <p className="text-sm text-red-700">Need correction</p>
                                                            </div>
                                                        )}
                                                    </div>

                                                    {csvPreview.duplicates > 0 && (
                                                        <Alert className="mt-4">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                <strong>Action Required:</strong> {csvPreview.duplicates} duplicate entries found. Please review and remove duplicates before proceeding.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}

                                                    {/* Detailed validation errors */}
                                                    {csvPreview.validationDetails && csvPreview.validationDetails.length > 0 && (
                                                        <div className="mt-4 max-h-64 overflow-y-auto border rounded-lg p-4">
                                                            <h4 className="font-semibold mb-2 text-red-800">Validation Errors:</h4>
                                                            <ul className="space-y-2 text-sm">
                                                                {csvPreview.validationDetails.map((detail, idx) => (
                                                                    <li key={idx} className="text-red-700">
                                                                        <strong>Row {detail.row}:</strong> {detail.errors.join('; ')}
                                                                    </li>
                                                                ))}
                                                            </ul>
                                                            {hasDateValidationErrors() && (
                                                                <Button
                                                                    type="button"
                                                                    variant="default"
                                                                    onClick={handleAutoFixDates}
                                                                    className="mt-3 bg-blue-600 hover:bg-blue-700"
                                                                >
                                                                    <Wand2 className="w-4 h-4 mr-2" />
                                                                    Auto Fix Date Formats
                                                                </Button>
                                                            )}
                                                        </div>
                                                    )}

                                                    <div className="mt-4 flex flex-col gap-3">
                                                        <Button
                                                            type="button"
                                                            variant="outline"
                                                            onClick={openCsvEditor}
                                                            className="w-full border-dashed"
                                                        >
                                                            <Pencil className="w-4 h-4 mr-2" />
                                                            Edit CSV data
                                                        </Button>
                                                        <p className="text-xs text-gray-500 text-center">
                                                            {csvPreview.validationDetails && csvPreview.validationDetails.length > 0
                                                                ? 'Fix validation errors by editing the data in the editor, then click Apply changes.'
                                                                : 'You can edit the data in the system and re-validate before continuing.'}
                                                        </p>
                                                    </div>

                                                    <div className="mt-6">
                                                        {isCurrentStepValid ? (
                                                            <Button 
                                                                onClick={handleStepComplete}
                                                                className="w-full bg-green-600 hover:bg-green-700"
                                                            >
                                                                Continue to Batch Creation
                                                            </Button>
                                                        ) : (
                                                            <p className="text-center text-sm text-red-600 py-2">
                                                                Fix validation issues above to continue.
                                                            </p>
                                                        )}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 3 && (
                                <Card>
                                    <CardHeader>
                                        <CardTitle className="flex items-center gap-2">
                                            <Users className="w-5 h-5" />
                                            Create Batch
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <div>
                                                <Label htmlFor="batch_name">Batch Name</Label>
                                                <Input
                                                    id="batch_name"
                                                    type="text"
                                                    value={data.batch_name}
                                                    placeholder="e.g., January 2026 RSE Departures"
                                                    className="w-full"
                                                    onChange={(e) => setData('batch_name', e.target.value)}
                                                />
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Suggested: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} {importMode === 'returnee' ? 'Returns' : (data.batch_type ? data.batch_type.charAt(0).toUpperCase() + data.batch_type.slice(1) : '')} Batch
                                                </p>
                                            </div>
                                            
                                            {importMode !== 'returnee' && (
                                            <div>
                                                <Label htmlFor="batch_type">Batch Type</Label>
                                                <select
                                                    id="batch_type"
                                                    value={data.batch_type}
                                                    className="w-full p-2 border rounded-md"
                                                    onChange={(e) => setData('batch_type', e.target.value)}
                                                >
                                                    <option value="">Select Type</option>
                                                    <option value="inbound">Inbound</option>
                                                    <option value="outbound">Outbound</option>
                                                    <option value="earnings">Earnings</option>
                                                    <option value="returns">Returns</option>
                                                </select>
                                            </div>
                                            )}

                                            <div className="mt-6">
                                                {isCurrentStepValid ? (
                                                    <Button
                                                        type="submit"
                                                        disabled={processing || (importMode === 'standard' && !csvPreview) || (importMode === 'returnee' && !returneePreview)}
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                        {processing ? 'Creating Batch...' : 'Create Batch & Import Data'}
                                                    </Button>
                                                ) : (
                                                    <p className="text-center text-sm text-red-600 py-2">
                                                        {importMode === 'returnee' ? 'Enter batch name to continue.' : 'Enter batch name and type to continue.'}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Edit CSV data dialog */}
            <Dialog open={showCsvEditor} onOpenChange={setShowCsvEditor}>
                <DialogContent className="max-w-[98vw] w-[98vw] max-h-[95vh] h-[90vh] flex flex-col min-w-[80vw]">
                    <DialogHeader>
                        <DialogTitle>Edit CSV data</DialogTitle>
                        <DialogDescription>
                            Edit the table below to fix validation errors. Changes are applied in memory only. Click Apply changes to re-validate.
                        </DialogDescription>
                    </DialogHeader>
                    <div className="flex-1 overflow-auto min-h-[60vh] border rounded-md">
                        <Table>
                            <TableHeader>
                                <TableRow className="bg-muted/50">
                                    <TableHead className="w-12 shrink-0 text-xs">#</TableHead>
                                    {csvPreview?.headers.map((h, i) => (
                                        <TableHead key={i} className="text-xs whitespace-nowrap min-w-[100px]">
                                            {h}
                                        </TableHead>
                                    ))}
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {editableRows.map((row, rowIdx) => (
                                    <TableRow key={rowIdx}>
                                        <TableCell className="font-mono text-xs text-muted-foreground shrink-0">
                                            {rowIdx + 2}
                                        </TableCell>
                                        {row.map((cell, colIdx) => (
                                            <TableCell key={colIdx} className="p-0">
                                                <input
                                                    type="text"
                                                    value={cell}
                                                    onChange={(e) => updateEditableCell(rowIdx, colIdx, e.target.value)}
                                                    className="w-full min-w-[80px] px-2 py-1.5 text-sm border-0 rounded bg-background hover:bg-muted/50 focus:bg-background focus:ring-1 focus:ring-ring"
                                                />
                                            </TableCell>
                                        ))}
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setShowCsvEditor(false)}>
                            Cancel
                        </Button>
                        <Button onClick={applyEditedCsv} className="bg-green-600 hover:bg-green-700">
                            Apply changes
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
};

export default UploadWizard;
