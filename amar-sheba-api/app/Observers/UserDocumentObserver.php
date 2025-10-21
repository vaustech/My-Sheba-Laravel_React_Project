<?php

namespace App\Observers;

use App\Models\UserDocument;
use App\Models\AuditLog; // AuditLog মডেল ইম্পোর্ট করুন
use Illuminate\Support\Facades\Auth; // Auth ইম্পোর্ট করুন
use Illuminate\Http\Request; // Request ইম্পোর্ট করুন

class UserDocumentObserver
{
    protected $request;

    // Request inject করুন constructor এ
    public function __construct(Request $request)
    {
        $this->request = $request;
    }

    /**
     * Handle the UserDocument "created" event.
     */
    public function created(UserDocument $userDocument): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action_type' => 'DOCUMENT_UPLOADED',
            'description' => "Uploaded document: '{$userDocument->title}' ({$userDocument->file_name})",
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);
    }

    /**
     * Handle the UserDocument "updated" event.
     */
    public function updated(UserDocument $userDocument): void
    {
        $changes = $userDocument->getChanges();
        unset($changes['updated_at']);

        if (empty($changes)) {
            return;
        }

        $description = "Updated document '{$userDocument->title}'. Changes: ";
        $changeDetails = [];

        foreach ($changes as $field => $newValue) {
            $oldValue = $userDocument->getOriginal($field);
            $changeDetails[] = "{$field} from '{$oldValue}' to '{$newValue}'";
        }

        $description .= implode(', ', $changeDetails);

        AuditLog::create([
            'user_id' => Auth::id(),
            'action_type' => 'DOCUMENT_UPDATED',
            'description' => $description,
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);
    }

    /**
     * Handle the UserDocument "deleted" event.
     */
    public function deleted(UserDocument $userDocument): void
    {
        AuditLog::create([
            'user_id' => Auth::id(),
            'action_type' => 'DOCUMENT_DELETED',
            'description' => "Deleted document: '{$userDocument->title}' ({$userDocument->file_name})",
            'ip_address' => $this->request->ip(),
            'user_agent' => $this->request->userAgent(),
        ]);
    }
}
