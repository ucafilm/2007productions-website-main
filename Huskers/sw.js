// Service Worker for Nebraska Huskers Game Sheet Generator
// Provides offline capabilities and caching

const CACHE_NAME = 'huskers-v1.0.0';
const urlsToCache = [
    '/huskers/',
    '/huskers/index.html',
    '/huskers/assets/css/huskers.css',
    '/huskers/assets/js/config.js',
    '/huskers/assets/js/api.js',
    '/huskers/assets/js/charts.js',
    '/huskers/assets/js/game-sheet.js',
    '/huskers/assets/js/main.js',
    'https://cdn.tailwindcss.com',
    'https://cdnjs.cloudflare.com/ajax/libs/Chart.js/3.9.1/chart.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css'
];

// Install event
self.addEventListener('install', function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(function(cache) {
                console.log('Opened cache');
                return cache.addAll(urlsToCache);
            })
    );
});

// Fetch event
self.addEventListener('fetch', function(event) {
    event.respondWith(
        caches.match(event.request)
            .then(function(response) {
                // Return cached version or fetch from network
                return response || fetch(event.request);
            }
        )
    );
});

// Activate event
self.addEventListener('activate', function(event) {
    event.waitUntil(
        caches.keys().then(function(cacheNames) {
            return Promise.all(
                cacheNames.map(function(cacheName) {
                    if (cacheName !== CACHE_NAME) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});
