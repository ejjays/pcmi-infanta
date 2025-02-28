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

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(urlsToCache);
    })
  );
  self.skipWaiting(); 
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  console.log('Service worker activated');
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
                  cache.put(event.request, responseToCache);
                });
            }
            return response;
          })
          .catch(() => {
            // If both cache and network fail, show offline page
            return caches.match('/offline');
          });
      })
  );
});

// Handle push events
self.addEventListener('push', event => {
  console.log('Push event received', event);
  
  const data = event.data ? event.data.json() : { 
    title: 'New Notification', 
    body: 'Something happened in your app' 
  };
  
  const options = {
    body: data.body,
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-192x192.png',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'join',
        title: 'Join Meeting'
      },
      {
        action: 'dismiss',
        title: 'Dismiss'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification(data.title || 'CG - Kamustahan', options)
  );
});

// Handle notification click
self.addEventListener('notificationclick', event => {
  console.log('Notification clicked', event);
  event.notification.close();
  
  // If the user clicked the "Join Meeting" action or the notification itself
  if (event.action === 'join' || !event.action) {
    if (event.notification.data && event.notification.data.url) {
      event.waitUntil(
        clients.openWindow(event.notification.data.url)
      );
    }
  }
});

// Log when a notification is shown
self.addEventListener('notificationshow', event => {
  console.log('Notification shown', event);
});