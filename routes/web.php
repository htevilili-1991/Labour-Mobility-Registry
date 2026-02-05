<?php

use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RegistryController;
use App\Http\Controllers\AuditController;
use Illuminate\Support\Facades\Route;
use Inertia\Inertia;

Route::get('/', function () {
    if (Auth::check()) {
        return redirect()->route('dashboard');
    }
    return Inertia::render('auth/login');
})->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    // Dashboard route using DashboardController
    Route::get('dashboard', [DashboardController::class, 'index'])->name('dashboard');

    // Registry routes
    Route::prefix('registry')->group(function () {
        // Explicit upload routes
        Route::get('upload', [RegistryController::class, 'upload'])->name('registry.upload');
        Route::post('upload', [RegistryController::class, 'storeCsv'])->name('registry.storeCsv');

        // Resource routes with constraints
        Route::resource('/', RegistryController::class)
            ->where(['registry' => '[0-9]+'])
            ->names('registry')
            ->parameters(['' => 'registry']);

        // Search and export
        Route::get('search', [RegistryController::class, 'search'])->name('registry.search');
        Route::get('export', [RegistryController::class, 'export'])->name('registry.export');
    });

    Route::get('/audits', [AuditController::class, 'index'])->name('audits.index');
    Route::delete('/audits', [AuditController::class, 'clear'])->name('audits.clear');

    // Admin routes
    Route::prefix('admin')->middleware('admin')->group(function () {
        // Role management
        Route::prefix('roles')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\RoleController::class, 'index'])->name('admin.roles.index');
            Route::get('/create', [App\Http\Controllers\Admin\RoleController::class, 'create'])->name('admin.roles.create');
            Route::post('/', [App\Http\Controllers\Admin\RoleController::class, 'store'])->name('admin.roles.store');
            Route::get('/{role}/edit', [App\Http\Controllers\Admin\RoleController::class, 'edit'])->name('admin.roles.edit');
            Route::put('/{role}', [App\Http\Controllers\Admin\RoleController::class, 'update'])->name('admin.roles.update');
            Route::delete('/{role}', [App\Http\Controllers\Admin\RoleController::class, 'destroy'])->name('admin.roles.destroy');
        });

        // Permission management
        Route::prefix('permissions')->group(function () {
            Route::get('/', [App\Http\Controllers\Admin\PermissionController::class, 'index'])->name('admin.permissions.index');
            Route::get('/create', [App\Http\Controllers\Admin\PermissionController::class, 'create'])->name('admin.permissions.create');
            Route::post('/', [App\Http\Controllers\Admin\PermissionController::class, 'store'])->name('admin.permissions.store');
            Route::get('/{permission}/edit', [App\Http\Controllers\Admin\PermissionController::class, 'edit'])->name('admin.permissions.edit');
            Route::put('/{permission}', [App\Http\Controllers\Admin\PermissionController::class, 'update'])->name('admin.permissions.update');
            Route::delete('/{permission}', [App\Http\Controllers\Admin\PermissionController::class, 'destroy'])->name('admin.permissions.destroy');
        });

        // User role management
        Route::prefix('users')->group(function () {
            Route::get('/roles', [App\Http\Controllers\Admin\UserRoleController::class, 'index'])->name('admin.users.roles.index');
            Route::get('/{user}/roles/edit', [App\Http\Controllers\Admin\UserRoleController::class, 'edit'])->name('admin.users.roles.edit');
            Route::put('/{user}/roles', [App\Http\Controllers\Admin\UserRoleController::class, 'update'])->name('admin.users.roles.update');
        });
    });

    // Include settings routes
    require __DIR__.'/settings.php';
});

require __DIR__.'/auth.php';
