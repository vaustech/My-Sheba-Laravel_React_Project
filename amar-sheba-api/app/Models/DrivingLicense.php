<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class DrivingLicense extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id',
        'license_number',
        'issue_date',
        'expiry_date',
        'vehicle_type', // যদি PDF বা নির্দেশনায় থাকে
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
