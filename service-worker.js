// Vivere atque FruiT offline worker
const CACHE_NAME = 'vaft-cache-v1';
const urlsToCache = [
  './',
  './index.html',
  './style.css',
  './manifest.json',
  './VafiT-gallery/index.html',
  './VafiT-gallery/style.css',
  './VafiT-gallery/app.js'
];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE_NAME).then(cache => cache.addAll(urlsToCache)));
});

self.addEventListener('fetch', e => {
  e.respondWith(caches.match(e.request).then(resp => resp || fetch(e.request)));
});
