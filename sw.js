const CACHE_NAME = 'has-field-v2';
const urlsToCache = [
  '/', '/index.html', '/manifest.json',
  'https://cdn.jsdelivr.net/npm/appwrite@13.0.0',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a44ddc00037a7b69023/view?project=6a42691c0006e65e22b2&mode=admin'
];

self.addEventListener('install', event => { event.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache))); self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(caches.keys().then(names => Promise.all(names.map(name => { if (name !== CACHE_NAME) return caches.delete(name); })))); self.clients.claim(); });
self.addEventListener('fetch', event => { if (event.request.url.includes('appwrite.io') && !event.request.url.includes('files/')) return; event.respondWith(caches.match(event.request).then(response => response || fetch(event.request).then(res => { const clone = res.clone(); caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone)); return res; }))); });
self.addEventListener('push', event => { const data = event.data?.json() || {}; event.waitUntil(self.registration.showNotification(data.title || 'HAS Field System', { body: data.body || 'New notification', icon: 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a44ddc00037a7b69023/view?project=6a42691c0006e65e22b2&mode=admin', badge: 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a44ddc00037a7b69023/view?project=6a42691c0006e65e22b2&mode=admin', vibrate: [100, 50, 100], data: { url: data.url || '/' } })); });
self.addEventListener('notificationclick', event => { event.notification.close(); event.waitUntil(clients.openWindow(event.notification.data.url || '/')); });
