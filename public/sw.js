const CACHE_NAME = 'pcmi-cache-v2-' + new Date().getTime();  
const urlsToCache = [
  // Core pages
  '/',
  '/offline',
  
  // App manifest and icons
  '/manifest.json',
  '/icons/icon-192x192.png',
  '/icons/icon-512x512.png',
  
  // Styles
  '/app/globals.css',
  
  // Main app routes
  '/app/(root)/(home)/page',
  '/app/(root)/(home)/personal-room/page',
  '/app/(root)/(home)/previous/page',
  '/app/(root)/(home)/recordings/page',
  '/app/(root)/(home)/upcoming/page',
  
  // Static assets
  '/assets/images/logo.png',
  '/assets/images/avatar.png',
  '/assets/icons/home.svg',
  '/assets/icons/calendar.svg',
  '/assets/icons/video.svg',
  '/assets/icons/recording.svg',
  
  // Fonts (if using custom fonts)
  '/fonts/your-font-regular.woff2',
  '/fonts/your-font-bold.woff2',
  
  // Critical JavaScript files
  '/_next/static/chunks/main.js',
  '/_next/static/chunks/webpack.js',
  '/_next/static/chunks/pages/_app.js',
  '/_next/static/chunks/pages/index.js',
  
  // API endpoints (if needed for offline functionality)
  '/api/user',
  '/api/meetings',
  
  // Additional assets
  '/favicon.ico',
  '/robots.txt'
];

console.log('Service Worker loaded');

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
});

self.addEventListener('install', (event) => {
  console.log('[Service Worker] Installing Service Worker...', event);
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching App Shell');
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  console.log('[Service Worker] Activating Service Worker...', event);
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('[Service Worker] Service worker activated');
  return self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  event.respondWith(
    caches.match(event.request)
      .then((cachedResponse) => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }
        
        // If not in cache, try network
        return fetch(event.request)
          .then((response) => {
            // Cache the new response
            if (response.status === 200) {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then((cache) => {
                  console.log('[Service Worker] Caching new resource:', event.request.url);
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            console.log('[Service Worker] Network request failed, serving offline page');
            return caches.match('/offline');
          });
      })
  );
});

// Updated push event handler
self.addEventListener('push', event => {
  console.log('[Service Worker] Push Received:', {
    data: event.data ? event.data.text() : 'no data'
  });

  event.waitUntil(
    (async () => {
      try {
        const data = event.data ? JSON.parse(event.data.text()) : {};
        
        // Log the parsed data
        console.log('[Service Worker] Parsed push data:', data);

        const title = data.meetingTitle || 'PCMI Notification';
        const options = {
          body: data.message || 'New notification',
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: 'pcmi-notification-' + Date.now(),
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: { 
            url: data.url || '/',
            timestamp: new Date().toISOString()
          }
        };

        // Remove the client check - always show notification
        console.log('[Service Worker] Showing notification:', { title, options });
        await self.registration.showNotification(title, options);
        console.log('[Service Worker] Notification shown successfully');
      } catch (error) {
        console.error('[Service Worker] Error in push event:', error);
        // Show a fallback notification on error
        await self.registration.showNotification('New Message', {
          body: 'You have a new notification',
          icon: '/icons/icon-192x192.png'
        });
      }
    })()
  );
});

// Add notification click handler
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification click:', event);
  event.notification.close();

  // Open the app when notification is clicked
  if (event.notification.data?.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Log when a notification is shown
self.addEventListener('notificationshow', event => {
  console.log('[Service Worker] Notification shown', event);
});