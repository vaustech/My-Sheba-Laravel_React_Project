<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\AuditLog; // AuditLog মডেল ইম্পোর্ট করুন

class ActivityHistoryController extends Controller
{
    public function __construct()
    {
        // ✅ শুধুমাত্র লগইন করা ইউজারই এই রুটে এক্সেস পাবে
        $this->middleware('auth:api');
    }

    /**
     * Fetch the authenticated user's activity history.
     * GET /api/history
     */
    public function index(Request $request)
    {
        $user = Auth::user();

        // ✅ ইউজারের লগগুলো নতুন থেকে পুরনো ক্রমে নিয়ে আসুন
        // pagination ব্যবহার করা হয়েছে (প্রতি পৃষ্ঠায় ১৫টি রেকর্ড)
        $history = AuditLog::where('user_id', $user->id)
                            ->latest() // created_at অনুযায়ী ডিসেন্ডিং অর্ডার
                            ->paginate(15);

        return response()->json($history);
    }
}
