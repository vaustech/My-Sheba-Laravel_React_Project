<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class AuditLog extends Model
{
    use HasFactory;

    // created_at ছাড়া অন্য কোনো timestamp নেই
    public $timestamps = false;

    // updated_at কলাম ব্যবহার বন্ধ করা
    const UPDATED_AT = null;

    protected $fillable = [
        'user_id',
        'action_type',
        'description',
        'ip_address',
        'user_agent',
        'created_at', // created_at fillable এ রাখলে ম্যানুয়ালি সেট করা যাবে
    ];

    /**
     * লগটির সাথে সম্পর্কিত ইউজার (যদি থাকে)
     */
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}