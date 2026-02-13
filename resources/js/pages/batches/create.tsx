import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import InputError from '@/components/input-error';
import { PageHeader } from '@/components/page-header';
import { Upload, Info } from 'lucide-react';

interface Props {
    auth: { user: User | null };
    schemes: string[];
    batchTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Batches', href: '/batches' },
    { label: 'Create', href: '/batches/create' }
];

export default function BatchCreate({ auth, schemes, batchTypes }: Props) {
    // Pre-fill with current month/year
    const now = new Date();
    const firstDayOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
    
    const formatDate = (date: Date): string => {
        return date.toISOString().split('T')[0];
    };

    // Generate suggested batch name
    const monthName = now.toLocaleString('default', { month: 'long' });
    const suggestedName = `${monthName} ${now.getFullYear()} Batch`;

    const { data, setData, post, processing, errors } = useForm({
        name: suggestedName,
        batch_type: '',
        scheme: '',
        period_start: formatDate(firstDayOfMonth),
        period_end: formatDate(lastDayOfMonth),
        description: '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post('/batches');
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Create Batch" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Create Registry Batch"
                    description="Create an empty batch to add registry entries manually. For CSV uploads, use the Upload Wizard instead."
                    actions={
                        <Link href="/batches">
                            <Button variant="outline">Back to Batches</Button>
                        </Link>
                    }
                />

                {/* Suggestion for CSV upload */}
                <Alert className="border-blue-200 bg-blue-50">
                    <Info className="h-4 w-4 text-blue-600" />
                    <AlertDescription className="text-blue-800">
                        <strong>Have CSV data to upload?</strong> Use the{' '}
                        <Link href="/registry/upload-wizard" className="font-semibold underline hover:text-blue-900">
                            Upload Wizard
                        </Link>{' '}
                        to create a batch and import CSV data in one step. This page is for creating an empty batch to add entries manually.
                    </AlertDescription>
                </Alert>

                <Card>
                    <CardHeader>
                        <CardTitle>Batch Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Batch Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., January 2026 RSE Departures"
                                        required
                                    />
                                    <InputError message={errors.name} />
                                </div>
                                <div>
                                    <Label htmlFor="scheme">Labour Scheme *</Label>
                                    <Select value={data.scheme} onValueChange={(value) => setData('scheme', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select scheme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemes.map((scheme) => (
                                                <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.scheme} />
                                </div>
                                <div>
                                    <Label htmlFor="batch_type">Batch Type *</Label>
                                    <Select value={data.batch_type} onValueChange={(value) => setData('batch_type', value)}>
                                        <SelectTrigger>
                                            <SelectValue placeholder="Select type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batchTypes.map((type) => (
                                                <SelectItem key={type} value={type}>{type}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    <InputError message={errors.batch_type} />
                                </div>
                                <div>
                                    <Label htmlFor="description">Description</Label>
                                    <Input
                                        id="description"
                                        type="text"
                                        value={data.description}
                                        onChange={(e) => setData('description', e.target.value)}
                                        placeholder="Optional description"
                                    />
                                    <InputError message={errors.description} />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="period_start">Period Start *</Label>
                                    <Input
                                        id="period_start"
                                        type="date"
                                        value={data.period_start}
                                        onChange={(e) => setData('period_start', e.target.value)}
                                        required
                                    />
                                    <InputError message={errors.period_start} />
                                </div>
                                <div>
                                    <Label htmlFor="period_end">Period End *</Label>
                                    <Input
                                        id="period_end"
                                        type="date"
                                        value={data.period_end}
                                        onChange={(e) => setData('period_end', e.target.value)}
                                        min={data.period_start}
                                        required
                                    />
                                    <InputError message={errors.period_end} />
                                </div>
                            </div>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <h3 className="font-semibold text-blue-900 mb-2">Next Steps</h3>
                                <p className="text-blue-800 text-sm">
                                    After creating this batch, you will be able to:
                                </p>
                                <ul className="text-blue-800 text-sm mt-2 list-disc list-inside space-y-1">
                                    <li>Add registry entries to this batch using bulk selection</li>
                                    <li>Edit batch details while in draft status</li>
                                    <li>Submit the batch for Labour Department verification</li>
                                </ul>
                                <div className="mt-4 pt-4 border-t border-blue-300">
                                    <p className="text-blue-800 text-sm font-medium mb-2">Quick Tip:</p>
                                    <p className="text-blue-700 text-sm">
                                        You can select multiple entries from the{' '}
                                        <Link href="/registry" className="font-semibold underline hover:text-blue-900">
                                            Registry page
                                        </Link>{' '}
                                        and add them to this batch in bulk.
                                    </p>
                                </div>
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Creating...' : 'Create Batch'}
                                </Button>
                                <Link href="/batches">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
