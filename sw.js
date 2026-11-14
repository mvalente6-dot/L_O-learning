/* When the phone is online, open the newest game. Keep a copy so a later
   visit still works if the connection drops. Opening the HTML from a folder
   does not use this. */
const CACHE = 'playlearn-latest-1';

self.addEventListener('install', () => {
  self.skipWaiting();
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    const upgraded = keys.some(key => key !== CACHE);
    await Promise.all(keys.filter(key => key !== CACHE).map(key => caches.delete(key)));
    await self.clients.claim();
    if (!upgraded) return;
    const windows = await self.clients.matchAll({ type: 'window' });
    windows.forEach(win => { win.navigate(win.url).catch(() => {}); });
  })());
});

function cleanUrl(url){
  const u = new URL(url);
  u.searchParams.delete('fresh');
  return u.href;
}

async function newestPage(request){
  const cache = await caches.open(CACHE);
  const savedUrl = cleanUrl(request.url);
  const bust = new URL(savedUrl);
  bust.searchParams.set('fresh', String(Date.now()));
  try {
    const fresh = await fetch(bust.href, { cache: 'no-store' });
    if (fresh.ok) await cache.put(savedUrl, fresh.clone());
    if (fresh.ok || fresh.type === 'opaqueredirect') return fresh;
    const saved = await cache.match(savedUrl);
    return saved || fresh;
  } catch (e) {
    const saved = await cache.match(savedUrl);
    if (saved) return saved;
    throw e;
  }
}

async function savedAsset(request){
  const cache = await caches.open(CACHE);
  const saved = await cache.match(request);
  const update = fetch(request).then(fresh => {
    if (fresh.ok) cache.put(request, fresh.clone());
    return fresh;
  }).catch(() => null);
  if (saved) return saved;
  const fresh = await update;
  if (fresh) return fresh;
  return new Response('', { status: 504 });
}

self.addEventListener('fetch', event => {
  const req = event.request;
  if (req.method !== 'GET') return;
  if (req.headers.has('range')) return;
  const url = new URL(req.url);
  if (url.origin !== location.origin) return;
  if (url.pathname.endsWith('/sw.js')) return;
  if (req.mode === 'navigate' || url.pathname.endsWith('.html')) {
    event.respondWith(newestPage(req));
    return;
  }
  event.respondWith(savedAsset(req));
});
