/* ── AppNest · Cloudflare Pages fix (Oct 2026) ──
   Cloudflare redirects *.html to clean URLs (/index.html -> /). Chrome refuses a
   "redirected" response that a Service Worker hands to a page load (ERR_FAILED).
   This strips the redirect flag from every response the SW fetches or reads from cache. */
(function(){
  var NB={101:1,204:1,205:1,304:1};
  function clean(r){
    if(!r||!r.redirected||NB[r.status])return r;
    return r.blob().then(function(b){return new Response(b,{status:r.status,statusText:r.statusText,headers:r.headers});});
  }
  var _fetch=self.fetch.bind(self);
  self.fetch=function(input,init){
    if(input&&typeof input==='object'&&input.mode==='navigate')input=input.url;
    return _fetch(input,init).then(clean);
  };
  var cm=Cache.prototype.match;
  Cache.prototype.match=function(){return cm.apply(this,arguments).then(clean);};
  var sm=CacheStorage.prototype.match;
  CacheStorage.prototype.match=function(){return sm.apply(this,arguments).then(clean);};
})();

/* AppNest Service Worker — ספריית הכושר 2.1
   חוקי AppNest (מסמך הדרישות, חלקים י״ב / ט״ז / י״ח):
   · שמירה לפי קובץ (allSettled) — לא addAll אטומי
   · ניווט: רשת קודם עם זמן קצוב ← מטמון ← דף אופליין. לעולם לא שגיאה.
   · רק שורש האפליקציה נשמר כדף הראשי ("./"), לא index.html
   · מדיה במטמון נפרד וקבוע — לא נמחק בעדכון גרסה (138MB לא יורדים שוב)
   · בכל עדכון: להעלות את VERSION */
const VERSION = 'fitlib-v10';
// ⚠️ חייב להתאים לתגית <script src="fitlog.js?v=..."> ב-index.html — מעלים את שניהם יחד.
//    הפרמטר מונע ערבוב: index.html חדש מהרשת + fitlog.js ישן מהמטמון של ה-SW הקודם.
const FITLOG = './fitlog.js?v=21';
const MEDIA_CACHE = 'fitlib-media-v1';
const CORE = ['./', FITLOG, './exercises.js', './names-he.js', './manifest.json', './icons/icon-192.png', './icons/icon-512.png'];
const SCOPE_PATH = new URL('./', self.location).pathname;

self.addEventListener('install', e => {
  e.waitUntil(
    caches.open(VERSION)
      .then(c => Promise.allSettled(CORE.map(u =>
        fetch(new Request(u, { cache: 'reload' })).then(r => (r && r.ok) ? c.put(u, r) : null)
      )))
      .then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', e => {
  e.waitUntil(
    caches.keys()
      .then(keys => Promise.all(keys
        .filter(k => k.startsWith('fitlib-') && k !== VERSION && k !== MEDIA_CACHE)
        .map(k => caches.delete(k))))
      .then(() => self.clients.claim())
  );
});

const OFFLINE_HTML = `<!doctype html><html lang="he" dir="rtl"><head><meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1"><title>ספריית הכושר — אין חיבור</title>
<style>body{margin:0;min-height:100vh;display:flex;align-items:center;justify-content:center;
background:#0a0a0a;color:#f5f5f4;font-family:-apple-system,'Segoe UI',sans-serif;text-align:center;padding:24px}
h1{font-size:20px;margin:12px 0 6px}p{color:#a1a1aa;font-size:14px;line-height:1.7;margin:0 0 20px}
button{background:#d4a437;color:#0a0a0a;border:0;border-radius:10px;padding:11px 26px;font-weight:700;font-size:15px}</style>
</head><body><div><div style="font-size:42px">📡</div><h1>אין חיבור לאינטרנט</h1>
<p>האפליקציה עוד לא נשמרה במכשיר.<br>התחברו לרשת ונסו שוב.<br><span dir="ltr">No connection — please try again.</span></p>
<button onclick="location.reload()">נסו שוב · Retry</button></div></body></html>`;

const offlineResponse = () =>
  new Response(OFFLINE_HTML, { status: 200, headers: { 'Content-Type': 'text/html; charset=utf-8' } });

const isAppRoot = url => url.pathname === SCOPE_PATH || url.pathname === SCOPE_PATH + 'index.html';

function withTimeout(promise, ms) {
  return new Promise((resolve, reject) => {
    const t = setTimeout(() => reject(new Error('timeout')), ms);
    promise.then(v => { clearTimeout(t); resolve(v); }, err => { clearTimeout(t); reject(err); });
  });
}

function handleNavigate(req, url) {
  return withTimeout(fetch(req), 4000)
    .then(res => {
      if (res && res.ok && isAppRoot(url)) {
        const copy = res.clone();
        caches.open(VERSION).then(c => c.put('./', copy)).catch(() => {});
      }
      return res;
    })
    .catch(() =>
      // שורש האפליקציה ← העותק השמור; כל כתובת אחרת ← העותק שלה, ואם אין — דף אופליין
      // (לא מגישים את האפליקציה בכתובת עמוקה: הנתיבים היחסיים לקבצים היו נשברים)
      caches.match(isAppRoot(url) ? './' : req)
        .then(hit => hit || offlineResponse())
    );
}

function handleMedia(req) {
  return caches.open(MEDIA_CACHE).then(c =>
    c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) c.put(req, res.clone()).catch(() => {});
      return res;
    }))
  );
}

// קבצים סטטיים: מהמטמון קודם. הם מתחדשים כשעולה VERSION (ההתקנה מורידה את CORE מחדש),
// כך שלא מורידים 3.5MB ברקע בכל פתיחה על חבילת גלישה.
function handleAsset(req) {
  return caches.open(VERSION).then(c =>
    c.match(req).then(hit => hit || fetch(req).then(res => {
      if (res && res.ok) c.put(req, res.clone()).catch(() => {});
      return res;
    }))
  );
}

self.addEventListener('fetch', e => {
  const req = e.request;
  const url = new URL(req.url);
  if (req.method !== 'GET' || url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') { e.respondWith(handleNavigate(req, url)); return; }

  // המאגר המלא (17MB) נטען רק לייצוא SQL — ישר מהרשת, לא נשמר
  if (url.pathname.endsWith('/exercises-full.js')) return;

  if (url.pathname.includes('/images/') || url.pathname.includes('/videos/')) {
    e.respondWith(handleMedia(req));
    return;
  }

  e.respondWith(handleAsset(req));
});

// לחיצה על תזכורת אימון — פותחת את האפליקציה
self.addEventListener('notificationclick', e => {
  e.notification.close();
  const target = (e.notification.data && e.notification.data.url) || './';
  e.waitUntil(
    self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
      for (const c of list) { if ('focus' in c) return c.focus(); }
      return self.clients.openWindow(target);
    })
  );
});
