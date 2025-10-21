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
        Schema::create('audit_logs', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->nullable()->constrained()->onDelete('set null'); // কোন ইউজার (ডিলিট হলে null হবে)
            $table->string('action_type'); // কাজের ধরন (e.g., 'DOCUMENT_UPLOADED', 'LOGIN_SUCCESS', 'LICENSE_RENEWED')
            $table->string('description')->nullable(); // কাজের সংক্ষিপ্ত বিবরণ (e.g., 'Uploaded NID.pdf', 'Renewed license DK-123')
            $table->ipAddress('ip_address')->nullable(); // ইউজারের আইপি অ্যাড্রেস
            $table->text('user_agent')->nullable(); // ব্রাউজারের তথ্য
            $table->timestamp('created_at')->useCurrent(); // কখন কাজটি হয়েছে (আপডেট হবে না)
        });
    }

    /**
     * Reverse the migrations.
     */
    public function down(): void
    {
        Schema::dropIfExists('audit_logs');
    }
};
