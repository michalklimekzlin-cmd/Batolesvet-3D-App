// ===== Vivere atque FruiT • Service Worker (rychlá verze) =====
const CACHE_NAME = 'vaft-cache-v4'; // zvýšeno z v3 → donutí to stáhnout znova
const ASSETS = [
  './',
  './index.html',
  './style.css',
  './app.js',
  './hlavoun.js',
  './agents.js',
  './pikos.js',
  './manifest.json'
];

// instalace – spustit hned, cachování běží "best effort"
self.addEventListener('install', event => {
  console.log('[SW] instalace (rychlá)...');
  self.skipWaiting();
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      // když něco nejde stáhnout, ať se to celé nezasekne
      return Promise.all(
        ASSETS.map(url =>
          fetch(url)
            .then(res => {
              if (res.ok) cache.put(url, res.clone());
            })
            .catch(() => {
              console.warn('[SW] nepodařilo se stáhnout:', url);
            })
        )
      );
    })
  );
});

// aktivace – smaž staré cache
self.addEventListener('activate', event => {
  console.log('[SW] aktivace...');
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys
          .filter(key => key !== CACHE_NAME)
          .map(key => {
            console.log('[SW] mažu starou cache:', key);
            return caches.delete(key);
          })
      )
    )
  );
  self.clients.claim();
});

// fetch – NETWORK FIRST → když nejde síť, vem cache
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // ulož si čerstvou verzi
        const copy = response.clone();
        caches.open(CACHE_NAME).then(cache => cache.put(event.request, copy));
        return response;
      })
      .catch(() => {
        // offline / chyba → zkus cache
        return caches.match(event.request);
      })
  );
});
