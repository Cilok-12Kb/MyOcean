<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Weather extends Model
{
    protected $table = 'weather';

    protected $guarded = [];

    protected $casts = [

        'prakiraan' => 'array',

        'utc_datetime' => 'datetime',

        'local_datetime' => 'datetime',

        'analysis_date' => 'datetime',

    ];
}