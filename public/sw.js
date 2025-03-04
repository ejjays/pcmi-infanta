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
  console.log('[Service Worker] Push Received:', event.data?.text());

  event.waitUntil(
    (async () => {
      try {
        const data = event.data ? JSON.parse(event.data.text()) : {};
        console.log('[Service Worker] Processing push data:', data);

        // Ensure we have the required data
        if (!data.title || !data.message) {
          throw new Error('Missing required notification data');
        }

        const options = {
          body: data.message,
          icon: '/icons/icon-192x192.png',
          badge: '/icons/icon-192x192.png',
          tag: `pcmi-notification-${Date.now()}`,
          requireInteraction: true,
          vibrate: [200, 100, 200],
          data: {
            url: data.url || '/',
            timestamp: new Date().toISOString()
          },
          actions: [
            {
              action: 'open',
              title: 'Open'
            }
          ]
        };

        // Get all windows clients
        const clients = await self.clients.matchAll({
          type: 'window',
          includeUncontrolled: true
        });

        // If we have an active window, focus it instead of showing notification
        if (clients.length > 0 && 'focus' in clients[0]) {
          await clients[0].focus();
          clients[0].postMessage({
            type: 'PUSH_RECEIVED',
            data: data
          });
        } else {
          // Show notification if no active windows
          await self.registration.showNotification(data.title, options);
        }
      } catch (error) {
        console.error('[Service Worker] Push event error:', error);
        // Show a fallback notification
        await self.registration.showNotification('New Message', {
          body: 'You have a new notification',
          icon: '/icons/icon-192x192.png'
        });
      }
    })()
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('[Service Worker] Notification clicked', event);
  event.notification.close();
  
  if (event.notification.data && event.notification.data.url) {
    event.waitUntil(
      clients.openWindow(event.notification.data.url)
    );
  }
});

// Log when a notification is shown
self.addEventListener('notificationshow', event => {
  console.log('[Service Worker] Notification shown', event);
});