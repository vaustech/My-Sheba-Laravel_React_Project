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
        Schema::create('appointments', function (Blueprint $table) {
           $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade'); // কোন ইউজার বুক করেছে
        $table->foreignId('service_id')->constrained()->onDelete('cascade'); // কোন সেবা বুক করেছে
        $table->foreignId('available_slot_id')->nullable()->constrained()->onDelete('set null'); // কোন স্লটটি বুক করেছে (স্লট ডিলিট হলে null হবে)
        $table->dateTime('appointment_time'); // অ্যাপয়েন্টমেন্টের নির্দিষ্ট সময় (স্লট থেকে কপি করা)
        $table->enum('status', ['pending', 'confirmed', 'completed', 'cancelled'])->default('pending'); // অ্যাপয়েন্টমেন্টের অবস্থা
        $table->text('notes')->nullable(); // ব্যবহারকারীর কোনো নোট থাকলে
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('appointments');
    }
};
