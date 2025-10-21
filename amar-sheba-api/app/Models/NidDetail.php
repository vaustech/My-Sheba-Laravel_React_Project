<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class NidDetail extends Model
{
    use HasFactory;

    // যেসব কলাম mass assign করা যাবে
    protected $fillable = [
        'user_id',
        'nid_number',
        'date_of_birth',
        'full_name_bn',
        'father_name',
        'mother_name',
        'address',
    ];

    // ঐচ্ছিকভাবে, যদি ইউজারের সাথে সম্পর্ক থাকে
    public function user()
    {
        return $this->belongsTo(User::class);
    }
}
