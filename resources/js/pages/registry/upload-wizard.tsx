import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps, User, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import React, { useState, useCallback, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Upload, FileText, Users, XCircle, Pencil, Download } from 'lucide-react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
    DialogDescription,
} from '@/components/ui/dialog';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface Props extends PageProps {
    auth: {
        user: User | null;
    };
    errors?: {
        csv_file?: string;
        entries?: string;
    };
    success?: string;
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
    const { errors, success, auth } = usePage<Props>().props;
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

    const [currentStep, setCurrentStep] = useState(savedProgress.currentStep);
    const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);
    const [showCsvEditor, setShowCsvEditor] = useState(false);
    const [editableRows, setEditableRows] = useState<string[][]>([]);

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
            id: 'map',
            title: 'Map Fields',
            description: 'Map CSV columns to registry fields',
            icon: FileText,
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
        
        // Trim whitespace and remove quotes
        const cleanDate = travelDate.trim().replace(/"/g, '');
        
        // Debug: log the actual date being validated
        console.log(`Validating date: "${travelDate}" -> cleaned: "${cleanDate}"`);
        
        // Accept both DD/MM/YYYY and YYYY-MM-DD formats
        const ddmmyyyyRegex = /^\d{1,2}\/\d{1,2}\/\d{4}$/;
        const yyyymmddRegex = /^\d{4}-\d{2}-\d{2}$/;
        
        if (ddmmyyyyRegex.test(cleanDate)) {
            console.log(`Date ${cleanDate} matches DD/MM/YYYY format`);
            return null;
        }
        
        if (yyyymmddRegex.test(cleanDate)) {
            console.log(`Date ${cleanDate} matches YYYY-MM-DD format, converting...`);
            // Convert YYYY-MM-DD to DD/MM/YYYY for display
            const [year, month, day] = cleanDate.split('-');
            const formattedDate = `${day}/${month}/${year}`;
            console.log(`Converted to: ${formattedDate}`);
            return null;
        }
        
        console.log(`Date ${cleanDate} does not match any expected format`);
        return 'Travel date should be in format DD/MM/YYYY or YYYY-MM-DD';
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
    }, [setData, runValidation]);

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

    const handleStepComplete = useCallback(() => {
        const nextStep = Math.min(currentStep + 1, steps.length);
        setCurrentStep(nextStep);
    }, [currentStep]);

    const handleSubmit = useCallback((e: React.FormEvent) => {
        e.preventDefault();
        
        if (currentStep < steps.length) {
            // Save progress and move to next step
            handleStepComplete();
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
    }, [currentStep]);

    // Derive completed state for each step (1-based index)
    const isStepCompleted = useCallback((stepIndex: number) => {
        const oneBased = stepIndex + 1;
        // Step 1: completed when CSV file has been selected
        if (oneBased === 1) return !!csvPreview;
        // Step 2: completed when we've moved past it
        if (oneBased === 2) return currentStep > 2;
        // Step 3: completed when we've moved past it
        if (oneBased === 3) return currentStep > 3;
        // Step 4: in progress when on it, not "completed" until form submits
        return false;
    }, [csvPreview, currentStep]);

    // Step has validation errors (show red, hide Next button)
    const isStepHasError = useCallback((stepIndex: number) => {
        const oneBased = stepIndex + 1;
        const isCurrentStep = currentStep === oneBased;
        if (!isCurrentStep) return false; // only current step can be in "error" state
        // Step 1: error when no file selected
        if (oneBased === 1) return !csvPreview;
        // Step 2: error when no valid rows
        if (oneBased === 2) return !csvPreview || csvPreview.validRows === 0;
        // Step 3: no validation, always can proceed
        if (oneBased === 3) return false;
        // Step 4: error when batch name or type missing
        if (oneBased === 4) return !data.batch_name?.trim() || !data.batch_type;
        return false;
    }, [currentStep, csvPreview, data.batch_name, data.batch_type]);

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
        if (hasError) return 'bg-red-50 border-red-400';
        if (completed) return 'bg-green-50 border-green-300';
        if (isCurrent) return 'bg-blue-50 border-blue-300';
        return 'bg-gray-50 border-gray-200';
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
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Upload Registry Data - Wizard</h1>
                            <div className="flex items-center gap-2">
                                <Badge variant="outline">Step {currentStep} of {steps.length}</Badge>
                            </div>
                        </div>

                        {success && (
                            <div className="mb-4 p-4 bg-green-100 text-green-700 rounded">
                                {success}
                            </div>
                        )}

                        {errors?.csv_file && (
                            <div className="mb-4 p-4 bg-red-100 text-red-700 rounded">
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
                                            <p className="text-sm text-gray-600 mt-1">{step.description}</p>
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
                                            <div className="p-4 bg-blue-100 border-2 border-blue-300 rounded-lg">
                                                <div className="flex items-center justify-between">
                                                    <div>
                                                        <h4 className="font-bold text-blue-900 mb-1 text-lg">📋 Need a CSV Template?</h4>
                                                        <p className="text-sm text-blue-800">Download our template to ensure your data is formatted correctly before uploading.</p>
                                                    </div>
                                                    <Button
                                                        variant="default"
                                                        size="sm"
                                                        onClick={() => {
                                                            const csvContent = `surname,given_name,nationality,country_of_residence,national_id_number,document_type,document_no,dob,age,sex,travel_date,direction,accommodation_address,note,travel_reason,border_post,destination_coming_from
Besv,Dom,PapuaNewGuinea,Australia,594375,National ID,9CQDZhJF,04-25-95,30,Male,10-06-25,Outbound,"633 Walter Stravenue Suite 010
Benjaminside, KS 17375-4713",N/A,Medical,Luganville,New Zealand`;
                                                            const blob = new Blob([csvContent], { type: 'text/csv' });
                                                            const url = window.URL.createObjectURL(blob);
                                                            const a = document.createElement('a');
                                                            a.href = url;
                                                            a.download = 'registry-template.csv';
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
                                                className={`border-2 border-dashed rounded-lg p-8 text-center transition-colors ${
                                                    isDragging
                                                        ? 'border-blue-500 bg-blue-50'
                                                        : 'border-gray-300 bg-gray-50 hover:border-gray-400'
                                                }`}
                                            >
                                                <Upload className={`w-12 h-12 mx-auto mb-4 ${isDragging ? 'text-blue-500' : 'text-gray-400'}`} />
                                                <p className="text-lg font-medium mb-2">
                                                    {isDragging ? 'Drop CSV file here' : 'Drag and drop CSV file here'}
                                                </p>
                                                <p className="text-sm text-gray-500 mb-4">or</p>
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
                                            
                                            {csvPreview && (
                                                <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                                                    <h4 className="font-semibold mb-2">CSV Preview</h4>
                                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                                                        <div>
                                                            <span className="font-medium">Total Rows:</span>
                                                            <span className="text-blue-600">{csvPreview.totalRows}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Valid Rows:</span>
                                                            <span className="text-green-600">{csvPreview.validRows}</span>
                                                        </div>
                                                        <div>
                                                            <span className="font-medium">Duplicates:</span>
                                                            <span className={csvPreview.duplicates > 0 ? 'text-red-600' : 'text-green-600'}>
                                                                {csvPreview.duplicates}
                                                            </span>
                                                        </div>
                                                    </div>
                                                    
                                                    {csvPreview.duplicates > 0 && (
                                                        <Alert className="mt-4">
                                                            <AlertCircle className="h-4 w-4" />
                                                            <AlertDescription>
                                                                <strong>Duplicate Detection:</strong> Found {csvPreview.duplicates} duplicate entries by document number. These will be automatically skipped during import.
                                                            </AlertDescription>
                                                        </Alert>
                                                    )}
                                                    
                                                    <div className="mt-4">
                                                        <h5 className="font-medium mb-2">Headers Found:</h5>
                                                        <div className="flex flex-wrap gap-2">
                                                            {csvPreview.headers.map((header, index) => (
                                                                <Badge key={index} variant="outline" className="text-xs">
                                                                    {header || `Column ${index + 1}`}
                                                                </Badge>
                                                            ))}
                                                        </div>
                                                    </div>
                                                    <div className="mt-6">
                                                        {isCurrentStepValid ? (
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
                                            Validate Data
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            {csvPreview && (
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
                                                                Continue to Field Mapping
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
                                            <FileText className="w-5 h-5" />
                                            Map Fields
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-4">
                                            <p className="text-gray-600 mb-4">
                                                Map your CSV columns to the required registry fields. This ensures data is properly imported.
                                            </p>
                                            
                                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-semibold mb-2">Required Fields</h4>
                                                    <ul className="text-sm space-y-1">
                                                        <li>• Surname</li>
                                                        <li>• Given Name</li>
                                                        <li>• Nationality</li>
                                                        <li>• Document Type</li>
                                                        <li>• Document Number</li>
                                                        <li>• Date of Birth</li>
                                                        <li>• Age</li>
                                                        <li>• Sex</li>
                                                        <li>• Travel Date</li>
                                                        <li>• Direction</li>
                                                    </ul>
                                                </div>
                                                
                                                <div className="p-4 border rounded-lg">
                                                    <h4 className="font-semibold mb-2">Your CSV Headers</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {csvPreview?.headers.map((header, index) => (
                                                            <Badge key={index} variant="outline" className="text-xs mb-1">
                                                                {header}
                                                            </Badge>
                                                        ))}
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6">
                                                <Button onClick={handleStepComplete} className="w-full bg-green-600 hover:bg-green-700">
                                                    Continue to Batch Creation
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {currentStep === 4 && (
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
                                                    Suggested: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} {data.batch_type ? data.batch_type.charAt(0).toUpperCase() + data.batch_type.slice(1) : ''} Batch
                                                </p>
                                            </div>
                                            
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

                                            <div className="mt-6">
                                                {isCurrentStepValid ? (
                                                    <Button 
                                                        type="submit"
                                                        disabled={processing || !csvPreview}
                                                        className="w-full bg-green-600 hover:bg-green-700"
                                                    >
                                                        {processing ? 'Creating Batch...' : 'Create Batch & Import Data'}
                                                    </Button>
                                                ) : (
                                                    <p className="text-center text-sm text-red-600 py-2">
                                                        Enter batch name and type to continue.
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
