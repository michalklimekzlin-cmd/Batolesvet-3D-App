const CACHE_NAME = "vaf-cache-v0.32";
const ASSETS = [
  "./",
  "./index.html",
  "./style.css?v=0.31",
  "./manifest.json",
  "./src/app.js?v=0.32",
  "./src/engine.js?v=0.32",
  "./src/teams.js?v=0.32"
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS))
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.map(k => k !== CACHE_NAME ? caches.delete(k) : null))
    )
  );
});

self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then(resp => resp || fetch(event.request))
  );
});