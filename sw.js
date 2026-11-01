/* Globe Handset Tracker PWA — network-only by design.
   Request, login and customer data are NEVER saved in Service Worker caches.
   Network access is required to use the tracker. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  // Same-origin HTML navigations only. Do not intercept any cross-origin APIs,
  // authentication SDKs, POSTs or non-navigation assets.
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request));
});
