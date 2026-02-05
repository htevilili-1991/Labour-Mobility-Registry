import { Head, useForm, usePage, Link } from '@inertiajs/react';
import { PageProps, User, BreadcrumbItem } from '@/types';
import AppLayout from '@/layouts/app-layout';
import React, { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowRight, Upload, Sparkles } from 'lucide-react';

interface Props extends PageProps {
    auth: {
        user: User | null;
    };
    errors: {
        csv_file?: string;
    };
    success?: string;
    test?: string;
}

const Upload: React.FC = () => {
    const { errors, success, auth } = usePage<Props>().props;

    const breadcrumbs: BreadcrumbItem[] = [
        { href: '/dashboard', label: 'Dashboard' },
        { href: '/registry/upload', label: 'Upload Registry CSV' },
    ];

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title="Upload Registry CSV" />
            <div className="max-w-4xl mx-auto sm:px-6 lg:px-8 py-12">
                <div className="space-y-6">
                    {/* Recommendation Card */}
                    <Card className="border-blue-200 bg-blue-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-blue-900">
                                <Sparkles className="w-5 h-5" />
                                New Upload Wizard Available
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <p className="text-blue-800">
                                We've upgraded the upload experience with a new guided wizard that includes:
                            </p>
                            <ul className="list-disc list-inside space-y-2 text-blue-800">
                                <li>Step-by-step guided process with progress tracking</li>
                                <li>Drag-and-drop CSV file upload</li>
                                <li>Real-time validation with detailed error messages</li>
                                <li>Auto-save progress (survives page refreshes)</li>
                                <li>Smart batch creation with pre-filled dates</li>
                                <li>Duplicate detection and validation</li>
                            </ul>
                            <div className="pt-4">
                                <Link href="/registry/upload-wizard">
                                    <Button className="bg-blue-600 hover:bg-blue-700 text-white">
                                        Use Upload Wizard
                                        <ArrowRight className="ml-2 h-4 w-4" />
                                    </Button>
                                </Link>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Legacy Upload Option */}
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <Upload className="w-5 h-5" />
                                Legacy Upload (Simple)
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Alert className="mb-4">
                                <AlertDescription>
                                    This is the simple upload option. For a better experience with validation and batch creation, use the{' '}
                                    <Link href="/registry/upload-wizard" className="font-semibold text-blue-600 hover:underline">
                                        Upload Wizard
                                    </Link>
                                    .
                                </AlertDescription>
                            </Alert>
                            <LegacyUploadForm errors={errors} success={success} />
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
};

// Legacy upload form component
const LegacyUploadForm: React.FC<{ errors?: { csv_file?: string }; success?: string }> = ({ errors, success }) => {
    const { post, setData, processing } = useForm({
        csv_file: null as File | null,
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0] || null;
        setData('csv_file', file);
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(route('registry.storeCsv'), {
            onSuccess: () => {
                setData('csv_file', null);
            },
        });
    };

    return (
        <div>
            <p className="mb-4 text-sm text-gray-600">
                Download the{' '}
                <a
                    href="/template/registry-template.csv"
                    download
                    className="text-blue-600 hover:underline font-medium"
                >
                    CSV template
                </a>{' '}
                to ensure your file is formatted correctly. The template includes all required fields for the registry. When importing, records with duplicate document numbers will be skipped to prevent data redundancy.
            </p>
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
            <form onSubmit={handleSubmit} encType="multipart/form-data">
                <div className="mb-4">
                    <label htmlFor="csv_file" className="block text-sm font-medium text-gray-700">
                        Select CSV File
                    </label>
                    <input
                        type="file"
                        id="csv_file"
                        accept=".csv"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                            file:mr-4 file:py-2 file:px-4
                            file:rounded-md file:border-0
                            file:text-sm file:font-semibold
                            file:bg-blue-50 file:text-blue-700
                            hover:file:bg-blue-100"
                    />
                </div>
                <Button
                    type="submit"
                    disabled={processing}
                >
                    {processing ? 'Uploading...' : 'Upload CSV'}
                </Button>
            </form>
        </div>
    );
};

export default Upload;
