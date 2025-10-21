<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;
use Carbon\Carbon; // Carbon ইম্পোর্ট করুন

class ServiceExpiringSoonNotification extends Notification // ShouldQueue যোগ করতে পারেন যদি চান
{
    use Queueable;

    protected $serviceName;
    protected $serviceIdentifier;
    protected $expiryDate;
    protected $daysUntilExpiry;

    /**
     * Create a new notification instance.
     * ডেটাগুলো constructor এর মাধ্যমে পাস করবো
     */
    public function __construct($serviceName, $serviceIdentifier, $expiryDate, $daysUntilExpiry)
    {
        $this->serviceName = $serviceName;
        $this->serviceIdentifier = $serviceIdentifier;
        $this->expiryDate = Carbon::parse($expiryDate); // Carbon অবজেক্টে কনভার্ট করুন
        $this->daysUntilExpiry = $daysUntilExpiry;
    }

    /**
     * Get the notification's delivery channels.
     * @return array<int, string>
     */
    public function via(object $notifiable): array
    {
        return ['mail']; // শুধু ইমেইল চ্যানেল ব্যবহার করবো
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        // $notifiable অবজেক্টটি হলো User মডেল
        $userName = $notifiable->name; // ইউজারের নাম

        // ইমেইলের সাবজেক্ট এবং কন্টেন্ট তৈরি করুন
        return (new MailMessage)
                    ->subject("{$this->serviceName} এর মেয়াদ শীঘ্রই শেষ হবে")
                    ->greeting("হ্যালো {$userName},")
                    ->line("আপনার {$this->serviceName} ({$this->serviceIdentifier}) এর মেয়াদ আর মাত্র {$this->daysUntilExpiry} দিন পর ({$this->expiryDate->format('d/m/Y')}) শেষ হবে।")
                    ->line("অনুগ্রহ করে সময়মতো নবায়ন করুন।")
                    ->action('এখনই নবায়ন করুন', url('/dashboard')) // আপনার ফ্রন্টএন্ড ড্যাশবোর্ডের লিংক দিন
                    ->line('আমাদের সেবা ব্যবহার করার জন্য ধন্যবাদ!');
    }

    /**
     * Get the array representation of the notification.
     * (যদি ডাটাবেসে নোটিফিকেশন সেভ করতে চান)
     * @return array<string, mixed>
     */
    // public function toArray(object $notifiable): array
    // {
    //     return [
    //         //
    //     ];
    // }
}