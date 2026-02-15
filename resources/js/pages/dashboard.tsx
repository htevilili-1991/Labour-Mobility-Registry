import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import AccessibilityModule from 'highcharts/modules/accessibility';
import {
    Users,
    Calendar,
    Globe,
    TrendingUp,
    FileText,
    Activity,
    Package,
    ClipboardCheck,
    CheckCircle2,
    ArrowUpRight,
    ArrowDownRight,
    Upload,
    LayoutGrid,
    BarChart3,
    Layers,
    Plane,
    Link2,
    Unlink,
    Clock,
} from 'lucide-react';

interface Registry {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    travel_date: string | null;
    created_at: string;
    direction: string;
}

interface ChartPoint {
    name: string;
    y: number;
}

interface Metrics {
    total_records: number;
    records_this_month: number;
    unique_nationalities: number;
    mom_change: number;
    draft_batches: number;
    pending_verification: number;
    approved_batches: number;
    total_batches: number;
    returns_last_30?: number;
    returns_last_90?: number;
    returns_total?: number;
    returns_matched?: number;
    returns_unmatched?: number;
    returns_pending_review?: number;
    return_match_rate?: number;
}

interface Props {
    metrics: Metrics;
    monthly_records_travel: Record<string, number>;
    travel_reason_records: ChartPoint[];
    sex_records: ChartPoint[];
    direction_records: ChartPoint[];
    batches_by_status: ChartPoint[];
    top_destinations: ChartPoint[];
    recent_records: Registry[];
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];

const chartColors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#06b6d4', '#84cc16'];

function makeLineChart(
    title: string,
    categories: string[],
    data: number[],
    color = '#3b82f6'
): Highcharts.Options {
    return {
        chart: { type: 'line', height: 260, backgroundColor: 'transparent' },
        title: { text: title, style: { fontSize: '14px', fontWeight: '600' } },
        xAxis: {
            categories,
            labels: { style: { fontSize: '11px', color: '#6b7280' } },
            gridLineWidth: 0,
        },
        yAxis: {
            min: 0,
            title: { text: '' },
            labels: { style: { fontSize: '11px', color: '#6b7280' } },
            gridLineColor: 'rgba(0,0,0,0.06)',
        },
        series: [{
            type: 'line',
            name: 'Records',
            data,
            color,
            lineWidth: 2,
            marker: { enabled: true, radius: 3 },
        }],
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: { formatter: function () { return `<b>${this.x}</b><br/>Records: ${this.y}`; } },
    };
}

function makePieChart(title: string, data: ChartPoint[], height = 260): Highcharts.Options {
    return {
        chart: { type: 'pie', height, backgroundColor: 'transparent' },
        title: { text: title, style: { fontSize: '14px', fontWeight: '600' } },
        series: [{ type: 'pie', name: 'Records', data, colors: chartColors }],
        plotOptions: {
            pie: {
                dataLabels: {
                    enabled: true,
                    format: '{point.name}: {point.percentage:.0f}%',
                    style: { fontSize: '11px' },
                },
                showInLegend: false,
            },
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: { pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)' },
    };
}

export default function Dashboard({
    metrics,
    monthly_records_travel,
    travel_reason_records,
    sex_records,
    direction_records,
    batches_by_status,
    top_destinations,
    recent_records,
    error,
}: Props) {
    const { auth } = usePage<SharedData>().props;
    const userName = auth?.user?.name?.split(' ')[0] || 'User';

    useEffect(() => {
        if (typeof Highcharts === 'object' && typeof AccessibilityModule === 'function') {
            AccessibilityModule(Highcharts);
        }
    }, []);

    const hasTravelData = Object.keys(monthly_records_travel).length > 0;
    const travelCategories = hasTravelData
        ? Object.keys(monthly_records_travel).map((m) => {
            const [y, mo] = m.split('-');
            return new Date(parseInt(y), parseInt(mo) - 1).toLocaleString('default', {
                month: 'short',
                year: '2-digit',
            });
        })
        : [];
    const travelData = hasTravelData ? Object.values(monthly_records_travel) : [];

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                {/* Header */}
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">
                            Labour Mobility Registry
                        </h1>
                        <p className="text-sm text-gray-500">
                            Welcome back, {userName}. Here&apos;s your operational overview.
                        </p>
                    </div>
                    <div className="flex flex-wrap items-center gap-2">
                        <Link
                            href="/registry/upload-wizard"
                            className="inline-flex items-center gap-2 rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-blue-700"
                        >
                            <Upload className="h-4 w-4" />
                            Upload Data
                        </Link>
                        <Link
                            href="/registry"
                            className="inline-flex items-center gap-2 rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50"
                        >
                            <LayoutGrid className="h-4 w-4" />
                            Registry
                        </Link>
                    </div>
                </div>

                {/* Quick Links */}
                <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
                    <Link
                        href="/registry"
                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow-md"
                    >
                        <div className="rounded-lg bg-blue-50 p-2.5 transition group-hover:bg-blue-100">
                            <LayoutGrid className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Registry</p>
                            <p className="text-xs text-gray-500">View & manage all entries</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:text-blue-600" />
                    </Link>
                    <Link
                        href="/batches"
                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-emerald-200 hover:shadow-md"
                    >
                        <div className="rounded-lg bg-emerald-50 p-2.5 transition group-hover:bg-emerald-100">
                            <Package className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Batches</p>
                            <p className="text-xs text-gray-500">{metrics.total_batches} batches total</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:text-emerald-600" />
                    </Link>
                    <Link
                        href="/verification"
                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow-md"
                    >
                        <div className="rounded-lg bg-amber-50 p-2.5 transition group-hover:bg-amber-100">
                            <ClipboardCheck className="h-5 w-5 text-amber-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Verification</p>
                            <p className="text-xs text-gray-500">{metrics.pending_verification} awaiting review</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:text-amber-600" />
                    </Link>
                    <Link
                        href="/reports"
                        className="group flex items-center gap-3 rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-violet-200 hover:shadow-md"
                    >
                        <div className="rounded-lg bg-violet-50 p-2.5 transition group-hover:bg-violet-100">
                            <BarChart3 className="h-5 w-5 text-violet-600" />
                        </div>
                        <div>
                            <p className="font-medium text-gray-900">Reports</p>
                            <p className="text-xs text-gray-500">Analytics & exports</p>
                        </div>
                        <ArrowUpRight className="ml-auto h-4 w-4 text-gray-400 transition group-hover:text-violet-600" />
                    </Link>
                </div>

                {error && (
                    <div className="rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <div className="flex items-center gap-2">
                            <FileText className="h-5 w-5 shrink-0" />
                            {error}
                        </div>
                    </div>
                )}

                {/* KPI Cards */}
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Total Records
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {metrics.total_records.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-blue-100 p-3">
                                    <Users className="h-6 w-6 text-blue-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        This Month
                                    </p>
                                    <div className="mt-1 flex items-center gap-2">
                                        <span className="text-2xl font-bold text-gray-900">
                                            {metrics.records_this_month.toLocaleString()}
                                        </span>
                                        {metrics.mom_change !== 0 && (
                                            <span
                                                className={`inline-flex items-center text-xs font-medium ${
                                                    metrics.mom_change >= 0 ? 'text-green-600' : 'text-red-600'
                                                }`}
                                            >
                                                {metrics.mom_change >= 0 ? (
                                                    <ArrowUpRight className="h-3 w-3" />
                                                ) : (
                                                    <ArrowDownRight className="h-3 w-3" />
                                                )}
                                                {Math.abs(metrics.mom_change)}%
                                            </span>
                                        )}
                                    </div>
                                </div>
                                <div className="rounded-lg bg-emerald-100 p-3">
                                    <Calendar className="h-6 w-6 text-emerald-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Nationalities
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {metrics.unique_nationalities.toLocaleString()}
                                    </p>
                                </div>
                                <div className="rounded-lg bg-violet-100 p-3">
                                    <Globe className="h-6 w-6 text-violet-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-xs font-medium uppercase tracking-wide text-gray-500">
                                        Pending Verification
                                    </p>
                                    <p className="mt-1 text-2xl font-bold text-gray-900">
                                        {metrics.pending_verification}
                                    </p>
                                    <p className="text-xs text-gray-500">
                                        {metrics.total_batches} batches total
                                    </p>
                                </div>
                                <div className="rounded-lg bg-amber-100 p-3">
                                    <ClipboardCheck className="h-6 w-6 text-amber-600" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Section: Batch Workflow */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Batch Workflow
                    </h2>
                    <div className="grid gap-4 sm:grid-cols-3">
                    <Link
                        href="/batches"
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-blue-200 hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-gray-100 p-2">
                                <Package className="h-5 w-5 text-gray-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Draft Batches</p>
                                <p className="text-2xl font-bold text-gray-700">{metrics.draft_batches}</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/verification"
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-amber-50 p-2">
                                <ClipboardCheck className="h-5 w-5 text-amber-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Awaiting Review</p>
                                <p className="text-2xl font-bold text-amber-600">{metrics.pending_verification}</p>
                            </div>
                        </div>
                    </Link>
                    <Link
                        href="/batches"
                        className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-200 hover:shadow"
                    >
                        <div className="flex items-center gap-3">
                            <div className="rounded-lg bg-green-50 p-2">
                                <CheckCircle2 className="h-5 w-5 text-green-600" />
                            </div>
                            <div>
                                <p className="text-sm font-medium text-gray-900">Approved</p>
                                <p className="text-2xl font-bold text-green-600">{metrics.approved_batches}</p>
                            </div>
                        </div>
                    </Link>
                    </div>
                </div>

                {/* Section: Returnee Compliance */}
                <div>
                        <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                            Returnee Compliance
                        </h2>
                        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                            <Link
                                href="/reports/returnee-compliance"
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-sky-50 p-2">
                                        <Plane className="h-5 w-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Returns (30 days)</p>
                                        <p className="text-2xl font-bold text-sky-600">{metrics.returns_last_30 ?? 0}</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/reports/returnee-compliance"
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-sky-200 hover:shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-sky-50 p-2">
                                        <Calendar className="h-5 w-5 text-sky-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Returns (90 days)</p>
                                        <p className="text-2xl font-bold text-sky-700">{metrics.returns_last_90 ?? 0}</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/reports/returnee-compliance"
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-green-200 hover:shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-green-50 p-2">
                                        <Link2 className="h-5 w-5 text-green-600" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Match Rate</p>
                                        <p className="text-2xl font-bold text-green-600">{metrics.return_match_rate ?? 0}%</p>
                                    </div>
                                </div>
                            </Link>
                            <Link
                                href="/reports/returnee-compliance"
                                className="rounded-lg border border-gray-200 bg-white p-4 shadow-sm transition hover:border-amber-200 hover:shadow"
                            >
                                <div className="flex items-center gap-3">
                                    <div className="rounded-lg bg-amber-50 p-2">
                                        <div className="flex items-center gap-1">
                                            <Link2 className="h-4 w-4 text-green-500" />
                                            <Unlink className="h-4 w-4 text-red-500" />
                                            <Clock className="h-4 w-4 text-amber-500" />
                                        </div>
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-gray-900">Matched / Unmatched</p>
                                        <p className="text-lg font-bold">
                                            <span className="text-green-600">{metrics.returns_matched ?? 0}</span>
                                            {' / '}
                                            <span className="text-red-600">{metrics.returns_unmatched ?? 0}</span>
                                            {((metrics.returns_pending_review ?? 0) > 0) && (
                                                <span className="ml-1 text-xs text-amber-600">
                                                    (+{metrics.returns_pending_review} pending)
                                                </span>
                                            )}
                                        </p>
                                    </div>
                                </div>
                            </Link>
                        </div>
                    </div>

                {/* Section: Analytics */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Analytics
                    </h2>
                    <div className="grid gap-6 lg:grid-cols-3">
                    <Card className="lg:col-span-2">
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <TrendingUp className="h-4 w-4 text-blue-600" />
                                Records Over Time
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {hasTravelData ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makeLineChart(
                                        '',
                                        travelCategories,
                                        travelData,
                                        '#3b82f6'
                                    )}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No travel date data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Activity className="h-4 w-4 text-emerald-600" />
                                By Direction
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {direction_records.length > 0 ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makePieChart('', direction_records)}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No direction data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <FileText className="h-4 w-4 text-violet-600" />
                                By Travel Reason
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {travel_reason_records.length > 0 ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makePieChart('', travel_reason_records)}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No travel reason data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Globe className="h-4 w-4 text-amber-600" />
                                Top Destinations
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {top_destinations.length > 0 ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makePieChart('', top_destinations, 260)}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No destination data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Users className="h-4 w-4 text-pink-600" />
                                By Sex
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {sex_records.length > 0 ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makePieChart('', sex_records)}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No sex data yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="flex items-center gap-2 text-base">
                                <Layers className="h-4 w-4 text-slate-600" />
                                Batch Status
                            </CardTitle>
                        </CardHeader>
                        <CardContent>
                            {batches_by_status.length > 0 ? (
                                <HighchartsReact
                                    highcharts={Highcharts}
                                    options={makePieChart('', batches_by_status)}
                                />
                            ) : (
                                <div className="flex h-52 items-center justify-center rounded-lg border-2 border-dashed border-gray-200 bg-gray-50 text-gray-500">
                                    <p className="text-sm">No batches yet</p>
                                </div>
                            )}
                        </CardContent>
                    </Card>
                </div>
                </div>

                {/* Section: Recent Activity */}
                <div>
                    <h2 className="mb-3 text-sm font-semibold uppercase tracking-wide text-gray-500">
                        Recent Records
                    </h2>
                {/* Recent Records */}
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle className="flex items-center gap-2 text-base">
                            <FileText className="h-4 w-4 text-gray-600" />
                            Recent Records
                        </CardTitle>
                        <Link
                            href="/registry"
                            className="text-sm font-medium text-blue-600 hover:text-blue-700"
                        >
                            View all
                        </Link>
                    </CardHeader>
                    <CardContent>
                                        {recent_records.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500">
                                <Users className="mb-4 h-12 w-12 text-gray-300" />
                                <p className="text-sm">No records yet</p>
                                <Link
                                    href="/registry/upload-wizard"
                                    className="mt-2 text-sm text-blue-600 hover:underline"
                                >
                                    Upload your first batch
                                </Link>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="bg-gray-50">
                                            <TableHead className="font-medium">Surname</TableHead>
                                            <TableHead className="font-medium">Given Name</TableHead>
                                            <TableHead className="font-medium">Nationality</TableHead>
                                            <TableHead className="font-medium">Direction</TableHead>
                                            <TableHead className="font-medium">Travel Date</TableHead>
                                            <TableHead className="font-medium">Created</TableHead>
                                            <TableHead className="text-right font-medium">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recent_records.map((record) => (
                                            <TableRow key={record.id} className="hover:bg-gray-50">
                                                <TableCell className="font-medium">
                                                    {record.surname || 'N/A'}
                                                </TableCell>
                                                <TableCell>{record.given_name || 'N/A'}</TableCell>
                                                <TableCell>{record.nationality || 'N/A'}</TableCell>
                                                <TableCell>
                                                    <Badge
                                                        variant="outline"
                                                        className={
                                                            record.direction === 'Inbound'
                                                                ? 'border-green-200 bg-green-50 text-green-700'
                                                                : 'border-blue-200 bg-blue-50 text-blue-700'
                                                        }
                                                    >
                                                        {record.direction || 'N/A'}
                                                    </Badge>
                                                </TableCell>
                                                <TableCell>
                                                    {record.travel_date
                                                        ? format(new Date(record.travel_date), 'MMM d, yyyy')
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    {record.created_at
                                                        ? format(new Date(record.created_at), 'MMM d')
                                                        : 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link
                                                        href={`/registry/${record.id}`}
                                                        className="inline-flex items-center gap-1 text-sm font-medium text-blue-600 hover:text-blue-700"
                                                    >
                                                        View
                                                        <ArrowUpRight className="h-3 w-3" />
                                                    </Link>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            </div>
                        )}
                    </CardContent>
                </Card>
                </div>
            </div>
        </AppLayout>
    );
}
