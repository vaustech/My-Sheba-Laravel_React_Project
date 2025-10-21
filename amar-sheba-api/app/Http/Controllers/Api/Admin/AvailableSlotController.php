<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\AvailableSlot;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Carbon\Carbon;

class AvailableSlotController extends Controller
{
    /**
     * Display a listing of available slots, filterable by service and date.
     * GET /api/admin/slots
     */
    public function index(Request $request)
    {
        $request->validate([
            'service_id' => 'nullable|integer|exists:services,id',
            'date' => 'nullable|date_format:Y-m-d',
            'per_page' => 'nullable|integer|min:5|max:100',
        ]);

        $query = AvailableSlot::with('service:id,name');

        if ($request->filled('service_id')) {
            $query->where('service_id', $request->service_id);
        }

        if ($request->filled('date')) {
            $query->whereDate('start_time', $request->date);
        }

        $slots = $query->orderBy('start_time')
                       ->paginate($request->input('per_page', 20));

        return response()->json($slots);
    }

    /**
     * Store a newly created available slot in storage.
     * POST /api/admin/slots
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'service_id' => 'required|integer|exists:services,id',
            'start_time' => 'required|date_format:Y-m-d H:i:s|after_or_equal:now',
            'end_time' => 'required|date_format:Y-m-d H:i:s|after:start_time',
            'capacity' => 'sometimes|integer|min:1',
        ]);

        // Overlap check
        $exists = AvailableSlot::where('service_id', $validated['service_id'])
            ->where(function ($query) use ($validated) {
                $query->where('start_time', '<', $validated['end_time'])
                      ->where('end_time', '>', $validated['start_time']);
            })
            ->exists();

        if ($exists) {
            return response()->json(['error' => 'নির্বাচিত সময়টিতে ইতিমধ্যে একটি স্লট বিদ্যমান আছে।'], 409);
        }

        $slot = AvailableSlot::create($validated);

        // Audit Log
        \App\Models\AuditLog::create([
            'user_id' => Auth::id(),
            'action_type' => 'SLOT_CREATED',
            'description' => "Created slot for service ID {$slot->service_id} at " . Carbon::parse($slot->start_time)->format('Y-m-d H:i'),
            'ip_address' => request()->ip(),
            'user_agent' => request()->userAgent(),
        ]);

        return response()->json($slot->load('service:id,name'), 201);
    }

    /**
     * Remove the specified available slot from storage.
     * DELETE /api/admin/slots/{availableSlot}
     */
    public function destroy(AvailableSlot $availableSlot)
    {
        if ($availableSlot->appointments()->whereIn('status', ['pending', 'confirmed'])->exists()) {
            return response()->json(['error' => 'এই স্লটে অ্যাপয়েন্টমেন্ট বুক করা আছে, তাই ডিলিট করা সম্ভব নয়।'], 409);
        }

        try {
            $slotInfo = "Slot for service ID {$availableSlot->service_id} at " . Carbon::parse($availableSlot->start_time)->format('Y-m-d H:i');
            $availableSlot->delete();

            // Audit Log
            \App\Models\AuditLog::create([
                'user_id' => Auth::id(),
                'action_type' => 'SLOT_DELETED',
                'description' => "Deleted {$slotInfo}",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json(['message' => 'স্লট সফলভাবে ডিলিট করা হয়েছে।']);
        } catch (\Exception $e) {
            \Log::error("Slot Deletion Failed (ID: {$availableSlot->id}): {$e->getMessage()}");
            return response()->json(['error' => 'স্লট ডিলিট করার সময় সমস্যা হয়েছে।'], 500);
        }
    }
}
