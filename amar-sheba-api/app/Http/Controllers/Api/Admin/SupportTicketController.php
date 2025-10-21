<?php

namespace App\Http\Controllers\Api\Admin; // Namespace ঠিক করুন

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\SupportTicket; // মডেল ইম্পোর্ট করুন
use App\Models\TicketMessage; // মডেল ইম্পোর্ট করুন
use Illuminate\Support\Facades\Auth; // Auth ইম্পোর্ট করুন
use Illuminate\Validation\Rule; // Rule ইম্পোর্ট করুন

class SupportTicketController extends Controller
{
    // এই কন্ট্রোলারের সব মেথডের জন্য অ্যাডমিন অথেনটিকেশন লাগবে
    // যা আমরা রুটে মিডলওয়্যার দিয়ে নিশ্চিত করবো

    /**
     * Display a listing of all support tickets (or filtered).
     * GET /api/admin/support-tickets
     */
    public function index(Request $request)
    {
        $request->validate([
            'status' => ['nullable', Rule::in(['open', 'replied', 'closed'])], // স্ট্যাটাস অনুযায়ী ফিল্টার
        ]);

        $query = SupportTicket::with('user:id,name'); // ইউজারের আইডি ও নাম লোড করুন

        // স্ট্যাটাস অনুযায়ী ফিল্টার করুন
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }

        $tickets = $query->latest('updated_at') // শেষ আপডেট অনুযায়ী সাজান
                         ->paginate(15); // পেজিনেশন

        return response()->json($tickets);
    }

    /**
     * Display the specified support ticket with all messages.
     * GET /api/admin/support-tickets/{supportTicket}
     */
    public function show(SupportTicket $supportTicket)
    {
        // টিকেট এবং এর সাথে সম্পর্কিত সব মেসেজ লোড করুন (ইউজার তথ্য সহ)
        $ticketWithMessages = $supportTicket->load(['user:id,name', 'messages.user:id,name,role']);

        return response()->json($ticketWithMessages);
    }

    /**
     * Add admin's reply to a support ticket.
     * POST /api/admin/support-tickets/{supportTicket}/reply
     */
    public function reply(Request $request, SupportTicket $supportTicket)
    {
        // অ্যাডমিন বন্ধ করা টিকেটেও রিপ্লাই দিতে পারবে (যদি প্রয়োজন হয়)
        // if ($supportTicket->status === 'closed') {
        //     return response()->json(['error' => 'Cannot reply to a closed ticket.'], 403);
        // }

        $request->validate([
            'message' => 'required|string|min:1',
        ]);

        $adminUser = Auth::user(); // অ্যাডমিনের তথ্য

        try {
            // নতুন মেসেজ যোগ করুন
            $message = $supportTicket->messages()->create([
                'user_id' => $adminUser->id, // অ্যাডমিনের আইডি
                'message' => $request->message,
            ]);

            // টিকেট স্ট্যাটাস 'replied' করুন এবং লাস্ট রিপ্লাই টাইম আপডেট করুন
            $supportTicket->update([
                'status' => 'replied',
                'last_reply_at' => now()
            ]);

            // এখানে ইউজারকে ইমেইল নোটিফিকেশন পাঠানো যেতে পারে যে অ্যাডমিন রিপ্লাই দিয়েছে

            return response()->json($message->load('user:id,name,role'), 201);

        } catch (\Exception $e) {
            \Log::error('Admin Support Ticket Reply Failed: ' . $e->getMessage());
            return response()->json(['error' => 'রিপ্লাই যোগ করা সম্ভব হয়নি।'], 500);
        }
    }

    /**
     * Update the status of a support ticket.
     * PATCH /api/admin/support-tickets/{supportTicket}/status
     */
    public function updateStatus(Request $request, SupportTicket $supportTicket)
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['open', 'replied', 'closed'])],
        ]);

        try {
            $supportTicket->update(['status' => $validated['status']]);

             // স্ট্যাটাস closed হলে ইউজারকে নোটিফাই করা যেতে পারে

            return response()->json([
                'message' => 'টিকেটের স্ট্যাটাস আপডেট করা হয়েছে।',
                'ticket' => $supportTicket->fresh() // আপডেট করা তথ্য
            ]);
        } catch (\Exception $e) {
             \Log::error('Support Ticket Status Update Failed: ' . $e->getMessage());
             return response()->json(['error' => 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।'], 500);
        }
    }
}