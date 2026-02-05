import { Head, useForm, usePage } from '@inertiajs/react';
import { PageProps, User, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import React, { useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { CheckCircle, AlertCircle, Upload, FileText, Users } from 'lucide-react';

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
}

const UploadWizard: React.FC = () => {
    const { errors, success, auth } = usePage<Props>().props;
    const { post, setData, processing } = useForm({
        csv_file: null as File | null,
        batch_name: '',
        batch_type: '',
        entries: [] as any[],
    });

    const [currentStep, setCurrentStep] = useState(1);
    const [csvPreview, setCsvPreview] = useState<CsvPreview | null>(null);
    const [validationErrors, setValidationErrors] = useState<string[]>([]);

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

    const handleFileSelect = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        setData('csv_file', file);

        // Preview CSV content
        const reader = new FileReader();
        reader.onload = (e) => {
            const text = e.target?.result as string;
            const lines = text.split('\n').filter(line => line.trim());
            const headers = lines[0]?.split(',').map(h => h.trim().replace(/"/g, '')) || [];
            const rows = lines.slice(1).map(line => line.split(',').map(cell => cell.trim().replace(/"/g, '')));
            
            // Basic validation
            const validRows = rows.filter(row => {
                if (row.length < 5) return false; // Minimum required fields
                const [surname, givenName, nationality, docType, docNo] = row;
                return surname && givenName && nationality && docType && docNo;
            });

            const duplicates = new Map<string, number>();
            rows.forEach((row, index) => {
                const docKey = `${row[2]}-${row[3]}`; // nationality-docNo
                if (duplicates.has(docKey)) {
                    duplicates.set(docKey, (duplicates.get(docKey) || 0) + 1);
                } else {
                    duplicates.set(docKey, 1);
                }
            });

            setCsvPreview({
                headers,
                rows,
                totalRows: rows.length,
                validRows: validRows.length,
                duplicates: duplicates.size,
            });

            // Auto-advance to validation step
            if (validRows.length > 0) {
                setCurrentStep(2);
            }
        };
        reader.readAsText(file);
    }, []);

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
            },
        });
    }, [currentStep]);

    const getStepIcon = (step: UploadStep) => {
        const Icon = step.icon;
        return <Icon className={`w-6 h-6 ${step.completed ? 'text-green-600' : 'text-gray-400'}`} />;
    };

    const getStepColor = (step: UploadStep) => {
        if (step.completed) return 'bg-green-50 border-green-200';
        if (step.id === currentStep.toString()) return 'bg-blue-50 border-blue-200';
        return 'bg-gray-50 border-gray-200';
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/registry/upload-wizard', label: 'Upload Wizard' },
    ];

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Upload Registry Data - Wizard" />
            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg">
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
                            <div className="flex justify-between">
                                {steps.map((step, index) => (
                                    <div
                                        key={step.id}
                                        className={`flex-1 text-center p-4 border-2 rounded-lg cursor-pointer transition-colors ${getStepColor(step)}`}
                                        onClick={() => setCurrentStep(index + 1)}
                                    >
                                        {getStepIcon(step)}
                                        <h3 className="font-semibold mt-2">{step.title}</h3>
                                        <p className="text-sm text-gray-600 mt-1">{step.description}</p>
                                        {step.completed && (
                                            <CheckCircle className="w-4 h-4 text-green-600 mx-auto mt-2" />
                                        )}
                                    </div>
                                ))}
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
                                            <div>
                                                <Label htmlFor="csv_file">Choose CSV File</Label>
                                                <Input
                                                    type="file"
                                                    id="csv_file"
                                                    accept=".csv"
                                                    onChange={handleFileSelect}
                                                    className="file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
                                                />
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

                                                    <div className="mt-6">
                                                        <Button 
                                                            onClick={handleStepComplete}
                                                            className="w-full"
                                                            disabled={csvPreview.validRows === 0}
                                                        >
                                                            {csvPreview.validRows > 0 ? 'Continue to Field Mapping' : 'Fix Issues First'}
                                                        </Button>
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
                                                <Button onClick={handleStepComplete} className="w-full">
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
                                                    placeholder="e.g., January 2026 RSE Departures"
                                                    className="w-full"
                                                    onChange={(e) => setData('batch_name', e.target.value)}
                                                />
                                            </div>
                                            
                                            <div>
                                                <Label htmlFor="batch_type">Batch Type</Label>
                                                <select
                                                    id="batch_type"
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
                                                <Button 
                                                    type="submit"
                                                    disabled={processing || !csvPreview}
                                                    className="w-full"
                                                >
                                                    {processing ? 'Creating Batch...' : 'Create Batch & Import Data'}
                                                </Button>
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
};

export default UploadWizard;
