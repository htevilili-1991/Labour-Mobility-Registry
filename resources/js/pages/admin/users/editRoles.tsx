import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
}

interface UserWithRoles {
    id: number;
    name: string;
    email: string;
    roles: Role[];
}

interface Props {
    auth: { user: User | null };
    user: UserWithRoles;
    roles: Role[];
}

export default function UserRoleEdit({ auth, user, roles }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/admin' },
        { label: 'Users', href: '/admin/users' },
        { label: 'Roles', href: '/admin/users/roles' },
        { label: 'Edit', href: `/admin/users/${user.id}/roles/edit` }
    ];

    const { data, setData, put, processing, errors } = useForm({
        roles: user.roles.map(role => role.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/users/${user.id}/roles`);
    };

    const handleRoleChange = (roleId: number, checked: boolean) => {
        if (checked) {
            setData('roles', [...data.roles, roleId]);
        } else {
            setData('roles', data.roles.filter(id => id !== roleId));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Edit User Roles" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <div>
                        <h1 className="text-2xl font-bold">Edit User Roles</h1>
                        <p className="text-gray-600">Manage roles for: {user.name} ({user.email})</p>
                    </div>
                    <Link href="/admin/users/roles">
                        <Button variant="outline">Back to User Roles</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Assign Roles</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div>
                                <Label>Available Roles</Label>
                                <div className="space-y-3 mt-2">
                                    {roles.map((role) => (
                                        <div key={role.id} className="flex items-start space-x-3 p-3 border rounded-lg">
                                            <Checkbox
                                                id={`role-${role.id}`}
                                                checked={data.roles.includes(role.id)}
                                                onCheckedChange={(checked) => 
                                                    handleRoleChange(role.id, checked as boolean)
                                                }
                                            />
                                            <div className="flex-1">
                                                <Label 
                                                    htmlFor={`role-${role.id}`} 
                                                    className="font-medium cursor-pointer"
                                                >
                                                    {role.display_name || role.name}
                                                </Label>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {role.description || 'No description available'}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {roles.length === 0 && (
                                    <p className="text-gray-500">No roles available. Please create roles first.</p>
                                )}
                                {errors.roles && <p className="text-red-500 text-sm mt-1">{errors.roles}</p>}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Roles'}
                                </Button>
                                <Link href="/admin/users/roles">
                                    <Button type="button" variant="outline">Cancel</Button>
                                </Link>
                            </div>
                        </form>
                    </CardContent>
                </Card>
            </div>
        </AppLayout>
    );
}
