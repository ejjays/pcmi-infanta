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

  // Service Worker Registration
  useEffect(() => {
    if ('serviceWorker' in navigator) {
      navigator.serviceWorker.register('/sw.js')
        .then(registration => {
          console.log('Service Worker registered with scope:', registration.scope);
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
        });
    }
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
      // First check if we have an active service worker
      const registration = await navigator.serviceWorker.ready;
      console.log('Service worker ready:', registration);

      // Check notification permission explicitly
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        if (permission !== 'granted') {
          throw new Error('Notification permission not granted');
        }
      }

      // Get current subscription
      const subscription = await registration.pushManager.getSubscription();
      if (!subscription) {
        throw new Error("No push subscription found. Please enable notifications first.");
      }

      // Try a direct notification first
      await registration.showNotification('Direct Notification', {
        body: 'This is a direct notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        tag: 'direct-test-' + Date.now(),
        requireInteraction: true
      });

      // Then try the push notification
      const response = await fetch('/api/notify-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: 'test-meeting',
          meetingTitle: 'Test Meeting',
          message: 'Push test notification ' + new Date().toISOString(),
          url: '/'
        }),
      });
      
      const result = await response.json();
      console.log('Push notification test result:', result);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to send push notification');
      }

      toast({
        title: "Notifications sent",
        description: `Direct notification shown and push notification sent to ${result.sentCount} subscribers`
      });
    } catch (error) {
      console.error('Error in notification test:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send notification',
        variant: "error"
      });
    }
  }}
  className="mb-2 bg-yellow-500 hover:bg-yellow-600"
>
  Test Both Notifications
</Button>

<Button 
  onClick={async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registration = await navigator.serviceWorker.ready;
        const subscription = await registration.pushManager.getSubscription();
        
        if (subscription) {
          console.log('Current subscription:', subscription);
          toast({
            title: "Subscription Active",
            description: "Push subscription exists and is logged to console"
          });
        } else {
          toast({
            title: "No Subscription",
            description: "No push subscription found. Try enabling notifications again.",
            variant: "error"
          });
        }
      } catch (error) {
        console.error('Error checking subscription:', error);
      }
    }
  }}
  className="mb-2 bg-green-500 hover:bg-green-600"
>
  Check Subscription
</Button>

<Button 
  onClick={async () => {
    try {
      const response = await fetch('/api/list-subscriptions');
      const data = await response.json();
      console.log('Current subscriptions:', data);
      toast({
        title: "Subscriptions",
        description: `Found ${data.subscriptions?.length || 0} active subscriptions`
      });
    } catch (error) {
      console.error('Error checking subscriptions:', error);
    }
  }}
  className="mb-2 bg-purple-500 hover:bg-purple-600"
>
  List All Subscriptions
</Button>
      
      <Button 
  onClick={async () => {
    if ('serviceWorker' in navigator) {
      try {
        const registrations = await navigator.serviceWorker.getRegistrations();
        for (const registration of registrations) {
          await registration.unregister();
          console.log('Service worker unregistered');
        }
        
        // Register again
        const newRegistration = await navigator.serviceWorker.register('/sw.js');
        console.log('Service worker registered with scope:', newRegistration.scope);
        
        // Force update
        await newRegistration.update();
        console.log('Service worker updated');
        
        toast({
          title: "Service worker refreshed",
          description: "Please reload the page and try again"
        });
      } catch (error) {
        console.error('Error refreshing service worker:', error);
      }
    }
  }}
  className="mb-2 bg-red-500 hover:bg-red-600"
>
  Refresh Service Worker
</Button>
<Button 
  onClick={async () => {
    try {
      if (Notification.permission !== 'granted') {
        const permission = await Notification.requestPermission();
        console.log('Permission result:', permission);
        if (permission !== 'granted') {
          alert('Notification permission denied');
          return;
        }
      }
      
      // Test with a direct notification
      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Direct Notification', {
        body: 'This is a direct notification',
        icon: '/icons/icon-192x192.png'
      });
      
      console.log('Direct notification sent');
    } catch (error) {
      console.error('Error sending direct notification:', error);
      alert('Error: ' + (error instanceof Error ? error.message : 'Unknown error'));
    }
  }}
  className="mb-2 bg-purple-500 hover:bg-purple-600"
>
  Direct Notification Test
</Button>

<Button 
  onClick={async () => {
    try {
      const response = await fetch('/api/notify-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: 'test-remote',
          meetingTitle: 'Remote Test',
          message: 'Testing remote push notification ' + new Date().toISOString(),
          url: '/'
        }),
      });
      
      const result = await response.json();
      console.log('Remote push test result:', result);
      
      toast({
        title: "Remote notification sent",
        description: `Sent to ${result.sentCount} subscribers`
      });
    } catch (error) {
      console.error('Error:', error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : 'Failed to send remote notification',
        variant: "destructive"
      });
    }
  }}
  className="mb-2 bg-blue-500 hover:bg-blue-600"
>
  Test Remote Push
</Button>


      <MeetingTypeList />
      <NotificationPermission /> 
    </section>
  );
};

export default Home;