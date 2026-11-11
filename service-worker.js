const CACHE = 'boggle-duo-v2';
// Only cache exact local assets. Avoid Firebase URLs so the game doesn't get stuck offline.
const ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(ASSETS))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => 
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  // Only handle GET requests and ignore Firebase API calls (must go to network)
  if (e.request.method !== 'GET' || e.request.url.includes('firebase')) return;
  
  e.respondWith(
    caches.match(e.request).then(cached => {
      // Fetch new version in background
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      // Return cache immediately, fallback to network if not in cache
      return cached || net;
    })
  );
});