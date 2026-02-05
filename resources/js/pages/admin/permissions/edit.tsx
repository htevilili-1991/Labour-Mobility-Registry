import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
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
    permission: Permission;
}

export default function PermissionEdit({ auth, permission }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/admin' },
        { label: 'Permissions', href: '/admin/permissions' },
        { label: 'Edit', href: `/admin/permissions/${permission.id}/edit` }
    ];
    const { data, setData, put, processing, errors } = useForm({
        name: permission.name,
        display_name: permission.display_name || '',
        group: permission.group || '',
        description: permission.description || '',
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/permissions/${permission.id}`);
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Edit Permission" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Edit Permission</h1>
                    <Link href="/admin/permissions">
                        <Button variant="outline">Back to Permissions</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Permission Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Permission Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., users.create, registry.edit"
                                        required
                                    />
                                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name}</p>}
                                </div>
                                <div>
                                    <Label htmlFor="display_name">Display Name</Label>
                                    <Input
                                        id="display_name"
                                        type="text"
                                        value={data.display_name}
                                        onChange={(e) => setData('display_name', e.target.value)}
                                        placeholder="e.g., Create Users, Edit Registry"
                                    />
                                    {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="group">Group</Label>
                                    <Input
                                        id="group"
                                        type="text"
                                        value={data.group}
                                        onChange={(e) => setData('group', e.target.value)}
                                        placeholder="e.g., users, registry, reports"
                                    />
                                    {errors.group && <p className="text-red-500 text-sm mt-1">{errors.group}</p>}
                                </div>
                            </div>

                            <div>
                                <Label htmlFor="description">Description</Label>
                                <textarea
                                    id="description"
                                    className="w-full p-2 border border-gray-300 rounded-md"
                                    rows={3}
                                    value={data.description}
                                    onChange={(e) => setData('description', e.target.value)}
                                    placeholder="Describe what this permission allows"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            {permission.roles.length > 0 && (
                                <div>
                                    <Label>Currently assigned to roles:</Label>
                                    <div className="flex flex-wrap gap-2 mt-2">
                                        {permission.roles.map((role) => (
                                            <Badge key={role.id} variant="outline">
                                                {role.display_name || role.name}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className="text-sm text-gray-500 mt-1">
                                        Note: This permission is currently assigned to {permission.roles.length} role(s). 
                                        Editing won't affect existing assignments.
                                    </p>
                                </div>
                            )}

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Permission'}
                                </Button>
                                <Link href="/admin/permissions">
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
