// ===== Vivere atque FruiT • Service Worker (stabilní verze) =====
const CACHE_NAME = 'vaft-cache-v3'; // při změně obsahu zvyš číslo
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

// instalace (stáhne základní soubory)
self.addEventListener('install', event => {
  console.log('[SW] instalace...');
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => cache.addAll(ASSETS))
  );
  self.skipWaiting(); // hned aktivuj
});

// aktivace (vymaž staré cache)
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
  clients.claim(); // aktivuj pro všechny stránky
});

// fetch (chovej se chytře – nejdřív cache, pak síť)
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(resp => {
      // když je v cache → dej hned, jinak zkus síť
      return (
        resp ||
        fetch(event.request)
          .then(response => {
            // ulož novou verzi do cache pro příště
            const copy = response.clone();
            caches.open(CACHE_NAME).then(cache => {
              cache.put(event.request, copy);
            });
            return response;
          })
          .catch(() => resp) // když nejsi online, použij starou
      );
    })
  );
});
