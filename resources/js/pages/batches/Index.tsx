import { Head, Link, router } from '@inertiajs/react';
import { type BreadcrumbItem, type User } from '@/types';
import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { Package, Plus } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface RegistryBatch {
    id: number;
    name: string;
    batch_type: string;
    scheme: string;
    period_start: string;
    period_end: string;
    status: string;
    description: string | null;
    record_count: number;
    submitted_by: number | null;
    verified_by: number | null;
    approved_by: number | null;
    submitted_at: string | null;
    verified_at: string | null;
    approved_at: string | null;
    rejection_reason: string | null;
    created_at: string;
    updated_at: string;
    submittedBy?: { id: number; name: string; email: string } | null;
    verifiedBy?: { id: number; name: string; email: string } | null;
    approvedBy?: { id: number; name: string; email: string } | null;
}

interface Props {
    auth: { user: User | null };
    batches: RegistryBatch[];
    filters: {
        scheme: string | null;
        batch_type: string | null;
        status: string | null;
    };
    schemes: string[];
    batchTypes: string[];
    statuses: string[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Batches', href: '/batches' }
];

export default function BatchIndex({ auth, batches, filters, schemes, batchTypes, statuses }: Props) {
    const [deleteTarget, setDeleteTarget] = useState<{ id: number; name: string } | null>(null);

    const handleFilterChange = (key: string, value: string) => {
        router.get('/batches', { ...filters, [key]: value }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'draft': return 'bg-gray-100 text-gray-800';
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'under_review': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatPeriod = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Registry Batches" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Registry Batches"
                    description="View and manage your registry batches. Create drafts, submit for verification, or track approval status."
                    actions={
                        <Link href="/batches/create">
                            <Button className="gap-2">
                                <Plus className="h-4 w-4" />
                                Create Batch
                            </Button>
                        </Link>
                    }
                />

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3 md:grid-cols-4">
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Scheme</label>
                                <Select value={filters.scheme || 'all'} onValueChange={(value) => handleFilterChange('scheme', value === 'all' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Schemes" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Schemes</SelectItem>
                                        {schemes.map((scheme) => (
                                            <SelectItem key={scheme} value={scheme}>{scheme}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Batch Type</label>
                                <Select value={filters.batch_type || 'all'} onValueChange={(value) => handleFilterChange('batch_type', value === 'all' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Types" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Types</SelectItem>
                                        {batchTypes.map((type) => (
                                            <SelectItem key={type} value={type}>{type}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div className="space-y-2">
                                <label className="text-sm font-medium leading-none">Status</label>
                                <Select value={filters.status || 'all'} onValueChange={(value) => handleFilterChange('status', value === 'all' ? '' : value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="All Statuses" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="all">All Statuses</SelectItem>
                                        {statuses.map((status) => (
                                            <SelectItem key={status} value={status}>{status}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Batches Table */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">All Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <EmptyState
                                icon={Package}
                                title="No batches yet"
                                description="Create your first batch to start managing registry entries. You can add entries from the Registry page or upload CSV data."
                                action={{ href: '/batches/create', label: 'Create Batch' }}
                            />
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Period</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Records</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {batches.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{batch.scheme}</Badge>
                                            </TableCell>
                                            <TableCell>{batch.batch_type}</TableCell>
                                            <TableCell>{formatPeriod(batch.period_start, batch.period_end)}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(batch.status)}>
                                                    {batch.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{batch.record_count}</TableCell>
                                            <TableCell>{batch.submittedBy?.name || '-'}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/batches/${batch.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                    {batch.status === 'draft' && (
                                                        <>
                                                            <Link href={`/batches/${batch.id}/edit`}>
                                                                <Button variant="outline" size="sm">Edit</Button>
                                                            </Link>
                                                            <Button
                                                                variant="outline"
                                                                size="sm"
                                                                onClick={() => setDeleteTarget({ id: batch.id, name: batch.name })}
                                                            >
                                                                Delete
                                                            </Button>
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>

            <Dialog open={!!deleteTarget} onOpenChange={(open) => !open && setDeleteTarget(null)}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Delete batch?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete &quot;{deleteTarget?.name}&quot;? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setDeleteTarget(null)}>
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={() => {
                                if (deleteTarget) {
                                    router.delete(`/batches/${deleteTarget.id}`);
                                    setDeleteTarget(null);
                                }
                            }}
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
