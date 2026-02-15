<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\ProfileUpdateRequest;
use App\Models\User;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;

class ProfileController extends Controller
{
    /**
     * Redirect to profile settings.
     */
    public function index(): RedirectResponse
    {
        return redirect()->route('settings.profile');
    }

    /**
     * Show the user's profile settings page.
     */
    public function showProfile(Request $request): Response
    {
        return Inertia::render('Settings/profile', [
            'mustVerifyEmail' => $request->user() instanceof MustVerifyEmail,
            'status' => $request->session()->get('status'),
        ]);
    }

    /**
     * Update the user's profile settings.
     */
    public function updateProfile(ProfileUpdateRequest $request): RedirectResponse
    {
        $request->user()->fill($request->validated());

        if ($request->user()->isDirty('email')) {
            $request->user()->email_verified_at = null;
        }

        $request->user()->save();

        // Refresh the user session to get updated data
        auth()->user()->refresh();

        return redirect()->route('settings.profile')->with('success', 'Profile updated.');
    }

    /**
     * Delete the user's account.
     */
    public function destroyProfile(Request $request): RedirectResponse
    {
        $request->validate([
            'password' => ['required', 'current_password'],
        ]);

        $user = $request->user();

        Auth::logout();

        $user->delete();

        $request->session()->invalidate();
        $request->session()->regenerateToken();

        return redirect('/');
    }

    /**
     * Show the password settings page.
     */
    public function showPassword(): Response
    {
        return Inertia::render('Settings/Password');
    }

    /**
     * Update the user's password.
     */
    public function updatePassword(Request $request): RedirectResponse
    {
        $request->validate([
            'current_password' => ['required', 'string'],
            'password' => ['required', 'string', Password::defaults(), 'confirmed'],
        ]);

        if (!Hash::check($request->current_password, auth()->user()->password)) {
            return redirect()->back()->withErrors(['current_password' => 'Current password is incorrect.']);
        }

        auth()->user()->update([
            'password' => Hash::make($request->password),
        ]);

        return redirect()->route('settings.password')->with('success', 'Password updated.');
    }

    /**
     * Show the user management page (admin-only).
     */
    public function showUserManagement(): Response
    {
        $users = User::all()->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ];
        });

        return Inertia::render('settings/UserManagement', [
            'users' => $users,
        ]);
    }

    /**
     * Add a new user (admin-only).
     */
    public function storeUser(Request $request): RedirectResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => ['required', 'string', Password::defaults()],
            'role' => 'required|in:admin,user',
        ]);

        User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => $request->role,
        ]);

        return redirect()->route('settings.users')->with('success', 'User added.');
    }

    /**
     * Update a user's role (admin-only).
     */
    public function updateUser(Request $request, User $user): RedirectResponse
    {
        $request->validate([
            'role' => 'required|in:admin,user',
        ]);

        $user->update(['role' => $request->role]);

        return redirect()->route('settings.users')->with('success', 'Role updated.');
    }

    /**
     * Delete a user (admin-only).
     */
    public function destroyUser(User $user): RedirectResponse
    {
        if ($user->id === auth()->id()) {
            return redirect()->back()->withErrors(['error' => 'Cannot delete your own account.']);
        }

        $user->delete();

        return redirect()->route('settings.users')->with('success', 'User deleted.');
    }

    /**
     * Show the roles and permissions management page (admin-only).
     */
    public function showRolesPermissions(): Response
    {
        return Inertia::render('Settings/RolesPermissions');
    }
}
