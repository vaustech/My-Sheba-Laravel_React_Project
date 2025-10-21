<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Sanctum\HasApiTokens;
use Tymon\JWTAuth\Contracts\JWTSubject;

// ✅ প্রয়োজনীয় মডেলগুলো ইম্পোর্ট করো
use App\Models\UserDocument;
use App\Models\NidDetail;
use App\Models\DrivingLicense;
use App\Models\TradeLicense;

class User extends Authenticatable implements JWTSubject
{
    use HasApiTokens, HasFactory, Notifiable;

    protected $fillable = [
        'name',
        'email',
        'password',
        'role',
    ];

    protected $hidden = [
        'password',
        'remember_token',
    ];

    protected $casts = [
        'email_verified_at' => 'datetime',
        'password' => 'hashed',
    ];

    /**
     * JWT Identifier
     */
    public function getJWTIdentifier()
    {
        return $this->getKey();
    }

    /**
     * JWT Custom Claims
     */
    public function getJWTCustomClaims()
    {
        return [];
    }

    /**
     * ✅ সম্পর্ক (Relationships)
     */

    // ১️⃣ ইউজারের NID ডিটেইল
    public function nidDetail()
    {
        return $this->hasOne(NidDetail::class);
    }

    // ২️⃣ ইউজারের ড্রাইভিং লাইসেন্স (একজন ইউজারের একাধিক থাকতে পারে)
    public function drivingLicenses()
    {
        return $this->hasMany(DrivingLicense::class);
    }

    // ৩️⃣ ইউজারের ট্রেড লাইসেন্স (একাধিক থাকতে পারে)
    public function tradeLicenses()
    {
        return $this->hasMany(TradeLicense::class);
    }

    // ৪️⃣ ইউজারের আপলোড করা ডকুমেন্ট (UserDocument)
    public function documents()
    {
        return $this->hasMany(UserDocument::class);
    }
    // ... অন্যান্য রিলেশনশিপের পর ...
public function eTinDetail() // সাধারণত একজন ইউজারের একটি TIN থাকে
{
    return $this->hasOne(ETinDetail::class);
}
// ইউজারের তৈরি করা সাপোর্ট টিকেট
public function supportTickets()
{
    return $this->hasMany(SupportTicket::class);
}

// ইউজারের পাঠানো টিকেট মেসেজ (যদিও সরাসরি দরকার নাও হতে পারে)
public function ticketMessages()
{
    return $this->hasMany(TicketMessage::class);
}
public function appointments()
{
    return $this->hasMany(Appointment::class);
}

}