import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { SimpleChart } from '@/components/charts/SimpleChart';

interface ComplianceData {
    compliance_rate: number;
    data_integrity_score: number;
    audit_trail_coverage: number;
    timeliness_score: number;
    quality_metrics: {
        complete_batches: number;
        properly_formatted: number;
        with_descriptions: number;
    };
    monthly_compliance: Array<{
        period: string;
        compliance_rate: number;
        data_integrity: number;
        audit_coverage: number;
    }>;
    scheme_compliance: Array<{
        scheme: string;
        compliance_rate: number;
        total_batches: number;
        approved_batches: number;
    }>;
    compliance_issues: Array<{
        type: string;
        count: number;
        severity: 'low' | 'medium' | 'high';
        description: string;
    }>;
}

interface Props {
    auth: { user: User | null };
    complianceData: ComplianceData;
    period: string;
    dateRange: { start: string; end: string };
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Reports', href: '/reports' },
    { label: 'Compliance Report', href: '/reports/compliance' }
];

export default function ComplianceReport({ auth, complianceData, period, dateRange }: Props) {
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

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'low': return 'bg-blue-100 text-blue-800';
            case 'medium': return 'bg-yellow-100 text-yellow-800';
            case 'high': return 'bg-red-100 text-red-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Compliance Report" />
            <div className="flex flex-col gap-6 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Compliance Report</h1>
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

                {/* Overall Compliance Score */}
                <Card>
                    <CardHeader>
                        <CardTitle>Overall Compliance Score</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-blue-600">
                                    {complianceData.compliance_rate.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Compliance Rate</p>
                                <Badge className={getStatusColor(complianceData.compliance_rate)}>
                                    {complianceData.compliance_rate >= 90 ? 'Excellent' : complianceData.compliance_rate >= 70 ? 'Good' : 'Needs Improvement'}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-green-600">
                                    {complianceData.data_integrity_score.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Data Integrity</p>
                                <Badge className={getStatusColor(complianceData.data_integrity_score, 'score')}>
                                    {complianceData.data_integrity_score >= 90 ? 'Excellent' : complianceData.data_integrity_score >= 70 ? 'Good' : 'Needs Attention'}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-purple-600">
                                    {complianceData.audit_trail_coverage.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Audit Coverage</p>
                                <Badge className={getStatusColor(complianceData.audit_trail_coverage, 'score')}>
                                    {complianceData.audit_trail_coverage >= 90 ? 'Excellent' : complianceData.audit_trail_coverage >= 70 ? 'Good' : 'Needs Attention'}
                                </Badge>
                            </div>
                            <div className="text-center">
                                <div className="text-4xl font-bold text-orange-600">
                                    {complianceData.timeliness_score.toFixed(1)}%
                                </div>
                                <p className="text-sm text-gray-600 mt-1">Timeliness</p>
                                <Badge className={getStatusColor(complianceData.timeliness_score, 'score')}>
                                    {complianceData.timeliness_score >= 90 ? 'Excellent' : complianceData.timeliness_score >= 70 ? 'Good' : 'Needs Attention'}
                                </Badge>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Quality Metrics */}
                <Card>
                    <CardHeader>
                        <CardTitle>Quality Metrics</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                            <div className="text-center">
                                <div className="text-3xl font-bold">{complianceData.quality_metrics.complete_batches}</div>
                                <p className="text-sm text-gray-600 mt-1">Complete Batches</p>
                                <p className="text-xs text-gray-500">Batches with all required data</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{complianceData.quality_metrics.properly_formatted}</div>
                                <p className="text-sm text-gray-600 mt-1">Properly Formatted</p>
                                <p className="text-xs text-gray-500">Batches with correct date formatting</p>
                            </div>
                            <div className="text-center">
                                <div className="text-3xl font-bold">{complianceData.quality_metrics.with_descriptions}</div>
                                <p className="text-sm text-gray-600 mt-1">With Descriptions</p>
                                <p className="text-xs text-gray-500">Batches with detailed descriptions</p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Trends */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Monthly Compliance Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimpleChart
                                data={complianceData.monthly_compliance.map(item => ({
                                    period: item.period,
                                    value: item.compliance_rate,
                                    label: 'Compliance Rate'
                                }))}
                                title="Compliance Rate Over Time"
                                color="#3b82f6"
                                height={200}
                            />
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Data Integrity Trends</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <SimpleChart
                                data={complianceData.monthly_compliance.map(item => ({
                                    period: item.period,
                                    value: item.data_integrity,
                                    label: 'Data Integrity'
                                }))}
                                title="Data Integrity Score Over Time"
                                color="#10b981"
                                height={200}
                            />
                        </CardContent>
                    </Card>
                </div>

                {/* Scheme Compliance */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance by Scheme</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {complianceData.scheme_compliance.map((scheme, index) => (
                                <div key={index} className="flex items-center justify-between p-4 border rounded-lg">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3">
                                            <h3 className="font-semibold">{scheme.scheme}</h3>
                                            <Badge className={getStatusColor(scheme.compliance_rate)}>
                                                {scheme.compliance_rate.toFixed(1)}%
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">
                                            {scheme.approved_batches} of {scheme.total_batches} batches approved
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-2xl font-bold">{scheme.approved_batches}</div>
                                        <p className="text-sm text-gray-500">Approved</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>

                {/* Compliance Issues */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance Issues</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-3">
                            {complianceData.compliance_issues.map((issue, index) => (
                                <div key={index} className="flex items-center justify-between p-3 border-l-4 border-red-500 bg-red-50 rounded">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-2">
                                            <h4 className="font-medium">{issue.type}</h4>
                                            <Badge className={getSeverityColor(issue.severity)}>
                                                {issue.severity}
                                            </Badge>
                                        </div>
                                        <p className="text-sm text-gray-600 mt-1">{issue.description}</p>
                                    </div>
                                    <div className="text-right">
                                        <div className="text-lg font-bold text-red-600">{issue.count}</div>
                                        <p className="text-sm text-gray-500">Issues</p>
                                    </div>
                                </div>
                            ))}
                            {complianceData.compliance_issues.length === 0 && (
                                <div className="text-center py-8">
                                    <p className="text-green-600 font-medium">No compliance issues found!</p>
                                    <p className="text-sm text-gray-500 mt-1">All batches meet compliance standards</p>
                                </div>
                            )}
                        </div>
                    </CardContent>
                </Card>

                {/* Recommendations */}
                <Card>
                    <CardHeader>
                        <CardTitle>Compliance Recommendations</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {complianceData.compliance_rate < 90 && (
                                <div className="p-4 bg-yellow-50 border-l-4 border-yellow-500 rounded">
                                    <h4 className="font-medium text-yellow-800">Improve Compliance Rate</h4>
                                    <p className="text-sm text-yellow-700 mt-1">
                                        Focus on reducing rejected batches by improving data quality and verification processes.
                                    </p>
                                </div>
                            )}
                            {complianceData.data_integrity_score < 90 && (
                                <div className="p-4 bg-blue-50 border-l-4 border-blue-500 rounded">
                                    <h4 className="font-medium text-blue-800">Enhance Data Integrity</h4>
                                    <p className="text-sm text-blue-700 mt-1">
                                        Ensure all batches have complete and properly formatted data before submission.
                                    </p>
                                </div>
                            )}
                            {complianceData.timeliness_score < 90 && (
                                <div className="p-4 bg-orange-50 border-l-4 border-orange-500 rounded">
                                    <h4 className="font-medium text-orange-800">Improve Processing Time</h4>
                                    <p className="text-sm text-orange-700 mt-1">
                                        Reduce verification and approval times to meet SLA requirements.
                                    </p>
                                </div>
                            )}
                            {complianceData.audit_trail_coverage < 90 && (
                                <div className="p-4 bg-purple-50 border-l-4 border-purple-500 rounded">
                                    <h4 className="font-medium text-purple-800">Complete Audit Trail</h4>
                                    <p className="text-sm text-purple-700 mt-1">
                                        Ensure all actions are properly logged for complete audit trail coverage.
                                    </p>
                                </div>
                            )}
                            {complianceData.compliance_rate >= 90 && 
                             complianceData.data_integrity_score >= 90 && 
                             complianceData.timeliness_score >= 90 && 
                             complianceData.audit_trail_coverage >= 90 && (
                                <div className="p-4 bg-green-50 border-l-4 border-green-500 rounded">
                                    <h4 className="font-medium text-green-800">Excellent Compliance</h4>
                                    <p className="text-sm text-green-700 mt-1">
                                        All compliance metrics are meeting or exceeding targets. Keep up the great work!
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
