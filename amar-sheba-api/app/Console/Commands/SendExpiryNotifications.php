<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\User;
use App\Models\DrivingLicense;
use App\Models\VehicleFitness;
use App\Notifications\ServiceExpiringSoonNotification;
use Carbon\Carbon;
use Illuminate\Support\Facades\Notification;

class SendExpiryNotifications extends Command
{
    /**
     * The name and signature of the console command.
     */
    protected $signature = 'send:expiry-notifications';

    /**
     * The console command description.
     */
    protected $description = 'Send email notifications for services expiring soon';

    /**
     * Execute the console command.
     */
    public function handle(): void
    {
        $this->info('Checking for expiring services...');

        // --- ড্রাইভিং লাইসেন্স চেক (৩০ দিনের মধ্যে মেয়াদ শেষ হবে) ---
        $drivingLicenseThreshold = Carbon::now()->addDays(30);
        $expiringLicenses = DrivingLicense::where('status', 'Active')
            ->where('expiry_date', '<=', $drivingLicenseThreshold)
            ->where('expiry_date', '>', Carbon::now())
            ->with('user')
            ->get();

        foreach ($expiringLicenses as $license) {
            if ($license->user) {
                $days = Carbon::now()->diffInDays($license->expiry_date, false) + 1;
                if ($days >= 0) {
                    $this->line("Sending DL expiry notification to user ID {$license->user->id}");
                    Notification::send($license->user, new ServiceExpiringSoonNotification(
                        'ড্রাইভিং লাইসেন্স',
                        $license->license_number,
                        $license->expiry_date,
                        $days
                    ));
                }
            }
        }

        $this->info(count($expiringLicenses) . ' driving license notifications sent.');

        // --- গাড়ির ফিটনেস চেক (৬০ দিনের মধ্যে মেয়াদ শেষ হবে) ---
        $fitnessThreshold = Carbon::now()->addDays(60);
        $expiringFitnesses = VehicleFitness::where('status', 'Active')
            ->where('expiry_date', '<=', $fitnessThreshold)
            ->where('expiry_date', '>', Carbon::now())
            ->with('user')
            ->get();

        foreach ($expiringFitnesses as $fitness) {
            if ($fitness->user) {
                $days = Carbon::now()->diffInDays($fitness->expiry_date, false) + 1;
                if ($days >= 0) {
                    $this->line("Sending VF expiry notification to user ID {$fitness->user->id}");
                    Notification::send($fitness->user, new ServiceExpiringSoonNotification(
                        'গাড়ির ফিটনেস',
                        $fitness->vehicle_reg_no,
                        $fitness->expiry_date,
                        $days
                    ));
                }
            }
        }

        $this->info(count($expiringFitnesses) . ' vehicle fitness notifications sent.');
        $this->info('Expiry notification check complete.');
    }
}
