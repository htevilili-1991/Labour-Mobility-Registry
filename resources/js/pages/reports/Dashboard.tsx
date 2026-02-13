import { Head, Link, router } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { PageHeader } from '@/components/page-header';

interface OverviewStats {
    total_batches: number;
    draft_batches: number;
    submitted_batches: number;
    under_review_batches: number;
    approved_batches: number;
    rejected_batches: number;
    total_records: number;
    batched_records: number;
}

interface VerificationMetrics {
    avg_verification_time: number;
    avg_approval_time: number;
    approval_rate: number;
    rejection_rate: number;
    pending_verification: number;
    avg_batch_size: number;
}

interface ComplianceMetrics {
    compliance_rate: number;
    data_integrity_score: number;
    audit_trail_coverage: number;
    timeliness_score: number;
    quality_metrics: {
        complete_batches: number;
        properly_formatted: number;
        with_descriptions: number;
    };
}

interface PerformanceMetrics {
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
    productivity: any;
    bottlenecks: any;
}

interface TrendData {
    period: string;
    total: number;
    submitted: number;
    under_review: number;
    approved: number;
    rejected: number;
    avg_records: number;
}

interface RecentActivity {
    id: number;
    action: string;
    description: string;
    user: string;
    batch: string | null;
    action_at: string;
}

interface TopPerformers {
    top_submitters: any[];
    top_verifiers: any[];
    top_approvers: any[];
}

interface Props {
    auth: { user: User | null };
    overview: OverviewStats;
    verificationMetrics: VerificationMetrics;
    complianceMetrics: ComplianceMetrics;
    performanceMetrics: PerformanceMetrics;
    trends: TrendData[];
    recentActivity: RecentActivity[];
    topPerformers: TopPerformers;
    filters: {
        period: string;
        scheme: string | null;
        batch_type: string | null;
    };
    schemes: string[];
    batchTypes: string[];
    periods: Record<string, string>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' }
];

export default function ReportsDashboard({ 
    auth, 
    overview, 
    verificationMetrics, 
    complianceMetrics, 
    performanceMetrics, 
    trends, 
    recentActivity, 
    topPerformers,
    filters,
    schemes,
    batchTypes,
    periods 
}: Props) {
    const handleFilterChange = (key: string, value: string | null) => {
        router.get('/reports', { ...filters, [key]: value }, { preserveState: true });
    };

    const getStatusColor = (value: number, type: 'rate' | 'score' = 'rate') => {
        if (type === 'rate') {
            if (value >= 90) return 'bg-green-100 text-green-800';
            if (value >= 70) return 'bg-yellow-100 text-yellow-800';
            return 'bg-red-100 text-red-800';
        } else {
            if (value >= 90) return 'bg-green-100 text-green-800';
            if (value >= 70) return 'bg-blue-100 text-blue-800';
            if (value >= 50) return 'bg-yellow-100 text-yellow-800';
            return 'bg-red-100 text-red-800';
        }
    };

    const formatTime = (hours: number) => {
        if (hours < 1) return `${Math.round(hours * 60)}m`;
        if (hours < 24) return `${hours.toFixed(1)}h`;
        return `${Math.round(hours / 24)}d`;
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Reports Dashboard" />
            <div className="flex flex-1 flex-col gap-6 p-6">
                <PageHeader
                    title="Reports Dashboard"
                    description="Analytics for verification status, compliance, and performance metrics."
                    actions={
                        <div className="flex gap-2">
                            <Link href="/reports/verification">
                                <Button variant="outline" size="sm">Verification</Button>
                            </Link>
                            <Link href="/reports/compliance">
                                <Button variant="outline" size="sm">Compliance</Button>
                            </Link>
                            <Link href="/reports/performance">
                                <Button variant="outline" size="sm">Performance</Button>
                            </Link>
                        </div>
                    }
                />

                {/* Filters */}
                <Card>
                    <CardHeader className="pb-3">
                        <CardTitle className="text-base">Filters</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                            <div>
                                <label className="block text-sm font-medium mb-2">Period</label>
                                <Select value={filters.period} onValueChange={(value) => handleFilterChange('period', value)}>
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select period" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {Object.entries(periods).map(([key, label]) => (
                                            <SelectItem key={key} value={key}>{label}</SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                            </div>
                            <div>
                                <label className="block text-sm font-medium mb-2">Scheme</label>
                                <Select value={filters.scheme || 'all'} onValueChange={(value) => handleFilterChange('scheme', value === 'all' ? null : value)}>
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
                                <Select value={filters.batch_type || 'all'} onValueChange={(value) => handleFilterChange('batch_type', value === 'all' ? null : value)}>
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
                                <Button onClick={() => router.get('/reports/export')} variant="outline">
                                    Export Report
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Overview Statistics */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Total Batches</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{overview.total_batches}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {overview.approved_batches} approved
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Pending Verification</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold text-blue-600">{overview.submitted_batches}</div>
                            <p className="text-xs text-gray-500 mt-1">
                                {overview.under_review_batches} under review
                            </p>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Compliance Rate</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{complianceMetrics.compliance_rate.toFixed(1)}%</div>
                            <Badge className={getStatusColor(complianceMetrics.compliance_rate)}>
                                {complianceMetrics.compliance_rate >= 90 ? 'Excellent' : complianceMetrics.compliance_rate >= 70 ? 'Good' : 'Needs Attention'}
                            </Badge>
                        </CardContent>
                    </Card>
                    <Card>
                        <CardHeader className="pb-2">
                            <CardTitle className="text-sm font-medium text-gray-600">Data Integrity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="text-2xl font-bold">{complianceMetrics.data_integrity_score.toFixed(1)}%</div>
                            <Badge className={getStatusColor(complianceMetrics.data_integrity_score, 'score')}>
                                {complianceMetrics.data_integrity_score >= 90 ? 'Excellent' : complianceMetrics.data_integrity_score >= 70 ? 'Good' : 'Needs Attention'}
                            </Badge>
                        </CardContent>
                    </Card>
                </div>

                {/* Detailed Metrics */}
                <Tabs defaultValue="verification" className="space-y-4">
                    <TabsList className="grid w-full grid-cols-4">
                        <TabsTrigger value="verification">Verification</TabsTrigger>
                        <TabsTrigger value="compliance">Compliance</TabsTrigger>
                        <TabsTrigger value="performance">Performance</TabsTrigger>
                        <TabsTrigger value="trends">Trends</TabsTrigger>
                    </TabsList>

                    <TabsContent value="verification" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Verification Time</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatTime(verificationMetrics.avg_verification_time ?? 0)}</div>
                                    <p className="text-sm text-gray-500">From submission to verification</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Approval Time</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{formatTime(verificationMetrics.avg_approval_time ?? 0)}</div>
                                    <p className="text-sm text-gray-500">From verification to approval</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Approval Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{verificationMetrics.approval_rate?.toFixed(1) ?? '0'}%</div>
                                    <Badge className={getStatusColor(verificationMetrics.approval_rate ?? 0)}>
                                        {verificationMetrics.approval_rate >= 90 ? 'Excellent' : verificationMetrics.approval_rate >= 70 ? 'Good' : 'Needs Improvement'}
                                    </Badge>
                                </CardContent>
                            </Card>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Rejection Rate</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{verificationMetrics.rejection_rate?.toFixed(1) ?? '0'}%</div>
                                    <p className="text-sm text-gray-500">Of completed batches</p>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Average Batch Size</CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className="text-2xl font-bold">{verificationMetrics.avg_batch_size?.toFixed(0) ?? '0'}</div>
                                    <p className="text-sm text-gray-500">Records per batch</p>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="compliance" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Compliance Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Compliance Rate</span>
                                        <Badge className={getStatusColor(complianceMetrics.compliance_rate)}>
                                            {complianceMetrics.compliance_rate?.toFixed(1) ?? '0'}%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Data Integrity Score</span>
                                        <Badge className={getStatusColor(complianceMetrics.data_integrity_score, 'score')}>
                                            {complianceMetrics.data_integrity_score?.toFixed(1) ?? '0'}%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Audit Trail Coverage</span>
                                        <Badge className={getStatusColor(complianceMetrics.audit_trail_coverage, 'score')}>
                                            {complianceMetrics.audit_trail_coverage?.toFixed(1) ?? '0'}%
                                        </Badge>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Timeliness Score</span>
                                        <Badge className={getStatusColor(complianceMetrics.timeliness_score, 'score')}>
                                            {complianceMetrics.timeliness_score?.toFixed(1) ?? '0'}%
                                        </Badge>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Quality Metrics</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-4">
                                    <div className="flex justify-between items-center">
                                        <span>Complete Batches</span>
                                        <span className="font-semibold">{complianceMetrics.quality_metrics.complete_batches}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Properly Formatted</span>
                                        <span className="font-semibold">{complianceMetrics.quality_metrics.properly_formatted}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>With Descriptions</span>
                                        <span className="font-semibold">{complianceMetrics.quality_metrics.with_descriptions}</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="performance" className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <Card>
                                <CardHeader>
                                    <CardTitle>Throughput</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Batches per Day</span>
                                        <span className="font-semibold">{performanceMetrics.throughput.batches_per_day}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Records per Day</span>
                                        <span className="font-semibold">{performanceMetrics.throughput.records_per_day}</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Peak Day</span>
                                        <span className="font-semibold">{performanceMetrics.throughput.peak_day.date}</span>
                                    </div>
                                </CardContent>
                            </Card>
                            <Card>
                                <CardHeader>
                                    <CardTitle>Efficiency</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-2">
                                    <div className="flex justify-between items-center">
                                        <span>Automation Rate</span>
                                        <span className="font-semibold">{performanceMetrics.efficiency.automation_rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Error Rate</span>
                                        <span className="font-semibold">{performanceMetrics.efficiency.error_rate}%</span>
                                    </div>
                                    <div className="flex justify-between items-center">
                                        <span>Rework Rate</span>
                                        <span className="font-semibold">{performanceMetrics.efficiency.rework_rate}%</span>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </TabsContent>

                    <TabsContent value="trends" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle>Batch Status Trends</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <div className="space-y-2">
                                    {trends.map((trend, index) => (
                                        <div key={index} className="flex items-center justify-between p-2 border rounded">
                                            <span className="text-sm font-medium">{new Date(trend.period).toLocaleDateString()}</span>
                                            <div className="flex gap-2 text-sm">
                                                <Badge variant="outline">{trend.total} total</Badge>
                                                <Badge className="bg-blue-100 text-blue-800">{trend.submitted} submitted</Badge>
                                                <Badge className="bg-yellow-100 text-yellow-800">{trend.under_review} under review</Badge>
                                                <Badge className="bg-green-100 text-green-800">{trend.approved} approved</Badge>
                                                <Badge className="bg-red-100 text-red-800">{trend.rejected} rejected</Badge>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>
                </Tabs>

                {/* Recent Activity and Top Performers */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Recent Activity</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="space-y-3">
                                {recentActivity.map((activity) => (
                                    <div key={activity.id} className="flex items-start gap-3 p-2 border-l-4 border-blue-500">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-2">
                                                <Badge variant="outline">{activity.action}</Badge>
                                                <span className="text-sm font-medium">{activity.user}</span>
                                            </div>
                                            <p className="text-sm text-gray-600 mt-1">{activity.description}</p>
                                            {activity.batch && (
                                                <p className="text-xs text-gray-500 mt-1">Batch: {activity.batch}</p>
                                            )}
                                            <p className="text-xs text-gray-400 mt-1">
                                                {new Date(activity.action_at).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Top Performers</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <Tabs defaultValue="submitters" className="space-y-4">
                                <TabsList className="grid w-full grid-cols-3">
                                    <TabsTrigger value="submitters">Top Submitters</TabsTrigger>
                                    <TabsTrigger value="verifiers">Top Verifiers</TabsTrigger>
                                    <TabsTrigger value="approvers">Top Approvers</TabsTrigger>
                                </TabsList>
                                
                                <TabsContent value="submitters">
                                    <div className="space-y-2">
                                        {topPerformers.top_submitters.map((user, index) => (
                                            <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                                                <span className="text-sm font-medium">{index + 1}. {user.name}</span>
                                                <Badge variant="outline">{user.registry_batches_count} batches</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="verifiers">
                                    <div className="space-y-2">
                                        {topPerformers.top_verifiers.map((user, index) => (
                                            <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                                                <span className="text-sm font-medium">{index + 1}. {user.name}</span>
                                                <Badge variant="outline">{user.verified_batches_count} verified</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                                
                                <TabsContent value="approvers">
                                    <div className="space-y-2">
                                        {topPerformers.top_approvers.map((user, index) => (
                                            <div key={user.id} className="flex justify-between items-center p-2 border rounded">
                                                <span className="text-sm font-medium">{index + 1}. {user.name}</span>
                                                <Badge variant="outline">{user.approved_batches_count} approved</Badge>
                                            </div>
                                        ))}
                                    </div>
                                </TabsContent>
                            </Tabs>
                        </CardContent>
                    </Card>
                </div>
            </div>
        </AppLayout>
    );
}
