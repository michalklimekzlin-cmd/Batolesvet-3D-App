// ===== Vivere atque FruiT • Centrální multi-app Service Worker =====
// Jeden worker pro celý svět, více cache podle cesty
// Michal & Kovošrot 2025 🧩

const APPS = [
  {
    name: 'root',
    prefix: '/Vivere-atque-FruiT/',
    cache: 'vaft-root-v1',
    assets: [
      '/Vivere-atque-FruiT/',
      '/Vivere-atque-FruiT/index.html',
      '/Vivere-atque-FruiT/style.css',
      '/Vivere-atque-FruiT/manifest.json'
    ]
  },
  {
    name: 'revia',
    prefix: '/Vivere-atque-FruiT/Revia/',
    cache: 'vaft-revia-v1',
    assets: [
      '/Vivere-atque-FruiT/Revia/',
      '/Vivere-atque-FruiT/Revia/index.html',
      '/Vivere-atque-FruiT/Revia/revia.css'
    ]
  },
  {
    name: 'guardian',
    prefix: '/Vivere-atque-FruiT/guardian/',
    cache: 'vaft-guardian-v1',
    assets: [
      '/Vivere-atque-FruiT/guardian/',
      '/Vivere-atque-FruiT/guardian/index.html',
      '/Vivere-atque-FruiT/guardian/guardian.js',
      '/Vivere-atque-FruiT/guardian/guardian.css'
    ]
  }
  // ← sem přidáš další appky (Michal-AI-Al-Klimek, BearHead…)
];

self.addEventListener('install', (event) => {
  console.log('[VAFT-SW] instalace…');
  event.waitUntil(
    Promise.all(
      APPS.map(app =>
        caches.open(app.cache).then(cache =>
          cache.addAll(app.assets).catch(() => {})
        )
      )
    )
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  console.log('[VAFT-SW] aktivace…');
  event.waitUntil(
    caches.keys().then(keys => {
      const allowed = APPS.map(a => a.cache);
      return Promise.all(
        keys.map(k => {
          if (!allowed.includes(k)) {
            console.log('[VAFT-SW] mažu starou cache:', k);
            return caches.delete(k);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// Pomocná funkce – přiřadí request k appce podle prefixu
function matchApp(url) {
  const u = new URL(url);
  let best = APPS[0];
  for (const app of APPS) {
    if (u.pathname.startsWith(app.prefix) && app.prefix.length > best.prefix.length) {
      best = app;
    }
  }
  return best;
}

// Fetch handler – network-first, fallback na cache
self.addEventListener('fetch', (event) => {
  const app = matchApp(event.request.url);

  event.respondWith(
    fetch(event.request)
      .then(res => {
        const copy = res.clone();
        caches.open(app.cache).then(c => c.put(event.request, copy));
        return res;
      })
      .catch(() => caches.match(event.request))
  );
});
