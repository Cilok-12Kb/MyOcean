<?php

namespace Database\Seeders;

use App\Models\WilayahRob;
use Illuminate\Database\Seeder;

class WilayahRobSeeder extends Seeder
{
    public function run(): void
    {
        WilayahRob::truncate();

        // Tinggi tanah tiap wilayah (meter) — estimasi pesisir Semarang
        // Semakin dekat laut, tanahnya semakin rendah bahkan di bawah MSL
        $wilayah = [
            ['nama_wilayah' => 'Tambakharjo',   'tinggi_tanah' => 0.45],
            ['nama_wilayah' => 'Tawangsari',     'tinggi_tanah' => 0.52],
            ['nama_wilayah' => 'Tawangmas',      'tinggi_tanah' => 0.60],
            ['nama_wilayah' => 'Panggung Lor',   'tinggi_tanah' => 0.38],
            ['nama_wilayah' => 'Bandarharjo',    'tinggi_tanah' => 0.30],
            ['nama_wilayah' => 'Tanjung Mas',    'tinggi_tanah' => 0.25],
            ['nama_wilayah' => 'Kemijen',        'tinggi_tanah' => 0.42],
            ['nama_wilayah' => 'Tambakrejo',     'tinggi_tanah' => 0.55],
            ['nama_wilayah' => 'Terboyo Kulon',  'tinggi_tanah' => 0.35],
            ['nama_wilayah' => 'Terboyo Wetan',  'tinggi_tanah' => 0.40],
            ['nama_wilayah' => 'Trimulyo',       'tinggi_tanah' => 0.48],
        ];

        foreach ($wilayah as $item) {
            WilayahRob::create($item);
        }
    }
}