// Bump this string on every deploy so old caches are dropped and every device re-downloads the game.
const CACHE = 'boggle-duo-v3';
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
      // cache: 'reload' skips the browser's HTTP cache so the new version really is the newest one
      .then(c => Promise.all(ASSETS.map(a => c.add(new Request(a, { cache: 'reload' })))))
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

  const url = new URL(e.request.url);
  const isPage = e.request.mode === 'navigate' || url.pathname.endsWith('/') || url.pathname.endsWith('index.html');

  if (isPage) {
    // The game page: NETWORK FIRST, so a new deploy is used immediately (not one visit later).
    // Falls back to the saved copy only when offline.
    e.respondWith(
      fetch(e.request, { cache: 'no-cache' }).then(res => {
        if (res && res.status === 200 && res.type === 'basic') {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => caches.match(e.request).then(c => c || caches.match('./index.html') || caches.match('./')))
    );
    return;
  }

  // Everything else (icons, manifest, fonts): cache first, refreshed in the background.
  e.respondWith(
    caches.match(e.request).then(cached => {
      const net = fetch(e.request).then(res => {
        if (res && res.status === 200 && (res.type === 'basic' || res.type === 'cors')) {
          const copy = res.clone();
          caches.open(CACHE).then(c => c.put(e.request, copy));
        }
        return res;
      }).catch(() => cached);
      return cached || net;
    })
  );
});
