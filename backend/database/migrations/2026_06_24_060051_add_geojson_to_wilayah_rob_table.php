<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Tambah kolom geojson (polygon batas wilayah) ke tabel wilayah_rob.
     * Disimpan sebagai LONGTEXT karena koordinat polygon bisa cukup panjang.
     * Nullable supaya wilayah yang belum punya geometri tetap bisa disimpan
     * dan dikelola (tinggi tanah + kalkulasi rob tetap berjalan normal).
     */
    public function up(): void
    {
        Schema::table('wilayah_rob', function (Blueprint $table) {
            $table->longText('geojson')->nullable()->after('tinggi_tanah');
        });
    }

    public function down(): void
    {
        Schema::table('wilayah_rob', function (Blueprint $table) {
            $table->dropColumn('geojson');
        });
    }
};