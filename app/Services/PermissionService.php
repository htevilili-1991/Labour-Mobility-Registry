<?php

namespace App\Services;

use App\Models\User;
use Illuminate\Support\Facades\Auth;

class PermissionService
{
    /**
     * Check if the current authenticated user has a specific permission.
     */
    public static function currentUserCan(string $permission): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }

        return $user->hasPermission($permission);
    }

    /**
     * Check if the current authenticated user has any of the given permissions.
     */
    public static function currentUserCanAny(array $permissions): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }

        return $user->hasAnyPermission($permissions);
    }

    /**
     * Check if the current authenticated user has all of the given permissions.
     */
    public static function currentUserCanAll(array $permissions): bool
    {
        $user = Auth::user();
        
        if (!$user) {
            return false;
        }

        return $user->hasAllPermissions($permissions);
    }

    /**
     * Check if a specific user has a specific permission.
     */
    public static function userCan(User $user, string $permission): bool
    {
        return $user->hasPermission($permission);
    }

    /**
     * Get all permissions for the current user.
     */
    public static function getCurrentUserPermissions(): array
    {
        $user = Auth::user();
        
        if (!$user) {
            return [];
        }

        $directPermissions = $user->permissions()->pluck('name')->toArray();
        $rolePermissions = $user->roles()
            ->with('permissions')
            ->get()
            ->pluck('permissions')
            ->flatten()
            ->pluck('name')
            ->toArray();

        return array_unique(array_merge($directPermissions, $rolePermissions));
    }

    /**
     * Get all roles for the current user.
     */
    public static function getCurrentUserRoles(): array
    {
        $user = Auth::user();
        
        if (!$user) {
            return [];
        }

        return $user->roles()->pluck('name')->toArray();
    }

    /**
     * Check if current user is super admin.
     */
    public static function isCurrentUserSuperAdmin(): bool
    {
        return self::currentUserCan('roles.view') && 
               self::currentUserCan('permissions.view') && 
               self::currentUserCan('users.delete');
    }
}
