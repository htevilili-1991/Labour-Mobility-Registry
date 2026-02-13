import { NavFooter } from '@/components/nav-footer';
import { NavMain } from '@/components/nav-main';
import { Sidebar, SidebarContent, SidebarFooter, SidebarHeader, SidebarMenu, SidebarMenuButton, SidebarMenuItem } from '@/components/ui/sidebar';
import { type NavItem } from '@/types';
import { Link } from '@inertiajs/react';
import { FileIcon, HistoryIcon, LayoutGrid, UploadIcon, PackageIcon } from 'lucide-react';
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
        icon: HistoryIcon,
    },
    {
        title: 'Audit Logs',
        href: '/audits',
        icon: HistoryIcon,
    },
];

const footerNavItems: NavItem[] = [];

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

            <SidebarFooter>
                <NavFooter items={footerNavItems} className="mt-auto" />
            </SidebarFooter>
        </Sidebar>
    );
}
