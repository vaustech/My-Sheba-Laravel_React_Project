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
        Schema::create('support_tickets', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // টিকেট যে তৈরি করেছে
            $table->string('subject'); // টিকেটের বিষয়
            $table->enum('status', ['open', 'replied', 'closed'])->default('open'); // টিকেটের অবস্থা
            $table->enum('priority', ['low', 'medium', 'high'])->default('medium'); // গুরুত্ব (ঐচ্ছিক)
            $table->timestamp('last_reply_at')->nullable(); // শেষ রিপ্লাই কখন এসেছে
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('support_tickets');
    }
};
