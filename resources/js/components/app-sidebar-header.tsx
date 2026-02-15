import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { UserInfo } from '@/components/user-info';
import { Bell, RefreshCw } from 'lucide-react';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage, router } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    const handleRefresh = () => {
        router.reload();
    };

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 w-full items-center justify-between gap-4 border-b bg-gradient-to-r from-white to-blue-50/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            {/* Left: sidebar trigger + breadcrumbs */}
            <div className="flex min-w-0 flex-1 items-center gap-3">
                <SidebarTrigger className="-ml-1 shrink-0 hover:bg-blue-100 transition-colors" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>

            {/* Right: notifications, refresh, profile */}
            <div className="flex shrink-0 items-center gap-1">
                <button className="relative rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-100">
                    <Bell className="h-5 w-5" />
                    <span className="absolute top-1 right-1 h-2 w-2 rounded-full bg-red-500" />
                </button>
                <button
                    onClick={handleRefresh}
                    className="rounded-lg p-2 text-gray-600 transition-colors hover:bg-blue-100"
                    title="Refresh content"
                >
                    <RefreshCw className="h-5 w-5" />
                </button>
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="rounded-full p-1 transition-colors hover:bg-blue-100">
                            <UserInfo user={auth.user} showName={false} />
                        </button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent className="w-56" align="end">
                        <UserMenuContent user={auth.user} />
                    </DropdownMenuContent>
                </DropdownMenu>
            </div>
        </header>
    );
}
