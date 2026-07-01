const CACHE_NAME='has-field-v3';
const LOGO_URL='https://fra.cloud.appwrite.io/v1/storage/buckets/6a426a570026eb00d2a3/files/6a450f89002c34c96ce0/view?project=6a42691c0006e65e22b2';
const urlsToCache=['/','/index.html','/manifest.json',LOGO_URL];
self.addEventListener('install',e=>{e.waitUntil(caches.open(CACHE_NAME).then(c=>c.addAll(urlsToCache)));self.skipWaiting()});
self.addEventListener('activate',e=>{e.waitUntil(caches.keys().then(n=>Promise.all(n.map(name=>{if(name!==CACHE_NAME)return caches.delete(name)}))));self.clients.claim()});
self.addEventListener('fetch',e=>{if(e.request.url.includes('appwrite.io')&&!e.request.url.includes('/files/'))return;e.respondWith(caches.match(e.request).then(r=>r||fetch(e.request).then(res=>{const clone=res.clone();caches.open(CACHE_NAME).then(c=>c.put(e.request,clone));return res})))});
self.addEventListener('push',e=>{const d=e.data?.json()||{};e.waitUntil(self.registration.showNotification(d.title||'HAS Field System',{body:d.body||'New notification',icon:LOGO_URL,badge:LOGO_URL,vibrate:[100,50,100],data:{url:d.url||'/'}}))});
self.addEventListener('notificationclick',e=>{e.notification.close();e.waitUntil(clients.openWindow(e.notification.data.url||'/'))});
