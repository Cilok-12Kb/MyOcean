<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('pasang_surut', function (Blueprint $table) {
            $table->id();

            $table->date('tanggal');
            $table->unsignedTinyInteger('jam'); // 0-23

            $table->float('tide_height_digital');
            $table->float('tide_height_manual')->nullable();
            $table->float('tide_height_prediction')->nullable();

            $table->enum('status', ['Pasang', 'Surut'])->virtualAs(
                "IF(tide_height_digital >= 1.5, 'Pasang', 'Surut')"
            );

            $table->unique(['tanggal', 'jam']);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('pasang_surut');
    }
};