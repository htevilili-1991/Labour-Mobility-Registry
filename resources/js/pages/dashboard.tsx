import { Head, Link, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User, type SharedData } from '@/types';
import React, { useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import Highcharts from 'highcharts';
import HighchartsReact from 'highcharts-react-official';
import AccessibilityModule from 'highcharts/modules/accessibility'; // Import as a module
import { Users, Calendar, Globe, TrendingUp, FileText, Activity } from 'lucide-react';

interface Registry {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    travel_date: string | null;
    created_at: string;
}

interface Metrics {
    total_records: number;
    records_this_month: number;
    unique_nationalities: number;
}

interface ChartData {
    name: string;
    y: number;
}

interface Props {
    metrics: Metrics;
    monthly_records_travel: Record<string, number>;
    travel_reason_records: ChartData[];
    sex_records: ChartData[];
    recent_records: Registry[];
    error?: string;
}

const breadcrumbs: BreadcrumbItem[] = [{ label: 'Dashboard', href: '/dashboard' }];

export default function Dashboard({
                                      metrics,
                                      monthly_records_travel,
                                      travel_reason_records,
                                      sex_records,
                                      recent_records,
                                      error,
                                  }: Props) {
    const { auth } = usePage<SharedData>().props;
    // Initialize Highcharts accessibility module
    useEffect(() => {
        if (typeof Highcharts === 'object' && typeof AccessibilityModule === 'function') {
            AccessibilityModule(Highcharts);
        }
    }, []); // Empty dependency array ensures it runs once on mount

    // Chart for Records Over Time (travel_date)
    const hasTravelData = Object.keys(monthly_records_travel).length > 0;
    const travelChartOptions: Highcharts.Options = {
        chart: {
            type: 'line',
            height: 300,
            backgroundColor: 'transparent',
        },
        title: {
            text: 'Records Over Time', // Accessible title for screen readers
        },
        accessibility: {
            description: 'This chart displays the number of records over time, grouped by month.',
            landmarkVerbosity: 'one',
            keyboardNavigation: {
                enabled: true,
            },
        },
        xAxis: {
            categories: hasTravelData
                ? Object.keys(monthly_records_travel).map((month) => {
                    const [year, m] = month.split('-');
                    return new Date(parseInt(year), parseInt(m) - 1).toLocaleString('default', {
                        month: 'short',
                        year: 'numeric',
                    });
                })
                : [],
            title: { text: 'Month', style: { color: '#6b7280', fontSize: '12px' } },
            labels: { style: { color: '#6b7280', fontSize: '11px' } },
            gridLineWidth: 0,
        },
        yAxis: {
            title: { text: 'Records', style: { color: '#6b7280', fontSize: '12px' } },
            min: 0,
            gridLineColor: 'rgba(0, 0, 0, 0.1)',
            labels: { style: { color: '#6b7280', fontSize: '11px' } },
        },
        series: [
            {
                type: 'line',
                name: 'Records',
                data: hasTravelData ? Object.values(monthly_records_travel) : [],
                color: '#3b82f6',
                lineWidth: 2,
                marker: { enabled: true, radius: 4, fillColor: '#3b82f6', lineColor: '#ffffff', lineWidth: 1 },
                states: { hover: { lineWidth: 3 } },
            },
        ],
        plotOptions: { line: { linecap: 'round' } },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            shadow: true,
            padding: 8,
            style: { color: '#1f2937', fontSize: '12px' },
            formatter: function (this: Highcharts.TooltipFormatterContextObject) {
                return `<b>${this.x}</b><br/>Records: ${this.y}`;
            },
        },
        responsive: {
            rules: [
                {
                    condition: { maxWidth: 500 },
                    chartOptions: { chart: { height: 200 }, xAxis: { labels: { style: { fontSize: '10px' } } } },
                },
            ],
        },
    };

    // Chart for Records by Travel Reason
    const hasReasonData = travel_reason_records.length > 0;
    const reasonChartOptions: Highcharts.Options = {
        chart: {
            type: 'pie',
            height: 300,
            backgroundColor: 'transparent',
        },
        title: {
            text: 'Records by Travel Reason', // Accessible title
        },
        accessibility: {
            description: 'This pie chart shows the distribution of records by travel reason.',
            landmarkVerbosity: 'one',
            keyboardNavigation: {
                enabled: true,
            },
        },
        series: [
            {
                type: 'pie',
                name: 'Records',
                data: hasReasonData ? travel_reason_records : [],
                colors: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'],
            },
        ],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: { color: '#1f2937', fontSize: '12px' },
                },
                showInLegend: false,
            },
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            shadow: true,
            padding: 8,
            style: { color: '#1f2937', fontSize: '12px' },
            pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
        },
        responsive: {
            rules: [{ condition: { maxWidth: 500 }, chartOptions: { chart: { height: 200 } } }],
        },
    };

    // Chart for Records by Sex
    const hasSexData = sex_records.length > 0;
    const sexChartOptions: Highcharts.Options = {
        chart: {
            type: 'pie',
            height: 300,
            backgroundColor: 'transparent',
        },
        title: {
            text: 'Records by Sex', // Accessible title
        },
        accessibility: {
            description: 'This pie chart shows the distribution of records by sex.',
            landmarkVerbosity: 'one',
            keyboardNavigation: {
                enabled: true,
            },
        },
        series: [
            {
                type: 'pie',
                name: 'Records',
                data: hasSexData ? sex_records : [],
                colors: ['#3b82f6', '#f59e0b', '#10b981'],
            },
        ],
        plotOptions: {
            pie: {
                allowPointSelect: true,
                cursor: 'pointer',
                dataLabels: {
                    enabled: true,
                    format: '<b>{point.name}</b>: {point.percentage:.1f}%',
                    style: { color: '#1f2937', fontSize: '12px' },
                },
                showInLegend: false,
            },
        },
        legend: { enabled: false },
        credits: { enabled: false },
        tooltip: {
            backgroundColor: '#ffffff',
            borderColor: '#e5e7eb',
            borderRadius: 8,
            shadow: true,
            padding: 8,
            style: { color: '#1f2937', fontSize: '12px' },
            pointFormat: '<b>{point.name}</b>: {point.y} ({point.percentage:.1f}%)',
        },
        responsive: {
            rules: [{ condition: { maxWidth: 500 }, chartOptions: { chart: { height: 200 } } }],
        },
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Dashboard" />
            <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 p-6">
                {/* Header Section */}
                <div className="mb-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                                Dashboard
                            </h1>
                            <p className="text-gray-600 mt-2">Welcome back! Here's your overview.</p>
                        </div>
                        <div className="flex items-center gap-2">
                            <Badge variant="secondary" className="bg-blue-100 text-blue-800 px-3 py-1">
                                <Activity className="w-4 h-4 mr-1" />
                                Live Data
                            </Badge>
                        </div>
                    </div>
                </div>

                {error && (
                    <div className="mb-6 rounded-lg border border-red-200 bg-red-50 p-4 text-red-800">
                        <div className="flex items-center">
                            <FileText className="w-5 h-5 mr-2" />
                            {error}
                        </div>
                    </div>
                )}

                {/* Enhanced Metrics Cards */}
                <div className="grid gap-6 md:grid-cols-3 mb-8">
                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-blue-500 to-blue-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-blue-100 text-sm font-medium mb-1">Total Records</p>
                                    <div className="text-3xl font-bold">{metrics.total_records.toLocaleString()}</div>
                                    <p className="text-blue-100 text-xs mt-2">All time entries</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Users className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-purple-500 to-purple-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-purple-100 text-sm font-medium mb-1">This Month</p>
                                    <div className="text-3xl font-bold">{metrics.records_this_month.toLocaleString()}</div>
                                    <p className="text-purple-100 text-xs mt-2">New records</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Calendar className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>

                    <Card className="relative overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-green-500 to-green-600 text-white">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-green-100 text-sm font-medium mb-1">Nationalities</p>
                                    <div className="text-3xl font-bold">{metrics.unique_nationalities.toLocaleString()}</div>
                                    <p className="text-green-100 text-xs mt-2">Unique countries</p>
                                </div>
                                <div className="bg-white/20 p-3 rounded-full">
                                    <Globe className="w-8 h-8 text-white" />
                                </div>
                            </div>
                        </CardContent>
                        <div className="absolute bottom-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mb-16"></div>
                    </Card>
                </div>
                {/* Enhanced Analytics Section */}
                <Card className="border-0 shadow-lg mb-8">
                    <CardHeader className="bg-gradient-to-r from-blue-50 to-purple-50 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <TrendingUp className="w-5 h-5 text-blue-600" />
                                Analytics Overview
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                                Real-time Data
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        <Tabs defaultValue="travel-date" className="w-full">
                            <TabsList className="grid w-full grid-cols-3 mb-6 bg-gray-100 p-1 rounded-lg">
                                <TabsTrigger value="travel-date" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                    Records Over Time
                                </TabsTrigger>
                                <TabsTrigger value="travel-reason" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                    By Travel Reason
                                </TabsTrigger>
                                <TabsTrigger value="sex" className="data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-md transition-all">
                                    By Sex
                                </TabsTrigger>
                            </TabsList>
                            <TabsContent value="travel-date" className="h-[350px]">
                                {hasTravelData ? (
                                    <HighchartsReact highcharts={Highcharts} options={travelChartOptions} />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <div className="text-center">
                                            <Calendar className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No travel date data available</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="travel-reason" className="h-[350px]">
                                {hasReasonData ? (
                                    <HighchartsReact highcharts={Highcharts} options={reasonChartOptions} />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <div className="text-center">
                                            <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No travel reason data available</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                            <TabsContent value="sex" className="h-[350px]">
                                {hasSexData ? (
                                    <HighchartsReact highcharts={Highcharts} options={sexChartOptions} />
                                ) : (
                                    <div className="flex h-full items-center justify-center text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                        <div className="text-center">
                                            <Users className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                                            <p>No sex data available</p>
                                        </div>
                                    </div>
                                )}
                            </TabsContent>
                        </Tabs>
                    </CardContent>
                </Card>
                {/* Enhanced Recent Records Table */}
                <Card className="border-0 shadow-lg">
                    <CardHeader className="bg-gradient-to-r from-green-50 to-blue-50 border-b">
                        <div className="flex items-center justify-between">
                            <CardTitle className="flex items-center gap-2 text-xl">
                                <FileText className="w-5 h-5 text-green-600" />
                                Recent Records
                            </CardTitle>
                            <Badge variant="outline" className="text-xs">
                                Latest {recent_records.length} entries
                            </Badge>
                        </div>
                    </CardHeader>
                    <CardContent className="p-6">
                        {recent_records.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-12 text-gray-500 bg-gray-50 rounded-lg border-2 border-dashed border-gray-200">
                                <FileText className="w-16 h-16 mb-4 text-gray-300" />
                                <p className="text-lg font-medium">No recent records available</p>
                                <p className="text-sm text-gray-400 mt-1">New records will appear here</p>
                            </div>
                        ) : (
                            <div className="overflow-x-auto">
                                <Table>
                                    <TableHeader>
                                        <TableRow className="border-b border-gray-200 bg-gray-50">
                                            <TableHead className="font-semibold text-gray-700">Surname</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Given Name</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Nationality</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Travel Date</TableHead>
                                            <TableHead className="font-semibold text-gray-700">Created At</TableHead>
                                            <TableHead className="font-semibold text-gray-700 text-right">Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {recent_records.map((record, index) => (
                                            <TableRow key={record.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                                                <TableCell className="font-medium text-gray-900">
                                                    {record.surname || 'N/A'}
                                                </TableCell>
                                                <TableCell className="text-gray-700">
                                                    {record.given_name || 'N/A'}
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex items-center gap-2">
                                                        <Globe className="w-4 h-4 text-blue-500" />
                                                        <span className="text-gray-700">{record.nationality || 'N/A'}</span>
                                                    </div>
                                                </TableCell>
                                                <TableCell className="text-gray-700">
                                                    {record.travel_date ? (
                                                        <div className="flex items-center gap-2">
                                                            <Calendar className="w-4 h-4 text-green-500" />
                                                            <span>{format(new Date(record.travel_date), 'MMM dd, yyyy')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-gray-700">
                                                    {record.created_at ? (
                                                        <div className="flex items-center gap-2">
                                                            <Activity className="w-4 h-4 text-purple-500" />
                                                            <span>{format(new Date(record.created_at), 'MMM dd, yyyy HH:mm')}</span>
                                                        </div>
                                                    ) : (
                                                        <span className="text-gray-400">N/A</span>
                                                    )}
                                                </TableCell>
                                                <TableCell className="text-right">
                                                    <Link 
                                                        href={`/registry/${record.id}`} 
                                                        className="inline-flex items-center gap-1 px-3 py-1 text-sm font-medium text-blue-600 bg-blue-50 rounded-md hover:bg-blue-100 transition-colors"
                                                    >
                                                        View
                                                        <TrendingUp className="w-3 h-3" />
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
        </AppLayout>
    );
}
