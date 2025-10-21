<?php

namespace App\Http\Middleware;

use Illuminate\Auth\Middleware\Authenticate as Middleware;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class Authenticate extends Middleware
{
    /**
     * Handle unauthenticated users.
     */
    protected function redirectTo(Request $request): ?string
    {
        // যদি রিকোয়েস্ট JSON আশা করে (যেমন API থেকে আসে)
        if ($request->expectsJson()) {
            // redirect না করে সরাসরি JSON response ফেরত দাও
            return null;
        }

        // যদি কোনো কারণে ওয়েব রুটে আসে, তাহলে null রিটার্ন করো (redirect করবে না)
        return null;
    }

    /**
     * Override unauthenticated response for APIs.
     */
    protected function unauthenticated($request, array $guards)
    {
        // সব ধরনের unauthorized অ্যাক্সেসে একটি consistent JSON রেসপন্স দেবে
        abort(response()->json([
            'message' => 'Unauthorized: Please login again or provide a valid token.',
            'status'  => Response::HTTP_UNAUTHORIZED
        ], Response::HTTP_UNAUTHORIZED));
    }
}
