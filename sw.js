/* Stores each game file after the first time it loads, so a later visit
   still works if the connection drops. Opening the HTML from a folder
   does not use this. */
const CACHE = 'playlearn-photos-1';

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET') return;
  event.respondWith((async () => {
    const cache = await caches.open(CACHE);
    const saved = await cache.match(event.request);
    if (saved) return saved;
    const fresh = await fetch(event.request);
    if (fresh.ok && new URL(event.request.url).origin === location.origin) {
      cache.put(event.request, fresh.clone());
    }
    return fresh;
  })());
});
