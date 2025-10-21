<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
    public function up(): void
    {
        Schema::create('available_slots', function (Blueprint $table) {
            $table->id();
        $table->foreignId('service_id')->constrained()->onDelete('cascade'); // কোন সেবার স্লট
        $table->dateTime('start_time'); // স্লট কখন শুরু
        $table->dateTime('end_time');   // স্লট কখন শেষ
        $table->integer('capacity')->default(1); // এই স্লটে কতজন বুক করতে পারবে (সাধারণত ১)
        // Optional: Add specific location/officer if needed
        // $table->string('location')->nullable();
        $table->timestamps();

        $table->unique(['service_id', 'start_time']);
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('available_slots');
    }
};
