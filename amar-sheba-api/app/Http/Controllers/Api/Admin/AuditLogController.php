<?php

namespace App\Http\Controllers\Api\Admin; // Namespace ঠিক করুন

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\AuditLog; // AuditLog মডেল ইম্পোর্ট করুন
use App\Models\User; // User মডেল ইম্পোর্ট করুন (ফিল্টারিং এর জন্য)

class AuditLogController extends Controller
{
    /**
     * Display a listing of the audit logs with filtering and pagination.
     * GET /api/admin/audit-logs
     */
    public function index(Request $request)
    {
        // ভ্যালিডেশন (ঐচ্ছিক, তবে ভালো প্র্যাকটিস)
        $request->validate([
            'user_id' => 'nullable|integer|exists:users,id', // ইউজার আইডি দিয়ে ফিল্টার
            'action_type' => 'nullable|string|max:100', // অ্যাকশন টাইপ দিয়ে ফিল্টার
            'per_page' => 'nullable|integer|min:5|max:100' // প্রতি পৃষ্ঠায় কয়টি আইটেম
        ]);

        $query = AuditLog::with('user:id,name'); // ইউজারের আইডি ও নাম লোড করুন

        // ইউজার আইডি অনুযায়ী ফিল্টার
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        // অ্যাকশন টাইপ অনুযায়ী ফিল্টার (Partial match)
        if ($request->filled('action_type')) {
            $query->where('action_type', 'like', '%' . $request->action_type . '%');
        }

        $perPage = $request->input('per_page', 15); // ডিফল্ট ১৫টি

        $logs = $query->latest('created_at') // নতুন লগ আগে দেখাবে
                      ->paginate($perPage);

        // API রেসপন্সের সাথে ফিল্টারিংয়ের জন্য প্রয়োজনীয় ডেটাও পাঠাতে পারেন (যেমন সব ইউজার বা অ্যাকশন টাইপের তালিকা)
        // $allUsers = User::select('id', 'name')->get();
        // $actionTypes = AuditLog::distinct()->pluck('action_type');

        return response()->json($logs);
        /* বিকল্প: অতিরিক্ত ডেটা সহ পাঠানো
        return response()->json([
            'logs' => $logs,
            'filters' => [
                 'users' => $allUsers,
                 'action_types' => $actionTypes
            ]
        ]); */
    }

    // show, destroy মেথড প্রয়োজন অনুযায়ী যোগ করা যেতে পারে
}