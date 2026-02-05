import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';

interface VerificationStats {
    total_batches: number;
    draft_batches: number;
    submitted_batches: number;
    under_review_batches: number;
    approved_batches: number;
    rejected_batches: number;
}

interface RegistryBatch {
    id: number;
    name: string;
    batch_type: string;
    scheme: string;
    status: string;
    record_count: number;
    submitted_at: string;
    verified_at: string | null;
    approved_at: string | null;
    submittedBy?: { id: number; name: string } | null;
    verifiedBy?: { id: number; name: string } | null;
    approvedBy?: { id: number; name: string } | null;
}

interface Props {
    auth: { user: User | null };
    stats: VerificationStats;
    recentBatches: RegistryBatch[];
    pendingVerification: RegistryBatch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Verification', href: '/verification' },
    { label: 'Verification Dashboard', href: '/verification/dashboard' }
];

export default function VerificationDashboard({ auth, stats, recentBatches, pendingVerification }: Props) {
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

    const getSchemeColor = (scheme: string) => {
        switch (scheme) {
            case 'RSE': return 'bg-purple-100 text-purple-800';
            case 'SWP': return 'bg-blue-100 text-blue-800';
            case 'PALM': return 'bg-green-100 text-green-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatDate = (dateString: string | null) => {
        if (!dateString) return 'N/A';
        return new Date(dateString).toLocaleDateString();
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Verification Dashboard" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Verification Dashboard</h1>
                        <p className="text-gray-600">Labour Department verification workflow overview</p>
                    </div>
                    <div className="flex gap-2">
                        <Link href="/verification">
                            <Button variant="outline">Back to Verification</Button>
                        </Link>
                        <Link href="/reports/verification">
                            <Button variant="outline">Verification Report</Button>
                        </Link>
                    </div>
                </div>

                {/* Overview Stats */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Total Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold">{stats.total_batches}</div>
                            <p className="text-sm text-gray-500">All batches in system</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-blue-600">{stats.submitted_batches}</div>
                            <p className="text-sm text-gray-500">Awaiting verification</p>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Under Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-3xl font-bold text-yellow-600">{stats.under_review_batches}</div>
                            <p className="text-sm text-gray-500">Currently being verified</p>
                        </CardContent>
                    </Card>
                </div>

                {/* Status Breakdown */}
                <Card>
                    <CardHeader>
                        <CardTitle>Status Breakdown</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            <div className="text-center">
                                <div className="text-2xl font-bold text-gray-600">{stats.draft_batches}</div>
                                <p className="text-sm text-gray-500">Draft</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-blue-600">{stats.submitted_batches}</div>
                                <p className="text-sm text-gray-500">Submitted</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-yellow-600">{stats.under_review_batches}</div>
                                <p className="text-sm text-gray-500">Under Review</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-green-600">{stats.approved_batches}</div>
                                <p className="text-sm text-gray-500">Approved</p>
                            </div>
                            <div className="text-center">
                                <div className="text-2xl font-bold text-red-600">{stats.rejected_batches}</div>
                                <p className="text-sm text-gray-500">Rejected</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Pending Verification */}
                {pendingVerification.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Pending Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Batch Name</TableHead>
                                        <TableHead>Type</TableHead>
                                        <TableHead>Scheme</TableHead>
                                        <TableHead>Records</TableHead>
                                        <TableHead>Submitted By</TableHead>
                                        <TableHead>Submitted Date</TableHead>
                                        <TableHead>Action</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {pendingVerification.map((batch) => (
                                        <TableRow key={batch.id}>
                                            <TableCell className="font-medium">{batch.name}</TableCell>
                                            <TableCell>
                                                <Badge variant="outline">{batch.batch_type}</Badge>
                                            </TableCell>
                                            <TableCell>
                                                <Badge className={getSchemeColor(batch.scheme)}>
                                                    {batch.scheme}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>{batch.record_count}</TableCell>
                                            <TableCell>{batch.submittedBy?.name || 'Unknown'}</TableCell>
                                            <TableCell>{formatDate(batch.submitted_at)}</TableCell>
                                            <TableCell>
                                                <Link href={`/verification/${batch.id}`}>
                                                    <Button size="sm">Verify</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </CardContent>
                    </Card>
                )}

                {/* Recent Activity */}
                <Card>
                    <CardHeader>
                        <CardTitle>Recent Activity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <Table>
                            <TableHeader>
                                <TableRow>
                                    <TableHead>Batch Name</TableHead>
                                    <TableHead>Status</TableHead>
                                    <TableHead>Type</TableHead>
                                    <TableHead>Scheme</TableHead>
                                    <TableHead>Records</TableHead>
                                    <TableHead>Submitted By</TableHead>
                                    <TableHead>Verified By</TableHead>
                                    <TableHead>Approved By</TableHead>
                                    <TableHead>Action</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {recentBatches.map((batch) => (
                                    <TableRow key={batch.id}>
                                        <TableCell className="font-medium">{batch.name}</TableCell>
                                        <TableCell>
                                            <Badge className={getStatusColor(batch.status)}>
                                                {batch.status.replace('_', ' ')}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge variant="outline">{batch.batch_type}</Badge>
                                        </TableCell>
                                        <TableCell>
                                            <Badge className={getSchemeColor(batch.scheme)}>
                                                {batch.scheme}
                                            </Badge>
                                        </TableCell>
                                        <TableCell>{batch.record_count}</TableCell>
                                        <TableCell>{batch.submittedBy?.name || 'N/A'}</TableCell>
                                        <TableCell>{batch.verifiedBy?.name || 'N/A'}</TableCell>
                                        <TableCell>{batch.approvedBy?.name || 'N/A'}</TableCell>
                                        <TableCell>
                                            <Link href={`/verification/${batch.id}`}>
                                                <Button size="sm" variant="outline">View</Button>
                                            </Link>
                                        </TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Link href="/verification">
                                <Button className="w-full">
                                    View All Batches
                                </Button>
                            </Link>
                            <Link href="/batches">
                                <Button variant="outline" className="w-full">
                                    Manage Batches
                                </Button>
                            </Link>
                            <Link href="/reports/verification">
                                <Button variant="outline" className="w-full">
                                    Verification Report
                                </Button>
                            </Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
