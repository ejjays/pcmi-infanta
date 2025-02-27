'use client';

import React, { createContext, useContext, useEffect, useState } from 'react';
import { 
  checkNotificationSupport, 
  requestNotificationPermission,
  subscribeToPushNotifications,
  saveSubscription
} from '@/lib/notifications';

type NotificationContextType = {
  notificationsEnabled: boolean;
  notificationsSupported: boolean;
  enableNotifications: () => Promise<boolean>;
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
    const supported = checkNotificationSupport();
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

  const enableNotifications = async () => {
    if (!notificationsSupported) return false;
    
    const permissionGranted = await requestNotificationPermission();
    setNotificationsEnabled(permissionGranted);
    
    if (permissionGranted) {
      const subscription = await subscribeToPushNotifications();
      if (subscription) {
        await saveSubscription(subscription);
      }
    }
    
    return permissionGranted;
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