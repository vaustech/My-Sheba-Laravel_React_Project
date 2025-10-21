<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon; // Carbon ইম্পোর্ট করুন

class DashboardController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    public function getDashboardData()
    {
        $user = Auth::user();
        
        // রিলেশনশিপ থেকে ডেটা লোড করুন
        $data = [
            'nid' => $user->nidDetail,
            'driving_licenses' => $user->drivingLicenses,
            'trade_licenses' => $user->tradeLicenses,
            'e_tin' => $user->eTinDetail,
            'notifications' => $this->generateNotifications($user) // নোটিফিকেশন জেনারেট করুন
            
        ];

        return response()->json($data);
    }

    /**
     * PDF  অনুযায়ী অ্যাকশন-ভিত্তিক নোটিফিকেশন জেনারেট করে
     */
    private function generateNotifications($user)
    {
        $notifications = [];

        foreach ($user->drivingLicenses as $license) {
            $expiry = Carbon::parse($license->expiry_date);
            $daysUntilExpiry = now()->diffInDays($expiry, false); // false দিলে নেগেটিভ ভ্যালু আসতে পারে

            if ($daysUntilExpiry <= 30 && $daysUntilExpiry >= 0) {
                $notifications[] = [
                    'id' => 'dl_' . $license->id,
                    'type' => 'warning', // warning টাইপ
                    'message' => "আপনার ড্রাইভিং লাইসেন্সের ({$license->license_number}) মেয়াদ {$daysUntilExpiry} দিন পর শেষ হবে। এখনই নবায়ন করুন।"
                ];
            } elseif ($daysUntilExpiry < 0) {
                 $notifications[] = [
                    'id' => 'dl_' . $license->id,
                    'type' => 'error', // error টাইপ
                    'message' => "আপনার ড্রাইভিং লাইসেন্সের ({$license->license_number}) মেয়াদ শেষ হয়ে গেছে।"
                ];
            }
        }
        
        // এখানে ট্রেড লাইসেন্সের জন্যও একই লজিক যোগ করা যাবে

        return $notifications;
    }
}