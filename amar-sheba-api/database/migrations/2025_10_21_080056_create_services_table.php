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
        Schema::create('services', function (Blueprint $table) {
            $table->id();
        $table->string('name'); // সেবার নাম (e.g., Vehicle Fitness Check)
        $table->text('description')->nullable();
        $table->integer('duration_minutes')->default(30); // প্রতিটি স্লটের ডিউরেশন
        $table->boolean('is_active')->default(true); // সেবাটি চালু আছে কিনা
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('services');
    }
};
