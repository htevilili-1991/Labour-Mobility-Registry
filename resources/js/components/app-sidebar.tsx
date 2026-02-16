import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FileIcon, HistoryIcon, LayoutGrid, UploadIcon, PackageIcon, BarChart3, Settings, BookOpen } from 'lucide-react';
import AppLogo from './app-logo';

const mainNavItems: NavItem[] = [
    {
        title: 'Dashboard',
        href: '/dashboard',
        icon: LayoutGrid,
    },
    {
        title: 'Registry',
        href: '/registry',
        icon: FileIcon,
    },
    {
        title: 'divider',
        href: '',
        icon: null,
    },
    {
        title: 'Batches',
        href: '/batches',
        icon: PackageIcon,
    },
    {
        title: 'Upload Data',
        href: '/registry/upload-wizard',
        icon: UploadIcon,
    },
    {
        title: 'Verification',
        href: '/verification',
        icon: HistoryIcon,
    },
    {
        title: 'divider',
        href: '',
        icon: null,
    },
    {
        title: 'Reports',
        href: '/reports',
        icon: BarChart3,
    },
    {
        title: 'Audit Logs',
        href: '/audits',
        icon: HistoryIcon,
    },
    {
        title: 'divider',
        href: '',
        icon: null,
    },
    {
        title: 'Settings',
        href: '/settings/profile',
        icon: Settings,
    },
];

export function AppSidebar() {
    return (
        <Sidebar collapsible="icon" variant="inset">
            <SidebarHeader>
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton size="lg" asChild>
                            <Link href="/dashboard" prefetch>
                                <AppLogo />
                            </Link>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarHeader>

            <SidebarContent>
                <NavMain items={mainNavItems} />
            </SidebarContent>

            <SidebarFooter className="mt-auto">
                <SidebarMenu>
                    <SidebarMenuItem>
                        <SidebarMenuButton asChild className="text-neutral-600 hover:text-neutral-800 dark:text-neutral-300 dark:hover:text-neutral-100">
                            <a href="https://htevilili-1991.github.io/lmr-user_manual/" target="_blank" rel="noopener noreferrer" className="flex items-center gap-2">
                                <BookOpen className="h-5 w-5 shrink-0" />
                                <span>User Manual</span>
                            </a>
                        </SidebarMenuButton>
                    </SidebarMenuItem>
                </SidebarMenu>
            </SidebarFooter>
        </Sidebar>
    );
}
