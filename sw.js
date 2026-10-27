const CACHE = 'tiyn-v1';
const ASSETS = ['./', './index.html', './manifest.json', './icon-180.png', './icon-192.png', './icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(CACHE).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});
self.addEventListener('activate', e => {
  e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim()));
});
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  const url = new URL(e.request.url);
  const put = (req, res) => { const cp = res.clone(); caches.open(CACHE).then(c => c.put(req, cp)); return res; };
  if (url.origin === location.origin) {
    // Страница: сначала сеть (чтобы обновления приходили сами), без сети — из кэша
    if (e.request.mode === 'navigate') {
      e.respondWith(fetch(e.request).then(r => put(e.request, r)).catch(() => caches.match(e.request).then(r => r || caches.match('./index.html'))));
      return;
    }
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => put(e.request, res))));
    return;
  }
  if (url.hostname === 'fonts.googleapis.com' || url.hostname === 'fonts.gstatic.com') {
    e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => put(e.request, res))));
  }
});
