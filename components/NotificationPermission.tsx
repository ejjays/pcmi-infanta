'use client';

import { useEffect, useState } from 'react';
import { useNotifications } from '@/context/NotificationContext';
import { Button } from './ui/button';
import { useToast } from './ui/use-toast';

const NotificationPermission = () => {
  const { notificationsEnabled, notificationsSupported, enableNotifications } = useNotifications();
  const [showPrompt, setShowPrompt] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    // Only show the prompt if notifications are supported but not enabled
    if (notificationsSupported && !notificationsEnabled) {
      // Wait a bit before showing the prompt to not overwhelm the user
      const timer = setTimeout(() => {
        setShowPrompt(true);
      }, 3000);
      
      return () => clearTimeout(timer);
    }
  }, [notificationsSupported, notificationsEnabled]);

  const handleEnableNotifications = async () => {
    const success = await enableNotifications();
    
    if (success) {
      toast({
        title: 'Notifications enabled',
        description: 'You will now receive notifications when meetings start.',
      });
    } else {
      toast({
        title: 'Notification permission denied',
        description: 'You will not receive notifications. You can enable them in your browser settings.',
        variant: 'error',
      });
    }
    
    setShowPrompt(false);
  };

  // Add the test notification function
  const testNotification = async () => {
    try {
      if (!('serviceWorker' in navigator)) {
        console.error('Service Worker not supported');
        return;
      }

      const registration = await navigator.serviceWorker.ready;

      // Show a local notification
      await registration.showNotification('Test Notification', {
        body: 'This is a test notification',
        icon: '/icons/icon-192x192.png',
        badge: '/icons/icon-192x192.png',
        vibrate: [100, 50, 100],
        data: {
          url: '/'
        }
      });

      toast({
        title: "Test notification sent",
        description: "If you didn't see a notification, check your browser settings",
      });
    } catch (error) {
      console.error('Error sending test notification:', error);
      toast({
        title: "Test notification failed",
        description: error.message,
        variant: "error"
      });
    }
  };

  if (!showPrompt) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 max-w-sm p-4 bg-dark-1 rounded-lg shadow-lg border border-dark-3">
      <h3 className="font-semibold mb-2">Enable Notifications</h3>
      <p className="text-sm mb-4">
        Get notified when meetings start so you never miss an important session.
      </p>
      <div className="flex justify-end gap-2">
        <Button 
          variant="outline" 
          onClick={() => setShowPrompt(false)}
          className="bg-dark-3 hover:bg-dark-4"
        >
          Later
        </Button>
        <Button 
          onClick={handleEnableNotifications}
          className="bg-blue-1 hover:bg-blue-600"
        >
          Enable
        </Button>
      </div>
      {/* Add the Test Notification button */}
      <Button 
        onClick={testNotification}
        className="mt-2 bg-gray-500 hover:bg-gray-600"
      >
        Test Notification
      </Button>
    </div>
  );
};

export default NotificationPermission;