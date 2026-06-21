<?php

namespace App\Http\Controllers;

use App\Models\PasangSurut;
use App\Models\WilayahRob;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use Illuminate\Support\Facades\Log;
use Carbon\Carbon;

class PasangSurutController extends Controller
{
    // Untuk grafik — ambil 24 data (jam 0-23) sesuai tanggal yang dipilih
    public function index(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $data = PasangSurut::where('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        return response()->json(['data' => $data]);
    }

    // Untuk tabel — hitung tinggi rob per wilayah sesuai tanggal & jam
    // Catatan: jam harus PERSIS cocok (bukan fallback ke jam sebelumnya).
    // Kalau data untuk jam tsb belum ada, kembalikan array kosong supaya
    // frontend bisa menampilkan status "data belum tersedia".
    public function robPerWilayah(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $jamParam = $request->query('jam');
        $jam = $jamParam !== null ? (int) explode(':', $jamParam)[0] : Carbon::now()->hour;

        $air = PasangSurut::where('tanggal', $tanggal)
            ->where('jam', $jam)
            ->first();

        if (!$air) {
            return response()->json(['data' => []]);
        }

        $wilayah = WilayahRob::all();

        $result = $wilayah->map(function ($w) use ($air) {
            $tinggiRob = round($air->tide_height_digital - $w->tinggi_tanah, 2);

            return [
                'nama_wilayah'        => $w->nama_wilayah,
                'tinggi_tanah'        => $w->tinggi_tanah,
                'tide_height_digital' => $air->tide_height_digital,
                'tinggi_rob'          => max($tinggiRob, 0),
                'tergenang'           => $tinggiRob > 0,
                'status'              => $air->status,
                'tanggal'             => $air->tanggal->toDateString(),
                'jam'                 => $air->jam,
            ];
        });

        return response()->json(['data' => $result]);
    }

    // ── CRUD untuk admin ──────────────────────────────────────────────

    // Daftar lengkap data pasang surut untuk tabel kelola admin
    // (beda dari index() yang khusus grafik — ini bisa difilter tanggal juga)
    public function adminIndex(Request $request)
    {
        $tanggal = $request->query('tanggal') ?? Carbon::today()->toDateString();

        $data = PasangSurut::where('tanggal', $tanggal)
            ->orderBy('jam', 'asc')
            ->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'tanggal'                => 'required|date',
            'jam'                    => 'required|integer|min:0|max:23',
            'tide_height_digital'    => 'required|numeric',
            'tide_height_manual'     => 'nullable|numeric',
            'tide_height_prediction' => 'nullable|numeric',
        ]);

        // Cegah duplikat tanggal+jam (sesuai constraint unique di migration)
        $exists = PasangSurut::where('tanggal', $validated['tanggal'])
            ->where('jam', $validated['jam'])
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Data untuk tanggal dan jam ini sudah ada. Gunakan fitur edit.',
            ], 422);
        }

        $data = PasangSurut::create($validated);

        return response()->json(['data' => $data], 201);
    }

    public function update(Request $request, PasangSurut $pasangSurut)
    {
        $validated = $request->validate([
            'tanggal'                => 'required|date',
            'jam'                    => 'required|integer|min:0|max:23',
            'tide_height_digital'    => 'required|numeric',
            'tide_height_manual'     => 'nullable|numeric',
            'tide_height_prediction' => 'nullable|numeric',
        ]);

        // Cegah bentrok dengan baris lain (selain dirinya sendiri)
        $exists = PasangSurut::where('tanggal', $validated['tanggal'])
            ->where('jam', $validated['jam'])
            ->where('id', '!=', $pasangSurut->id)
            ->exists();

        if ($exists) {
            return response()->json([
                'message' => 'Data untuk tanggal dan jam ini sudah ada di baris lain.',
            ], 422);
        }

        $pasangSurut->update($validated);

        return response()->json(['data' => $pasangSurut]);
    }

    public function destroy(PasangSurut $pasangSurut)
    {
        $pasangSurut->delete();

        return response()->json(['message' => 'Data berhasil dihapus']);
    }

    // ── Generate prediksi 24 jam untuk tanggal target, menggunakan model BiLSTM ──
    // Riwayat diambil otomatis dari 2 hari sebelum tanggal target
    // (contoh: target 2026-06-20 → riwayat diambil dari 2026-06-18 dan 2026-06-19).
    public function generatePrediksi(Request $request)
    {
        $validated = $request->validate([
            'tanggal' => 'required|date',
        ]);

        $tanggalTarget = Carbon::parse($validated['tanggal'])->startOfDay();
        $lookbackJam   = 26; // LOOKBACK (24) + buffer 2 baris untuk shift(1)/shift(2)

        // Ambil baris dengan tanggal < tanggal target, urut terbaru dulu,
        // batasi $lookbackJam baris, lalu balik urutan jadi naik (lama → baru).
        $riwayat = PasangSurut::where('tanggal', '<', $tanggalTarget->toDateString())
            ->orderByDesc('tanggal')
            ->orderByDesc('jam')
            ->limit($lookbackJam)
            ->get()
            ->sortBy(function ($row) {
                return $row->tanggal->toDateString() . ' ' . str_pad($row->jam, 2, '0', STR_PAD_LEFT);
            })
            ->values();

        if ($riwayat->count() < $lookbackJam) {
            return response()->json([
                'message' => "Data historis sebelum {$tanggalTarget->toDateString()} belum cukup. "
                    . "Tersedia {$riwayat->count()} baris, butuh minimal {$lookbackJam} baris berurutan "
                    . "(idealnya 2 hari penuh: " . $tanggalTarget->copy()->subDays(2)->toDateString()
                    . " dan " . $tanggalTarget->copy()->subDay()->toDateString() . ").",
            ], 422);
        }

        // Pastikan baris terakhir riwayat persis jam 23:00 hari sebelum tanggal target,
        // supaya prediksi pertama yang dihasilkan adalah jam 00:00 tanggal target.
        $barisTerakhir     = $riwayat->last();
        $expectedDatetime  = $tanggalTarget->copy()->subHour(); // jam 23:00 H-1
        $actualDatetime    = Carbon::parse($barisTerakhir->tanggal->toDateString())->setTime($barisTerakhir->jam, 0);

        if (!$actualDatetime->equalTo($expectedDatetime)) {
            return response()->json([
                'message' => "Data riwayat tidak berurutan sampai tepat sebelum {$tanggalTarget->toDateString()} 00:00. "
                    . "Baris terakhir yang ditemukan: {$actualDatetime->format('Y-m-d H:i')}. "
                    . "Pastikan tidak ada jam yang bolong pada data 2 hari sebelum tanggal target.",
            ], 422);
        }

        $payload = [
            'riwayat' => $riwayat->map(function ($row) {
                return [
                    'datetime' => $row->tanggal->toDateString() . ' ' . str_pad($row->jam, 2, '0', STR_PAD_LEFT) . ':00:00',
                    // PENTING: model dilatih dengan data dalam satuan CENTIMETER
                    // (60-212 cm), tapi tabel pasang_surut menyimpan dalam METER.
                    // Konversi *100 di sini (meter -> cm) sebelum dikirim ke
                    // model-service, supaya konsisten dengan rentang training.
                    // Konversi sebaliknya (/100, cm -> meter) sudah ada di bagian
                    // bawah method ini saat menyimpan HASIL prediksi.
                    'manual'   => (float) ($row->tide_height_manual ?? $row->tide_height_digital) * 100,
                    'sensor'   => (float) $row->tide_height_digital * 100,
                ];
            })->values(),
            'jumlah_jam_prediksi' => 24,
        ];

        // Panggil Python model service
        try {
            $response = Http::withHeaders([
                    'X-API-Key' => config('services.model_service.api_key'),
                ])
                ->timeout(60)
                ->post(config('services.model_service.url') . '/predict', $payload);
        } catch (\Exception $e) {
            Log::error('Gagal menghubungi model service: ' . $e->getMessage());
            return response()->json([
                'message' => 'Tidak bisa terhubung ke model prediksi. Pastikan model service sedang berjalan.',
            ], 503);
        }

        if (!$response->successful()) {
            Log::error('Model service error: ' . $response->body());
            return response()->json([
                'message' => 'Model prediksi gagal memproses data: ' . ($response->json('detail') ?? 'Unknown error'),
            ], 502);
        }

        $hasil = $response->json('hasil');

        // PENTING: model BiLSTM dilatih dengan dataset dalam satuan CENTIMETER,
        // tapi tabel pasang_surut di sistem ini memakai satuan METER (lihat
        // tide_height_digital/manual yang nilainya ~0.5-2.5, bukan ~50-250).
        // Konversi cm → meter sebelum disimpan supaya konsisten dengan data lain
        // dan tampil benar di grafik (yang skalanya 0-3 meter).
        $disimpan = 0;
        foreach ($hasil as $jamPrediksi) {
            $tanggal = substr($jamPrediksi['datetime'], 0, 10);
            $jam     = $jamPrediksi['jam'];
            $prediksiMeter = round($jamPrediksi['prediksi_cm'] / 100, 3);

            PasangSurut::updateOrCreate(
                ['tanggal' => $tanggal, 'jam' => $jam],
                ['tide_height_prediction' => $prediksiMeter]
            );
            $disimpan++;
        }

        return response()->json([
            'message'        => "Berhasil generate {$disimpan} data prediksi untuk {$tanggalTarget->toDateString()}.",
            'count'          => $disimpan,
            'tanggal_target' => $tanggalTarget->toDateString(),
            'data'           => $hasil,
        ]);
    }
}