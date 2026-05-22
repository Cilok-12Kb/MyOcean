<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {

        Schema::create('weather', function (Blueprint $table) {

            $table->id();

            // wilayah
            $table->string('kode_wilayah')->unique();

            $table->string('desa')->nullable();
            $table->string('kecamatan')->nullable();

            $table->double('lat')->nullable();
            $table->double('lon')->nullable();

            // waktu
            $table->dateTime('utc_datetime')->nullable();

            $table->dateTime('local_datetime')->nullable();

            $table->dateTime('analysis_date')->nullable();

            // cuaca
            $table->integer('t')->nullable();

            $table->integer('hu')->nullable();

            $table->string('weather_desc')->nullable();

            $table->string('weather_desc_en')->nullable();

            // angin
            $table->double('ws')->nullable();

            $table->string('wd')->nullable();

            // awan & visibility
            $table->integer('tcc')->nullable();

            $table->string('vs_text')->nullable();

            // full prakiraan 3 hari
            $table->json('prakiraan')->nullable();

            $table->timestamp('updated_from_bmkg')->nullable();

            $table->timestamps();

        });

    }

    public function down(): void
    {
        Schema::dropIfExists('weather');
    }
};