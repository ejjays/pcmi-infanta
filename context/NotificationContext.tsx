'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';

type NotificationContextType = {
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  enableNotifications: () => Promise<boolean>;
};

// Utility function to convert base64 string to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return new Uint8Array([...Array(rawData.length)].map((_, i) => rawData.charCodeAt(i)));
};

const NotificationContext = createContext<NotificationContextType>({
  notificationsEnabled: false,
  notificationsSupported: false,
  enableNotifications: async () => false,
});

export const useNotifications = () => useContext(NotificationContext);

export const NotificationProvider = ({ 
  children 
}: { 
  children: React.ReactNode 
}) => {
  const [notificationsEnabled, setNotificationsEnabled] = useState(false);
  const [notificationsSupported, setNotificationsSupported] = useState(false);

  useEffect(() => {
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setNotificationsSupported(supported);
    
    const notificationsEnabledInStorage = localStorage.getItem('notificationsEnabled') === 'true';
    if (notificationsEnabledInStorage) {
      setNotificationsEnabled(true);
    }

    if (supported) {
      navigator.serviceWorker.register('/sw.js')
        .then(async (registration) => {
          console.log('Service Worker registered with scope:', registration.scope);
          
          if (Notification.permission === 'granted') {
            setNotificationsEnabled(true);
            const subscription = await subscribeToPushNotifications();
            if (subscription) {
              await saveSubscription(subscription);
            }
          }
        })
        .catch(error => {
          console.error('Service Worker registration failed:', error);
          setNotificationsSupported(false);
        });
    }
  }, []);

  const validateAndUpdateSubscription = async (subscription: PushSubscription) => {
    try {
      // Test the subscription
      const testResponse = await fetch('/api/notify-participants', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          meetingId: 'test',
          meetingTitle: 'Subscription Test',
          message: 'Testing subscription...',
          url: '/'
        }),
      });

      if (!testResponse.ok) {
        // If test fails, remove the subscription
        await subscription.unsubscribe();
        return false;
      }

      return true;
    } catch (error) {
      console.error('Error validating subscription:', error);
      return false;
    }
  };

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      if (subscription) {
        const isValid = await validateAndUpdateSubscription(subscription);
        if (!isValid) {
          await subscription.unsubscribe();
          subscription = null;
        }
      }

      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
        });
        console.log('New subscription created:', subscription);
      }

      return subscription;
    } catch (error) {
      console.error('Failed to subscribe to push notifications:', error);
      return null;
    }
  };

  const saveSubscription = async (subscription: PushSubscription): Promise<boolean> => {
    try {
      const response = await fetch('/api/save-subscription', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ subscription }),
      });

      if (!response.ok) {
        throw new Error('Failed to save subscription');
      }
      
      console.log('Subscription saved successfully');
      return true;
    } catch (error) {
      console.error('Error saving subscription:', error);
      return false; 
    }
  };

  const cleanupInvalidSubscriptions = async () => {
    try {
      const response = await fetch('/api/list-subscriptions');
      const data = await response.json();
      
      for (const sub of data.subscriptions) {
        try {
          const testResponse = await fetch('/api/notify-participants', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
              meetingId: 'cleanup-test',
              meetingTitle: 'Cleanup Test',
              message: 'Testing subscription validity',
              url: '/'
            })
          });
          
          if (!testResponse.ok) {
            await fetch('/api/remove-subscription', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ endpoint: sub.subscription.endpoint })
            });
          }
        } catch (error) {
          console.error('Error testing subscription:', error);
        }
      }
    } catch (error) {
      console.error('Error cleaning up subscriptions:', error);
    }
  };

  const enableNotifications = async () => {
    if (!notificationsSupported) return false;

    try {
      const permission = await Notification.requestPermission();
      if (permission !== 'granted') {
        console.log('Notification permission denied');
        return false;
      }

      const subscription = await subscribeToPushNotifications();
      if (!subscription) {
        console.error('Failed to get push subscription');
        return false;
      }
      
      console.log('Got subscription:', subscription.endpoint);
      
      const saved = await saveSubscription(subscription);
      if (!saved) {
        console.error('Failed to save subscription to server');
        return false;
      }
      
      console.log('Subscription saved successfully');
      setNotificationsEnabled(true);
      localStorage.setItem('notificationsEnabled', 'true');

      const registration = await navigator.serviceWorker.ready;
      await registration.showNotification('Notifications Enabled', {
        body: 'You will now receive notifications when meetings start.',
        icon: '/icons/icon-192x192.png'
      });

      return true;
    } catch (error) {
      console.error('Error enabling notifications:', error);
      return false;
    }
  };

  return (
    <NotificationContext.Provider
      value={{
        notificationsEnabled,
        notificationsSupported,
        enableNotifications,
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};