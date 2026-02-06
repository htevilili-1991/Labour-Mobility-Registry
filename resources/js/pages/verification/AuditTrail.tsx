import { Head } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';

interface AuditTrailEntry {
    id: number;
    action: string;
    description: string;
    old_values: any;
    new_values: any;
    action_at: string;
    user: { id: number; name: string; email: string };
}

interface RegistryBatch {
    id: number;
    name: string;
    batch_type: string;
    scheme: string;
    status: string;
}

interface Props {
    auth: { user: User | null };
    batch: RegistryBatch;
    auditTrail: AuditTrailEntry[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { title: 'Dashboard', href: '/dashboard' },
    { title: 'Verification', href: '/verification' },
    { title: 'Audit Trail', href: null },
];

export default function VerificationAuditTrail({ auth, batch, auditTrail }: Props) {
    const getActionColor = (action: string) => {
        switch (action) {
            case 'submitted': return 'bg-blue-100 text-blue-800';
            case 'verified': return 'bg-yellow-100 text-yellow-800';
            case 'approved': return 'bg-green-100 text-green-800';
            case 'rejected': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const formatAction = (action: string) => {
        return action.charAt(0).toUpperCase() + action.slice(1).replace('_', ' ');
    };

    return (
        <AppLayout auth={auth} breadcrumbs={breadcrumbs}>
            <Head title={`Audit Trail - ${batch.name}`} />
            
            <div className="space-y-6">
                {/* Header */}
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-semibold">Audit Trail</h1>
                        <p className="text-gray-600 mt-1">
                            Batch: {batch.name}
                        </p>
                    </div>
                    <Badge className={getActionColor(batch.status)}>
                        {batch.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                </div>

                {/* Audit Trail Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Audit History</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Date & Time</TableHead>
                                        <TableHead>User</TableHead>
                                        <TableHead>Action</TableHead>
                                        <TableHead>Description</TableHead>
                                        <TableHead>Changes</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {auditTrail.length === 0 ? (
                                        <TableRow>
                                            <TableCell colSpan={5} className="text-center py-8 text-gray-500">
                                                No audit trail entries found for this batch.
                                            </TableCell>
                                        </TableRow>
                                    ) : (
                                        auditTrail.map((entry) => (
                                            <TableRow key={entry.id}>
                                                <TableCell>
                                                    {new Date(entry.action_at).toLocaleString()}
                                                </TableCell>
                                                <TableCell>
                                                    <div>
                                                        <div className="font-medium">{entry.user.name}</div>
                                                        <div className="text-sm text-gray-500">{entry.user.email}</div>
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <Badge className={getActionColor(entry.action)}>
                                                        {formatAction(entry.action)}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>{entry.description}</TableCell>
                                                <TableCell>
                                                    <div className="space-y-2">
                                                        {entry.old_values && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-red-600">Before:</span>
                                                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(entry.old_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                        {entry.new_values && (
                                                            <div className="text-sm">
                                                                <span className="font-medium text-green-600">After:</span>
                                                                <pre className="mt-1 text-xs bg-gray-50 p-2 rounded overflow-x-auto">
                                                                    {JSON.stringify(entry.new_values, null, 2)}
                                                                </pre>
                                                            </div>
                                                        )}
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))
                                    )}
                                </TableBody>
                            </Table>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
