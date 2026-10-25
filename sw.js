// Offline support: app shell cached; league data always tried fresh first.
const CACHE = 'grudge-ledger-v1';
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icons/icon-192.png', 'icons/icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL))); self.skipWaiting(); });
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))));
  self.clients.claim();
});
self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET') return;
  const sameOrigin = url.origin === self.location.origin;
  // Network first for data and the page, falling back to cache when offline.
  if (sameOrigin && (url.pathname.endsWith('/league.json') || e.request.mode === 'navigate' || url.pathname.endsWith('index.html'))) {
    e.respondWith(fetch(e.request).then(r => {
      const copy = r.clone(); caches.open(CACHE).then(c => c.put(url.pathname.endsWith('/league.json') ? 'data/league.json' : e.request, copy));
      return r;
    }).catch(() => caches.match(url.pathname.endsWith('/league.json') ? 'data/league.json' : e.request).then(r => r || caches.match('index.html'))));
    return;
  }
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    if (res.ok && (sameOrigin || url.host.includes('fonts.g'))) { const c2 = res.clone(); caches.open(CACHE).then(c => c.put(e.request, c2)); }
    return res;
  })));
});
