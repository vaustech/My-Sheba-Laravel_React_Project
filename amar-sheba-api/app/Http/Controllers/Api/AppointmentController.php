<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Appointment;
use App\Models\AvailableSlot;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AppointmentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    /**
     * Display a listing of the authenticated user's appointments.
     * GET /api/appointments
     */
    public function index(Request $request)
    {
        $user = Auth::user();
        $appointments = $user->appointments()
                             ->with('service:id,name') // Load service name
                             ->latest('appointment_time') // নতুন অ্যাপয়েন্টমেন্ট আগে
                             ->paginate(10); // পেজিনেশন

        return response()->json($appointments);
    }

    /**
     * Store a new appointment for the authenticated user.
     * POST /api/appointments
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|integer|exists:services,id',
            'available_slot_id' => 'required|integer|exists:available_slots,id',
            'notes' => 'nullable|string|max:500',
        ]);

        $user = Auth::user();
        $slot = AvailableSlot::find($validated['available_slot_id']);

        // --- Validation Checks ---
        // 1. Check if the slot belongs to the selected service
        if (!$slot || $slot->service_id != $validated['service_id']) {
            return response()->json(['error' => 'নির্বাচিত স্লটটি এই সেবার জন্য নয়।'], 422); // Unprocessable Entity
        }
        // 2. Check if the slot is in the future
        if (Carbon::parse($slot->start_time)->isPast()) {
             return response()->json(['error' => 'এই সময়টি ইতিমধ্যে পার হয়ে গেছে।'], 422);
        }
        // 3. Check if the slot is already booked (assuming capacity 1)
        $existingAppointment = Appointment::where('available_slot_id', $slot->id)
                                          ->whereIn('status', ['pending', 'confirmed'])
                                          ->exists();
        if ($existingAppointment) {
            return response()->json(['error' => 'দুঃখিত, এই স্লটটি ইতিমধ্যে বুক করা হয়ে গেছে।'], 409); // Conflict
        }
        // 4. Check if the user already has an appointment at the same time (optional)
        // ...

        // --- Create Appointment ---
        try {
            DB::beginTransaction();

            $appointment = Appointment::create([
                'user_id' => $user->id,
                'service_id' => $validated['service_id'],
                'available_slot_id' => $validated['available_slot_id'],
                'appointment_time' => $slot->start_time, // Copy start time from slot
                'status' => 'pending', // Or 'confirmed' directly if no admin approval needed
                'notes' => $validated['notes'] ?? null,
            ]);

            // Optional: Reduce slot capacity or mark as booked if capacity logic is complex
            // If capacity is always 1, the `whereDoesntHave` check in slot listing is enough

            DB::commit();

            // Notify Admin (optional)
            // ... dispatch event or send notification ...

             // Add Audit Log
             \App\Models\AuditLog::create([
                 'user_id' => $user->id,
                 'action_type' => 'APPOINTMENT_BOOKED',
                 'description' => "Booked appointment #{$appointment->id} for service #{$appointment->service_id} at {$appointment->appointment_time->format('Y-m-d H:i')}",
                 'ip_address' => $request->ip(),
                 'user_agent' => $request->userAgent(),
             ]);


            return response()->json($appointment->load('service:id,name'), 201);

        } catch (\Exception $e) {
            DB::rollBack();
            \Log::error('Appointment Booking Failed: ' . $e->getMessage());
            return response()->json(['error' => 'অ্যাপয়েন্টমেন্ট বুকিং ব্যর্থ হয়েছে।'], 500);
        }
    }

    // Optional: show, cancel methods
    // public function show(Appointment $appointment) { ... check ownership ... }
    // public function cancel(Appointment $appointment) { ... check ownership & status ... }
}