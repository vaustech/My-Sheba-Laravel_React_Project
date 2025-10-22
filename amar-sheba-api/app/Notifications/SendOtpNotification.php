<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class SendOtpNotification extends Notification
{
    use Queueable;

    protected $otp;

    /**
     * Create a new notification instance.
     */
    public function __construct($otp)
    {
        $this->otp = $otp;
    }

    /**
     * Get the notification's delivery channels.
     */
    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    /**
     * Get the mail representation of the notification.
     */
    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
                    ->subject('আপনার লগইন ভেরিফিকেশন কোড')
                    ->greeting("হ্যালো {$notifiable->name},")
                    ->line("আপনার অ্যাকাউন্টে লগইন করার জন্য ওয়ান-টাইম পাসওয়ার্ড (OTP) হলো:")
                    ->line("**{$this->otp}**")
                    ->line('এই কোডটি 10 মিনিটের জন্য ভ্যালিড থাকবে।')
                    ->line('আপনি যদি লগইন করার চেষ্টা না করে থাকেন, তবে এই ইমেইলটি উপেক্ষা করুন।');
    }
}