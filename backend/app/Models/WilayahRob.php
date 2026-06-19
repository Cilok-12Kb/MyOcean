<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class WilayahRob extends Model
{
    protected $table = 'wilayah_rob';

    protected $fillable = [
        'nama_wilayah',
        'tinggi_tanah',
    ];

    protected $casts = [
        'tinggi_tanah' => 'float',
    ];
}