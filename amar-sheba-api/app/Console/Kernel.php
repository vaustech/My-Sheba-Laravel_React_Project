<?php

namespace App\Console;

use Illuminate\Console\Scheduling\Schedule;
use Illuminate\Foundation\Console\Kernel as ConsoleKernel;

class Kernel extends ConsoleKernel
{
    /**
     * Define the application's command schedule.
     */
    protected function schedule(Schedule $schedule): void
    {
        // উদাহরণ: প্রতিদিন সকাল ৮টায় নোটিফিকেশন পাঠাবে
        $schedule->command('send:expiry-notifications')
                 ->dailyAt('08:00'); 

        // 👉 টেস্টিংয়ের জন্য চাইলে নিচেরটা ব্যবহার করতে পারো:
        // $schedule->command('send:expiry-notifications')->everyMinute();
    }

    /**
     * Register the commands for the application.
     */
    protected function commands(): void
    {
        $this->load(__DIR__.'/Commands');
        require base_path('routes/console.php');
    }
}
