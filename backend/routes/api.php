<?php

use App\Http\Controllers\Admin\UserManagementController;
use App\Http\Controllers\Auth\AuthController;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\Facades\Http;

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

Route::get('/cuaca-semarang', function () {

    // seluruh wilayah Semarang
    $wilayahSemarang = [

        // Semarang Utara
        '33.74.06.1001',
        '33.74.06.1002',
        '33.74.06.1003',
        '33.74.06.1004',

        // Semarang Tengah
        '33.74.03.1001',
        '33.74.03.1002',
        '33.74.03.1003',

        // Semarang Barat
        '33.74.05.1001',
        '33.74.05.1002',

        // Pedurungan
        '33.74.11.1001',
        '33.74.11.1002',

        // Genuk
        '33.74.07.1001',
        '33.74.07.1002',

        // Tambahkan semua wilayah lainnya
    ];

    $hasil = [];

    foreach ($wilayahSemarang as $kode) {

        try {

            $response = Http::withoutVerifying()
                ->timeout(20)
                ->get(
                    "https://api.bmkg.go.id/publik/prakiraan-cuaca?adm4={$kode}"
                );

            $json = json_decode(
                $response->body(),
                true
            );

            if (isset($json['data'][0])) {

                $hasil[] = $json['data'][0];

            }

        } catch (\Exception $e) {

            continue;

        }

    }

    return response()->json([
        'data' => $hasil
    ]);

});