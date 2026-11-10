// Arenova service worker
// IMPORTANT: VERSION must match the V value in the loader at the top of index.html (and the ?v= on the CSS links).
// Bump BOTH on every deploy so players get the new files.
const VERSION = '20261110';
const CACHE = 'arenova-' + VERSION;

// Files that are always needed (install fails if one of these can't be fetched)
const CORE = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// Split app files. Requested with ?v=VERSION by the loader, so they are cached under that exact URL.
const APP_FILES = [
  'css/base.css',
  'css/games/boggle.css',
  'css/games/scattergories.css',
  'css/games/hangman.css',
  'css/games/sketch-race.css',
  'css/games/snakes-trivia.css',
  'css/games/spy-word.css',
  'css/games/word-chain.css',
  'css/games/island-mayor.css',
  'games/boggle.html',
  'games/scattergories.html',
  'games/hangman.html',
  'games/sketch-race.html',
  'games/snakes-trivia.html',
  'games/spy-word.html',
  'games/word-chain.html',
  'games/island-mayor.html',
  'js/core/config.js',
  'js/core/dictionary.js',
  'js/core/state.js',
  'js/core/utils.js',
  'js/core/sound.js',
  'js/core/ambient.js',
  'js/core/profile.js',
  'js/core/matchmaking.js',
  'js/core/howto.js',
  'js/core/rooms.js',
  'js/core/social.js',
  'js/core/friends.js',
  'js/core/rounds.js',
  'js/core/room-sync.js',
  'js/core/results.js',
  'js/core/pwa.js',
  'js/games/boggle.js',
  'js/games/scattergories.js',
  'js/games/hangman.js',
  'js/games/sketch-race.js',
  'js/games/spy-word.js',
  'js/games/word-chain.js',
  'js/games/snakes-trivia.js',
  'js/games/island-mayor.js',
  'js/core/thumbnails.js',
  'js/core/auth.js'
].map(f => './' + f + '?v=' + VERSION);

// Never cache Firebase URLs so the game doesn't get stuck offline.
self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(CACHE)
      .then(c => c.addAll(CORE).then(() =>
        // app files are cached one by one: a single failure must not block the install
        Promise.all(APP_FILES.map(u => c.add(u).catch(() => {})))
      ))
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
