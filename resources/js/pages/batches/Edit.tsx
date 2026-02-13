import { Head, Link, useForm, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Upload, Info } from 'lucide-react';

interface RegistryBatch {
    id: number;
    name: string;
    batch_type: string;
    scheme: string;
    period_start: string;
    period_end: string;
    status: string;
    description: string | null;
}

interface Props {
    auth: { user: User | null };
    batch: RegistryBatch;
    schemes: string[];
    batchTypes: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Batches', href: '/batches' },
    { label: 'Edit', href: '' }
];

export default function BatchEdit({ auth, batch, schemes, batchTypes }: Props) {
    const { data, setData, post, processing, errors } = useForm({
        name: batch.name,
        batch_type: batch.batch_type,
        scheme: batch.scheme,
        period_start: batch.period_start?.split('T')[0] || '',
        period_end: batch.period_end?.split('T')[0] || '',
        description: batch.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        post(`/batches/${batch.id}`);
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Edit Batch: ${batch.name}`} />

            <div className="max-w-7xl mx-auto sm:px-6 lg:px-8 py-12">
                <div className="bg-white overflow-hidden shadow-sm sm:rounded-lg border border-gray-200">
                    <div className="p-6 bg-white border-b border-gray-200">
                        <div className="flex justify-between items-center mb-6">
                            <h1 className="text-2xl font-bold">Edit Batch</h1>
                            <div className="flex items-center gap-2">
                                <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                                    batch.status === 'approved' ? 'bg-green-100 text-green-800' :
                                    batch.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                    batch.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                    'bg-gray-100 text-gray-800'
                                }`}>
                                    {batch.status.replace('_', ' ').toUpperCase()}
                                </span>
                            </div>
                        </div>

                        {batch.status === 'approved' && (
                            <Alert className="mb-6">
                                <Info className="h-4 w-4" />
                                <AlertDescription>
                                    This batch has been approved and is locked. Some fields may not be editable.
                                </AlertDescription>
                            </Alert>
                        )}

                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div>
                                    <Label htmlFor="name">Batch Name</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        disabled={batch.status === 'approved'}
                                    />
                                    {errors.name && (
                                        <p className="mt-1 text-sm text-red-600">{errors.name}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="batch_type">Batch Type</Label>
                                    <Select
                                        value={data.batch_type}
                                        onValueChange={(value) => setData('batch_type', value)}
                                        disabled={batch.status === 'approved'}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select batch type" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {batchTypes.map((type) => (
                                                <SelectItem key={type} value={type}>
                                                    {type.charAt(0).toUpperCase() + type.slice(1).replace('_', ' ')}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.batch_type && (
                                        <p className="mt-1 text-sm text-red-600">{errors.batch_type}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="scheme">Scheme</Label>
                                    <Select
                                        value={data.scheme}
                                        onValueChange={(value) => setData('scheme', value)}
                                        disabled={batch.status === 'approved'}
                                    >
                                        <SelectTrigger className="mt-1">
                                            <SelectValue placeholder="Select scheme" />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {schemes.map((scheme) => (
                                                <SelectItem key={scheme} value={scheme}>
                                                    {scheme}
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                    {errors.scheme && (
                                        <p className="mt-1 text-sm text-red-600">{errors.scheme}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="period_start">Period Start</Label>
                                    <Input
                                        id="period_start"
                                        type="date"
                                        value={data.period_start}
                                        onChange={(e) => setData('period_start', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        disabled={batch.status === 'approved'}
                                    />
                                    {errors.period_start && (
                                        <p className="mt-1 text-sm text-red-600">{errors.period_start}</p>
                                    )}
                                </div>

                                <div>
                                    <Label htmlFor="period_end">Period End</Label>
                                    <Input
                                        id="period_end"
                                        type="date"
                                        value={data.period_end}
                                        onChange={(e) => setData('period_end', e.target.value)}
                                        className="mt-1 block w-full"
                                        required
                                        disabled={batch.status === 'approved'}
                                    />
                                    {errors.period_end && (
                                        <p className="mt-1 text-sm text-red-600">{errors.period_end}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                    rows={4}
                                    disabled={batch.status === 'approved'}
                                />
                                {errors.description && (
                                    <p className="mt-1 text-sm text-red-600">{errors.description}</p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-4">
                                <Link href={`/batches/${batch.id}`}>
                                    <Button type="button" variant="outline">
                                        Cancel
                                    </Button>
                                </Link>
                                <Button
                                    type="submit"
                                    disabled={processing || batch.status === 'approved'}
                                    className="bg-blue-600 hover:bg-blue-700"
                                >
                                    {processing ? 'Updating...' : 'Update Batch'}
                                </Button>
                            </div>
                        </form>
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
