<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class PasangSurut extends Model
{
    protected $table = 'pasang_surut';

    protected $fillable = [
        'tanggal',
        'jam',
        'tide_height_digital',
        'tide_height_manual',
        'tide_height_prediction',
    ];

    protected $casts = [
        'tanggal' => 'date:Y-m-d',   // ← format-only cast, TIDAK dikonversi timezone
        'jam'                    => 'integer',
        'tide_height_digital'    => 'float',
        'tide_height_manual'     => 'float',
        'tide_height_prediction' => 'float',
    ];
}