<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\AvailableSlot;
use App\Models\Service;
use Illuminate\Http\Request;
use Carbon\Carbon;

class AvailableSlotController extends Controller
{
    /**
     * Display a listing of available slots for a specific service and date.
     * GET /api/services/{service}/slots?date=YYYY-MM-DD
     */
    public function index(Request $request, Service $service)
    {
        $request->validate([
            'date' => 'required|date_format:Y-m-d',
        ]);

        $selectedDate = Carbon::parse($request->date)->startOfDay();
        $now = Carbon::now();

        // Check if the selected date is in the past
        if ($selectedDate->isPast() && !$selectedDate->isToday()) {
             return response()->json([]); // Return empty array for past dates
        }

        $slots = AvailableSlot::where('service_id', $service->id)
                ->whereDate('start_time', $selectedDate)
                // Only show slots that haven't started yet
                ->where('start_time', '>', $now)
                // Filter out slots that are already fully booked (assuming capacity = 1 for now)
                ->whereDoesntHave('appointments', function ($query) {
                    $query->whereIn('status', ['pending', 'confirmed']); // Check against pending/confirmed appointments
                })
                ->orderBy('start_time')
                ->select('id', 'start_time', 'end_time') // প্রয়োজনীয় কলাম
                ->get();

        return response()->json($slots);
    }
}