import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleChart } from '@/components/charts/SimpleChart';

interface PerformanceData {
    throughput: {
        batches_per_day: number;
        records_per_day: number;
        peak_day: { date: string; count: number };
    };
    efficiency: {
        automation_rate: number;
        error_rate: number;
        rework_rate: number;
    };
    productivity: {
        user_productivity: Array<{
            user: string;
            batches_processed: number;
            records_processed: number;
            avg_time_per_batch: number;
        }>;
        team_productivity: {
            total_users: number;
            avg_productivity: number;
            top_performer: string;
        };
        resource_utilization: {
            cpu_usage: number;
            memory_usage: number;
            storage_usage: number;
        };
    };
    bottlenecks: {
        verification_bottleneck: {
            stage: string;
            avg_time: number;
            impact: string;
            recommendation: string;
        };
        approval_bottleneck: {
            stage: string;
            avg_time: number;
            impact: string;
            recommendation: string;
        };
        data_entry_bottleneck: {
            stage: string;
            avg_time: number;
            impact: string;
            recommendation: string;
        };
    };
    monthly_performance: Array<{
        period: string;
        throughput: number;
        efficiency: number;
        productivity: number;
    }>;
}

interface Props {
    auth: { user: User | null };
    performanceData: PerformanceData;
    period: string;
    dateRange: { start: string; end: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Performance Report', href: '/reports/performance' }
];

export default function PerformanceReport({ auth, performanceData, period, dateRange }: Props) {
    const getStatusColor = (value: number, type: 'rate' | 'usage' = 'rate') => {
        if (type === 'rate') {
            if (value >= 90) return 'bg-green-100 text-green-800';
            if (value >= 70) return 'bg-yellow-100 text-yellow-800';
            return 'bg-red-100 text-red-800';
        } else {
            if (value <= 70) return 'bg-green-100 text-green-800';
            if (value <= 85) return 'bg-yellow-100 text-yellow-800';
            return 'bg-red-100 text-red-800';
        }
    };

    const getImpactColor = (impact: string) => {
        switch (impact) {
            case 'low': return 'bg-blue-100 text-blue-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Performance Report" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Performance Report</h1>
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

                {/* Throughput Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Throughput Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600">
                                    {performanceData.throughput.batches_per_day.toFixed(1)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Batches per Day</p>
                                <p className="text-xs text-gray-500">Average daily processing</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600">
                                    {performanceData.throughput.records_per_day.toFixed(0)}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Records per Day</p>
                                <p className="text-xs text-gray-500">Average daily volume</p>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600">
                                    {performanceData.throughput.peak_day.count}
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Peak Day</p>
                                <p className="text-xs text-gray-500">{performanceData.throughput.peak_day.date}</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Efficiency Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Efficiency Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600">
                                    {performanceData.efficiency.automation_rate.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Automation Rate</p>
                                <Badge className={getStatusColor(performanceData.efficiency.automation_rate)}>
                                    {performanceData.efficiency.automation_rate >= 90 ? 'Excellent' : performanceData.efficiency.automation_rate >= 70 ? 'Good' : 'Needs Improvement'}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-red-600">
                                    {performanceData.efficiency.error_rate.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Error Rate</p>
                                <Badge className={getStatusColor(100 - performanceData.efficiency.error_rate)}>
                                    {performanceData.efficiency.error_rate <= 5 ? 'Excellent' : performanceData.efficiency.error_rate <= 10 ? 'Good' : 'Needs Attention'}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-orange-600">
                                    {performanceData.efficiency.rework_rate.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Rework Rate</p>
                                <Badge className={getStatusColor(100 - performanceData.efficiency.rework_rate)}>
                                    {performanceData.efficiency.rework_rate <= 5 ? 'Excellent' : performanceData.efficiency.rework_rate <= 10 ? 'Good' : 'Needs Attention'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Trends */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Trends</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <SimpleChart
                                data={performanceData.monthly_performance.map(item => ({
                                    period: item.period,
                                    value: item.throughput,
                                    label: 'Throughput'
                                }))}
                                title="Throughput Over Time"
                                color="#3b82f6"
                                height={200}
                            />
                            <SimpleChart
                                data={performanceData.monthly_performance.map(item => ({
                                    period: item.period,
                                    value: item.efficiency,
                                    label: 'Efficiency'
                                }))}
                                title="Efficiency Over Time"
                                color="#10b981"
                                height={200}
                            />
                            <SimpleChart
                                data={performanceData.monthly_performance.map(item => ({
                                    period: item.period,
                                    value: item.productivity,
                                    label: 'Productivity'
                                }))}
                                title="Productivity Over Time"
                                color="#f59e0b"
                                height={200}
                            />
                        </div>
                    </CardContent>
                </Card>

                {/* User Productivity */}
                <Card>
                    <CardHeader>
                        <CardTitle>User Productivity</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {performanceData.productivity.user_productivity.map((user, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <h3 className="font-semibold">{user.user}</h3>
                                        <div className="flex gap-4 mt-2 text-sm text-gray-600">
                                            <span>{user.batches_processed} batches</span>
                                            <span>{user.records_processed} records</span>
                                            <span>{user.avg_time_per_batch.toFixed(1)}h/batch</span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <Badge className={getStatusColor(user.avg_time_per_batch <= 24 ? 100 : 50)}>
                                            {user.avg_time_per_batch <= 24 ? 'Fast' : 'Slow'}
                                        </Badge>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Team Productivity */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Team Overview</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>Total Users</span>
                                    <span className="font-semibold">{performanceData.productivity.team_productivity.total_users}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Average Productivity</span>
                                    <span className="font-semibold">{performanceData.productivity.team_productivity.avg_productivity.toFixed(1)}</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Top Performer</span>
                                    <span className="font-semibold">{performanceData.productivity.team_productivity.top_performer}</span>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Resource Utilization</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center">
                                    <span>CPU Usage</span>
                                    <Badge className={getStatusColor(performanceData.productivity.resource_utilization.cpu_usage, 'usage')}>
                                        {performanceData.productivity.resource_utilization.cpu_usage}%
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Memory Usage</span>
                                    <Badge className={getStatusColor(performanceData.productivity.resource_utilization.memory_usage, 'usage')}>
                                        {performanceData.productivity.resource_utilization.memory_usage}%
                                    </Badge>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span>Storage Usage</span>
                                    <Badge className={getStatusColor(performanceData.productivity.resource_utilization.storage_usage, 'usage')}>
                                        {performanceData.productivity.resource_utilization.storage_usage}%
                                    </Badge>
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Bottlenecks */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Bottlenecks</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-6">
                            <div className="p-4 border-l-4 border-orange-500 bg-orange-50 rounded">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-orange-800">
                                            {performanceData.bottlenecks.verification_bottleneck.stage}
                                        </h4>
                                        <p className="text-sm text-orange-700 mt-1">
                                            Average time: {performanceData.bottlenecks.verification_bottleneck.avg_time.toFixed(1)} hours
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {performanceData.bottlenecks.verification_bottleneck.impact}
                                        </p>
                                    </div>
                                    <Badge className={getImpactColor(performanceData.bottlenecks.verification_bottleneck.impact)}>
                                        {performanceData.bottlenecks.verification_bottleneck.impact}
                                    </Badge>
                                </div>
                                <div className="mt-3 p-3 bg-white rounded border">
                                    <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {performanceData.bottlenecks.verification_bottleneck.recommendation}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-l-4 border-red-500 bg-red-50 rounded">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-red-800">
                                            {performanceData.bottlenecks.approval_bottleneck.stage}
                                        </h4>
                                        <p className="text-sm text-red-700 mt-1">
                                            Average time: {performanceData.bottlenecks.approval_bottleneck.avg_time.toFixed(1)} hours
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {performanceData.bottlenecks.approval_bottleneck.impact}
                                        </p>
                                    </div>
                                    <Badge className={getImpactColor(performanceData.bottlenecks.approval_bottleneck.impact)}>
                                        {performanceData.bottlenecks.approval_bottleneck.impact}
                                    </Badge>
                                </div>
                                <div className="mt-3 p-3 bg-white rounded border">
                                    <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {performanceData.bottlenecks.approval_bottleneck.recommendation}
                                    </p>
                                </div>
                            </div>

                            <div className="p-4 border-l-4 border-blue-500 bg-blue-50 rounded">
                                <div className="flex justify-between items-start">
                                    <div className="flex-1">
                                        <h4 className="font-medium text-blue-800">
                                            {performanceData.bottlenecks.data_entry_bottleneck.stage}
                                        </h4>
                                        <p className="text-sm text-blue-700 mt-1">
                                            Average time: {performanceData.bottlenecks.data_entry_bottleneck.avg_time.toFixed(1)} hours
                                        </p>
                                        <p className="text-sm text-gray-600 mt-2">
                                            {performanceData.bottlenecks.data_entry_bottleneck.impact}
                                        </p>
                                    </div>
                                    <Badge className={getImpactColor(performanceData.bottlenecks.data_entry_bottleneck.impact)}>
                                        {performanceData.bottlenecks.data_entry_bottleneck.impact}
                                    </Badge>
                                </div>
                                <div className="mt-3 p-3 bg-white rounded border">
                                    <p className="text-sm font-medium text-gray-700">Recommendation:</p>
                                    <p className="text-sm text-gray-600 mt-1">
                                        {performanceData.bottlenecks.data_entry_bottleneck.recommendation}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Performance Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Performance Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {performanceData.efficiency.automation_rate < 90 && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <h4 className="font-medium text-blue-800">Increase Automation</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Consider automating repetitive tasks to improve efficiency and reduce manual errors.
                                    </p>
                                </div>
                            )}
                            {performanceData.efficiency.error_rate > 5 && (
                                <div className="p-4 bg-red-50 border-l-4 border-red-500 rounded">
                                    <h4 className="font-medium text-red-800">Reduce Error Rate</h4>
                                    <p className="text-sm text-red-700 mt-1">
                                        Implement better validation and quality checks to reduce errors and rework.
                                    </p>
                                </div>
                            )}
                            {performanceData.throughput.batches_per_day < 10 && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                    <h4 className="font-medium text-yellow-800">Increase Throughput</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Optimize processes and consider additional resources to increase daily throughput.
                                    </p>
                                </div>
                            )}
                            {performanceData.productivity.resource_utilization.cpu_usage > 85 && (
                                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                                    <h4 className="font-medium text-orange-800">Monitor Resource Usage</h4>
                                    <p className="text-sm text-orange-700 mt-1">
                                        CPU usage is high. Consider optimizing processes or scaling resources.
                                    </p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
