<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;
use Illuminate\Support\Facades\Auth;

class UserController extends Controller
{
    /**
     * Display a listing of users.
     * GET /api/admin/users
     */
    public function index()
    {
        // অ্যাডমিন ছাড়া অন্য সব ইউজার দেখান (নিজেকে বাদ দিয়ে)
        $users = User::where('id', '!=', Auth::id())
                     ->latest()
                     ->paginate(15);

        return response()->json($users);
    }

    /**
     * Remove the specified user.
     * DELETE /api/admin/users/{user}
     */
    public function destroy(User $user)
    {
        // অ্যাডমিন নিজেকে ডিলিট করতে পারবে না
        if ($user->id === Auth::id()) {
            return response()->json(['error' => 'You cannot delete your own account.'], 403);
        }

        // চাইলে নিচের লাইন আনকমেন্ট করে অন্য অ্যাডমিনকে ডিলিট করা বন্ধ করতে পারো
        /*
        if ($user->role === 'admin') {
            return response()->json(['error' => 'Cannot delete another admin.'], 403);
        }
        */

        try {
            $userName = $user->name;
            $user->delete();

            // অডিট লগ এখানে যোগ করা যেতে পারে ভবিষ্যতে
            // AuditLog::create([...]);

            return response()->json(['message' => "User '{$userName}' deleted successfully."]);
        } catch (\Exception $e) {
            \Log::error('User Deletion Failed: ' . $e->getMessage());
            return response()->json(['error' => 'Failed to delete user.'], 500);
        }
    }
}
