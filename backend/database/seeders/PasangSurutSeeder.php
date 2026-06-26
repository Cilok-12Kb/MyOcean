<?php

namespace Database\Seeders;

use App\Models\PasangSurut;
use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class PasangSurutSeeder extends Seeder
{
    /**
     * Mengisi data "observasi" pasang surut dari dataset NYATA
     * (1 Januari 2023 s.d. 24 Juni 2026, 29.487 baris per jam),
     * BUKAN data dummy/generate seperti seeder sebelumnya.
     *
     * Sumber: dataset_pasut_2023_2025.xlsx (kolom Tanggal, Jam, Manual,
     * Sensor). Kolom Manual & Sensor pada file asli dalam satuan CENTIMETER,
     * sudah dikonversi ke METER (dibagi 100, dibulatkan 2 desimal) supaya
     * konsisten dengan kolom tide_height_digital / tide_height_manual yang
     * ada di database (contoh nilai existing: 1.35, 1.59, dst).
     *
     * Mapping kolom dataset -> kolom tabel:
     * - Tanggal -> tanggal
     * - Jam ("02:00" dst)   -> jam (diambil jam-nya saja, integer 0-23)
     * - Sensor (cm) / 100   -> tide_height_digital (pembacaan alat digital)
     * - Manual (cm) / 100   -> tide_height_manual  (pembacaan manual/staff)
     *
     * Kolom yang SENGAJA TIDAK diisi:
     * - status: kolom generated MySQL, otomatis terisi sendiri mengikuti
     *   nilai tide_height_digital. Jangan disentuh dari seeder.
     * - tide_height_prediction: khusus untuk hasil model BiLSTM lewat fitur
     *   "Generate Prediksi", bukan bagian dari data observasi historis ini,
     *   jadi dibiarkan NULL.
     *
     * Catatan data: dari 29.487 baris, ada 5 baris dengan nilai Sensor yang
     * janggal (4 baris melonjak jauh di atas rentang normal ~60-222 cm, dan
     * 1 baris bernilai 0) — kemungkinan glitch alat sensor sungguhan, tetap
     * dimasukkan apa adanya sebagai data observasi historis (tidak dibersihkan
     * di seeder ini, supaya proses import benar-benar 1:1 dengan file asli).
     *
     * File CSV (database/seeders/data/pasut_surut.csv) sudah dalam bentuk
     * final: tanggal, jam, tide_height_digital, tide_height_manual.
     * Insert dilakukan per-chunk (1000 baris) di dalam transaction supaya
     * aman & ringan untuk ~30 ribu baris.
     */
    public function run(): void
    {
        PasangSurut::truncate();

        $csvPath = database_path('seeders/data/dataset_pasut_2026.csv');

        if (! file_exists($csvPath)) {
            $this->command->error("File CSV tidak ditemukan: {$csvPath}");
            return;
        }

        $handle = fopen($csvPath, 'r');
        $header = fgetcsv($handle); // buang baris header: tanggal,jam,tide_height_digital,tide_height_manual

        $chunkSize = 1000;
        $buffer    = [];
        $total     = 0;
        $now       = now();

        DB::beginTransaction();

        try {
            while (($row = fgetcsv($handle)) !== false) {
                [$tanggal, $jam, $digital, $manual] = $row;

                $buffer[] = [
                    'tanggal'                => $tanggal,
                    'jam'                    => (int) $jam,
                    'tide_height_digital'    => (float) $digital,
                    'tide_height_manual'     => (float) $manual,
                    'tide_height_prediction' => null,
                    'created_at'             => $now,
                    'updated_at'             => $now,
                ];

                if (count($buffer) >= $chunkSize) {
                    PasangSurut::insert($buffer);
                    $total += count($buffer);
                    $buffer = [];
                }
            }

            if (! empty($buffer)) {
                PasangSurut::insert($buffer);
                $total += count($buffer);
            }

            fclose($handle);
            DB::commit();
        } catch (\Throwable $e) {
            fclose($handle);
            DB::rollBack();
            throw $e;
        }

        $this->command->info("PasangSurutSeeder: berhasil import {$total} baris data nyata (2023-01-01 s.d. 2026-06-24) dari pasut_surut.csv.");
    }
}