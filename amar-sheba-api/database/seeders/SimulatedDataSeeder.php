<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\Hash;
use App\Models\User;
use App\Models\NidDetail;
use App\Models\DrivingLicense;
use App\Models\VehicleFitness;
use App\Models\UserDocument;
use App\Models\ETinDetail; // <-- নতুন ইম্পোর্ট

class SimulatedDataSeeder extends Seeder
{
    /**
     * Run the database seeds.
     */
    public function run(): void
    {
        // --- একটি স্যাম্পল ইউজার তৈরি করুন ---
        $user = User::firstOrCreate(
            ['email' => 'user@example.com'],
            [
                'name' => 'Demo User',
                'password' => Hash::make('password123'),
            ]
        );

        // --- NID তথ্য সিড করুন ---
        NidDetail::firstOrCreate(['user_id' => $user->id], [
            'nid_number' => '1987654321',
            'birth_date' => '1990-05-15',
            'address' => 'Dhaka, Bangladesh',
        ]);

        // --- ড্রাইভিং লাইসেন্স তথ্য সিড করুন ---
        DrivingLicense::firstOrCreate(['user_id' => $user->id], [
            'license_number' => 'DL-2025-12345',
            'status' => 'Active',
            'expiry_date' => now()->addMonths(10),
        ]);

        // --- গাড়ির ফিটনেস তথ্য সিড করুন ---
        VehicleFitness::firstOrCreate(['user_id' => $user->id], [
            'vehicle_reg_no' => 'DHAKA-METRO-12345',
            'status' => 'Active',
            'expiry_date' => now()->addMonths(6),
        ]);

        // --- ইউজারের জন্য কিছু ডকুমেন্ট সিড করুন ---
        UserDocument::firstOrCreate(['user_id' => $user->id, 'title' => 'National ID Copy'], [
            'category' => 'Personal',
            'file_name' => 'nid_copy.pdf',
            'file_path' => 'user_documents/' . $user->id . '/nid_copy.pdf',
        ]);

        UserDocument::firstOrCreate(['user_id' => $user->id, 'title' => 'Driving License Scan'], [
            'category' => 'Vehicle',
            'file_name' => 'driving_license.pdf',
            'file_path' => 'user_documents/' . $user->id . '/driving_license.pdf',
        ]);

        // --- ইউজারের জন্য e-TIN তথ্য সিড করুন ---
        ETinDetail::firstOrCreate(['user_id' => $user->id], [
            'tin_number' => '123456789012', // একটি স্যাম্পল TIN নম্বর
        ]);

        $this->command->info('✅ Simulated demo data (NID, License, Vehicle, Documents, e-TIN) সফলভাবে সিড করা হয়েছে!');
    }
}
