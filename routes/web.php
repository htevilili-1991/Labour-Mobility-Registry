<?php

use App\Http\Controllers\AuditController;
use App\Http\Controllers\DashboardController;
use App\Http\Controllers\RegistryBatchController;
use App\Http\Controllers\RegistryController;
use App\Http\Controllers\ReportsController;
use App\Http\Controllers\VerificationController;
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
        Route::get('upload-wizard', [RegistryController::class, 'uploadWizard'])->name('registry.upload-wizard');
        Route::post('upload', [RegistryController::class, 'storeCsv'])->name('registry.storeCsv');
        Route::post('store-wizard', [RegistryController::class, 'storeWizard'])->name('registry.storeWizard');
        Route::post('preview-returnee-wizard', [RegistryController::class, 'previewReturneeWizard'])->name('registry.previewReturneeWizard');
        Route::post('store-returnee-wizard', [RegistryController::class, 'storeReturneeWizard'])->name('registry.storeReturneeWizard');
        Route::post('bulk-delete', [RegistryController::class, 'bulkDestroy'])->name('registry.bulk-destroy');

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

    Route::prefix('notifications')->name('notifications.')->group(function () {
        Route::get('/', [\App\Http\Controllers\NotificationController::class, 'index'])->name('index');
        Route::post('/read-all', [\App\Http\Controllers\NotificationController::class, 'markAllRead'])->name('mark-all-read');
        Route::post('/{id}/read', [\App\Http\Controllers\NotificationController::class, 'markRead'])->name('mark-read');
    });

    // Reports and Analytics routes
    Route::prefix('reports')->middleware('permission:reports.view')->group(function () {
        Route::get('/', [ReportsController::class, 'index'])->name('reports.dashboard');
        Route::get('/verification', [ReportsController::class, 'verificationReport'])->name('reports.verification');
        Route::get('/compliance', [ReportsController::class, 'complianceReport'])->name('reports.compliance');
        Route::get('/performance', [ReportsController::class, 'performanceReport'])->name('reports.performance');
        Route::get('/returnee-compliance', [ReportsController::class, 'returneeComplianceReport'])->name('reports.returnee-compliance');
        Route::get('/returnee-compliance/export', [ReportsController::class, 'exportReturneeCompliance'])->name('reports.returnee-compliance.export');
        Route::get('/export', [ReportsController::class, 'export'])->name('reports.export');
        Route::get('/real-time', [ReportsController::class, 'realTimeData'])->name('reports.realtime');
    });

    // Registry batch routes (VBoS data entry)
    Route::prefix('batches')->middleware('permission:batches.view')->group(function () {
        Route::get('/', [RegistryBatchController::class, 'index'])->name('batches.index');
        Route::get('/create', [RegistryBatchController::class, 'create'])->middleware('permission:batches.create')->name('batches.create');
        Route::post('/', [RegistryBatchController::class, 'store'])->middleware('permission:batches.create')->name('batches.store');
        Route::get('/{batch}', [RegistryBatchController::class, 'show'])->name('batches.show');
        Route::get('/{batch}/edit', [RegistryBatchController::class, 'edit'])->middleware('permission:batches.edit')->name('batches.edit');
        Route::put('/{batch}', [RegistryBatchController::class, 'update'])->middleware('permission:batches.edit')->name('batches.update');
        Route::delete('/{batch}', [RegistryBatchController::class, 'destroy'])->middleware('permission:batches.edit')->name('batches.destroy');
        Route::post('/{batch}/submit', [RegistryBatchController::class, 'submit'])->middleware('permission:batches.submit')->name('batches.submit');
        Route::post('/{batch}/add-entries', [RegistryBatchController::class, 'addRegistryEntries'])->middleware('permission:batches.edit')->name('batches.add-entries');
        Route::post('/{batch}/remove-entries', [RegistryBatchController::class, 'removeRegistryEntries'])->middleware('permission:batches.edit')->name('batches.remove-entries');
    });

    // Verification routes (Labour Department)
    Route::prefix('verification')->middleware('permission:batches.verify')->group(function () {
        Route::get('/', [VerificationController::class, 'index'])->name('verification.index');
        Route::get('/dashboard', [VerificationController::class, 'dashboard'])->name('verification.dashboard');
        Route::get('/{batch}', [VerificationController::class, 'show'])->name('verification.show');
        Route::post('/{batch}/verify', [VerificationController::class, 'verify'])->name('verification.batch-verify');
        Route::post('/{batch}/approve', [VerificationController::class, 'approve'])->middleware('permission:batches.approve')->name('verification.approve');
        Route::post('/{batch}/reject', [VerificationController::class, 'reject'])->middleware('permission:batches.reject')->name('verification.reject');
        Route::get('/{batch}/audit', [VerificationController::class, 'auditTrail'])->middleware('permission:batches.audit')->name('verification.audit');
    });

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
