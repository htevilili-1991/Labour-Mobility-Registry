import { Head, Link, useForm } from '@inertiajs/react';
import AppLayout from '@/layouts/app-layout';
import { type BreadcrumbItem, type User } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Checkbox } from '@/components/ui/checkbox';

interface Permission {
    id: number;
    name: string;
    display_name: string;
    group: string;
    description: string;
}

interface Role {
    id: number;
    name: string;
    display_name: string;
    description: string;
    permissions: Permission[];
}

interface Props {
    auth: { user: User | null };
    role: Role;
    permissions: Record<string, Permission[]>;
}

export default function RoleEdit({ auth, role, permissions }: Props) {
    const breadcrumbs: BreadcrumbItem[] = [
        { label: 'Dashboard', href: '/dashboard' },
        { label: 'Admin', href: '/admin' },
        { label: 'Roles', href: '/admin/roles' },
        { label: 'Edit', href: `/admin/roles/${role.id}/edit` }
    ];
    const { data, setData, put, processing, errors } = useForm({
        name: role.name,
        display_name: role.display_name || '',
        description: role.description || '',
        permissions: role.permissions.map(p => p.id),
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        put(`/admin/roles/${role.id}`);
    };

    const handlePermissionChange = (permissionId: number, checked: boolean) => {
        if (checked) {
            setData('permissions', [...data.permissions, permissionId]);
        } else {
            setData('permissions', data.permissions.filter(id => id !== permissionId));
        }
    };

    return (
        <AppLayout breadcrumbs={breadcrumbs} auth={auth}>
            <Head title="Edit Role" />
            <div className="flex flex-col gap-4 p-4">
                <div className="flex justify-between items-center">
                    <h1 className="text-2xl font-bold">Edit Role</h1>
                    <Link href="/admin/roles">
                        <Button variant="outline">Back to Roles</Button>
                    </Link>
                </div>

                <Card>
                    <CardHeader>
                        <CardTitle>Role Information</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <form onSubmit={handleSubmit} className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <Label htmlFor="name">Role Name *</Label>
                                    <Input
                                        id="name"
                                        type="text"
                                        value={data.name}
                                        onChange={(e) => setData('name', e.target.value)}
                                        placeholder="e.g., manager, editor, viewer"
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
                                        placeholder="e.g., Manager, Editor, Viewer"
                                    />
                                    {errors.display_name && <p className="text-red-500 text-sm mt-1">{errors.display_name}</p>}
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
                                    placeholder="Describe the role and its purpose"
                                />
                                {errors.description && <p className="text-red-500 text-sm mt-1">{errors.description}</p>}
                            </div>

                            <div>
                                <Label>Permissions</Label>
                                <div className="space-y-4 mt-2">
                                    {Object.entries(permissions).map(([group, groupPermissions]) => (
                                        <div key={group} className="border rounded-lg p-4">
                                            <h3 className="font-semibold mb-3 capitalize">{group || 'General'}</h3>
                                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                                                {groupPermissions.map((permission) => (
                                                    <div key={permission.id} className="flex items-center space-x-2">
                                                        <Checkbox
                                                            id={`permission-${permission.id}`}
                                                            checked={data.permissions.includes(permission.id)}
                                                            onCheckedChange={(checked) => 
                                                                handlePermissionChange(permission.id, checked as boolean)
                                                            }
                                                        />
                                                        <Label 
                                                            htmlFor={`permission-${permission.id}`} 
                                                            className="text-sm cursor-pointer"
                                                        >
                                                            {permission.display_name || permission.name}
                                                        </Label>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                {errors.permissions && <p className="text-red-500 text-sm mt-1">{errors.permissions}</p>}
                            </div>

                            <div className="flex gap-2">
                                <Button type="submit" disabled={processing}>
                                    {processing ? 'Updating...' : 'Update Role'}
                                </Button>
                                <Link href="/admin/roles">
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
