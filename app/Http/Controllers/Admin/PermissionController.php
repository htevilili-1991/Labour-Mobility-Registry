<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\Permission;
use Illuminate\Http\Request;
use Inertia\Inertia;

class PermissionController extends Controller
{
    public function index()
    {
        $permissions = Permission::with('roles')->get()->groupBy('group');
        
        return Inertia::render('Admin/Permissions/Index', [
            'permissions' => $permissions,
        ]);
    }

    public function create()
    {
        return Inertia::render('Admin/Permissions/Create');
    }

    public function store(Request $request)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name',
            'display_name' => 'nullable|string|max:255',
            'group' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        Permission::create([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'group' => $request->group,
            'description' => $request->description,
        ]);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission created successfully.');
    }

    public function edit(Permission $permission)
    {
        $permission->load('roles');
        
        return Inertia::render('Admin/Permissions/Edit', [
            'permission' => $permission,
        ]);
    }

    public function update(Request $request, Permission $permission)
    {
        $request->validate([
            'name' => 'required|string|unique:permissions,name,' . $permission->id,
            'display_name' => 'nullable|string|max:255',
            'group' => 'nullable|string|max:255',
            'description' => 'nullable|string',
        ]);

        $permission->update([
            'name' => $request->name,
            'display_name' => $request->display_name,
            'group' => $request->group,
            'description' => $request->description,
        ]);

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission updated successfully.');
    }

    public function destroy(Permission $permission)
    {
        if ($permission->roles()->count() > 0) {
            return back()->with('error', 'Cannot delete permission assigned to roles.');
        }

        $permission->delete();

        return redirect()->route('admin.permissions.index')
            ->with('success', 'Permission deleted successfully.');
    }
}
