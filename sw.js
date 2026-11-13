/* IRM Portal service worker — network-only by design.
   Request, login and customer data are NEVER saved in Service Worker caches.
   Network access is required to use the portal.
   It also shows the chat notification when the server sends a push. */
self.addEventListener('install', event => { self.skipWaiting(); });
self.addEventListener('activate', event => { event.waitUntil(self.clients.claim()); });
self.addEventListener('fetch', event => {
  // Same-origin HTML navigations only. Do not intercept any cross-origin APIs,
  // authentication SDKs, POSTs or non-navigation assets.
  if (event.request.mode !== 'navigate' || event.request.method !== 'GET') return;
  if (new URL(event.request.url).origin !== self.location.origin) return;
  event.respondWith(fetch(event.request));
});

/* ----- Chat notifications ----- */
// The push carries no text (nothing about the chat leaves the portal), so the
// notification is always the same line. Tapping it opens the chat.
const IS_APPLE = /iPhone|iPad|iPod/.test(self.navigator.userAgent) ||
  (/Macintosh/.test(self.navigator.userAgent) && !/Chrome|Chromium|Firefox|Edg\//.test(self.navigator.userAgent));
self.addEventListener('push', event => {
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    wins.forEach(c => { try { c.postMessage({ type: 'irm-push' }); } catch (e) {} });   // open pages fetch the message now
    // The portal is on screen: its own sound and toast are enough.
    // (Apple devices must always show a notification, or they stop delivering.)
    if (!IS_APPLE && wins.some(c => c.visibilityState === 'visible')) return;
    await self.registration.showNotification('IRM Portal', {
      body: 'New chat message',
      icon: './icon-192.png',
      badge: './icon-192.png',
      tag: 'irm-chat',
      renotify: true,
      data: { url: new URL('./?chat=1', self.registration.scope).href }
    });
  })());
});
self.addEventListener('notificationclick', event => {
  event.notification.close();
  const url = (event.notification.data && event.notification.data.url) || self.registration.scope;
  event.waitUntil((async () => {
    const wins = await self.clients.matchAll({ type: 'window', includeUncontrolled: true });
    const mine = wins.find(c => c.url.indexOf(self.registration.scope) === 0);
    if (mine) {
      try { await mine.focus(); } catch (e) {}
      mine.postMessage({ type: 'irm-open-chat' });
      return;
    }
    await self.clients.openWindow(url);
  })());
});
