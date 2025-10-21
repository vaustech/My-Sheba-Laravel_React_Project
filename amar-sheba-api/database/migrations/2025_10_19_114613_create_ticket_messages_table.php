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
        Schema::create('ticket_messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('support_ticket_id')->constrained()->onDelete('cascade'); // কোন টিকেটের মেসেজ
            $table->foreignId('user_id')->constrained()->onDelete('cascade'); // মেসেজটি কে দিয়েছে (ইউজার বা অ্যাডমিন)
            $table->text('message'); // মেসেজের কন্টেন্ট
            $table->timestamps();
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('ticket_messages');
    }
};
