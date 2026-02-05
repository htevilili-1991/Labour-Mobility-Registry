<?php

use App\Http\Controllers\Settings\PasswordController;
use App\Http\Controllers\Settings\ProfileController;
use Illuminate\Support\Facades\Route;

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/settings', [ProfileController::class, 'index'])->name('settings.index');
    Route::get('/settings/profile', [ProfileController::class, 'showProfile'])->name('settings.profile');
    Route::post('/settings/profile', [ProfileController::class, 'updateProfile'])->name('profile.update');
    Route::delete('/settings/profile', [ProfileController::class, 'destroyProfile'])->name('profile.destroy');
    Route::get('/settings/password', [PasswordController::class, 'edit'])->name('settings.password');
    Route::post('/settings/password', [PasswordController::class, 'update'])->name('password.update');
    Route::get('/settings/appearance', [ProfileController::class, 'showAppearance'])->name('settings.appearance');

    Route::middleware('admin')->group(function () {
        Route::get('/settings/users', [ProfileController::class, 'showUserManagement'])->name('settings.users');
        Route::post('/settings/users', [ProfileController::class, 'storeUser'])->name('settings.users.store');
        Route::patch('/settings/users/{user}', [ProfileController::class, 'updateUser'])->name('settings.users.update');
        Route::delete('/settings/users/{user}', [ProfileController::class, 'destroyUser'])->name('settings.users.destroy');
        
        Route::get('/settings/roles-permissions', [ProfileController::class, 'showRolesPermissions'])->name('settings.roles-permissions');
    });
});
