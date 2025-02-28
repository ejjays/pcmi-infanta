export const checkNotificationSupport = () => {
  if (!('Notification' in window)) {
    console.log('This browser does not support notifications');
    return false;
  }
  return true;
};

// Request notification permission
export const requestNotificationPermission = async () => {
  if (!checkNotificationSupport()) return false;
  
  try {
    const permission = await Notification.requestPermission();
    return permission === 'granted';
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
};

// Subscribe to push notifications
export const subscribeToPushNotifications = async () => {
  if (!checkNotificationSupport()) return null;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Get existing subscription or create a new one
    let subscription = await registration.pushManager.getSubscription();
    
    if (!subscription) {
      // You'll need to generate VAPID keys for your application
      // For development, you can use tools like web-push to generate these
      VAPID_PUBLIC_KEY is a string
const VAPID_PUBLIC_KEY = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY || '';
const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      // Convert VAPID key to the format required by the browser
      const applicationServerKey = urlBase64ToUint8Array(VAPID_PUBLIC_KEY);
      
      subscription = await registration.pushManager.subscribe({
        userVisibleOnly: true,
        applicationServerKey
      });
    }
    
    return subscription;
  } catch (error) {
    console.error('Error subscribing to push notifications:', error);
    return null;
  }
};

// Helper function to convert base64 string to Uint8Array
function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');
  
  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  
  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  
  return outputArray;
}

// Send subscription to your server
export const saveSubscription = async (subscription) => {
  try {
    const response = await fetch('/api/save-subscription', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(subscription),
    });
    
    return response.ok;
  } catch (error) {
    console.error('Error saving subscription:', error);
    return false;
  }
};

// Show a notification (for testing or local notifications)
export const showLocalNotification = async (title, options) => {
  if (!checkNotificationSupport()) return;
  
  try {
    const registration = await navigator.serviceWorker.ready;
    registration.showNotification(title, options);
  } catch (error) {
    console.error('Error showing notification:', error);
  }
};