import { Head, Link } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

interface Role {
    id: number;
    name: string;
    display_name: string;
}

interface UserWithRoles {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props {
    auth: { user: User | null };
    users: UserWithRoles[];
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/admin' },
    { label: 'Users', href: '/admin/users' },
    { label: 'Roles', href: '/admin/users/roles' }
];

export default function UserRoleIndex({ auth, users }: Props) {
    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="User Roles" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">User Role Management</h1>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>All Users and Their Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        {users.length === 0 ? (
                            <p className="text-gray-500">No users found.</p>
                        ) : (
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>Name</TableHead>
                                        <TableHead>Email</TableHead>
                                        <TableHead>Roles</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell className="font-medium">{user.name}</TableCell>
                                            <TableCell>{user.email}</TableCell>
                                            <TableCell>
                                                <div className="flex flex-wrap gap-1">
                                                    {user.roles.map((role) => (
                                                        <Badge key={role.id} variant="secondary" className="text-xs">
                                                            {role.display_name || role.name}
                                                        </Badge>
                                                    ))}
                                                    {user.roles.length === 0 && (
                                                        <span className="text-gray-500 text-sm">No roles assigned</span>
                                                    )}
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Link href={`/admin/users/${user.id}/roles/edit`}>
                                                    <Button variant="outline" size="sm">Edit Roles</Button>
                                                </Link>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        )}
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
