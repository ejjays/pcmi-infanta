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
    // Check if notifications are supported
    const supported = 'Notification' in window && 'serviceWorker' in navigator;
    setNotificationsSupported(supported);
    
    // Check if permission is already granted
    if (supported && Notification.permission === 'granted') {
      setNotificationsEnabled(true);
      
      // Subscribe to push notifications if permission is already granted
      subscribeToPushNotifications().then(subscription => {
        if (subscription) {
          saveSubscription(subscription);
        }
      });
    }
  }, []);

  const subscribeToPushNotifications = async () => {
    try {
      const registration = await navigator.serviceWorker.ready;
      let subscription = await registration.pushManager.getSubscription();

      // If no subscription exists, create one
      if (!subscription) {
        subscription = await registration.pushManager.subscribe({
          userVisibleOnly: true,
          applicationServerKey: urlBase64ToUint8Array(process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '')
        });
        
        console.log('Created new subscription:', subscription);
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
    return true; // Return true on success
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false; 
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