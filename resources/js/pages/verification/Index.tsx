import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

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

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Batch Verification" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Batch Verification
                            </h1>
                            <p className="text-gray-600 mt-2">Review and approve registry batches submitted by VBoS</p>
                        </div>
                        <Link href="/verification/dashboard">
                            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white shadow-lg hover:shadow-xl transition-all duration-300">
                                Dashboard
                            </Button>
                        </Link>
                    </div>
                </div>

                {/* Enhanced Quick Stats */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Pending Verification</p>
                                    <div className="text-3xl font-bold">
                                        {batches.filter(b => b.status === 'submitted').length}
                                    </div>
                                    <p className="text-blue-100 text-xs mt-2">Awaiting review</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <div className="w-6 h-6 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-yellow-500 to-yellow-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-yellow-100 text-sm font-medium mb-1">Under Review</p>
                                    <div className="text-3xl font-bold">
                                        {batches.filter(b => b.status === 'under_review').length}
                                    </div>
                                    <p className="text-yellow-100 text-xs mt-2">In progress</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <div className="w-6 h-6 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">Approved</p>
                                    <div className="text-3xl font-bold">
                                        {batches.filter(b => b.status === 'approved').length}
                                    </div>
                                    <p className="text-green-100 text-xs mt-2">Completed</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <div className="w-6 h-6 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-red-500 to-red-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-red-100 text-sm font-medium mb-1">Rejected</p>
                                    <div className="text-3xl font-bold">
                                        {batches.filter(b => b.status === 'rejected').length}
                                    </div>
                                    <p className="text-red-100 text-xs mt-2">Not approved</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <div className="w-6 h-6 bg-white rounded-full"></div>
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>
                </div>

                {/* Filters */}
                <Card>
                    <CardHeader>
                        <CardTitle>Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Scheme</label>
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
                            <div>
                                <label className="block text-sm font-medium mb-2">Batch Type</label>
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
                            <div>
                                <label className="block text-sm font-medium mb-2">Status</label>
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
                    <CardHeader>
                        <CardTitle>Submitted Batches</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {batches.length === 0 ? (
                            <p className="text-gray-500">No batches found.</p>
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
