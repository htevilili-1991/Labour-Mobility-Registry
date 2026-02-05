import Heading from '@/components/heading';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { cn } from '@/lib/utils';
import { type NavItem, type SharedData } from '@/types';
import { Link, usePage } from '@inertiajs/react';
import { type PropsWithChildren } from 'react';

export default function SettingsLayout({ children }: PropsWithChildren) {
    // Move usePage to the top level, before any return statements
    const { auth } = usePage<SharedData>().props;
    const isAdmin = auth.user.role === 'admin';

    // When server-side rendering, we only render the layout on the client...
    if (typeof window === 'undefined') {
        return null;
    }

    const sidebarNavItems: NavItem[] = [
        {
            title: 'Profile',
            href: '/settings/profile',
            icon: null,
        },
        {
            title: 'Password',
            href: '/settings/password',
            icon: null,
        },
        {
            title: 'Appearance',
            href: '/settings/appearance',
            icon: null,
        },
        ...(isAdmin
            ? [
                {
                    title: 'User Management',
                    href: '/settings/users',
                    icon: null,
                },
                {
                    title: 'Roles & Permissions',
                    href: '/settings/roles-permissions',
                    icon: null,
                },
            ]
            : []),
    ];

    const currentPath = window.location.pathname;

    return (
        <div className="px-4 py-6 relative z-20">
            <Heading title="Settings" description="Manage your profile and account settings" />

            <div className="flex flex-col space-y-8 lg:flex-row lg:space-y-0 lg:space-x-12">
                <aside className="w-full lg:w-64 shrink-0 z-30">
                    <nav className="flex flex-col space-y-1 space-x-0">
                        {sidebarNavItems.map((item, index) => (
                            <Button
                                key={`${item.href}-${index}`}
                                size="sm"
                                variant="ghost"
                                asChild
                                className={cn('w-full justify-start', {
                                    'bg-muted': currentPath === item.href,
                                })}
                            >
                                <Link href={item.href} prefetch>
                                    {item.title}
                                </Link>
                            </Button>
                        ))}
                    </nav>
                </aside>

                <Separator className="my-6 md:hidden" />

                <div>
                    <section className="max-w-4xl space-y-12">{children}</section>
                </div>
            </div>
        </div>
    );
}
