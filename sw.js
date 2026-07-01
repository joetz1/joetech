const CACHE_NAME = 'has-field-v3';
const LOGO_URL = 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2';

const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  LOGO_URL, // ← Cache logo
  'https://cdn.jsdelivr.net/npm/appwrite@13.0.0',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching resources including logo');
        return cache.addAll(urlsToCache);
      })
      .catch(err => console.log('[SW] Cache failed:', err))
  );
  self.skipWaiting();
});

// Activate Service Worker
self.addEventListener('activate', event => {
  console.log('[SW] Activating...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy
self.addEventListener('fetch', event => {
  // Allow Appwrite files (logo)
  if (event.request.url.includes('appwrite.io') && event.request.url.includes('/files/')) {
    event.respondWith(
      caches.match(event.request)
        .then(cachedResponse => {
          return cachedResponse || fetch(event.request)
            .then(response => {
              const responseToCache = response.clone();
              caches.open(CACHE_NAME)
                .then(cache => cache.put(event.request, responseToCache));
              return response;
            });
        })
    );
    return;
  }
  
  // Skip other Appwrite API calls
  if (event.request.url.includes('appwrite.io')) return;
  
  // Cache first strategy for other resources
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        return cachedResponse || fetch(event.request)
          .then(response => {
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => cache.put(event.request, responseToCache));
            return response;
          });
      })
  );
});

// Push Notification with Logo
self.addEventListener('push', event => {
  const data = event.data?.json() || {};
  const options = {
    body: data.body || 'New notification from HAS Field System',
    icon: LOGO_URL,
    badge: LOGO_URL,
    vibrate: [100, 50, 100],
    data: { url: data.url || '/' }
  };
  event.waitUntil(
    self.registration.showNotification(
      data.title || 'HAS Field System',
      options
    )
  );
});
