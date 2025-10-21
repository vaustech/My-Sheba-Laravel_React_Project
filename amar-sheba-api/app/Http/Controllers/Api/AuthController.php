<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Hash;
use App\Models\User;

class AuthController extends Controller
{
    public function __construct()
    {
        // login এবং register ছাড়া বাকি সব রুটে auth:api middleware প্রযোজ্য
        $this->middleware('auth:api', ['except' => ['login', 'register']]);
    }

    /**
     * 🔹 Login user and return token with role info
     */
    public function login(Request $request)
    {
        $credentials = $request->only('email', 'password');

        if (!$token = Auth::guard('api')->attempt($credentials)) {
            return response()->json(['error' => 'ইমেইল বা পাসওয়ার্ড সঠিক নয়।'], 401);
        }

        return $this->respondWithToken($token);
    }

    /**
     * 🔹 Register a new user (default role: user)
     */
    public function register(Request $request)
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:6|confirmed',
        ]);

        $user = User::create([
            'name' => $request->name,
            'email' => $request->email,
            'password' => Hash::make($request->password),
            'role' => 'user', // ✅ নতুন ইউজারের ডিফল্ট role
        ]);

        return response()->json(['message' => 'রেজিস্ট্রেশন সম্পন্ন হয়েছে। এখন লগইন করুন।']);
    }

    /**
     * 🔹 Get the authenticated user's info (with role)
     */
    public function me()
    {
        $user = Auth::guard('api')->user();

        return response()->json([
            'id'    => $user->id,
            'name'  => $user->name,
            'email' => $user->email,
            'role'  => $user->role, // ✅ role পাঠানো হচ্ছে
        ]);
    }

    /**
     * 🔹 Logout user (invalidate token)
     */
    public function logout()
    {
        Auth::guard('api')->logout();

        return response()->json(['message' => 'সফলভাবে লগআউট হয়েছে।']);
    }

    /**
     * 🔹 Refresh a JWT token
     */
    public function refresh()
    {
        return $this->respondWithToken(Auth::guard('api')->refresh());
    }

    /**
     * 🔹 Return token + user info in response
     */
    protected function respondWithToken($token)
    {
        $user = Auth::guard('api')->user();

        return response()->json([
            'access_token' => $token,
            'token_type'   => 'bearer',
            'expires_in'   => Auth::guard('api')->factory()->getTTL() * 60,
            'user' => [
                'id'    => $user->id,
                'name'  => $user->name,
                'email' => $user->email,
                'role'  => $user->role, // ✅ React ফ্রন্টএন্ডের জন্য role পাঠানো হচ্ছে
            ],
        ]);
    }
}
