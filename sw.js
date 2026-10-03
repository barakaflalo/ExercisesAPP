/* AppNest Service Worker — ספריית הכושר */
/* Cloudflare Pages redirects *.html -> pretty URL (308); a cached "redirected" copy is refused for page loads. Hand navigations a clean copy. */
function cleanNav(r){ if(!r||!r.redirected) return r; return r.blob().then(b=>new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers})); }
const _respondWith=FetchEvent.prototype.respondWith;
FetchEvent.prototype.respondWith=function(p){ const nav=this.request.mode==='navigate'; return _respondWith.call(this, nav?Promise.resolve(p).then(cleanNav):p); };
const VERSION = 'fitlib-v7';
const CORE = ['./index.html', './exercises.js', './names-he.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(CORE)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys().then(keys => Promise.all(keys.filter(k => k.startsWith('fitlib-') && k !== VERSION && k !== VERSION + '-media').map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', e => {
  const url = new URL(e.request.url);
  if (e.request.method !== 'GET' || url.origin !== location.origin) return;

  // מדיה (תמונות/גיפים): cache-first עם מילוי הדרגתי
  if (url.pathname.includes('/images/') || url.pathname.includes('/videos/')) {
    e.respondWith(
      caches.open(VERSION + '-media').then(async c => {
        const hit = await c.match(e.request);
        if (hit) return hit;
        const res = await fetch(e.request);
        if (res.ok) c.put(e.request, res.clone());
        return res;
      })
    );
    return;
  }

  // ליבת האפליקציה: cache-first, עדכון ברקע
  e.respondWith(
    caches.match(e.request).then(hit => {
      const net = fetch(e.request).then(res => {
        if (res.ok) caches.open(VERSION).then(c => c.put(e.request, res.clone()));
        return res;
      }).catch(() => hit);
      return hit || net;
    })
  );
});

// לחיצה על תזכורת אימון — פותחת את האפליקציה
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './index.html';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) {
        if ('focus' in c) return c.focus();
      }
      return self.clients.openWindow(target);
    })
  );
});
