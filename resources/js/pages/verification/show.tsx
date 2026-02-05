import { Head, Link, router, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';
import { Alert, AlertDescription } from '@/components/ui/alert';

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

interface Approval {
    id: number;
    action: string;
    comments: string | null;
    discrepancies_found: any[] | null;
    verification_checklist: any[] | null;
    action_at: string;
    user: { id: number; name: string; email: string };
}

interface AuditTrail {
    id: number;
    action: string;
    description: string;
    old_values: any;
    new_values: any;
    action_at: string;
    user: { id: number; name: string; email: string };
}

interface Props {
    auth: { user: User | null };
    batch: RegistryBatch;
    registryEntries: RegistryEntry[];
    approvals: Approval[];
    auditTrail: AuditTrail[];
}

export default function VerificationShow({ auth, batch, registryEntries, approvals, auditTrail }: Props) {
    const getStatusColor = (status: string) => {
        switch (status) {
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

    // Verification form
    const { data, setData, post, processing } = useForm({
        notes: '',
        discrepancies: [] as Array<{ description: string; severity: string }>,
        checklist: [
            { item: 'Data completeness verified', completed: false },
            { item: 'Cross-referenced with government records', completed: false },
            { item: 'Checked against immigration data', completed: false },
            { item: 'Verified worker feedback consistency', completed: false },
            { item: 'Compliance with scheme requirements', completed: false },
            { item: 'No duplicate entries found', completed: false },
        ] as Array<{ item: string; completed: boolean }>,
    });

    const handleVerify = () => {
        post(`/verification/${batch.id}/verify`);
    };

    const handleApprove = () => {
        post(`/verification/${batch.id}/approve`);
    };

    const handleReject = () => {
        const reason = prompt('Please provide rejection reason:');
        if (reason && reason.trim().length >= 10) {
            router.post(`/verification/${batch.id}/reject`, { reason });
        }
    };

    const addDiscrepancy = () => {
        const description = prompt('Describe the discrepancy:');
        if (description) {
            setData('discrepancies', [
                ...data.discrepancies,
                { description, severity: 'medium' }
            ]);
        }
    };

    const removeDiscrepancy = (index: number) => {
        setData('discrepancies', data.discrepancies.filter((_, i) => i !== index));
    };

    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Verification', href: '/verification' },
        { label: batch.name, href: `/verification/${batch.id}` }
    ];

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title={`Verification: ${batch.name}`} />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Batch Verification: {batch.name}</h1>
                    <div className="flex gap-2">
                        <Link href="/verification">
                            <Button variant="outline">Back to Verification</Button>
                        </Link>
                        <Link href={`/verification/${batch.id}/audit`}>
                            <Button variant="outline">View Audit Trail</Button>
                        </Link>
                    </div>
                </div>

                {/* Batch Overview */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <Card>
                        <CardHeader>
                            <CardTitle>Batch Information</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
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
                                <p>{batch.scheme}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Type</Label>
                                <p>{batch.batch_type}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Period</Label>
                                <p>{formatPeriod(batch.period_start, batch.period_end)}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Records</Label>
                                <p>{batch.record_count}</p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Submission Details</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            <div>
                                <Label className="font-semibold">Submitted By</Label>
                                <p>{batch.submittedBy?.name || '-'}</p>
                            </div>
                            <div>
                                <Label className="font-semibold">Submitted At</Label>
                                <p>{formatDate(batch.submitted_at)}</p>
                            </div>
                            {batch.description && (
                                <div>
                                    <Label className="font-semibold">Description</Label>
                                    <p>{batch.description}</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Actions</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2">
                            {batch.status === 'submitted' && (
                                <Button onClick={handleVerify} className="w-full">
                                    Start Verification
                                </Button>
                            )}
                            {batch.status === 'under_review' && (
                                <>
                                    <Button onClick={handleApprove} className="w-full">
                                        Approve Batch
                                    </Button>
                                    <Button onClick={handleReject} variant="destructive" className="w-full">
                                        Reject Batch
                                    </Button>
                                </>
                            )}
                            {batch.status === 'approved' && (
                                <Alert>
                                    <AlertDescription>
                                        This batch has been approved and locked.
                                    </AlertDescription>
                                </Alert>
                            )}
                            {batch.status === 'rejected' && batch.rejection_reason && (
                                <Alert variant="destructive">
                                    <AlertDescription>
                                        <strong>Rejection Reason:</strong> {batch.rejection_reason}
                                    </AlertDescription>
                                </Alert>
                            )}
                        </CardContent>
                    </Card>
                </div>

                {/* Verification Form */}
                {batch.status === 'submitted' || batch.status === 'under_review' ? (
                    <Card>
                        <CardHeader>
                            <CardTitle>Verification Checklist</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <form onSubmit={handleVerify} className="space-y-6">
                                <div>
                                    <Label className="font-semibold mb-3 block">Verification Checklist</Label>
                                    <div className="space-y-2">
                                        {data.checklist.map((item, index) => (
                                            <div key={index} className="flex items-center space-x-2">
                                                <Checkbox
                                                    id={`checklist-${index}`}
                                                    checked={item.completed}
                                                    onCheckedChange={(checked: boolean) => {
                                                        const newChecklist = [...data.checklist];
                                                        newChecklist[index].completed = checked;
                                                        setData('checklist', newChecklist);
                                                    }}
                                                />
                                                <Label htmlFor={`checklist-${index}`} className="text-sm">
                                                    {item.item}
                                                </Label>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div>
                                    <Label htmlFor="notes" className="font-semibold">Verification Notes</Label>
                                    <textarea
                                        id="notes"
                                        value={data.notes}
                                        onChange={(e: React.ChangeEvent<HTMLTextAreaElement>) => setData('notes', e.target.value)}
                                        placeholder="Add notes about your verification findings..."
                                        rows={4}
                                        className="mt-1 w-full p-2 border border-gray-300 rounded-md"
                                    />
                                </div>

                                <div>
                                    <div className="flex justify-between items-center mb-2">
                                        <Label className="font-semibold">Discrepancies Found</Label>
                                        <Button type="button" variant="outline" size="sm" onClick={addDiscrepancy}>
                                            Add Discrepancy
                                        </Button>
                                    </div>
                                    <div className="space-y-2">
                                        {data.discrepancies.map((discrepancy, index) => (
                                            <div key={index} className="flex items-center justify-between p-2 border rounded">
                                                <span>{discrepancy.description}</span>
                                                <Button
                                                    type="button"
                                                    variant="destructive"
                                                    size="sm"
                                                    onClick={() => removeDiscrepancy(index)}
                                                >
                                                    Remove
                                                </Button>
                                            </div>
                                        ))}
                                        {data.discrepancies.length === 0 && (
                                            <p className="text-gray-500 text-sm">No discrepancies recorded</p>
                                        )}
                                    </div>
                                </div>

                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Verifying...' : 'Complete Verification'}
                                </Button>
                            </form>
                        </CardContent>
                    </Card>
                ) : null}

                {/* Registry Entries */}
                <Card>
                    <CardHeader>
                        <CardTitle>Registry Entries ({registryEntries.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {registryEntries.length === 0 ? (
                            <p className="text-gray-500">No registry entries in this batch.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Nationality</TableHead>
                                        <TableHead>Travel Date</TableHead>
                                        <TableHead>Direction</TableHead>
                                        <TableHead>Border Post</TableHead>
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
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>

                {/* Approval History */}
                {approvals.length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>Approval History</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                {approvals.map((approval) => (
                                    <div key={approval.id} className="border-l-4 border-blue-500 pl-4">
                                        <div className="flex justify-between items-start">
                                            <div>
                                                <Badge className={getStatusColor(approval.action)}>
                                                    {approval.action.replace('_', ' ')}
                                                </Badge>
                                                <p className="font-semibold mt-1">{approval.user.name}</p>
                                                <p className="text-sm text-gray-500">
                                                    {formatDate(approval.action_at)}
                                                </p>
                                            </div>
                                        </div>
                                        {approval.comments && (
                                            <p className="mt-2 text-sm">{approval.comments}</p>
                                        )}
                                        {approval.discrepancies_found && approval.discrepancies_found.length > 0 && (
                                            <div className="mt-2">
                                                <Label className="font-semibold text-sm">Discrepancies:</Label>
                                                <ul className="text-sm mt-1 list-disc list-inside">
                                                    {approval.discrepancies_found.map((disc: any, index: number) => (
                                                        <li key={index}>{disc.description}</li>
                                                    ))}
                                                </ul>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
