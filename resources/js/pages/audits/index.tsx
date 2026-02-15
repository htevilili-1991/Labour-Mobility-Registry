import React, { useEffect, useState } from 'react';
import { Head, router, usePage } from '@inertiajs/react';
import { useReactTable, getCoreRowModel, flexRender, type ColumnDef } from '@tanstack/react-table';
import { type BreadcrumbItem, type SharedData } from '@/types';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription } from '@/components/ui/alert';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { PageHeader } from '@/components/page-header';
import { EmptyState } from '@/components/empty-state';
import { ClipboardList } from 'lucide-react';
import AppLayout from '@/layouts/app-layout';

interface Audit {
    id: number;
    user_id: number | null;
    user: User | null;
    event: string;
    auditable_type: string;
    auditable_id: number;
    old_values: RegistryAuditValues | null;
    new_values: RegistryAuditValues | null;
    created_at: string;
}

interface Props {
    audits: PaginatedResponse<Audit>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Audit Logs', href: '/audits' },
];

export default function Audits({ audits }: Props) {
    const { auth } = usePage<SharedData>().props;
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(!!flashMessage);
    const [alertMessage, setAlertMessage] = useState<string | null>(flashMessage || null);
    const [auditsData, setAuditsData] = useState(audits);
    const [showClearDialog, setShowClearDialog] = useState(false);

    useEffect(() => {
        if (flashMessage) {
            setShowAlert(true);
            setAlertMessage(flashMessage);
            const timer = setTimeout(() => setShowAlert(false), 4000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage]);

    const handleClearLogs = () => {
        setShowClearDialog(false);
        router.delete(route('audits.clear'), {
            preserveScroll: true,
            onSuccess: () => {
                setAlertMessage('Audit logs cleared successfully.');
                setShowAlert(true);
            },
        });
    };

    const columns: ColumnDef<Audit>[] = React.useMemo(
        () => [
            {
                header: 'User',
                accessorFn: (row) => row.user?.name ?? 'N/A',
                enableSorting: false,
            },
            { header: 'Event', accessorKey: 'event', enableSorting: true },
            { header: 'Registry ID', accessorKey: 'auditable_id', enableSorting: true },
            {
                header: 'Changes',
                accessorFn: (row) =>
                    JSON.stringify(row.event !== 'deleted' ? row.new_values : row.old_values, null, 2).replace(
                        /</g,
                        '&lt;'
                    ),
                cell: ({ getValue }) => <pre className="text-sm">{getValue() as string}</pre>,
                enableSorting: false,
            },
            {
                header: 'Date',
                accessorFn: (row) => new Date(row.created_at).toLocaleString(),
                enableSorting: true,
                accessorKey: 'created_at',
            },
        ],
        []
    );

    const table = useReactTable<Audit>({
        data: auditsData.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getCoreRowModel(),
        manualSorting: true,
        manualPagination: true,
        pageCount: auditsData.meta.last_page,
        initialState: {
            pagination: {
                pageIndex: auditsData.meta.current_page - 1,
                pageSize: auditsData.meta.per_page,
            },
        },
        state: {
            sorting: [],
        },
    });

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Audit Logs" />
            <div className="relative flex h-full flex-1 flex-col gap-6 rounded-xl p-6">
                <PageHeader
                    title="Audit Logs"
                    description="Track changes to registry entries. All create, update, and delete actions are recorded here."
                    actions={
                        auditsData.data.length > 0 && (
                            <Button variant="destructive" size="sm" onClick={() => setShowClearDialog(true)}>
                                Clear Logs
                            </Button>
                        )
                    }
                />
                {showAlert && alertMessage && (
                    <Alert
                        variant={flash?.success ? 'default' : 'destructive'}
                        className={`fixed top-4 right-4 z-40 max-w-md animate-in fade-in slide-in-from-top-2 duration-300 ${
                            flash?.success ? 'bg-green-600' : 'bg-red-600'
                        } text-white shadow-lg rounded-lg`}
                    >
                        <AlertDescription className="text-white pr-8">
                            {flash?.success ? 'Success! ' : 'Error! '}
                            {alertMessage}
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
                {auditsData.data.length === 0 ? (
                    <EmptyState
                        icon={ClipboardList}
                        title="No audit logs yet"
                        description="When you create, update, or delete registry entries, those actions will be recorded here."
                    />
                ) : (
                    <div className="z-0 overflow-x-auto rounded-xl border border-gray-200">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500 cursor-pointer"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(header.column.columnDef.header, header.getContext())}
                                            <span>
                                                {{
                                                    asc: ' 🔼',
                                                    desc: ' 🔽',
                                                }[header.column.getIsSorted() as string] ?? ''}
                                            </span>
                                        </th>
                                    ))}
                                </tr>
                            ))}
                            </thead>
                            <tbody className="divide-y divide-gray-200 bg-white">
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="whitespace-nowrap px-6 py-4 text-sm text-gray-900"
                                        >
                                            {flexRender(cell.column.columnDef.cell, cell.getContext())}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between border-t border-gray-200 px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">
                                    Page {table.getState().pagination.pageIndex + 1} of {table.getPageCount()}
                                </span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => table.setPageSize(Number(e.target.value))}
                                    className="rounded-md border border-gray-300 bg-white p-1 text-sm shadow-sm focus:border-blue-500 focus:ring-blue-500"
                                >
                                    {[10, 25, 50].map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage()}
                                >
                                    Previous
                                </Button>
                                <Button
                                    variant="outline"
                                    size="sm"
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage()}
                                >
                                    Next
                                </Button>
                            </div>
                        </div>
                    </div>
                )}

            <Dialog open={showClearDialog} onOpenChange={setShowClearDialog}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Clear all audit logs?</DialogTitle>
                        <DialogDescription>
                            This will permanently delete all audit log entries. This action cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button variant="outline" onClick={() => setShowClearDialog(false)}>
                            Cancel
                        </Button>
                        <Button variant="destructive" onClick={handleClearLogs}>
                            Clear Logs
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            </div>
        </AppLayout>
    );
}
