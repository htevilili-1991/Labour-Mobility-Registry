import { Head, Link, usePage, router } from '@inertiajs/react';
import { useReactTable, getCoreRowModel, getSortedRowModel, getPaginationRowModel, type ColumnDef } from '@tanstack/react-table';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import React, { useEffect, useState, useCallback, useRef } from 'react';
import { flexRender } from '@tanstack/react-table';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Card, CardContent } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { DownloadIcon, ChevronDownIcon, PlusIcon, Trash2Icon } from 'lucide-react';
import { DropdownMenu, DropdownMenuTrigger, DropdownMenuContent, DropdownMenuCheckboxItem } from '@/components/ui/dropdown-menu';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog';
import { debounce } from 'lodash';

interface Registry {
    id: number;
    surname: string;
    given_name: string;
    nationality: string;
    country_of_residence: string;
    national_id_number: number;
    document_type: string;
    document_no: string;
    dob: string;
    age: number;
    sex: string;
    travel_date: string;
    direction: string;
    accommodation_address: string;
    note: string | null;
    travel_reason: string;
    border_post: string;
    destination_coming_from: string;
}

interface PaginationLink {
    url: string | null;
    label: string;
    active: boolean;
}

interface DraftBatch {
    id: number;
    name: string;
    scheme: string;
    batch_type: string;
}

interface Props {
    auth: {
        user: User | null;
    };
    registry: {
        data: Registry[];
        links: PaginationLink[];
        meta: {
            current_page: number;
            last_page: number;
            per_page: number;
            total: number;
        };
    };
    distinctYears: string[];
    draftBatches?: DraftBatch[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Registry', href: '/registry' },
];

export default function Registry({ auth, registry, distinctYears, draftBatches = [] }: Props) {
    const { url } = usePage();
    const searchParams = new URLSearchParams(url.split('?')[1] || '');
    const initialSearch = searchParams.get('search') || '';
    const initialYears = searchParams.get('years') ? searchParams.get('years')!.split(',') : ['all'];
    const [globalFilter, setGlobalFilter] = useState(initialSearch);
    const [selectedYears, setSelectedYears] = useState<string[]>(initialYears);
    const { flash } = usePage<{ flash?: { success?: string; error?: string } }>().props;
    const flashMessage = flash?.success || flash?.error;
    const [showAlert, setShowAlert] = useState(!!flashMessage);
    const [exportError, setExportError] = useState<string | null>(null);
    const [navigationError, setNavigationError] = useState<string | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [selectedIds, setSelectedIds] = useState<Set<number>>(new Set());
    const [showBulkActions, setShowBulkActions] = useState(false);
    const [selectedBatchId, setSelectedBatchId] = useState<string>('');
    const [showBulkDeleteDialog, setShowBulkDeleteDialog] = useState(false);
    const [singleDeleteId, setSingleDeleteId] = useState<number | null>(null);
    const lastNavigatedPage = useRef(registry.meta.current_page);

    useEffect(() => {
        if (flashMessage || exportError || navigationError) {
            setShowAlert(true);
            const timer = setTimeout(() => {
                setShowAlert(false);
                setExportError(null);
                setNavigationError(null);
            }, 4000);
            return () => clearTimeout(timer);
        }
    }, [flashMessage, exportError, navigationError]);

    const getCsrfToken = () => {
        const token = document.querySelector('meta[name="csrf-token"]')?.getAttribute('content');
        if (!token) {
            console.error('CSRF token missing');
            setNavigationError('CSRF token is missing. Please refresh the page.');
        }
        return token || '';
    };

    // Toggle selection
    const toggleSelection = useCallback((id: number) => {
        setSelectedIds(prev => {
            const next = new Set(prev);
            if (next.has(id)) {
                next.delete(id);
            } else {
                next.add(id);
            }
            return next;
        });
    }, []);

    // Select all on current page
    const toggleSelectAll = useCallback(() => {
        if (selectedIds.size === registry.data.length && registry.data.every(r => selectedIds.has(r.id))) {
            setSelectedIds(new Set());
        } else {
            setSelectedIds(new Set(registry.data.map(r => r.id)));
        }
    }, [selectedIds, registry.data]);

    // Bulk add to batch
    const handleBulkAddToBatch = useCallback(async () => {
        if (!selectedBatchId || selectedIds.size === 0) return;
        
        const csrfToken = getCsrfToken();
        if (!csrfToken) return;

        try {
            setIsLoading(true);
            const response = await fetch(`/batches/${selectedBatchId}/add-entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                    'Accept': 'application/json',
                },
                body: JSON.stringify({
                    registry_ids: Array.from(selectedIds),
                }),
            });

            if (response.ok) {
                setSelectedIds(new Set());
                setSelectedBatchId('');
                setShowBulkActions(false);
                router.reload();
            } else {
                const error = await response.json();
                setNavigationError(error.message || 'Failed to add entries to batch');
            }
        } catch (error) {
            console.error('Bulk add error:', error);
            setNavigationError('Failed to add entries to batch');
        } finally {
            setIsLoading(false);
        }
    }, [selectedBatchId, selectedIds, router]);

    const executeBulkDelete = useCallback(() => {
        if (selectedIds.size === 0) return;
        const csrfToken = getCsrfToken();
        if (!csrfToken) return;

        setShowBulkDeleteDialog(false);
        router.post(route('registry.bulk-destroy'), { registry_ids: Array.from(selectedIds) }, {
            preserveScroll: true,
            headers: { 'X-CSRF-TOKEN': csrfToken },
            onSuccess: () => {
                setSelectedIds(new Set());
                setShowBulkActions(false);
            },
            onError: (errors) => {
                setNavigationError(Object.values(errors).flat().join(' ') || 'Failed to delete records');
            },
        });
    }, [selectedIds, router]);

    const executeSingleDelete = useCallback(() => {
        if (singleDeleteId === null) return;
        const id = singleDeleteId;
        setSingleDeleteId(null);
        router.delete(route('registry.destroy', id), { preserveScroll: true });
    }, [singleDeleteId, router]);

    useEffect(() => {
        setShowBulkActions(selectedIds.size > 0);
    }, [selectedIds.size]);

    const columns: ColumnDef<Registry>[] = React.useMemo(
        () => [
            {
                header: () => (
                    <Checkbox
                        checked={registry.data.length > 0 && registry.data.every(r => selectedIds.has(r.id))}
                        onCheckedChange={toggleSelectAll}
                        className="size-5 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:!text-white"
                    />
                ),
                id: 'select',
                cell: ({ row }) => (
                    <Checkbox
                        checked={selectedIds.has(row.original.id)}
                        onCheckedChange={() => toggleSelection(row.original.id)}
                        className="size-5 border-2 border-gray-400 data-[state=checked]:bg-blue-600 data-[state=checked]:border-blue-600 data-[state=checked]:!text-white"
                    />
                ),
                enableSorting: false,
            },
            { header: 'Surname', accessorKey: 'surname', enableSorting: true },
            { header: 'Given Name', accessorKey: 'given_name', enableSorting: true },
            { header: 'Nationality', accessorKey: 'nationality', enableSorting: true },
            { header: 'Country of Residence', accessorKey: 'country_of_residence', enableSorting: true },
            { header: 'National ID Number', accessorKey: 'national_id_number', enableSorting: true },
            { header: 'Document Type', accessorKey: 'document_type', enableSorting: true },
            { header: 'Document Number', accessorKey: 'document_no', enableSorting: true },
            {
                header: 'DoB',
                accessorKey: 'dob',
                enableSorting: true,
                cell: ({ getValue }) => (getValue() as string) || 'N/A',
            },
            { header: 'Sex', accessorKey: 'sex', enableSorting: true },
            { header: 'Age', accessorKey: 'age', enableSorting: true },
            {
                header: 'Travel Date',
                accessorKey: 'travel_date',
                enableSorting: true,
                cell: ({ getValue }) => (getValue() as string) || 'N/A',
            },
            { header: 'Direction', accessorKey: 'direction', enableSorting: true },
            { header: 'Accommodation Address', accessorKey: 'accommodation_address', enableSorting: true },
            { header: 'Note', accessorKey: 'note', enableSorting: true },
            { header: 'Travel Reason', accessorKey: 'travel_reason', enableSorting: true },
            { header: 'Border Post', accessorKey: 'border_post', enableSorting: true },
            { header: 'Destination/Coming From', accessorKey: 'destination_coming_from', enableSorting: true },
            {
                header: 'Actions',
                id: 'actions',
                cell: ({ row }) => (
                    <div className="flex space-x-2">
                        <Link
                            href={`/registry/${row.original.id}`}
                            className="px-3 py-1 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2"
                        >
                            View
                        </Link>
                        <Link
                            href={`/registry/${row.original.id}/edit`}
                            className="px-3 py-1 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                        >
                            Edit
                        </Link>
                        <button
                            type="button"
                            onClick={() => setSingleDeleteId(row.original.id)}
                            className="px-3 py-1 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                        >
                            Delete
                        </button>
                    </div>
                ),
                enableSorting: false,
            },
        ],
        []
    );

    const table = useReactTable<Registry>({
        data: registry.data || [],
        columns,
        getCoreRowModel: getCoreRowModel(),
        getSortedRowModel: getSortedRowModel(),
        getPaginationRowModel: getPaginationRowModel(),
        manualPagination: true,
        manualSorting: true,
        pageCount: registry.meta.last_page || 1,
        state: {
            pagination: {
                pageIndex: registry.meta.current_page - 1,
                pageSize: registry.meta.per_page,
            },
            globalFilter,
        },
        initialState: {
            columnVisibility: {
                nationality: false,
                country_of_residence: false,
                national_id_number: false,
                document_type: false,
                document_no: false,
                dob: false,
                age: false,
                direction: false,
                accommodation_address: false,
                note: false,
                border_post: false,
            },
        },
        onGlobalFilterChange: setGlobalFilter,
        onSortingChange: debounce((updater) => {
            const newSorting = typeof updater === 'function' ? updater(table.getState().sorting) : updater;
            const sortParams = newSorting.length > 0 ? `${newSorting[0].id}:${newSorting[0].desc ? 'desc' : 'asc'}` : '';
            const csrfToken = getCsrfToken();
            if (!csrfToken) return;
            const queryParams = new URLSearchParams({
                page: '1',
                per_page: table.getState().pagination.pageSize.toString(),
                sort: sortParams,
                search: globalFilter,
            });
            if (selectedYears.length && !selectedYears.includes('all')) {
                selectedYears.forEach((year) => queryParams.append('years[]', year));
            }
            console.log('Sorting navigation:', `/registry?${queryParams.toString()}`);
            setIsLoading(true);
            router.visit(`/registry?${queryParams.toString()}`, {
                preserveState: true,
                preserveScroll: true,
                headers: { 'X-CSRF-TOKEN': csrfToken },
                onSuccess: () => {
                    lastNavigatedPage.current = 1;
                    table.setPageIndex(0);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Navigation error (sorting):', errors);
                    setNavigationError('Failed to sort: ' + (Object.values(errors)[0] || 'Unknown error.'));
                    setIsLoading(false);
                },
            });
        }, 300),
        onPaginationChange: debounce((updater) => {
            const newPagination = typeof updater === 'function' ? updater(table.getState().pagination) : updater;
            const newPageIndex = newPagination.pageIndex;
            const newPageSize = newPagination.pageSize;
            const resetPage = newPageSize !== table.getState().pagination.pageSize;
            const targetPage = resetPage ? 1 : newPageIndex + 1;

            if (targetPage === lastNavigatedPage.current) {
                console.log('Skipping navigation: already on page', targetPage);
                return;
            }

            const csrfToken = getCsrfToken();
            if (!csrfToken) return;

            const sortParams = table.getState().sorting[0]
                ? `${table.getState().sorting[0].id}:${table.getState().sorting[0].desc ? 'desc' : 'asc'}`
                : '';
            const queryParams = new URLSearchParams({
                page: targetPage.toString(),
                per_page: newPageSize.toString(),
                sort: sortParams,
                search: globalFilter,
            });
            if (selectedYears.length && !selectedYears.includes('all')) {
                selectedYears.forEach((year) => queryParams.append('years[]', year));
            }
            console.log('Navigating to:', `/registry?${queryParams.toString()}`, 'New page:', targetPage, 'New pageSize:', newPageSize);
            setIsLoading(true);
            router.visit(`/registry?${queryParams.toString()}`, {
                preserveState: true,
                preserveScroll: true,
                headers: { 'X-CSRF-TOKEN': csrfToken },
                onSuccess: () => {
                    console.log('Navigation succeeded to page:', targetPage);
                    lastNavigatedPage.current = targetPage;
                    table.setPageIndex(newPageIndex);
                    table.setPageCount(registry.meta.last_page || 1);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Navigation error (pagination):', errors);
                    setNavigationError('Failed to change page: ' + (Object.values(errors)[0] || 'Unknown error.'));
                    table.setPageIndex(lastNavigatedPage.current - 1);
                    setIsLoading(false);
                },
            });
        }, 300),
    });

    const handleSearchSubmit = useCallback(
        debounce((searchQuery: string, years: string[]) => {
            const csrfToken = getCsrfToken();
            if (!csrfToken) return;
            const sortParams = table.getState().sorting[0]
                ? `${table.getState().sorting[0].id}:${table.getState().sorting[0].desc ? 'desc' : 'asc'}`
                : '';
            const queryParams = new URLSearchParams({
                page: '1',
                per_page: table.getState().pagination.pageSize.toString(),
                sort: sortParams,
                search: searchQuery,
            });
            if (years.length && !years.includes('all')) {
                years.forEach((year) => queryParams.append('years[]', year));
            }
            console.log('Search navigation:', `/registry?${queryParams.toString()}`, 'Search query:', searchQuery, 'Years:', years);
            setIsLoading(true);
            router.visit(`/registry?${queryParams.toString()}`, {
                preserveState: true,
                preserveScroll: true,
                headers: { 'X-CSRF-TOKEN': csrfToken },
                onSuccess: () => {
                    lastNavigatedPage.current = 1;
                    table.setPageIndex(0);
                    setIsLoading(false);
                },
                onError: (errors) => {
                    console.error('Navigation error (search):', errors);
                    setNavigationError('Failed to search: ' + (Object.values(errors)[0] || 'Unknown error.'));
                    setIsLoading(false);
                },
            });
        }, 300),
        [table]
    );

    useEffect(() => {
        handleSearchSubmit(globalFilter, selectedYears);
    }, [globalFilter, selectedYears, handleSearchSubmit]);

    // Sync table state with server props
    useEffect(() => {
        console.log('Server meta:', registry.meta);
        table.setPageIndex(registry.meta.current_page - 1);
        table.setPageCount(registry.meta.last_page || 1);
        lastNavigatedPage.current = registry.meta.current_page;
    }, [registry.meta, table]);

    const exportToCSV = async () => {
        try {
            const csrfToken = getCsrfToken();
            if (!csrfToken) return;
            const queryParams = new URLSearchParams();
            if (globalFilter) queryParams.set('search', globalFilter);
            if (selectedYears.length && !selectedYears.includes('all')) {
                selectedYears.forEach((year) => queryParams.append('years[]', year));
            }
            setIsLoading(true);
            const url = `/registry/export?${queryParams.toString()}`;
            const response = await fetch(url, {
                method: 'GET',
                headers: {
                    'Accept': 'application/json',
                    'X-CSRF-TOKEN': csrfToken,
                },
            });

            if (!response.ok) {
                throw new Error('Failed to fetch export data');
            }

            const { registry: { data } }: { registry: { data: Registry[] } } = await response.json();

            const headers = [
                'surname', 'given_name', 'nationality', 'country_of_residence', 'national_id_number',
                'document_type', 'document_no', 'dob', 'age', 'sex', 'travel_date', 'direction',
                'accommodation_address', 'note', 'travel_reason', 'border_post', 'destination_coming_from',
            ];

            const csvRows = [
                headers.join(','),
                ...data.map((row) =>
                    headers
                        .map((key) => {
                            const value = row[key as keyof Registry] ?? 'N/A';
                            return `"${String(value).replace(/"/g, '""')}"`;
                        })
                        .join(',')
                ),
            ];

            const csvContent = csvRows.join('\n');
            const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
            const urlObj = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.setAttribute('href', urlObj);
            link.setAttribute('download', `registry_export_${new Date().toISOString().split('T')[0]}.csv`);
            document.body.appendChild(link);
            link.click();
            document.body.removeChild(link);
            URL.revokeObjectURL(urlObj);
            setIsLoading(false);
        } catch (error) {
            console.error('Export failed:', error);
            setExportError('Failed to export data. Please try again.');
            setShowAlert(true);
            setIsLoading(false);
        }
    };

    const handleYearChange = (year: string) => {
        setSelectedYears((prev) => {
            if (year === 'all') {
                return ['all'];
            }
            const newYears = prev.includes('all') ? [] : [...prev];
            if (newYears.includes(year)) {
                return newYears.filter((y) => y !== year);
            }
            return [...newYears, year].filter((y) => y !== 'all');
        });
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Registry" />
            <div className="relative flex h-full flex-1 flex-col gap-4 rounded-xl p-4">
                {isLoading && (
                    <div className="absolute inset-0 flex items-center justify-center bg-gray-100 bg-opacity-50 z-10">
                        <svg className="animate-spin h-8 w-8 text-blue-500" viewBox="0 0 24 24">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                        </svg>
                    </div>
                )}
                {showAlert && (flashMessage || exportError || navigationError) && (
                    <Alert
                        variant={flash?.success ? 'default' : 'destructive'}
                        className={`fixed top-4 right-4 z-40 max-w-md animate-in fade-in slide-in-from-top-2 duration-300 ${
                            flash?.success ? 'bg-green-600' : 'bg-red-600'
                        } text-white shadow-lg rounded-lg ${!showAlert ? 'animate-out fade-out slide-out-to-top-2' : ''}`}
                    >
                        <AlertDescription className="text-white pr-8">
                            {flash?.success ? 'Success! ' : 'Error! '}
                            {flashMessage || exportError || navigationError || 'An unexpected error occurred.'}
                        </AlertDescription>
                        <button
                            onClick={() => {
                                setShowAlert(false);
                                setExportError(null);
                                setNavigationError(null);
                            }}
                            className="absolute top-2 right-2 text-white hover:text-gray-200 focus:outline-none"
                            aria-label="Close alert"
                        >
                            ✕
                        </button>
                    </Alert>
                )}
                {/* Bulk Actions Bar */}
                {showBulkActions && (
                    <Card className="bg-blue-50 border-blue-200">
                        <CardContent className="p-4">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <span className="font-medium text-blue-900">
                                        {selectedIds.size} {selectedIds.size === 1 ? 'entry' : 'entries'} selected
                                    </span>
                                    {draftBatches.length > 0 && (
                                        <div className="flex items-center gap-2">
                                            <Select value={selectedBatchId} onValueChange={setSelectedBatchId}>
                                                <SelectTrigger className="w-64">
                                                    <SelectValue placeholder="Select batch to add entries" />
                                                </SelectTrigger>
                                                <SelectContent>
                                                    {draftBatches.map((batch) => (
                                                        <SelectItem key={batch.id} value={batch.id.toString()}>
                                                            {batch.name} ({batch.scheme} - {batch.batch_type})
                                                        </SelectItem>
                                                    ))}
                                                </SelectContent>
                                            </Select>
                                            <Button
                                                onClick={handleBulkAddToBatch}
                                                disabled={!selectedBatchId || isLoading}
                                                className="bg-blue-600 hover:bg-blue-700"
                                            >
                                                <PlusIcon className="h-4 w-4 mr-2" />
                                                Add to Batch
                                            </Button>
                                        </div>
                                    )}
                                    <Button
                                        variant="destructive"
                                        onClick={() => setShowBulkDeleteDialog(true)}
                                        disabled={isLoading}
                                        className="bg-red-600 hover:bg-red-700"
                                    >
                                        <Trash2Icon className="h-4 w-4 mr-2" />
                                        Delete Selected
                                    </Button>
                                </div>
                                <Button
                                    variant="outline"
                                    onClick={() => {
                                        setSelectedIds(new Set());
                                        setShowBulkActions(false);
                                    }}
                                >
                                    Clear Selection
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="mb-4 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-4">
                        <Input
                            type="text"
                            value={globalFilter}
                            onChange={(e) => setGlobalFilter(e.target.value)}
                            placeholder="Search registry..."
                            className="w-full max-w-md rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-2 text-sm"
                        />
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    {selectedYears.includes('all') ? 'All Years' : selectedYears.join(', ') || 'Select Years'}
                                    <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="start">
                                <DropdownMenuCheckboxItem
                                    checked={selectedYears.includes('all')}
                                    onCheckedChange={() => handleYearChange('all')}
                                >
                                    All
                                </DropdownMenuCheckboxItem>
                                {distinctYears.map((year) => (
                                    <DropdownMenuCheckboxItem
                                        key={year}
                                        checked={selectedYears.includes(year)}
                                        onCheckedChange={() => handleYearChange(year)}
                                    >
                                        {year}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                    <div className="flex items-center gap-2">
                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="outline"
                                    className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                                >
                                    Columns <ChevronDownIcon className="ml-2 h-4 w-4" />
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent align="end">
                                {table.getAllLeafColumns().map((column) => (
                                    <DropdownMenuCheckboxItem
                                        key={column.id}
                                        checked={column.getIsVisible()}
                                        onCheckedChange={(value) => column.toggleVisibility(!!value)}
                                        disabled={column.id === 'actions'}
                                    >
                                        {column.columnDef.header as string}
                                    </DropdownMenuCheckboxItem>
                                ))}
                            </DropdownMenuContent>
                        </DropdownMenu>
                        <Button
                            onClick={exportToCSV}
                            className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700"
                            disabled={isLoading}
                        >
                            <DownloadIcon className="h-4 w-4 mr-2" />
                            Export to CSV
                        </Button>
                    </div>
                </div>
                {registry.data?.length === 0 ? (
                    <div className="text-center py-8">
                        <svg
                            className="mx-auto h-12 w-12 text-gray-400"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                        >
                            <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M3 7h18M3 11h18m-9 4h9m-9 4h6"
                            />
                        </svg>
                        <p className="mt-2 text-sm text-gray-500">No registry data available.</p>
                    </div>
                ) : (
                    <div className="border-gray-200 overflow-x-auto rounded-xl border z-0 bg-white">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                            {table.getHeaderGroups().map((headerGroup) => (
                                <tr key={headerGroup.id}>
                                    {headerGroup.headers.map((header) => (
                                        <th
                                            key={header.id}
                                            className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer"
                                            onClick={header.column.getToggleSortingHandler()}
                                        >
                                            {header.isPlaceholder
                                                ? null
                                                : flexRender(
                                                    header.column.columnDef.header,
                                                    header.getContext()
                                                )}
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
                            <tbody className="bg-white divide-y divide-gray-200">
                            {table.getRowModel().rows.map((row) => (
                                <tr key={row.id} className="hover:bg-gray-50">
                                    {row.getVisibleCells().map((cell) => (
                                        <td
                                            key={cell.id}
                                            className="px-6 py-4 whitespace-nowrap text-sm text-gray-900"
                                        >
                                            {flexRender(
                                                cell.column.columnDef.cell,
                                                cell.getContext()
                                            )}
                                        </td>
                                    ))}
                                </tr>
                            ))}
                            </tbody>
                        </table>
                        <div className="flex items-center justify-between px-6 py-4">
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-700">
                                    Page {table.getState().pagination.pageIndex + 1} of{' '}
                                    {registry.meta.last_page || 1}
                                </span>
                                <select
                                    value={table.getState().pagination.pageSize}
                                    onChange={(e) => {
                                        table.setPageSize(Number(e.target.value));
                                    }}
                                    className="rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 p-1 text-sm"
                                    disabled={isLoading}
                                >
                                    {[10, 25, 50].map((pageSize) => (
                                        <option key={pageSize} value={pageSize}>
                                            Show {pageSize}
                                        </option>
                                    ))}
                                </select>
                            </div>
                            <div className="flex gap-2">
                                <button
                                    onClick={() => table.previousPage()}
                                    disabled={!table.getCanPreviousPage() || isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                                        table.getCanPreviousPage() && !isLoading
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Previous
                                </button>
                                <button
                                    onClick={() => table.nextPage()}
                                    disabled={!table.getCanNextPage() || isLoading}
                                    className={`px-4 py-2 text-sm font-medium rounded-md ${
                                        table.getCanNextPage() && !isLoading
                                            ? 'bg-blue-500 text-white hover:bg-blue-600'
                                            : 'bg-gray-200 text-gray-500 cursor-not-allowed'
                                    }`}
                                >
                                    Next
                                </button>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bulk delete confirmation */}
            <Dialog open={showBulkDeleteDialog} onOpenChange={setShowBulkDeleteDialog}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Delete selected records?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete {selectedIds.size} selected record(s)? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setShowBulkDeleteDialog(false)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeBulkDelete}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Single delete confirmation */}
            <Dialog open={singleDeleteId !== null} onOpenChange={(open) => !open && setSingleDeleteId(null)}>
                <DialogContent className="sm:max-w-md" onPointerDownOutside={(e) => e.preventDefault()}>
                    <DialogHeader>
                        <DialogTitle>Delete this record?</DialogTitle>
                        <DialogDescription>
                            Are you sure you want to delete this record? This cannot be undone.
                        </DialogDescription>
                    </DialogHeader>
                    <DialogFooter className="gap-2 sm:gap-0">
                        <Button
                            variant="outline"
                            onClick={() => setSingleDeleteId(null)}
                        >
                            Cancel
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={executeSingleDelete}
                            disabled={isLoading}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            Delete
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </AppLayout>
    );
}
