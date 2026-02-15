import { Head, router, usePage } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import HeadingSmall from '@/components/heading-small';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { useEffect, useState } from 'react';

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Cron Jobs', href: '/settings/cron-jobs' },
];

type FrequencyType = 'hourly' | 'daily' | 'daily_at' | 'weekly' | 'cron';

interface ScheduleJob {
    id: number;
    command: string;
    name: string;
    description: string | null;
    enabled: boolean;
    frequency_type: FrequencyType;
    frequency_value: string | null;
    parameters: Record<string, unknown> | null;
    last_run_at: string | null;
    created_at: string;
    updated_at: string;
}

interface CronJobsPageProps {
    jobs: ScheduleJob[];
    frequencyTypes: Record<FrequencyType, string>;
}

export default function CronJobs() {
    const { auth, jobs, frequencyTypes } = usePage<
        SharedData & CronJobsPageProps
    >().props;
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>()
        .props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(!!flashMessage);

    const handleSave = (job: ScheduleJob, data: Partial<ScheduleJob>) => {
        router.put(`/settings/cron-jobs/${job.id}`, data, { preserveScroll: true });
    };

    useEffect(() => {
        if (flashMessage) {
            setShowAlert(true);
            const timer = setTimeout(() => setShowAlert(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Cron Jobs" />
            <SettingsLayout>
                <div
                    className="space-y-6"
                    style={{
                        maxWidth: '1152px',
                        margin: '0 auto',
                        padding: '0 16px',
                        overflowX: 'hidden',
                    }}
                >
                    {showAlert && flashMessage && (
                        <Alert
                            variant={flash?.success ? 'default' : 'destructive'}
                            className={`fixed top-4 right-4 z-40 max-w-md animate-in fade-in slide-in-from-top-2 duration-300 ${
                                flash?.success ? 'bg-green-600' : 'bg-red-600'
                            } text-white shadow-lg rounded-lg`}
                        >
                            <AlertDescription className="text-white pr-8">
                                {flash?.success ? 'Success! ' : 'Error! '}
                                {flashMessage}
                            </AlertDescription>
                            <button
                                onClick={() => setShowAlert(false)}
                                className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
                                aria-label="Close alert"
                            >
                                ✕
                            </button>
                        </Alert>
                    )}

                    <HeadingSmall
                        title="Cron Jobs"
                        description="Configure scheduled tasks that run in the background"
                    />

                    <p className="text-sm text-gray-600">
                        Ensure your server runs <code className="bg-gray-100 px-1 py-0.5 rounded">php artisan schedule:run</code> every minute.
                    </p>

                    <div className="space-y-6">
                        {jobs.map((job) => (
                            <CronJobCard
                                key={job.id}
                                job={job}
                                frequencyTypes={frequencyTypes}
                                onSave={handleSave}
                            />
                        ))}
                    </div>

                    {(!jobs || jobs.length === 0) && (
                        <Card>
                            <CardContent className="py-8">
                                <p className="text-gray-500 text-center">
                                    No cron jobs configured. Run the ScheduleConfig seeder to populate jobs.
                                </p>
                            </CardContent>
                        </Card>
                    )}
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}

interface CronJobCardProps {
    job: ScheduleJob;
    frequencyTypes: Record<FrequencyType, string>;
    onSave: (job: ScheduleJob, data: Partial<ScheduleJob>) => void;
}

function CronJobCard({
    job,
    frequencyTypes,
    onSave,
}: CronJobCardProps) {
    const [enabled, setEnabled] = useState(job.enabled);
    const [frequencyType, setFrequencyType] = useState<FrequencyType>(
        job.frequency_type
    );
    const [frequencyValue, setFrequencyValue] = useState(
        job.frequency_value ?? ''
    );
    const [saving, setSaving] = useState(false);

    const needsFrequencyValue =
        frequencyType === 'daily_at' || frequencyType === 'cron';
    const frequencyLabel =
        frequencyType === 'daily_at'
            ? 'Time (HH:MM)'
            : frequencyType === 'cron'
              ? 'Cron expression'
              : null;

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        onSave(job, {
            enabled,
            frequency_type: frequencyType,
            frequency_value: needsFrequencyValue ? frequencyValue : null,
        });
        setSaving(false);
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center gap-3">
                    <code className="text-sm font-mono text-gray-600">
                        {job.command}
                    </code>
                    {!job.enabled && (
                        <span className="text-xs font-normal text-gray-500">
                            (disabled)
                        </span>
                    )}
                </CardTitle>
                {job.description && (
                    <p className="text-sm text-gray-600">{job.description}</p>
                )}
                {job.last_run_at && (
                    <p className="text-xs text-gray-500">
                        Last run: {new Date(job.last_run_at).toLocaleString()}
                    </p>
                )}
            </CardHeader>
            <CardContent>
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="flex items-center space-x-2">
                        <Checkbox
                            id={`enabled-${job.id}`}
                            checked={enabled}
                            onCheckedChange={(checked) =>
                                setEnabled(checked === true)
                            }
                        />
                        <Label
                            htmlFor={`enabled-${job.id}`}
                            className="text-sm font-medium"
                        >
                            Enabled
                        </Label>
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                        <div>
                            <Label htmlFor={`frequency-type-${job.id}`}>
                                Frequency
                            </Label>
                            <Select
                                value={frequencyType}
                                onValueChange={(v) =>
                                    setFrequencyType(v as FrequencyType)
                                }
                            >
                                <SelectTrigger
                                    id={`frequency-type-${job.id}`}
                                    className="mt-1"
                                >
                                    <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                    {Object.entries(frequencyTypes).map(
                                        ([key, label]) => (
                                            <SelectItem
                                                key={key}
                                                value={key}
                                            >
                                                {label}
                                            </SelectItem>
                                        )
                                    )}
                                </SelectContent>
                            </Select>
                        </div>

                        {needsFrequencyValue && (
                            <div>
                                <Label htmlFor={`frequency-value-${job.id}`}>
                                    {frequencyLabel}
                                </Label>
                                <Input
                                    id={`frequency-value-${job.id}`}
                                    value={frequencyValue}
                                    onChange={(e) =>
                                        setFrequencyValue(e.target.value)
                                    }
                                    placeholder={
                                        frequencyType === 'daily_at'
                                            ? '08:00'
                                            : '0 8 * * *'
                                    }
                                    className="mt-1"
                                />
                            </div>
                        )}
                    </div>

                    <Button type="submit" disabled={saving}>
                        {saving ? 'Saving…' : 'Save'}
                    </Button>
                </form>
            </CardContent>
        </Card>
    );
}
