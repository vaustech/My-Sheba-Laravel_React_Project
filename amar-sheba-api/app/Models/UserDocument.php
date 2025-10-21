<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class UserDocument extends Model
{
    use HasFactory;

    // এই ফিল্ডগুলো mass assignable হবে
    protected $fillable = [
        'user_id',
        'title',
        'category',
        'file_name',
        'file_path',
    ];

    /**
     * ডকুমেন্টের মালিক ইউজার
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
