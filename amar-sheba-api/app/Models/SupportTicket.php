<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class SupportTicket extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'subject',
        'status',
        'priority',
        'last_reply_at',
    ];

    // ইউজার যে টিকেট তৈরি করেছে
    public function user()
    {
        return $this->belongsTo(User::class);
    }

    // টিকেটের মেসেজগুলো
    public function messages()
    {
        return $this->hasMany(TicketMessage::class);
    }
}