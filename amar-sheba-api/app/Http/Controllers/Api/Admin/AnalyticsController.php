<?php

namespace App\Http\Controllers\Api\Admin; // Namespace ঠিক করুন

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User; // User মডেল ইম্পোর্ট করুন
use App\Models\UserDocument; // UserDocument মডেল ইম্পোর্ট করুন
use App\Models\SupportTicket; // SupportTicket মডেল ইম্পোর্ট করুন
use Illuminate\Support\Facades\DB; // DB facade ব্যবহার করবো গণনার জন্য

class AnalyticsController extends Controller
{
    /**
     * Get summary analytics data for the admin dashboard.
     * GET /api/admin/analytics/summary
     */
    public function summary()
    {
        try {
            // মোট ব্যবহারকারী (অ্যাডমিন বাদে)
            $totalUsers = User::where('role', '!=', 'admin')->count();

            // মোট আপলোড করা ডকুমেন্ট
            $totalDocuments = UserDocument::count();

            // সাপোর্ট টিকেট গণনা (স্ট্যাটাস অনুযায়ী)
            $ticketCounts = SupportTicket::select('status', DB::raw('count(*) as total'))
                                         ->groupBy('status')
                                         ->pluck('total', 'status') // ফলাফলকে 'status' => count ফরম্যাটে আনবে
                                         ->all(); // কালেকশনকে অ্যারেতে রূপান্তর

            // ডেটা প্রস্তুত করুন
            $summaryData = [
                'totalUsers' => $totalUsers,
                'totalDocuments' => $totalDocuments,
                'supportTickets' => [
                    'open' => $ticketCounts['open'] ?? 0, // 'open' স্ট্যাটাসের টিকেট সংখ্যা
                    'replied' => $ticketCounts['replied'] ?? 0, // 'replied' স্ট্যাটাসের টিকেট সংখ্যা
                    'closed' => $ticketCounts['closed'] ?? 0, // 'closed' স্ট্যাটাসের টিকেট সংখ্যা
                    'total' => array_sum($ticketCounts), // মোট টিকেট সংখ্যা
                ],
                // ভবিষ্যতে আরও অ্যানালিটিক্স যোগ করা যেতে পারে
                // 'totalAppointments' => Appointment::count(),
            ];

            return response()->json($summaryData);

        } catch (\Exception $e) {
            \Log::error('Analytics Summary Failed: ' . $e->getMessage());
            return response()->json(['error' => 'অ্যানালিটিক্স ডেটা লোড করা সম্ভব হয়নি।'], 500);
        }
    }
}