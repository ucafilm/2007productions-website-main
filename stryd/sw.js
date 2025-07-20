// Service Worker for Stryd Stories PWA
// Cache-first strategy with network fallback

const CACHE_NAME = 'stryd-stories-v1.0.0';
const STATIC_CACHE = 'stryd-static-v1.0.0';

// Files to cache immediately
const STATIC_FILES = [
  '/stryd/',
  '/stryd/index.html',
  '/stryd/styles.css',
  '/stryd/app.js',
  '/stryd/manifest.json',
  'https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@200;300;400;500;600&family=Inter:wght@100;200;300;400;500;600;700;800;900&display=swap',
  'https://unpkg.com/react@18/umd/react.production.min.js',
  'https://unpkg.com/react-dom@18/umd/react-dom.production.min.js'
];

// Install event - cache static files
self.addEventListener('install', (event) => {
  console.log('Service Worker installing...');
  
  event.waitUntil(
    caches.open(STATIC_CACHE)
      .then((cache) => {
        console.log('Caching static files...');
        return cache.addAll(STATIC_FILES);
      })
      .then(() => {
        console.log('Static files cached successfully');
        return self.skipWaiting();
      })
      .catch((error) => {
        console.error('Cache installation failed:', error);
      })
  );
});

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  console.log('Service Worker activating...');
  
  event.waitUntil(
    caches.keys()
      .then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            if (cacheName !== STATIC_CACHE && cacheName !== CACHE_NAME) {
              console.log('Deleting old cache:', cacheName);
              return caches.delete(cacheName);
            }
          })
        );
      })
      .then(() => {
        console.log('Service Worker activated');
        return self.clients.claim();
      })
  );
});

// Fetch event - serve from cache, fallback to network
self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Handle navigation requests
  if (request.mode === 'navigate') {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match('/stryd/index.html');
        })
        .then((response) => {
          if (response) {
            return response;
          }
          return fetch(request);
        })
        .catch(() => {
          // Offline fallback
          return caches.match('/stryd/index.html');
        })
    );
    return;
  }

  // Handle static file requests
  if (STATIC_FILES.some(file => request.url.includes(file.replace(/^\//, '')))) {
    event.respondWith(
      caches.open(STATIC_CACHE)
        .then((cache) => {
          return cache.match(request);
        })
        .then((response) => {
          if (response) {
            // Serve from cache
            return response;
          }
          
          // Fetch from network and cache
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(STATIC_CACHE)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            });
        })
        .catch(() => {
          // Return cached version if available
          return caches.match(request);
        })
    );
    return;
  }

  // Handle image uploads and other dynamic content
  if (request.url.includes('/stryd/') && request.method === 'POST') {
    // Let POST requests go through to network
    event.respondWith(fetch(request));
    return;
  }

  // Handle external resources (fonts, CDN)
  if (!request.url.startsWith(self.location.origin)) {
    event.respondWith(
      caches.open(CACHE_NAME)
        .then((cache) => {
          return cache.match(request);
        })
        .then((response) => {
          if (response) {
            return response;
          }
          
          return fetch(request)
            .then((networkResponse) => {
              if (networkResponse.ok) {
                const responseClone = networkResponse.clone();
                caches.open(CACHE_NAME)
                  .then((cache) => {
                    cache.put(request, responseClone);
                  });
              }
              return networkResponse;
            });
        })
        .catch(() => {
          console.log('External resource failed to load:', request.url);
        })
    );
    return;
  }

  // Default: network first, cache fallback
  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME)
            .then((cache) => {
              cache.put(request, responseClone);
            });
        }
        return response;
      })
      .catch(() => {
        return caches.match(request);
      })
  );
});

// Background sync for offline actions
self.addEventListener('sync', (event) => {
  console.log('Background sync triggered:', event.tag);
  
  if (event.tag === 'background-sync') {
    event.waitUntil(
      // Handle any queued actions when back online
      console.log('Processing background sync...')
    );
  }
});

// Push notification handling (for future features)
self.addEventListener('push', (event) => {
  console.log('Push notification received:', event);
  
  const options = {
    body: 'Your Stryd story is ready!',
    icon: '/stryd/icons/icon-192x192.png',
    badge: '/stryd/icons/badge-72x72.png',
    vibrate: [100, 50, 100],
    data: {
      dateOfArrival: Date.now(),
      primaryKey: 1
    },
    actions: [
      {
        action: 'explore',
        title: 'View Story',
        icon: '/stryd/icons/action-view.png'
      },
      {
        action: 'close',
        title: 'Close',
        icon: '/stryd/icons/action-close.png'
      }
    ]
  };
  
  event.waitUntil(
    self.registration.showNotification('Stryd Stories', options)
  );
});

// Handle notification clicks
self.addEventListener('notificationclick', (event) => {
  console.log('Notification clicked:', event);
  
  event.notification.close();
  
  if (event.action === 'explore') {
    event.waitUntil(
      clients.openWindow('/stryd/')
    );
  }
});

// Message handling from main app
self.addEventListener('message', (event) => {
  console.log('Service Worker received message:', event.data);
  
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
  
  if (event.data && event.data.type === 'CACHE_CLEAR') {
    event.waitUntil(
      caches.keys().then((cacheNames) => {
        return Promise.all(
          cacheNames.map((cacheName) => {
            return caches.delete(cacheName);
          })
        );
      }).then(() => {
        event.ports[0].postMessage({ success: true });
      })
    );
  }
});