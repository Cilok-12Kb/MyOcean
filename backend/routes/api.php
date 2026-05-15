<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;

Route::get('/test', function () {
    return response()->json([
        'message' => 'My_Ocean API Connected'
    ]);
});

Route::post('/ocean-control-center/login', [AuthController::class, 'login']);

Route::middleware('auth:sanctum')->group(function () {

    Route::post('/logout', [AuthController::class, 'logout']);

});

Route::middleware('auth:sanctum')->get('/admin/dashboard', function () {
    return response()->json([
        'message' => 'Selamat datang di dashboard admin My_Ocean'
    ]);
});

Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->get('/super-admin-only', function () {

    return response()->json([
        'message' => 'Hanya super admin yang bisa akses'
    ]);

});

Route::middleware(['auth:sanctum', 'role:super_admin'])
    ->post('/admin/create-staff', [UserManagementController::class, 'createStaff']);