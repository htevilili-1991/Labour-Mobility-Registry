import { Head, Link, usePage } from '@inertiajs/react';
import HeadingSmall from '@/components/heading-small';
import { type BreadcrumbItem, type SharedData } from '@/types';
import AppLayout from '@/layouts/app-layout';
import SettingsLayout from '@/layouts/settings/layout';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const breadcrumbs: BreadcrumbItem[] = [
    {
        label: 'Roles & Permissions',
        href: '/settings/roles-permissions',
    },
];

export default function RolesPermissions() {
    const { auth } = usePage<SharedData>().props;

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Roles & Permissions" />
            <SettingsLayout>
                <div className="space-y-6" style={{ maxWidth: '1152px', margin: '0 auto', padding: '0 16px', overflowX: 'hidden' }}>
                    <HeadingSmall 
                        title="Roles & Permissions" 
                        description="Manage user roles and system permissions" 
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                            <CardHeader>
                                <CardTitle>Role Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    Create and manage user roles with specific permissions.
                                </p>
                                <div className="space-y-2">
                                    <Link href="/admin/roles">
                                        <Button variant="outline" className="w-full">
                                            Manage Roles
                                        </Button>
                                    </Link>
                                    <Link href="/admin/roles/create">
                                        <Button className="w-full">
                                            Create New Role
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle>Permission Management</CardTitle>
                            </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    Define granular permissions for different system features.
                                </p>
                                <div className="space-y-2">
                                    <Link href="/admin/permissions">
                                        <Button variant="outline" className="w-full">
                                            Manage Permissions
                                        </Button>
                                    </Link>
                                    <Link href="/admin/permissions/create">
                                        <Button className="w-full">
                                            Create New Permission
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <Card>
                        <CardHeader>
                            <CardTitle>User Role Assignments</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <p className="text-gray-600 mb-4">
                                View and manage role assignments for all users.
                            </p>
                            <Link href="/admin/users/roles">
                                <Button>
                                    Manage User Roles
                                </Button>
                            </Link>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Quick Access</CardTitle>
                        </CardHeader>
                            <CardContent>
                                <p className="text-gray-600 mb-4">
                                    Quick links to common administrative tasks.
                                </p>
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                    <Link href="/admin/roles">
                                        <Button variant="outline" className="w-full">
                                            View All Roles
                                        </Button>
                                    </Link>
                                    <Link href="/admin/permissions">
                                        <Button variant="outline" className="w-full">
                                            View All Permissions
                                        </Button>
                                    </Link>
                                    <Link href="/admin/users/roles">
                                        <Button variant="outline" className="w-full">
                                            User Role Management
                                        </Button>
                                    </Link>
                                </div>
                            </CardContent>
                    </Card>
                </div>
            </SettingsLayout>
        </AppLayout>
    );
}
