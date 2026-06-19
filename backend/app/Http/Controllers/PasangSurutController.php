<?php

namespace App\Http\Controllers;

use App\Models\PasangSurut;
use App\Models\WilayahRob;
use Illuminate\Http\Request;
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
}