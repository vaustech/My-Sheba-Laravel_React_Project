<?php

namespace App\Providers;

use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

// মডেল এবং Observer ইম্পোর্ট করুন
use App\Models\UserDocument;
use App\Observers\UserDocumentObserver;

class EventServiceProvider extends ServiceProvider
{
    /**
     * Register any events for your application.
     */
    public function boot(): void
    {
        // ✅ UserDocument মডেলের জন্য Observer রেজিস্টার করুন
        UserDocument::observe(UserDocumentObserver::class);
    }
}
