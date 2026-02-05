<?php

namespace Database\Seeders;

use Illuminate\Database\Console\Seeds\WithoutModelEvents;
use Illuminate\Database\Seeder;
use App\Models\Role;
use App\Models\Permission;

class RolePermissionSeeder extends Seeder
{
    public function run(): void
    {
        // Create permissions
        $permissions = [
            // Registry permissions
            ['name' => 'registry.view', 'display_name' => 'View Registry', 'group' => 'registry', 'description' => 'View registry entries'],
            ['name' => 'registry.create', 'display_name' => 'Create Registry', 'group' => 'registry', 'description' => 'Create new registry entries'],
            ['name' => 'registry.edit', 'display_name' => 'Edit Registry', 'group' => 'registry', 'description' => 'Edit existing registry entries'],
            ['name' => 'registry.delete', 'display_name' => 'Delete Registry', 'group' => 'registry', 'description' => 'Delete registry entries'],
            ['name' => 'registry.upload', 'display_name' => 'Upload Registry', 'group' => 'registry', 'description' => 'Upload registry data via CSV'],
            ['name' => 'registry.export', 'display_name' => 'Export Registry', 'group' => 'registry', 'description' => 'Export registry data'],
            
            // User management permissions
            ['name' => 'users.view', 'display_name' => 'View Users', 'group' => 'users', 'description' => 'View user list and details'],
            ['name' => 'users.create', 'display_name' => 'Create Users', 'group' => 'users', 'description' => 'Create new users'],
            ['name' => 'users.edit', 'display_name' => 'Edit Users', 'group' => 'users', 'description' => 'Edit user information'],
            ['name' => 'users.delete', 'display_name' => 'Delete Users', 'group' => 'users', 'description' => 'Delete users'],
            ['name' => 'users.manage-roles', 'display_name' => 'Manage User Roles', 'group' => 'users', 'description' => 'Assign and remove user roles'],
            
            // Role and permission management
            ['name' => 'roles.view', 'display_name' => 'View Roles', 'group' => 'roles', 'description' => 'View roles and permissions'],
            ['name' => 'roles.create', 'display_name' => 'Create Roles', 'group' => 'roles', 'description' => 'Create new roles'],
            ['name' => 'roles.edit', 'display_name' => 'Edit Roles', 'group' => 'roles', 'description' => 'Edit existing roles'],
            ['name' => 'roles.delete', 'display_name' => 'Delete Roles', 'group' => 'roles', 'description' => 'Delete roles'],
            ['name' => 'permissions.view', 'display_name' => 'View Permissions', 'group' => 'roles', 'description' => 'View permissions'],
            ['name' => 'permissions.create', 'display_name' => 'Create Permissions', 'group' => 'roles', 'description' => 'Create new permissions'],
            ['name' => 'permissions.edit', 'display_name' => 'Edit Permissions', 'group' => 'roles', 'description' => 'Edit existing permissions'],
            ['name' => 'permissions.delete', 'display_name' => 'Delete Permissions', 'group' => 'roles', 'description' => 'Delete permissions'],
            
            // Reports permissions
            ['name' => 'reports.view', 'display_name' => 'View Reports', 'group' => 'reports', 'description' => 'View reports and analytics'],
            ['name' => 'reports.create', 'display_name' => 'Create Reports', 'group' => 'reports', 'description' => 'Create new reports'],
            ['name' => 'reports.edit', 'display_name' => 'Edit Reports', 'group' => 'reports', 'description' => 'Edit existing reports'],
            ['name' => 'reports.delete', 'display_name' => 'Delete Reports', 'group' => 'reports', 'description' => 'Delete reports'],
            
            // Audit permissions
            ['name' => 'audits.view', 'display_name' => 'View Audits', 'group' => 'audits', 'description' => 'View audit logs'],
            ['name' => 'audits.clear', 'display_name' => 'Clear Audits', 'group' => 'audits', 'description' => 'Clear audit logs'],
        ];

        foreach ($permissions as $permission) {
            Permission::firstOrCreate(['name' => $permission['name']], $permission);
        }

        // Create roles
        $roles = [
            [
                'name' => 'super-admin',
                'display_name' => 'Super Admin',
                'description' => 'Full system access with all permissions',
                'permissions' => 'all' // All permissions
            ],
            [
                'name' => 'admin',
                'display_name' => 'Administrator',
                'description' => 'Administrative access with most permissions',
                'permissions' => [
                    'registry.view', 'registry.create', 'registry.edit', 'registry.upload', 'registry.export',
                    'users.view', 'users.edit', 'users.manage-roles',
                    'roles.view',
                    'reports.view', 'reports.create', 'reports.edit',
                    'audits.view'
                ]
            ],
            [
                'name' => 'manager',
                'display_name' => 'Manager',
                'description' => 'Can manage registry and view reports',
                'permissions' => [
                    'registry.view', 'registry.create', 'registry.edit', 'registry.upload', 'registry.export',
                    'reports.view', 'reports.create', 'reports.edit'
                ]
            ],
            [
                'name' => 'viewer',
                'display_name' => 'Viewer',
                'description' => 'Read-only access to registry and reports',
                'permissions' => [
                    'registry.view', 'registry.export',
                    'reports.view'
                ]
            ],
            [
                'name' => 'data-entry',
                'display_name' => 'Data Entry',
                'description' => 'Can create and edit registry entries',
                'permissions' => [
                    'registry.view', 'registry.create', 'registry.edit'
                ]
            ]
        ];

        foreach ($roles as $roleData) {
            $role = Role::firstOrCreate(['name' => $roleData['name']], [
                'display_name' => $roleData['display_name'],
                'description' => $roleData['description']
            ]);

            if ($roleData['permissions'] === 'all') {
                // Assign all permissions to super admin
                $allPermissionIds = Permission::pluck('id')->toArray();
                $role->permissions()->sync($allPermissionIds);
            } else {
                // Assign specific permissions
                $permissionIds = Permission::whereIn('name', $roleData['permissions'])->pluck('id')->toArray();
                $role->permissions()->sync($permissionIds);
            }
        }
    }
}
