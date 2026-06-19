<?php

namespace App\Http\Controllers;

use App\Models\WilayahRob;
use Illuminate\Http\Request;

class WilayahRobController extends Controller
{
    public function index()
    {
        $data = WilayahRob::orderBy('nama_wilayah', 'asc')->get();

        return response()->json(['data' => $data]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'nama_wilayah' => 'required|string|max:255|unique:wilayah_rob,nama_wilayah',
            'tinggi_tanah' => 'required|numeric|min:0',
        ]);

        $wilayah = WilayahRob::create($validated);

        return response()->json(['data' => $wilayah], 201);
    }

    public function update(Request $request, WilayahRob $wilayahRob)
    {
        $validated = $request->validate([
            'nama_wilayah' => 'required|string|max:255|unique:wilayah_rob,nama_wilayah,' . $wilayahRob->id,
            'tinggi_tanah' => 'required|numeric|min:0',
        ]);

        $wilayahRob->update($validated);

        return response()->json(['data' => $wilayahRob]);
    }

    public function destroy(WilayahRob $wilayahRob)
    {
        $wilayahRob->delete();

        return response()->json(['message' => 'Wilayah berhasil dihapus']);
    }
}