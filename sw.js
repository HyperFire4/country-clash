// Country Clash service worker — makes the app installable and lets it open offline.
const CACHE = 'country-clash-v1';   // bump this number when you publish a new index.html to force an update
const SHELL = ['./', 'index.html', 'manifest.webmanifest', 'icon-192.png', 'icon-512.png'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(k => Promise.all(k.filter(n => n !== CACHE).map(n => caches.delete(n)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  const req = e.request, url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== location.origin) return;       // data, flags etc. go straight to the network
  if (req.mode === 'navigate') {                                              // page: newest version first, cached copy when offline
    e.respondWith(fetch(req).then(r => { caches.open(CACHE).then(c => c.put('index.html', r.clone())); return r; }).catch(() => caches.match('index.html')));
    return;
  }
  e.respondWith(caches.match(req).then(hit => { const net = fetch(req).then(r => { caches.open(CACHE).then(c => c.put(req, r.clone())); return r; }).catch(() => hit); return hit || net; }));
});
