<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\UserDocument;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Facades\Storage;
use Symfony\Component\HttpFoundation\StreamedResponse;
use Illuminate\Support\Facades\Response;
use Illuminate\Validation\Rule; // Rule ইম্পোর্ট করুন

class UserDocumentController extends Controller
{
    public function __construct()
    {
        $this->middleware('auth:api');
    }

    // --- সব ডকুমেন্ট লিস্ট ---
    public function index()
    {
        $documents = Auth::user()->documents()->latest()->get();
        return response()->json($documents);
    }

    // --- নতুন ডকুমেন্ট আপলোড ---
    public function store(Request $request)
    {
        $request->validate([
            'title' => 'required|string|max:255',
            'category' => 'nullable|string|max:100',
            'document' => 'required|file|mimes:pdf,jpg,jpeg,png|max:5120',
        ]);

        $user = Auth::user();
        $file = $request->file('document');

        $path = $file->store('user_documents/' . $user->id, 'local');
        $fileName = $file->getClientOriginalName();

        $document = UserDocument::create([
            'user_id' => $user->id,
            'title' => $request->title,
            'category' => $request->category,
            'file_name' => $fileName,
            'file_path' => $path,
        ]);

        return response()->json($document, 201);
    }

    // --- ডকুমেন্ট ডিলিট ---
    public function destroy($id)
    {
        $user = Auth::user();
        $document = UserDocument::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        Storage::disk('local')->delete($document->file_path);
        $document->delete();

        return response()->json(['message' => 'ডকুমেন্ট সফলভাবে ডিলিট করা হয়েছে।']);
    }

    // --- ফাইল প্রিভিউ / ডাউনলোড ---
    public function preview($id)
    {
        $user = Auth::user();
        $document = UserDocument::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        if (!Storage::disk('local')->exists($document->file_path)) {
            return response()->json(['error' => 'ফাইল খুঁজে পাওয়া যায়নি।'], 404);
        }

        $path = Storage::disk('local')->path($document->file_path);
        $fileName = $document->file_name;
        $mimeType = Storage::disk('local')->mimeType($document->file_path);

        $headers = [
            'Content-Type' => $mimeType,
            'Content-Disposition' => 'inline; filename="' . $fileName . '"',
        ];

        return Response::file($path, $headers);
    }

    /**
     * Update the specified document's title and category in storage.
     * PUT /api/documents/{id}
     * PATCH /api/documents/{id}
     */
    public function update(Request $request, $id)
    {
        $user = Auth::user();
        $document = UserDocument::where('id', $id)
            ->where('user_id', $user->id)
            ->firstOrFail();

        // ডেটা ভ্যালিডেট করুন
        $validatedData = $request->validate([
            'title' => 'sometimes|required|string|max:255',
            'category' => 'nullable|string|max:100',
        ]);

        // ভ্যালিডেট করা ডেটা আপডেট করুন
        $document->update($validatedData);

        return response()->json([
            'message' => 'ডকুমেন্টের তথ্য সফলভাবে আপডেট করা হয়েছে।',
            'document' => $document,
        ]);
    }
}
