<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class TicketMessage extends Model
{
    use HasFactory;

    protected $fillable = [
        'support_ticket_id',
        'user_id',
        'message',
    ];

    // মেসেজটি যে টিকেট এর অংশ
    public function supportTicket()
    {
        return $this->belongsTo(SupportTicket::class);
    }

    // মেসেজটি যে ইউজার দিয়েছে
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}