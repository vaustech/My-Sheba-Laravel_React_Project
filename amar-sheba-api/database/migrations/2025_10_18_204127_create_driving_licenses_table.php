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
        Schema::create('driving_licenses', function (Blueprint $table) {
            $table->id();
        $table->foreignId('user_id')->constrained()->onDelete('cascade');
        $table->string('license_number')->unique();
        $table->date('issue_date');
        $table->date('expiry_date'); // নোটিফিকেশনের জন্য গুরুত্বপূর্ণ
        $table->string('vehicle_class'); // যেমন: "Motorcycle, Light Vehicle"
        $table->string('status')->default('Active'); // যেমন: Active, Expired
        $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('driving_licenses');
    }
};
