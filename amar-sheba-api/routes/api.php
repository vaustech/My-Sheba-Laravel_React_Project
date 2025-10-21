<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ====================
// 🧩 Controllers Import
// ====================
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserDocumentController;
use App\Http\Controllers\Api\DrivingLicenseController;
use App\Http\Controllers\Api\ActivityHistoryController;
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\Admin\AvailableSlotController as AdminAvailableSlotController;
// ====================
// 🔐 Public Routes (No Auth Required)
// ====================
Route::post('login', [AuthController::class, 'login']);
Route::post('register', [AuthController::class, 'register']);

// ====================
// 🔒 Protected Routes (Requires Authentication)
// ====================
Route::middleware('auth:api')->group(function () {
    // --- Auth Routes ---
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);

    // --- Dashboard Routes ---
    Route::get('dashboard', [DashboardController::class, 'getDashboardData']);

    // --- Document Wallet Routes ---
    Route::get('documents/{id}/preview', [UserDocumentController::class, 'preview']);
    Route::apiResource('documents', UserDocumentController::class)
         ->only(['index', 'store', 'update', 'destroy']);

    // --- Driving License Routes ---
    Route::post('driving-licenses/{drivingLicense}/renew', [DrivingLicenseController::class, 'renew']);
    Route::get('driving-licenses/{drivingLicense}', [DrivingLicenseController::class, 'show']);

    // --- Activity History ---
    Route::get('history', [ActivityHistoryController::class, 'index']);
});

// ====================
// 👑 Admin Routes (Requires Authentication & Admin Role)
// ====================
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {
    // User Management Routes
    Route::get('users', [AdminUserController::class, 'index']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']);
    // ভবিষ্যতে দরকার হলে নিচেরগুলোও যোগ করতে পারো:
    // Route::get('users/{user}', [AdminUserController::class, 'show']);
    // Route::patch('users/{user}/block', [AdminUserController::class, 'block']);

// ✉️ Support Ticket Routes (User)
    Route::get('support-tickets', [SupportTicketController::class, 'index']);
    Route::post('support-tickets', [SupportTicketController::class, 'store']);
    Route::get('support-tickets/{supportTicket}', [SupportTicketController::class, 'show']);
    Route::post('support-tickets/{supportTicket}/reply', [SupportTicketController::class, 'reply']);
    // Route::patch('support-tickets/{supportTicket}/close', [SupportTicketController::class, 'close']); // পরে যোগ করা যাবে



// ✉️ Support Ticket Management
    Route::get('support-tickets', [AdminSupportTicketController::class, 'index']); // সব টিকেট দেখুন
    Route::get('support-tickets/{supportTicket}', [AdminSupportTicketController::class, 'show']); // নির্দিষ্ট টিকেট দেখুন
    Route::post('support-tickets/{supportTicket}/reply', [AdminSupportTicketController::class, 'reply']); // রিপ্লাই দিন
    Route::patch('support-tickets/{supportTicket}/status', [AdminSupportTicketController::class, 'updateStatus']); // স্ট্যাটাস পরিবর্তন করুন

// 📜 Audit Log Route
    Route::get('audit-logs', [AdminAuditLogController::class, 'index']);
    

    // 🗓️ Appointment Management
    Route::get('appointments', [AdminAppointmentController::class, 'index']);
    Route::patch('appointments/{appointment}/status', [AdminAppointmentController::class, 'updateStatus']);
    // Route::get('appointments/{appointment}', [AdminAppointmentController::class, 'show']); // পরে যোগ করা যেতে পারে
    // 📊 Analytics Routes
    Route::get('analytics/summary', [AdminAnalyticsController::class, 'summary']);
    // 🛠️ Service Management
    Route::apiResource('services', AdminServiceController::class);

    // ⏰ Available Slot Management
    Route::get('slots', [AdminAvailableSlotController::class, 'index']);
    Route::post('slots', [AdminAvailableSlotController::class, 'store']);
    Route::delete('slots/{availableSlot}', [AdminAvailableSlotController::class, 'destroy']);
});