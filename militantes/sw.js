// Funcionamento sem internet: guarda a aplicação em cache.
const CACHE = 'militantes-2026.11.13-g1';
const FICHEIROS = ['./', './index.html', './manifest.json', './favicon.png', './icon-192.png', './icon-512.png', './icon-maskable-512.png', './apple-touch-icon.png', './caop2025.js', './lib/qrcode.js', './lib/jspdf.umd.min.js', './lib/jsQR.js', './fonts/manrope-latin-wght-normal.woff2', './fonts/manrope-latin-ext-wght-normal.woff2'];
self.addEventListener('install', e => { e.waitUntil(caches.open(CACHE).then(c => c.addAll(FICHEIROS)).then(() => self.skipWaiting())); });
self.addEventListener('activate', e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== CACHE).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener('fetch', e => {
  if (e.request.method !== 'GET') return;
  e.respondWith(caches.match(e.request).then(r => r || fetch(e.request).then(res => {
    const url = new URL(e.request.url);
    if (res.ok && (url.origin === location.origin || url.hostname.endsWith('fonts.googleapis.com') || url.hostname.endsWith('fonts.gstatic.com'))) {
      const copia = res.clone(); caches.open(CACHE).then(c => c.put(e.request, copia));
    }
    return res;
  }).catch(() => caches.match('./index.html'))));
});
