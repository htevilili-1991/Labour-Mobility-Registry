import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface ReturneeRecord {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    return_date: string;
    flight_number: string | null;
    match_status: string | null;
    reintegration_status: string | null;
}

interface ReturneeComplianceSummary {
    total_returns: number;
    matched: number;
    unmatched: number;
    pending_review: number;
    match_rate: number;
    by_reintegration_status: Record<string, number>;
    records: ReturneeRecord[];
    date_range: { start: string; end: string };
}

interface Props {
    auth: { user: User | null };
    summary: ReturneeComplianceSummary;
    period: string;
    dateRange: { start: string; end: string };
    periods: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Returnee Compliance Summary', href: '/reports/returnee-compliance' },
];

export default function ReturneeComplianceReport({ auth, summary, period, dateRange, periods }: Props) {
    const handlePeriodChange = (value: string) => {
        router.get('/reports/returnee-compliance', { period: value }, { preserveState: true });
    };

    const handleExport = () => {
        const url = `/reports/returnee-compliance/export?period=${period}`;
        window.open(url, '_blank');
    };

    const getMatchStatusBadge = (status: string | null) => {
        const s = status || 'unmatched';
        switch (s) {
            case 'matched':
                return <Badge className="bg-green-100 text-green-800">Matched</Badge>;
            case 'pending_review':
                return <Badge className="bg-amber-100 text-amber-800">Pending Review</Badge>;
            default:
                return <Badge className="bg-red-100 text-red-800">Unmatched</Badge>;
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Returnee Compliance Summary" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold">Returnee Compliance Summary</h1>
                        <p className="text-gray-600">
                            {summary.date_range.start} to {summary.date_range.end}
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                        <Select value={period} onValueChange={handlePeriodChange}>
                            <SelectTrigger className="w-44">
                                <SelectValue placeholder="Select period" />
                            </SelectTrigger>
                            <SelectContent>
                                {Object.entries(periods).map(([key, label]) => (
                                    <SelectItem key={key} value={key}>
                                        {label}
                                    </SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        <Button variant="outline" onClick={handleExport}>
                            Export CSV
                        </Button>
                        <Link href="/reports">
                            <Button variant="outline">Back to Reports</Button>
                        </Link>
                    </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-2 gap-4 md:grid-cols-5">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Returns</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.total_returns}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Matched</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-green-600">{summary.matched}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Unmatched</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-red-600">{summary.unmatched}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending Review</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-amber-600">{summary.pending_review}</div>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Match Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{summary.match_rate}%</div>
                        </CardContent>
                    </Card>
                </div>

                {/* Reintegration Status Breakdown */}
                {Object.keys(summary.by_reintegration_status).length > 0 && (
                    <Card>
                        <CardHeader>
                            <CardTitle>By Reintegration Status</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="flex flex-wrap gap-4">
                                {Object.entries(summary.by_reintegration_status).map(([status, count]) => (
                                    <div key={status || 'none'} className="flex items-center gap-2">
                                        <Badge variant="outline">{status || 'Not Set'}</Badge>
                                        <span className="font-medium">{count}</span>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>
                )}

                {/* Returnee Records Table */}
                <Card>
                    <CardHeader>
                        <CardTitle>Returnee Records ({summary.records.length})</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {summary.records.length === 0 ? (
                            <div className="py-12 text-center text-gray-500">
                                No returnee records in the selected period.
                            </div>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Nationality</TableHead>
                                        <TableHead>Return Date</TableHead>
                                        <TableHead>Match Status</TableHead>
                                        <TableHead>Reintegration</TableHead>
                                        <TableHead>Flight</TableHead>
                                        <TableHead className="text-right">Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {summary.records.map((record) => (
                                        <TableRow key={record.id}>
                                            <TableCell className="font-medium">
                                                {record.surname}, {record.given_name}
                                            </TableCell>
                                            <TableCell>{record.nationality}</TableCell>
                                            <TableCell>{record.return_date}</TableCell>
                                            <TableCell>{getMatchStatusBadge(record.match_status)}</TableCell>
                                            <TableCell>{record.reintegration_status || '-'}</TableCell>
                                            <TableCell>{record.flight_number || '-'}</TableCell>
                                            <TableCell className="text-right">
                                                <Link href={`/registry/${record.id}/edit`}>
                                                    <Button variant="ghost" size="sm">
                                                        Edit
                                                    </Button>
                                                </Link>
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
