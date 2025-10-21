<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\DrivingLicense; // মডেল ইম্পোর্ট করুন
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Auth ইম্পোর্ট করুন
use Carbon\Carbon; // Carbon ইম্পোর্ট করুন

class DrivingLicenseController extends Controller
{
    public function __construct()
    {
        // এই কন্ট্রোলারের সব মেথডের জন্য লগইন বাধ্যতামূলক
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the resource.
     * (আমরা এটি ড্যাশবোর্ড কন্ট্রোলারে ব্যবহার করছি, তাই এখানে প্রয়োজন নাও হতে পারে)
     */
    // public function index()
    // {
    //     //
    // }

    /**
     * Display the specified resource.
     * (নির্দিষ্ট লাইসেন্স দেখানোর জন্য লাগতে পারে)
     */
    public function show(DrivingLicense $drivingLicense)
    {
        // নিশ্চিত করুন যে ইউজার শুধু নিজের লাইসেন্স দেখতে পাচ্ছে
        if ($drivingLicense->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }
        return response()->json($drivingLicense);
    }


    /**
     * সিমুলেটেড নবায়ন প্রক্রিয়া
     * POST /api/driving-licenses/{drivingLicense}/renew
     */
    public function renew(Request $request, DrivingLicense $drivingLicense)
    {
        // ধাপ ১: ভ্যালিডেশন - ইউজার কি এই লাইসেন্সের মালিক?
        if ($drivingLicense->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden - You do not own this license.'], 403);
        }

        // ধাপ ২: সিমুলেশন - মেয়াদ ৫ বছর বাড়িয়ে দিন এবং স্ট্যাটাস 'Active' করুন
        try {
            $newExpiryDate = Carbon::parse($drivingLicense->expiry_date)->addYears(5);
            
            $drivingLicense->update([
                'expiry_date' => $newExpiryDate,
                'status' => 'Active'
            ]);

            // আপডেট করা লাইসেন্সের তথ্য রিটার্ন করুন
            return response()->json([
                'message' => 'লাইসেন্স সফলভাবে নবায়ন করা হয়েছে (সিমুলেশন)।',
                'license' => $drivingLicense->fresh() // ডাটাবেস থেকে সর্বশেষ তথ্য লোড করে পাঠান
            ]);

        } catch (\Exception $e) {
            // কোনো কারণে আপডেট ফেইল হলে এরর দিন
            \Log::error('License Renewal Failed: ' . $e->getMessage()); // এরর লগ করুন
            return response()->json(['error' => 'নবায়ন প্রক্রিয়া ব্যর্থ হয়েছে।'], 500);
        }
    }

    // store, update, destroy মেথডগুলো প্রয়োজন অনুযায়ী পরে যোগ করা যাবে
}