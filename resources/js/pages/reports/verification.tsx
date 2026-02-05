import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleChart } from '@/components/charts/SimpleChart';

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
    verification_notes: string | null;
    approval_notes: string | null;
    created_at: string;
    updated_at: string;
    submittedBy?: { id: number; name: string; email: string } | null;
    verifiedBy?: { id: number; name: string; email: string } | null;
    approvedBy?: { id: number; name: string; email: string } | null;
}

interface Props {
    auth: { user: User | null };
    batches: RegistryBatch[];
    metrics: any;
    period: string;
    dateRange: { start: string; end: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Verification Report', href: '/reports/verification' }
];

export default function VerificationReport({ auth, batches, metrics, period, dateRange }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'under_review': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatTime = (dateString: string | null) => {
        if (!dateString) return '-';
        const date = new Date(dateString);
        return date.toLocaleString();
    };

    const formatDuration = (start: string | null, end: string | null) => {
        if (!start || !end) return '-';
        const startDate = new Date(start);
        const endDate = new Date(end);
        const diffMs = endDate.getTime() - startDate.getTime();
        const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
        const diffDays = Math.floor(diffHours / 24);
        
        if (diffDays > 0) {
            return `${diffDays}d ${diffHours % 24}h`;
        }
        return `${diffHours}h`;
    };

    const verificationTrends = batches.reduce((acc, batch) => {
        const month = new Date(batch.created_at || '').toLocaleDateString();
        if (!acc[month]) {
            acc[month] = { submitted: 0, verified: 0, approved: 0, rejected: 0 };
        }
        
        if (batch.status === 'submitted') acc[month].submitted++;
        if (batch.status === 'under_review') acc[month].verified++;
        if (batch.status === 'approved') acc[month].approved++;
        if (batch.status === 'rejected') acc[month].rejected++;
        
        return acc;
    }, {} as Record<string, { submitted: number; verified: number; approved: number; rejected: number }>);

    const trendData = Object.entries(verificationTrends).map(([period, counts]) => ({
        period,
        value: counts.approved + counts.rejected,
        label: 'Completed'
    }));

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Verification Report" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Verification Report</h1>
                        <p className="text-gray-600">
                            {dateRange.start} to {dateRange.end}
                        </p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/reports">
                            <Button variant="outline">Back to Dashboard</Button>
                        </Link>
                        <Button onClick={() => window.print()}>
                            Print Report
                        </Button>
                    </div>
                </div>

                {/* Summary Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{batches.length}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Avg Verification Time</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.avg_verification_time}h</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Approval Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.approval_rate}%</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Rejection Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{metrics.rejection_rate}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Verification Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Verification Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <SimpleChart
                            data={trendData}
                            title="Completed Batches Over Time"
                            color="#10b981"
                            height={300}
                        />
                    </CardContent>
                </Card>

                {/* Detailed Batch List */}
                <Card>
                    <CardHeader>
                        <CardTitle>Batch Details</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Name</TableHead>
                                    <TableHead>Scheme</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Records</TableHead>
                                    <TableHead>Submitted</TableHead>
                                    <TableHead>Verified</TableHead>
                                    <TableHead>Approved</TableHead>
                                    <TableHead>Time to Verify</TableHead>
                                    <TableHead>Time to Approve</TableHead>
                                    <TableHead>Actions</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {batches.map((batch) => {
                                    const verificationTime = batch.verified_at && batch.submitted_at 
                                        ? formatDuration(batch.submitted_at, batch.verified_at)
                                        : '-';
                                    
                                    const approvalTime = batch.approved_at && batch.verified_at
                                        ? formatDuration(batch.verified_at, batch.approved_at)
                                        : '-';
                                    
                                    return (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{batch.scheme}</Badge>
                                            </TableCell>
                                            <TableCell>{batch.batch_type}</TableCell>
                                            <TableCell>
                                                <Badge className={getStatusColor(batch.status)}>
                                                    {batch.status.replace('_', ' ')}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{batch.record_count}</TableCell>
                                            <TableCell>{formatTime(batch.submitted_at)}</TableCell>
                                            <TableCell>{formatTime(batch.verified_at)}</TableCell>
                                            <TableCell>{formatTime(batch.approved_at)}</TableCell>
                                            <TableCell className="text-sm">{verificationTime}</TableCell>
                                            <TableCell className="text-sm">{approvalTime}</TableCell>
                                            <TableCell>
                                                <div className="flex gap-2">
                                                    <Link href={`/verification/${batch.id}`}>
                                                        <Button variant="outline" size="sm">View</Button>
                                                    </Link>
                                                    <Link href={`/verification/${batch.id}/audit`}>
                                                        <Button variant="outline" size="sm">Audit</Button>
                                                    </Link>
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    );
                                })}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Status Breakdown */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Status Distribution</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span>Draft</span>
                                    <Badge variant="outline">
                                        {batches.filter(b => b.status === 'draft').length}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Submitted</span>
                                    <Badge className="bg-blue-100 text-blue-800">
                                        {batches.filter(b => b.status === 'submitted').length}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Under Review</span>
                                    <Badge className="bg-yellow-100 text-yellow-800">
                                        {batches.filter(b => b.status === 'under_review').length}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Approved</span>
                                    <Badge className="bg-green-100 text-green-800">
                                        {batches.filter(b => b.status === 'approved').length}
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Rejected</span>
                                    <Badge className="bg-red-100 text-red-800">
                                        {batches.filter(b => b.status === 'rejected').length}
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Performance Metrics</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                <div className="flex justify-between items-center">
                                    <span>Average Batch Size</span>
                                    <span className="font-semibold">{metrics.avg_batch_size} records</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fastest Verification</span>
                                    <span className="font-semibold">{metrics.fastest_verification}h</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Slowest Verification</span>
                                    <span className="font-semibold">{metrics.slowest_verification}h</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Fastest Approval</span>
                                    <span className="font-semibold">{metrics.fastest_approval}h</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Slowest Approval</span>
                                    <span className="font-semibold">{metrics.slowest_approval}h</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
