<?php

use App\Http\Controllers\Api\RegistryBatchController;
use App\Http\Controllers\Api\RegistryController;
use App\Http\Controllers\Api\VerificationController;
use App\Http\Controllers\Api\AuditController;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

/*
|--------------------------------------------------------------------------
| API Routes
|--------------------------------------------------------------------------
|
| Here is where you can register API routes for your application. These
| routes are loaded by the RouteServiceProvider and all of them will
| be assigned to the "api" middleware group. Make something great!
|
*/

Route::middleware('auth:api')->get('/user', function (Request $request) {
    return $request->user();
});

// Registry Batch Routes (VBoS Data Entry)
Route::prefix('batches')->middleware('permission:batches.view')->group(function () {
    Route::get('/', [RegistryBatchController::class, 'index']);
    Route::post('/', [RegistryBatchController::class, 'store'])->middleware('permission:batches.create');
    Route::get('/statistics', [RegistryBatchController::class, 'statistics']);
    
    Route::prefix('{batch}')->group(function () {
        Route::get('/', [RegistryBatchController::class, 'show']);
        Route::put('/', [RegistryBatchController::class, 'update'])->middleware('permission:batches.edit');
        Route::delete('/', [RegistryBatchController::class, 'destroy'])->middleware('permission:batches.edit');
        Route::post('/submit', [RegistryBatchController::class, 'submit'])->middleware('permission:batches.submit');
        Route::post('/add-entries', [RegistryBatchController::class, 'addEntries'])->middleware('permission:batches.edit');
        Route::post('/remove-entries', [RegistryBatchController::class, 'removeEntries'])->middleware('permission:batches.edit');
        Route::get('/entries', [RegistryBatchController::class, 'entries']);
    });
});

// Registry Entry Routes
Route::prefix('registry')->middleware('permission:registry.view')->group(function () {
    Route::get('/', [RegistryController::class, 'index']);
    Route::post('/', [RegistryController::class, 'store'])->middleware('permission:registry.create');
    Route::get('/search', [RegistryController::class, 'search']);
    Route::get('/export', [RegistryController::class, 'export'])->middleware('permission:registry.export');
    
    Route::prefix('{registry}')->group(function () {
        Route::get('/', [RegistryController::class, 'show']);
        Route::put('/', [RegistryController::class, 'update'])->middleware('permission:registry.edit');
        Route::delete('/', [RegistryController::class, 'destroy'])->middleware('permission:registry.delete');
    });
});

// Verification Routes (Labour Department)
Route::prefix('verification')->middleware('permission:batches.verify')->group(function () {
    Route::get('/', [VerificationController::class, 'index']);
    Route::get('/dashboard', [VerificationController::class, 'dashboard']);
    Route::get('/metrics', [VerificationController::class, 'metrics']);
    
    Route::prefix('{batch}')->group(function () {
        Route::get('/', [VerificationController::class, 'show']);
        Route::post('/verify', [VerificationController::class, 'verify']);
        Route::post('/approve', [VerificationController::class, 'approve'])->middleware('permission:batches.approve');
        Route::post('/reject', [VerificationController::class, 'reject'])->middleware('permission:batches.reject');
        Route::get('/audit', [VerificationController::class, 'auditTrail'])->middleware('permission:batches.audit');
        Route::get('/approvals', [VerificationController::class, 'approvals']);
    });
});

// Audit Trail Routes
Route::prefix('audit')->middleware('permission:audits.view')->group(function () {
    Route::get('/', [AuditController::class, 'index']);
    Route::get('/search', [AuditController::class, 'search']);
    Route::delete('/', [AuditController::class, 'clear'])->middleware('permission:audits.clear');
    
    Route::prefix('batches/{batch}')->group(function () {
        Route::get('/', [AuditController::class, 'batchAudit']);
    });
    
    Route::prefix('registry/{registry}')->group(function () {
        Route::get('/', [AuditController::class, 'registryAudit']);
    });
});

// API Documentation
Route::get('/api/documentation', function () {
    return response()->json([
        'title' => 'Labour Mobility Registry API',
        'version' => '1.0.0',
        'description' => 'RESTful API for Vanuatu Labour Mobility Registry verification workflow',
        'base_url' => config('app.url') . '/api',
        'endpoints' => [
            'batches' => [
                'GET /api/batches' => 'List all registry batches',
                'POST /api/batches' => 'Create new batch',
                'GET /api/batches/{id}' => 'Get batch details',
                'PUT /api/batches/{id}' => 'Update batch',
                'DELETE /api/batches/{id}' => 'Delete batch',
                'POST /api/batches/{id}/submit' => 'Submit batch for verification',
                'GET /api/batches/statistics' => 'Get batch statistics',
            ],
            'verification' => [
                'GET /api/verification' => 'List batches for verification',
                'GET /api/verification/dashboard' => 'Get verification dashboard',
                'GET /api/verification/metrics' => 'Get verification metrics',
                'GET /api/verification/{id}' => 'Get batch for verification',
                'POST /api/verification/{id}/verify' => 'Verify batch',
                'POST /api/verification/{id}/approve' => 'Approve batch',
                'POST /api/verification/{id}/reject' => 'Reject batch',
                'GET /api/verification/{id}/audit' => 'Get batch audit trail',
            ],
            'registry' => [
                'GET /api/registry' => 'List registry entries',
                'POST /api/registry' => 'Create registry entry',
                'GET /api/registry/{id}' => 'Get registry entry',
                'PUT /api/registry/{id}' => 'Update registry entry',
                'DELETE /api/registry/{id}' => 'Delete registry entry',
                'GET /api/registry/search' => 'Search registry entries',
                'GET /api/registry/export' => 'Export registry data',
            ],
            'audit' => [
                'GET /api/audit' => 'Get audit trail',
                'GET /api/audit/search' => 'Search audit trail',
                'GET /api/audit/batches/{id}' => 'Get batch audit trail',
                'GET /api/audit/registry/{id}' => 'Get registry audit trail',
            ],
        ],
        'authentication' => [
            'type' => 'Bearer Token',
            'header' => 'Authorization: Bearer {token}',
        ],
        'permissions' => [
            'batches.view' => 'View batches',
            'batches.create' => 'Create batches',
            'batches.edit' => 'Edit batches',
            'batches.submit' => 'Submit batches',
            'batches.verify' => 'Verify batches',
            'batches.approve' => 'Approve batches',
            'batches.reject' => 'Reject batches',
            'batches.audit' => 'View batch audit trail',
            'registry.view' => 'View registry entries',
            'registry.create' => 'Create registry entries',
            'registry.edit' => 'Edit registry entries',
            'registry.delete' => 'Delete registry entries',
            'registry.export' => 'Export registry data',
            'audits.view' => 'View audit trail',
            'audits.clear' => 'Clear audit trail',
        ],
    ]);
});
