import { Breadcrumbs } from '@/components/breadcrumbs';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Badge } from '@/components/ui/badge';
import { DropdownMenu, DropdownMenuContent, DropdownMenuTrigger } from '@/components/ui/dropdown-menu';
import { UserMenuContent } from '@/components/user-menu-content';
import { UserInfo } from '@/components/user-info';
import { Activity, Bell } from 'lucide-react';
import { type BreadcrumbItem as BreadcrumbItemType, type SharedData } from '@/types';
import { usePage } from '@inertiajs/react';

export function AppSidebarHeader({ breadcrumbs = [] }: { breadcrumbs?: BreadcrumbItemType[] }) {
    const page = usePage<SharedData>();
    const { auth } = page.props;

    return (
        <header className="border-sidebar-border/50 flex h-16 shrink-0 items-center gap-4 border-b bg-gradient-to-r from-white to-blue-50/50 px-6 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12 md:px-4">
            <div className="flex items-center gap-3 flex-1">
                <SidebarTrigger className="-ml-1 hover:bg-blue-100 transition-colors" />
                <Breadcrumbs breadcrumbs={breadcrumbs} />
            </div>
            
            {/* Right side actions */}
            <div className="flex items-center gap-3">
                {/* Status Badge */}
                <Badge variant="secondary" className="bg-green-100 text-green-800 px-3 py-1 flex items-center gap-1">
                    <Activity className="w-3 h-3" />
                    Live
                </Badge>
                
                {/* Notifications */}
                <button className="relative p-2 rounded-lg hover:bg-blue-100 transition-colors">
                    <Bell className="w-5 h-5 text-gray-600" />
                    <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span>
                </button>

                {/* Profile Dropdown */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <button className="relative rounded-full hover:bg-blue-100 transition-colors p-1">
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
