<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\Appointment;
use App\Models\Service; // For filtering
use App\Models\User;    // For filtering
use Illuminate\Validation\Rule;

class AppointmentController extends Controller
{
    /**
     * Display a listing of appointments with filters.
     * GET /api/admin/appointments
     */
    public function index(Request $request)
    {
        $request->validate([
            'user_id' => 'nullable|integer|exists:users,id',
            'service_id' => 'nullable|integer|exists:services,id',
            'status' => ['nullable', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
            'date' => 'nullable|date_format:Y-m-d', // Filter by appointment date
            'per_page' => 'nullable|integer|min:5|max:100'
        ]);

        $query = Appointment::with(['user:id,name', 'service:id,name']); // Load user and service names

        // Apply filters
        if ($request->filled('user_id')) {
            $query->where('user_id', $request->user_id);
        }
        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }
        if ($request->filled('status')) {
            $query->where('status', $request->status);
        }
        if ($request->filled('date')) {
            $query->whereDate('appointment_time', $request->date);
        }

        $perPage = $request->input('per_page', 15);
        $appointments = $query->latest('appointment_time')->paginate($perPage);

        return response()->json($appointments);
    }

    /**
     * Update the status of the specified appointment.
     * PATCH /api/admin/appointments/{appointment}/status
     */
    public function updateStatus(Request $request, Appointment $appointment) // Use Route Model Binding
    {
        $validated = $request->validate([
            'status' => ['required', Rule::in(['pending', 'confirmed', 'completed', 'cancelled'])],
        ]);

        try {
            $appointment->update(['status' => $validated['status']]);

            // Notify user about status change (optional)
            // You can dispatch an event or send a notification here

            return response()->json([
                'message' => 'অ্যাপয়েন্টমেন্ট স্ট্যাটাস আপডেট করা হয়েছে।',
                'appointment' => $appointment->fresh()->load(['user:id,name', 'service:id,name']) // Return updated data with relations
            ]);
        } catch (\Exception $e) {
            \Log::error('Appointment Status Update Failed: ' . $e->getMessage());
            return response()->json(['error' => 'স্ট্যাটাস আপডেট করা সম্ভব হয়নি।'], 500);
        }
    }

    // You can add show, destroy methods if needed
    // public function show(Appointment $appointment) { ... }
    // public function destroy(Appointment $appointment) { ... }
}