import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ClipboardCheck, BarChart3 } from 'lucide-react';

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
    { label: 'Verification', href: '/verification' }
];

export default function VerificationIndex({ auth, batches, filters, schemes, batchTypes, statuses }: Props) {
    const handleFilterChange = (key: string, value: string) => {
        router.get('/verification', { ...filters, [key]: value }, { preserveState: true });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
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

    const getUrgencyIndicator = (submittedAt: string | null) => {
        if (!submittedAt) return null;
        
        const daysSinceSubmission = Math.floor((new Date().getTime() - new Date(submittedAt).getTime()) / (1000 * 60 * 60 * 24));
        
        if (daysSinceSubmission > 7) return 'bg-red-100 text-red-800';
        if (daysSinceSubmission > 3) return 'bg-yellow-100 text-yellow-800';
        return 'bg-green-100 text-green-800';
    };

    const pendingCount = batches.filter((b) => b.status === 'submitted').length;
    const underReviewCount = batches.filter((b) => b.status === 'under_review').length;
    const approvedCount = batches.filter((b) => b.status === 'approved').length;
    const rejectedCount = batches.filter((b) => b.status === 'rejected').length;

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Batch Verification" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Batch Verification"
                    description="Review and approve registry batches submitted for verification."
                    actions={
                        <Link href="/verification/dashboard">
                            <Button variant="outline" className="gap-2">
                                <BarChart3 className="h-4 w-4" />
                                Dashboard
                            </Button>
                        </Link>
                    }
                />

                {/* Quick Stats */}
                <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Pending</p>
                            <p className="mt-1 text-2xl font-bold text-blue-600">{pendingCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Under Review</p>
                            <p className="mt-1 text-2xl font-bold text-amber-600">{underReviewCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Approved</p>
                            <p className="mt-1 text-2xl font-bold text-green-600">{approvedCount}</p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardContent className="p-4">
                            <p className="text-xs font-medium uppercase tracking-wide text-gray-500">Rejected</p>
                            <p className="mt-1 text-2xl font-bold text-red-600">{rejectedCount}</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
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
                                            <SelectItem key={status} value={status}>{status.replace('_', ' ')}</SelectItem>
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
                        <CardTitle className="text-base">Submitted Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <EmptyState
                                icon={ClipboardCheck}
                                title="No batches to verify"
                                description="Batches submitted for verification will appear here. New submissions will show up when users submit their draft batches."
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
                                        <TableHead>Submitted</TableHead>
                                        <TableHead>Urgency</TableHead>
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
                                            <TableCell>
                                                <div>
                                                    <div>{batch.submittedBy?.name || '-'}</div>
                                                    {batch.submitted_at && (
                                                        <div className="text-xs text-gray-500">
                                                            {new Date(batch.submitted_at).toLocaleDateString()}
                                                        </div>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                {batch.submitted_at && (
                                                    <Badge className={getUrgencyIndicator(batch.submitted_at) || ''}>
                                                        {Math.floor((new Date().getTime() - new Date(batch.submitted_at).getTime()) / (1000 * 60 * 60 * 24))} days
                                                    </Badge>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/verification/${batch.id}`}>
                                                        <Button variant="outline" size="sm">Review</Button>
                                                    </Link>
                                                    <Link href={`/verification/${batch.id}/audit`}>
                                                        <Button variant="outline" size="sm">Audit</Button>
                                                    </Link>
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
        </AppLayout>
    );
}
