<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth; // Auth ইম্পোর্ট করুন
use Symfony\Component\HttpFoundation\Response;

class IsAdmin
{
    /**
     * Handle an incoming request.
     */
    public function handle(Request $request, Closure $next): Response
    {
        // চেক করুন ইউজার লগইন করা আছে কিনা এবং তার role 'admin' কিনা
        if (Auth::check() && Auth::user()->role === 'admin') {
            return $next($request); // অ্যাডমিন হলে রিকোয়েস্টটি চালিয়ে যেতে দিন
        }

        // অ্যাডমিন না হলে Forbidden রেসপন্স দিন
        return response()->json(['error' => 'Forbidden - Admin access required.'], 403);
    }
}