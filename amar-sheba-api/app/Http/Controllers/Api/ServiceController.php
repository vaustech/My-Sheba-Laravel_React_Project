<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Service;
use Illuminate\Http\Request;

class ServiceController extends Controller
{
    /**
     * Display a listing of active services available for booking.
     * GET /api/services
     */
    public function index()
    {
        // শুধু সক্রিয় সেবাগুলো দেখান
        $services = Service::where('is_active', true)
                           ->select('id', 'name', 'description', 'duration_minutes') // প্রয়োজনীয় কলাম
                           ->orderBy('name')
                           ->get();
        return response()->json($services);
    }

    // show method if needed: GET /api/services/{service}
    // public function show(Service $service) { ... }
}