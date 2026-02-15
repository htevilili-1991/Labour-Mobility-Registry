import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { Button } from '@/components/ui/button';
import { Bell, CheckCheck, Loader2 } from 'lucide-react';
import { usePage, router } from '@inertiajs/react';
import { type SharedData } from '@/types';
import { useEffect, useState, useCallback } from 'react';

interface NotificationData {
    id: string;
    type: string;
    data: {
        type?: string;
        message?: string;
        url?: string;
        batch_name?: string;
        [key: string]: unknown;
    };
    read_at: string | null;
    created_at: string;
}

interface NotificationsResponse {
    data: NotificationData[];
    meta: {
        unread_count: number;
        current_page: number;
        last_page: number;
        total: number;
    };
}

const POLL_INTERVAL_MS = 30000;

export function NotificationsDropdown() {
    const { auth } = usePage<SharedData>().props;
    const [notifications, setNotifications] = useState<NotificationData[]>([]);
    const [unreadCount, setUnreadCount] = useState(
        auth?.unread_notifications_count ?? 0
    );
    const [loading, setLoading] = useState(false);
    const [open, setOpen] = useState(false);

    const fetchNotifications = useCallback(async () => {
        if (!auth?.user) return;
        setLoading(true);
        try {
            const res = await fetch(
                '/notifications?per_page=15',
                { headers: { Accept: 'application/json', 'X-Requested-With': 'XMLHttpRequest' } }
            );
            const json = await res.json();
            if (res.ok && json?.data) {
                setNotifications(Array.isArray(json.data) ? json.data : []);
                setUnreadCount(typeof json.meta?.unread_count === 'number' ? json.meta.unread_count : 0);
            } else {
                setNotifications([]);
            }
        } catch {
            setNotifications([]);
        } finally {
            setLoading(false);
        }
    }, [auth?.user]);

    useEffect(() => {
        setUnreadCount(auth?.unread_notifications_count ?? 0);
    }, [auth?.unread_notifications_count]);

    useEffect(() => {
        if (open) {
            fetchNotifications();
            const id = setInterval(fetchNotifications, POLL_INTERVAL_MS);
            return () => clearInterval(id);
        }
    }, [open, fetchNotifications]);

    const markAsRead = async (id: string) => {
        try {
            await fetch(`/notifications/${id}/read`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            setUnreadCount((c) => Math.max(0, c - 1));
            setNotifications((prev) =>
                prev.map((n) =>
                    n.id === id ? { ...n, read_at: new Date().toISOString() } : n
                )
            );
        } catch {
            // Ignore
        }
    };

    const markAllRead = async () => {
        try {
            await fetch('/notifications/read-all', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Accept: 'application/json',
                    'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') ?? '',
                    'X-Requested-With': 'XMLHttpRequest',
                },
            });
            setUnreadCount(0);
            setNotifications((prev) =>
                prev.map((n) => ({ ...n, read_at: new Date().toISOString() }))
            );
            router.reload({ only: ['auth'] });
        } catch {
            // Ignore
        }
    };

    const formatTime = (dateStr: string) => {
        const date = new Date(dateStr);
        const now = new Date();
        const diffMs = now.getTime() - date.getTime();
        const diffMins = Math.floor(diffMs / 60000);
        const diffHours = Math.floor(diffMs / 3600000);
        const diffDays = Math.floor(diffMs / 86400000);
        if (diffMins < 1) return 'Just now';
        if (diffMins < 60) return `${diffMins}m ago`;
        if (diffHours < 24) return `${diffHours}h ago`;
        if (diffDays < 7) return `${diffDays}d ago`;
        return date.toLocaleDateString();
    };

    if (!auth?.user) return null;

    return (
        <DropdownMenu open={open} onOpenChange={setOpen}>
            <DropdownMenuTrigger asChild>
                <Button
                    variant="ghost"
                    size="icon"
                    className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-100"
                >
                    <Bell className="h-5 w-5" />
                    {unreadCount > 0 && (
                        <span className="absolute -top-0.5 -right-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-red-500 px-1 text-[10px] font-medium text-white">
                            {unreadCount > 99 ? '99+' : unreadCount}
                        </span>
                    )}
                    <span className="sr-only">Notifications</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-80 max-h-[400px] overflow-hidden flex flex-col">
                <div className="flex items-center justify-between border-b px-3 py-2">
                    <span className="font-semibold text-sm">Notifications</span>
                    {unreadCount > 0 && (
                        <button
                            type="button"
                            onClick={markAllRead}
                            className="text-xs text-blue-600 hover:text-blue-700 flex items-center gap-1"
                        >
                            <CheckCheck className="h-3.5 w-3.5" />
                            Mark all read
                        </button>
                    )}
                </div>
                <div className="overflow-y-auto flex-1 max-h-[320px]">
                    {loading && notifications.length === 0 ? (
                        <div className="flex items-center justify-center py-8">
                            <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
                        </div>
                    ) : notifications.length === 0 ? (
                        <div className="py-8 text-center text-sm text-gray-500">
                            No notifications yet
                        </div>
                    ) : (
                        <div className="py-1">
                            {notifications.map((n) => (
                                <div
                                    key={n.id}
                                    className={`px-3 py-2 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-0 ${
                                        !n.read_at ? 'bg-blue-50/50' : ''
                                    }`}
                                    role="button"
                                    tabIndex={0}
                                    onClick={() => {
                                        if (!n.read_at) markAsRead(n.id);
                                        if (n.data?.url) {
                                            setOpen(false);
                                            router.visit(n.data.url as string);
                                        }
                                    }}
                                    onKeyDown={(e) => {
                                        if (e.key === 'Enter' || e.key === ' ') {
                                            e.preventDefault();
                                            if (!n.read_at) markAsRead(n.id);
                                            if (n.data?.url) {
                                                setOpen(false);
                                                router.visit(n.data.url as string);
                                            }
                                        }
                                    }}
                                >
                                    <p className="text-sm text-gray-900 line-clamp-2">
                                        {n.data?.message ?? 'New notification'}
                                    </p>
                                    <p className="text-xs text-gray-500 mt-0.5">
                                        {formatTime(n.created_at)}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
