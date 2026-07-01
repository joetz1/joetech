const CACHE_NAME = 'has-field-v3';
const urlsToCache = [
  '/',
  '/index.html',
  '/manifest.json',
  'https://cdn.jsdelivr.net/npm/appwrite@13.0.0',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.5.1/css/all.min.css',
  'https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap',
  'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2&mode=admin'
];

// Install Service Worker
self.addEventListener('install', event => {
  console.log('[SW] Installing...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('[SW] Caching app shell');
        return cache.addAll(urlsToCache);
      })
      .catch(err => {
        console.log('[SW] Cache failed:', err);
      })
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
            console.log('[SW] Deleting old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Fetch Strategy: Cache First, then Network
self.addEventListener('fetch', event => {
  // Skip Appwrite API calls (don't cache them)
  if (event.request.url.includes('appwrite.io') && !event.request.url.includes('/files/')) {
    return;
  }

  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Return cached response if available
        if (cachedResponse) {
          return cachedResponse;
        }

        // Fetch from network
        return fetch(event.request)
          .then(response => {
            // Check if valid response
            if (!response || response.status !== 200 || response.type !== 'basic') {
              return response;
            }

            // Clone and cache the response
            const responseToCache = response.clone();
            caches.open(CACHE_NAME)
              .then(cache => {
                cache.put(event.request, responseToCache);
              });

            return response;
          })
          .catch(() => {
            // Return offline fallback for navigation requests
            if (event.request.mode === 'navigate') {
              return caches.match('/index.html');
            }
          });
      })
  );
});

// Push Notification
self.addEventListener('push', event => {
  console.log('[SW] Push received');
  
  let data = {};
  try {
    data = event.data?.json() || {};
  } catch(e) {
    data = { title: 'HAS Field System', body: event.data?.text() || 'New notification' };
  }

  const options = {
    body: data.body || 'You have a new notification',
    icon: 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2&mode=admin',
    badge: 'https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2&mode=admin',
    vibrate: [100, 50, 100],
    data: {
      url: data.url || '/'
    },
    actions: [
      {
        action: 'open',
        title: 'Open App'
      }
    ]
  };

  event.waitUntil(
    self.registration.showNotification(
      data.title || 'HAS Field System',
      options
    )
  );
});

// Notification Click
self.addEventListener('notificationclick', event => {
  console.log('[SW] Notification clicked');
  event.notification.close();

  const urlToOpen = event.notification.data?.url || '/';

  event.waitUntil(
    clients.matchAll({ type: 'window' })
      .then(windowClients => {
        // Check if there is already a window open
        for (const client of windowClients) {
          if (client.url === urlToOpen && 'focus' in client) {
            return client.focus();
          }
        }
        // Open new window
        if (clients.openWindow) {
          return clients.openWindow(urlToOpen);
        }
      })
  );
});

// Background Sync (for offline queue)
self.addEventListener('sync', event => {
  console.log('[SW] Background sync:', event.tag);
  if (event.tag === 'sync-attendance') {
    event.waitUntil(syncAttendance());
  } else if (event.tag === 'sync-entries') {
    event.waitUntil(syncEntries());
  }
});

// Sync attendance records
async function syncAttendance() {
  try {
    const queue = await getOfflineQueue('attendance');
    for (const record of queue) {
      // Send to server
      await fetch('/api/sync/attendance', {
        method: 'POST',
        body: JSON.stringify(record)
      });
    }
    // Clear queue
    await clearOfflineQueue('attendance');
  } catch(e) {
    console.log('[SW] Sync attendance failed:', e);
  }
}

// Sync logbook entries
async function syncEntries() {
  try {
    const queue = await getOfflineQueue('entries');
    for (const entry of queue) {
      await fetch('/api/sync/entries', {
        method: 'POST',
        body: JSON.stringify(entry)
      });
    }
    await clearOfflineQueue('entries');
  } catch(e) {
    console.log('[SW] Sync entries failed:', e);
  }
}

// Helper: Get offline queue
async function getOfflineQueue(type) {
  // In a real app, this would use IndexedDB
  return [];
}

// Helper: Clear offline queue
async function clearOfflineQueue(type) {
  // Clear queue after successful sync
}
