'use client'; 

import React, { useEffect, useState } from 'react';
import MeetingTypeList from '@/components/MeetingTypeList';
import NotificationPermission from '@/components/NotificationPermission'; 
import { Button } from '@/components/ui/button';
import { useToast } from '@/components/ui/use-toast';

const Home = () => {
  const [dateTime, setDateTime] = useState(new Date());
  const { toast } = useToast();

  useEffect(() => {
    const intervalId = setInterval(() => {
      setDateTime(new Date());
    }, 1000);

    return () => clearInterval(intervalId); 
  }, []);

  const localTime = new Date(dateTime.toLocaleString('en-PH', { timeZone: 'Asia/Manila' }));

  const hoursMinutes = localTime.toLocaleTimeString('en-PH', { hour: '2-digit', minute: '2-digit' }).split(' ');
  const hoursMinutesPart = hoursMinutes[0];
  const amPmPart = hoursMinutes[1];
  const seconds = localTime.getSeconds().toString().padStart(2, '0'); 

  const date = new Intl.DateTimeFormat('en-PH', { dateStyle: 'full' }).format(localTime);

  return (
    <section className="flex size-full flex-col gap-5 text-white">
      <div className="h-[303px] w-full rounded-[20px] bg-hero bg-cover">
        <div className="flex h-full flex-col justify-between max-md:px-5 max-md:py-8 lg:p-11">
          <h2 className="mr-4 max-w-[273px] rounded py-2 text-center text-base font-normal glassmorphism">
            Cellgroup Saturday at 9:00 PM
          </h2>
          <div className="flex flex-col gap-2">
            <h1 className="text-4xl font-extrabold lg:text-7xl">
              {hoursMinutesPart} {amPmPart}
              <span style={{ fontSize: '0.50em', fontWeight: 'bold', color: 'white', verticalAlign: 'baseline' }}> {seconds}s</span>
            </h1>
            <p className="text-lg font-medium text-sky-1 lg:text-2xl">{date}</p>
          </div>
        </div>
      </div>

      {/* Test Notification Button */}
     <Button 
  onClick={async () => {
    try {
      if (typeof window !== 'undefined') {
        // Check if service worker is supported
        if (!('serviceWorker' in navigator)) {
          toast({
            title: "Service Worker not supported",
            description: "Your browser doesn't support service workers",
            variant: "error"
          });
          return;
        }
        
        // Request notification permission
        const permission = await Notification.requestPermission();
        console.log("Notification permission:", permission);
        
        if (permission === 'granted') {
          // Get service worker registration
          let registration;
          try {
            // Try to get existing registration
            registration = await navigator.serviceWorker.ready;
          } catch (error) {
            console.log("No service worker registered, registering now...");
            registration = await navigator.serviceWorker.register('/sw.js');
            toast({
              title: "Service worker registered",
              description: "Please try the notification button again"
            });
            return;
          }
          
          // Show notification
          await registration.showNotification('Test Notification', {
            body: 'This is a test notification from your app!',
            icon: '/icons/icon-192x192.png'
          });
          console.log("Notification sent");
          
          toast({
            title: "Notification sent",
            description: "Check your notifications"
          });
        } else {
          toast({
            title: "Notification permission denied",
            description: "Please enable notifications in your browser settings"
          });
        }
      }
    } catch (error: any) {
      console.error("Notification error:", error);
      toast({
        title: "Error showing notification",
        description: error?.message || "Unknown error occurred",
        variant: "error"
      });
    }
  }}
  className="mb-6 bg-blue-1 hover:bg-blue-2"
>
  Test Notification
</Button>

      <MeetingTypeList />
      <NotificationPermission /> 
    </section>
  );
};

export default Home;