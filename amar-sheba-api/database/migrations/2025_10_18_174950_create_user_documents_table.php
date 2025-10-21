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
        Schema::create('user_documents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // কোন ইউজার-এর ফাইল
            $table->string('title'); // ইউজার-এর দেওয়া ফাইলের নাম (যেমন: "আমার NID")
            $table->string('category')->nullable(); // PDF অনুযায়ী ট্যাগ/ক্যাটাগরি (Personal, Vehicle) [cite: 29]
            $table->string('file_name'); // সার্ভারে সেভ করা আসল ফাইলের নাম
            $table->string('file_path'); // সার্ভারে ফাইলের পাথ
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('user_documents');
    }
};
