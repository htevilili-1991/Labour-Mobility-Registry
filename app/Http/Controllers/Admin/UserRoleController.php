<?php

namespace App\Http\Controllers\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\Role;
use Illuminate\Http\Request;
use Inertia\Inertia;

class UserRoleController extends Controller
{
    public function index()
    {
        $users = User::with('roles')->get();
        
        return Inertia::render('Admin/Users/Roles', [
            'users' => $users,
        ]);
    }

    public function edit(User $user)
    {
        $user->load('roles');
        $roles = Role::all();
        
        return Inertia::render('Admin/Users/EditRoles', [
            'user' => $user,
            'roles' => $roles,
        ]);
    }

    public function update(Request $request, User $user)
    {
        $request->validate([
            'roles' => 'nullable|array',
            'roles.*' => 'exists:roles,id',
        ]);

        $user->roles()->sync($request->roles ?? []);

        return redirect()->route('admin.users.roles.index')
            ->with('success', 'User roles updated successfully.');
    }
}
