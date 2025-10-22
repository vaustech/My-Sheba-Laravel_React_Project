<?php

use Illuminate\Http\Request;
use Illuminate\Support\Facades\Route;

// ====================
// 🧩 Controllers Import
// ====================
// --- User Facing ---
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\DashboardController;
use App\Http\Controllers\Api\UserDocumentController;
use App\Http\Controllers\Api\ActivityHistoryController;
use App\Http\Controllers\Api\SupportTicketController;
use App\Http\Controllers\Api\ServiceController; // User Service List
use App\Http\Controllers\Api\AvailableSlotController; // User Slot List
use App\Http\Controllers\Api\AppointmentController; // User Appointment actions

// --- Admin Facing ---
use App\Http\Controllers\Api\Admin\UserController as AdminUserController;
use App\Http\Controllers\Api\Admin\SupportTicketController as AdminSupportTicketController;
use App\Http\Controllers\Api\Admin\AuditLogController as AdminAuditLogController;
use App\Http\Controllers\Api\Admin\AppointmentController as AdminAppointmentController;
use App\Http\Controllers\Api\Admin\AnalyticsController as AdminAnalyticsController;
use App\Http\Controllers\Api\Admin\ServiceController as AdminServiceController;
use App\Http\Controllers\Api\Admin\AvailableSlotController as AdminAvailableSlotController;

// ====================
// 🔐 Public Routes (No Auth Required)
// ====================
Route::controller(AuthController::class)->group(function () {
    Route::post('register', 'register');
    Route::post('login', 'login');         // Step 1: Password Check -> Send OTP
    Route::post('verify-otp', 'verifyOtp'); // Step 2: Verify OTP -> Get Token
});

// ====================
// 🔒 Protected User Routes (Requires Authentication)
// ====================
Route::middleware('auth:api')->group(function () {

    // --- Auth ---
    Route::post('logout', [AuthController::class, 'logout']);
    Route::post('refresh', [AuthController::class, 'refresh']);
    Route::get('me', [AuthController::class, 'me']);

    // --- Dashboard ---
    Route::get('dashboard', [DashboardController::class, 'getDashboardData']); // Correct method

    // --- Document Wallet ---
    Route::get('documents', [UserDocumentController::class, 'index']);
    Route::post('documents', [UserDocumentController::class, 'store']);
    Route::get('documents/{id}/preview', [UserDocumentController::class, 'preview']); // Correct parameter {id}
    Route::patch('documents/{id}', [UserDocumentController::class, 'update']); // Use PATCH or PUT for update
    Route::delete('documents/{id}', [UserDocumentController::class, 'destroy']); // Correct parameter {id}

    // --- Support Tickets (User) ---
    Route::get('support-tickets', [SupportTicketController::class, 'index']);
    Route::post('support-tickets', [SupportTicketController::class, 'store']);
    Route::get('support-tickets/{supportTicket}', [SupportTicketController::class, 'show']); // Uses Route Model Binding
    Route::post('support-tickets/{supportTicket}/reply', [SupportTicketController::class, 'reply']);

    // --- Activity History ---
    Route::get('history', [ActivityHistoryController::class, 'index']);

    // --- Appointment Booking (User) ---
    Route::get('services', [ServiceController::class, 'index']); // List available services
    Route::get('services/{service}/slots', [AvailableSlotController::class, 'index']); // List slots for service/date
    Route::post('appointments', [AppointmentController::class, 'store']); // Book appointment
    Route::get('appointments', [AppointmentController::class, 'index']); // List user's appointments
    // Route::patch('appointments/{appointment}/cancel', [AppointmentController::class, 'cancel']); // Optional cancel route

});

// ====================
// 🧑‍💼 Admin Routes (Protected for Admins)
// ====================
Route::middleware(['auth:api', 'admin'])->prefix('admin')->group(function () {

    // --- User Management ---
    Route::get('users', [AdminUserController::class, 'index']);
    Route::delete('users/{user}', [AdminUserController::class, 'destroy']); // Uses Route Model Binding
    // Add show, update routes later if needed

    // --- Service Management ---
    // apiResource is likely OK here if Controller follows convention
    Route::apiResource('services', AdminServiceController::class);

    // --- Available Slot Management ---
    Route::get('slots', [AdminAvailableSlotController::class, 'index']);
    Route::post('slots', [AdminAvailableSlotController::class, 'store']);
    Route::delete('slots/{availableSlot}', [AdminAvailableSlotController::class, 'destroy']); // Uses Route Model Binding

    // --- Appointment Management ---
    Route::get('appointments', [AdminAppointmentController::class, 'index']);
    Route::patch('appointments/{appointment}/status', [AdminAppointmentController::class, 'updateStatus']); // Uses Route Model Binding
    // Add show route later if needed

    // --- Support Ticket Management ---
    Route::get('support-tickets', [AdminSupportTicketController::class, 'index']);
    Route::get('support-tickets/{supportTicket}', [AdminSupportTicketController::class, 'show']); // Uses Route Model Binding
    Route::post('support-tickets/{supportTicket}/reply', [AdminSupportTicketController::class, 'reply']);
    Route::patch('support-tickets/{supportTicket}/status', [AdminSupportTicketController::class, 'updateStatus']);

    // --- Audit Logs ---
    Route::get('audit-logs', [AdminAuditLogController::class, 'index']);

    // --- Analytics ---
    Route::get('analytics/summary', [AdminAnalyticsController::class, 'summary']); // Correct route and method

}); // End Admin Group

// *** Extra closing brace removed ***