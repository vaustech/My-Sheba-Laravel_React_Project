<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;
use Illuminate\Validation\Rule;

class ServiceController extends Controller
{
    /**
     * Display a listing of the services.
     * GET /api/admin/services
     */
    public function index(Request $request)
    {
        $services = Service::latest()->paginate(15);
        return response()->json($services);
    }

    /**
     * Store a newly created service in storage.
     * POST /api/admin/services
     */
    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255|unique:services,name',
            'description' => 'nullable|string',
            'duration_minutes' => 'required|integer|min:5',
            'is_active' => 'sometimes|boolean',
        ]);

        $service = Service::create($validated);

        return response()->json($service, 201);
    }

    /**
     * Display the specified service.
     * GET /api/admin/services/{service}
     */
    public function show(Service $service)
    {
        return response()->json($service);
    }

    /**
     * Update the specified service in storage.
     * PUT/PATCH /api/admin/services/{service}
     */
    public function update(Request $request, Service $service)
    {
        $validated = $request->validate([
            'name' => ['sometimes', 'required', 'string', 'max:255', Rule::unique('services')->ignore($service->id)],
            'description' => 'nullable|string',
            'duration_minutes' => 'sometimes|required|integer|min:5',
            'is_active' => 'sometimes|boolean',
        ]);

        $service->update($validated);

        return response()->json($service->fresh());
    }

    /**
     * Remove the specified service from storage.
     * DELETE /api/admin/services/{service}
     */
    public function destroy(Service $service)
    {
        try {
            $serviceName = $service->name;
            $service->delete();

            // Add Audit Log
            \App\Models\AuditLog::create([
                'user_id' => \Illuminate\Support\Facades\Auth::id(),
                'action_type' => 'SERVICE_DELETED',
                'description' => "Deleted service: '{$serviceName}' (ID: {$service->id})",
                'ip_address' => request()->ip(),
                'user_agent' => request()->userAgent(),
            ]);

            return response()->json(['message' => 'সেবা সফলভাবে ডিলিট করা হয়েছে।']);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error("Service Deletion Failed (ID: {$service->id}): {$e->getMessage()}");
            return response()->json(['error' => 'সেবাটি ডিলিট করা সম্ভব হয়নি। সম্ভবত এটি অ্যাপয়েন্টমেন্টের সাথে যুক্ত।'], 409);
        } catch (\Exception $e) {
            \Log::error("Service Deletion Failed (ID: {$service->id}): {$e->getMessage()}");
            return response()->json(['error' => 'সেবা ডিলিট করার সময় সমস্যা হয়েছে।'], 500);
        }
    }
}
