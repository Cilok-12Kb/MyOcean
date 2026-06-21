<?php

namespace Database\Seeders;

use App\Models\PasangSurut;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PasangSurutSeeder extends Seeder
{
    /**
     * Generate data dummy "observasi" pasang surut untuk 30 hari berturut-turut
     * SEBELUM tanggal 21 Juni 2026 (yaitu 22 Mei - 20 Juni 2026, 720 baris:
     * 30 hari x 24 jam), supaya ada riwayat panjang yang representatif untuk
     * fitur "Generate Prediksi" memprediksi tanggal 21 Juni ke depan.
     *
     * Kolom yang diisi: tide_height_digital, tide_height_manual.
     * (Kolom 'status' tidak disentuh — itu generated column MySQL, otomatis
     * menyesuaikan nilai tide_height_digital.)
     * Kolom tide_height_prediction SENGAJA dibiarkan NULL — itu khusus untuk
     * hasil model BiLSTM nanti lewat fitur "Generate Prediksi", bukan data
     * observasi seperti yang di-generate seeder ini.
     *
     * POLA NILAI — dirancang menyerupai pasang surut nyata (bukan sinusoidal
     * berulang identik tiap hari), terdiri dari 3 komponen:
     *
     * 1. Komponen semi-diurnal (dominan): osilasi ~12 jam, mensimulasikan
     *    siklus pasang-surut harian (2x pasang & 2x surut per hari).
     * 2. Modulasi purnama-perbani: amplitudo komponen di atas membesar &
     *    mengecil mengikuti siklus ~14.5 hari (mirip siklus bulan: pasang
     *    lebih tinggi saat purnama/perbani, lebih rendah di antaranya).
     * 3. Noise acak kecil: variasi harian yang tidak sempurna mengikuti
     *    rumus matematis murni, seperti pengukuran sungguhan.
     *
     * PENTING — rentang nilai:
     * Model BiLSTM dilatih dengan data dalam rentang 60-212 cm (0.60-2.12 m).
     * Parameter di bawah ini SENGAJA diatur supaya hasil akhir tetap di
     * sekitar 67-202 cm, dengan margin aman dari batas training. Jangan
     * naikkan $amplitudoSemidiurnal atau $amplitudoPurnama tanpa mengecek
     * ulang rentang scaler_fitur.pkl yang dipakai model-service, karena
     * nilai di luar rentang training menyebabkan prediksi tidak akurat.
     */
    public function run(): void
    {
        PasangSurut::truncate();

        $jumlahHari   = 30;
        $tanggalAkhir = Carbon::parse('2026-06-20'); // hari terakhir data (sehari sebelum target prediksi)
        $tanggalMulai = $tanggalAkhir->copy()->subDays($jumlahHari - 1); // 2026-05-22

        // --- Parameter pola (satuan meter) ---
        $base                  = 1.35;   // titik tengah, dekat (0.60 + 2.12) / 2
        $amplitudoSemidiurnal  = 0.45;   // amplitudo dasar osilasi 12 jam
        $amplitudoPurnama      = 0.20;   // seberapa besar amplitudo di atas berubah mengikuti siklus bulan
        $periodePurnamaJam     = 14.5 * 24; // ~14.5 hari dalam jam
        $noiseMaksCm           = 2;      // noise acak +/- 2 cm

        for ($hari = 0; $hari < $jumlahHari; $hari++) {
            $tanggal = $tanggalMulai->copy()->addDays($hari);

            for ($jam = 0; $jam < 24; $jam++) {
                // Indeks waktu kontinu lintas hari (jam ke-0 dari awal periode 30 hari)
                $indexWaktu = ($hari * 24) + $jam;

                // Modulasi purnama-perbani: amplitudo semidiurnal naik-turun mengikuti siklus ~14.5 hari
                $modulasi = 1 + ($amplitudoPurnama / $amplitudoSemidiurnal)
                    * sin((2 * M_PI * $indexWaktu) / $periodePurnamaJam);

                // Komponen semi-diurnal: osilasi utama periode 12 jam
                $semidiurnal = $amplitudoSemidiurnal * $modulasi * sin((2 * M_PI * $indexWaktu) / 12);

                $noise   = mt_rand(-$noiseMaksCm * 100, $noiseMaksCm * 100) / 10000; // ke meter
                $digital = round($base + $semidiurnal + $noise, 2);
                $manual  = round($digital + (mt_rand(-2, 2) / 100), 2);

                PasangSurut::create([
                    'tanggal'                => $tanggal->toDateString(),
                    'jam'                    => $jam,
                    'tide_height_digital'    => $digital,
                    'tide_height_manual'     => $manual,
                    'tide_height_prediction' => null,
                ]);
            }
        }

        $this->command->info(
            "PasangSurutSeeder: berhasil generate "
            . ($jumlahHari * 24)
            . " baris data ({$tanggalMulai->toDateString()} s.d. {$tanggalAkhir->toDateString()})."
        );
    }
}