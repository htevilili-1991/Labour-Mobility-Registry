import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';

interface RegistryEntry {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    travel_date: string;
    direction: string;
    border_post: string;
    created_at: string;
}

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
    batch: RegistryBatch;
    registryEntries: RegistryEntry[];
}

export default function BatchShow({ auth, batch, registryEntries }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Batches', href: '/batches' },
        { label: batch.name, href: `/batches/${batch.id}` }
    ];
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

    const formatDate = (dateString: string | null) => {
        if (!dateString) return '-';
        return new Date(dateString).toLocaleString();
    };

    const formatPeriod = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        return `${startDate.toLocaleDateString()} - ${endDate.toLocaleDateString()}`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title={`Batch: ${batch.name}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">{batch.name}</h1>
                    <div className="flex gap-2">
                        {batch.status === 'draft' && (
                            <>
                                <Link href={`/batches/${batch.id}/edit`}>
                                    <Button variant="outline">Edit Batch</Button>
                                </Link>
                                <Button 
                                    onClick={() => {
                                        if (confirm('Are you sure you want to submit this batch for verification?')) {
                                            router.post(`/batches/${batch.id}/submit`);
                                        }
                                    }}
                                    disabled={batch.record_count === 0}
                                >
                                    Submit for Verification
                                </Button>
                            </>
                        )}
                        <Link href="/batches">
                            <Button variant="outline">Back to Batches</Button>
                        </Link>
                    </div>
                </div>

                {/* Batch Details */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="font-semibold">Status</Label>
                                <div className="mt-1">
                                    <Badge className={getStatusColor(batch.status)}>
                                        {batch.status.replace('_', ' ')}
                                    </Badge>
                                </div>
                            </div>
                            <div>
                                <Label className="font-semibold">Scheme</Label>
                                <p className="mt-1">{batch.scheme}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Type</Label>
                                <p className="mt-1">{batch.batch_type}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Period</Label>
                                <p className="mt-1">{formatPeriod(batch.period_start, batch.period_end)}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Records</Label>
                                <p className="mt-1">{batch.record_count}</p>
                            </div>
                            {batch.description && (
                                <div>
                                    <Label className="font-semibold">Description</Label>
                                    <p className="mt-1">{batch.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Workflow Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div>
                                <Label className="font-semibold">Submitted By</Label>
                                <p className="mt-1">{batch.submittedBy?.name || '-'}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Submitted At</Label>
                                <p className="mt-1">{formatDate(batch.submitted_at)}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Verified By</Label>
                                <p className="mt-1">{batch.verifiedBy?.name || '-'}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Verified At</Label>
                                <p className="mt-1">{formatDate(batch.verified_at)}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Approved By</Label>
                                <p className="mt-1">{batch.approvedBy?.name || '-'}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Approved At</Label>
                                <p className="mt-1">{formatDate(batch.approved_at)}</p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Status-specific information */}
                {batch.status === 'rejected' && batch.rejection_reason && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-red-600">Rejection Reason</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-red-800">{batch.rejection_reason}</p>
                        </CardContent>
                    </Card>
                )}

                {batch.verification_notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{batch.verification_notes}</p>
                        </CardContent>
                    </Card>
                )}

                {batch.approval_notes && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="text-green-600">Approval Notes</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p>{batch.approval_notes}</p>
                        </CardContent>
                    </Card>
                )}

                {/* Registry Entries */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registry Entries ({registryEntries.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {registryEntries.length === 0 ? (
                            <div className="text-center py-8">
                                <p className="text-gray-500 mb-4">No registry entries in this batch.</p>
                                <p className="text-sm text-gray-400">
                                    Add entries to this batch to prepare it for submission.
                                </p>
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Nationality</TableHead>
                                        <TableHead>Travel Date</TableHead>
                                        <TableHead>Direction</TableHead>
                                        <TableHead>Border Post</TableHead>
                                        <TableHead>Added</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {registryEntries.map((entry) => (
                                        <TableRow key={entry.id}>
                                            <TableCell>
                                                {entry.surname}, {entry.given_name}
                                            </TableCell>
                                            <TableCell>{entry.nationality}</TableCell>
                                            <TableCell>
                                                {new Date(entry.travel_date).toLocaleDateString()}
                                            </TableCell>
                                            <TableCell>{entry.direction}</TableCell>
                                            <TableCell>{entry.border_post}</TableCell>
                                            <TableCell>
                                                {new Date(entry.created_at).toLocaleDateString()}
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Actions for draft batches */}
                {batch.status === 'draft' && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Management</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex gap-2">
                                <Link href="/registry">
                                    <Button variant="outline">Browse Registry</Button>
                                </Link>
                                <Link href="/registry/upload">
                                    <Button variant="outline">Upload Registry Data</Button>
                                </Link>
                            </div>
                            <p className="text-sm text-gray-600 mt-2">
                                Add registry entries to this batch to prepare it for submission.
                            </p>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
