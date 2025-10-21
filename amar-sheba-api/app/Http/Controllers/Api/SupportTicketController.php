<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\SupportTicket;
use App\Models\TicketMessage;
use Illuminate\Support\Facades\DB; // ট্রানজেকশনের জন্য

class SupportTicketController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the user's support tickets.
     * GET /api/support-tickets
     */
    public function index()
    {
        $user = Auth::user();
        $tickets = $user->supportTickets()
                        ->with('messages') // মেসেজগুলো লোড করুন (প্রথম মেসেজ দেখাতে)
                        ->latest('updated_at') // শেষ আপডেট অনুযায়ী সাজান
                        ->paginate(10);

        return response()->json($tickets);
    }

    /**
     * Store a new support ticket and its initial message.
     * POST /api/support-tickets
     */
    public function store(Request $request)
    {
        $request->validate([
            'subject' => 'required|string|max:255',
            'message' => 'required|string|min:10',
            'priority' => 'sometimes|in:low,medium,high', // ঐচ্ছিক
        ]);

        $user = Auth::user();

        // ডাটাবেস ট্রানজেকশন ব্যবহার করুন যাতে টিকেট ও মেসেজ একসাথে তৈরি হয়
        try {
            DB::beginTransaction();

            // টিকেট তৈরি
            $ticket = SupportTicket::create([
                'user_id' => $user->id,
                'subject' => $request->subject,
                'priority' => $request->priority ?? 'medium', // ডিফল্ট 'medium'
                'status' => 'open', // নতুন টিকেট সবসময় open থাকবে
            ]);

            // প্রথম মেসেজ তৈরি
            $ticket->messages()->create([
                'user_id' => $user->id,
                'message' => $request->message,
            ]);

            DB::commit();

            return response()->json($ticket->load('messages'), 201); // তৈরি হওয়া টিকেট ও মেসেজ রিটার্ন করুন

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Support Ticket Creation Failed: ' . $e->getMessage());
            return response()->json(['error' => 'টিকেট তৈরি করা সম্ভব হয়নি।'], 500);
        }
    }

    /**
     * Display the specified support ticket with all its messages.
     * GET /api/support-tickets/{supportTicket}
     */
    public function show(SupportTicket $supportTicket)
    {
        // নিশ্চিত করুন ইউজার নিজের টিকেট দেখছে
        if ($supportTicket->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

        // টিকেট এবং এর সাথে সম্পর্কিত সব মেসেজ লোড করুন (ইউজার তথ্য সহ)
        $ticketWithMessages = $supportTicket->load(['messages.user:id,name,role']); // শুধু প্রয়োজনীয় ইউজার তথ্য নিন

        return response()->json($ticketWithMessages);
    }

     /**
     * Add a reply to an existing support ticket.
     * POST /api/support-tickets/{supportTicket}/reply
     */
    public function reply(Request $request, SupportTicket $supportTicket)
    {
         // নিশ্চিত করুন ইউজার নিজের টিকেটে রিপ্লাই দিচ্ছে
        if ($supportTicket->user_id !== Auth::id()) {
            return response()->json(['error' => 'Forbidden'], 403);
        }

         // অ্যাডমিন বন্ধ করে দিলে ইউজার রিপ্লাই দিতে পারবে না
         if ($supportTicket->status === 'closed') {
             return response()->json(['error' => 'এই টিকেটটি বন্ধ করে দেওয়া হয়েছে।'], 403);
         }

        $request->validate([
            'message' => 'required|string|min:1',
        ]);

        $user = Auth::user();

        try {
            // নতুন মেসেজ যোগ করুন
            $message = $supportTicket->messages()->create([
                'user_id' => $user->id,
                'message' => $request->message,
            ]);

            // টিকেট স্ট্যাটাস 'open' করুন (যদি ইউজার রিপ্লাই দেয়) এবং লাস্ট রিপ্লাই টাইম আপডেট করুন
            $supportTicket->update([
                 'status' => 'open',
                 'last_reply_at' => now()
             ]);

            // এখানে অ্যাডমিনকে নোটিফাই করার ইভেন্ট ডিসপ্যাচ করা যেতে পারে

            return response()->json($message->load('user:id,name,role'), 201);

        } catch (\Exception $e) {
             \Log::error('Support Ticket Reply Failed: ' . $e->getMessage());
             return response()->json(['error' => 'রিপ্লাই যোগ করা সম্ভব হয়নি।'], 500);
        }
    }


    // ইউজার টিকেট close করতে চাইলে একটি মেথড যোগ করা যেতে পারে
    // public function close(SupportTicket $supportTicket) { ... }

}