<?php

namespace Database\Seeders;

use App\Models\PasangSurut;
use Illuminate\Database\Seeder;
use Carbon\Carbon;

class PasangSurutSeeder extends Seeder
{
    public function run(): void
    {
        PasangSurut::truncate();

        $tanggal = Carbon::today();

        for ($jam = 0; $jam < 24; $jam++) {
            $siklus    = (2 * M_PI * ($jam % 12)) / 12;
            $base      = 1.65;
            $amplitudo = 0.85;

            $digital    = round($base + ($amplitudo * sin($siklus)), 2);
            $manual     = round($digital + (mt_rand(-3, 3) / 100), 2);
            $prediction = round($digital - (mt_rand(3, 7) / 100), 2);

            PasangSurut::create([
                'tanggal'                => $tanggal->toDateString(),
                'jam'                    => $jam,
                'tide_height_digital'    => $digital,
                'tide_height_manual'     => $manual,
                'tide_height_prediction' => $prediction,
            ]);
        }
    }
}