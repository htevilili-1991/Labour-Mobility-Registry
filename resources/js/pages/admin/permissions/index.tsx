import { Head, Link, router } from '@inertiajs/react';
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

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
    description: string;
    roles: Role[];
}

interface Props {
    auth: { user: User | null };
    permissions: Record<string, Permission[]>;
}

const breadcrumbs: BreadcrumbItem[] = [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'Admin', href: '/admin' },
    { label: 'Permissions', href: '/admin/permissions' }
];

export default function PermissionIndex({ auth, permissions }: Props) {
    const handleDelete = (id: number) => {
        if (confirm('Are you sure you want to delete this permission?')) {
            router.delete(`/admin/permissions/${id}`, {
                onSuccess: () => {
                    // Success message will be shown via flash session
                },
                onError: (errors) => {
                    alert('Error deleting permission: ' + (errors.message || 'Unknown error'));
                }
            });
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Permissions" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Permissions Management</h1>
                    <Link href="/admin/permissions/create">
                        <Button>Create Permission</Button>
                    </Link>
                </div>

                {Object.entries(permissions).map(([group, groupPermissions]) => (
                    <Card key={group}>
                        <CardHeader>
                            <CardTitle className="capitalize">{group || 'General'} Permissions</CardTitle>
                        </CardHeader>
                        <CardContent>
                            {groupPermissions.length === 0 ? (
                                <p className="text-gray-500">No permissions in this group.</p>
                            ) : (
                                <Table>
                                    <TableHeader>
                                        <TableRow>
                                            <TableHead>Name</TableHead>
                                            <TableHead>Display Name</TableHead>
                                            <TableHead>Description</TableHead>
                                            <TableHead>Assigned to Roles</TableHead>
                                            <TableHead>Actions</TableHead>
                                        </TableRow>
                                    </TableHeader>
                                    <TableBody>
                                        {groupPermissions.map((permission) => (
                                            <TableRow key={permission.id}>
                                                <TableCell className="font-medium">{permission.name}</TableCell>
                                                <TableCell>{permission.display_name || '-'}</TableCell>
                                                <TableCell>{permission.description || '-'}</TableCell>
                                                <TableCell>
                                                    <div className="flex flex-wrap gap-1">
                                                        {permission.roles.map((role) => (
                                                            <Badge key={role.id} variant="outline" className="text-xs">
                                                                {role.display_name || role.name}
                                                            </Badge>
                                                        ))}
                                                        {permission.roles.length === 0 && (
                                                            <span className="text-gray-500 text-sm">Not assigned</span>
                                                        )}
                                                    </div>
                                                </TableCell>
                                                <TableCell>
                                                    <div className="flex gap-2">
                                                        <Link href={`/admin/permissions/${permission.id}/edit`}>
                                                            <Button variant="outline" size="sm">Edit</Button>
                                                        </Link>
                                                        <Button 
                                                            variant="destructive" 
                                                            size="sm"
                                                            onClick={() => handleDelete(permission.id)}
                                                        >
                                                            Delete
                                                        </Button>
                                                    </div>
                                                </TableCell>
                                            </TableRow>
                                        ))}
                                    </TableBody>
                                </Table>
                            )}
                        </CardContent>
                    </Card>
                ))}

                {Object.keys(permissions).length === 0 && (
                    <Card>
                        <CardContent className="text-center py-8">
                            <p className="text-gray-500">No permissions found.</p>
                            <Link href="/admin/permissions/create" className="mt-4 inline-block">
                                <Button>Create the first permission</Button>
                            </Link>
                        </CardContent>
                    </Card>
                )}
            </div>
        </AppLayout>
    );
}
