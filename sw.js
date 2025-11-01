// sw.js — jednoduchý cache-buster pro PWA
const CACHE = 'batole-v34'; // zvyšit při každém nasazení

self.addEventListener('install', (e) => {
  self.skipWaiting();
  e.waitUntil(
    caches.open(CACHE).then((c) =>
      c.addAll([
        './',
        './index.html',
        './main.js?v=34',
        './manifest.json',
        './icon512.png',
      ])
    )
  );
});

self.addEventListener('activate', (e) => {
  clients.claim();
  e.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter(k => k !== CACHE).map(k => caches.delete(k)))
    )
  );
});

self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url);
  e.respondWith(
    fetch(e.request).then((res) => {
      if (url.origin === location.origin) {
        const clone = res.clone();
        caches.open(CACHE).then((c) => c.put(e.request, clone));
      }
      return res;
    }).catch(() => caches.match(e.request))
  );
});