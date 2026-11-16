/* The System - service worker
   1) Offline cache (app shell + fonts)
   2) Notifications: click handling, push, periodic background check
   Bump VERSION whenever you change any cached file. */
const VERSION = 'the-system-v3';
const ASSETS = ['./', 'index.html', 'css/style.css', 'js/app.js', 'manifest.json',
  'icons/icon.svg', 'icons/favicon.ico', 'icons/apple-touch-icon.png', 'icons/icon-192.png', 'icons/icon-512.png', 'icons/icon-maskable-512.png'];

self.addEventListener('install', e => {
  e.waitUntil(caches.open(VERSION).then(c => c.addAll(ASSETS)).then(() => self.skipWaiting()));
});

self.addEventListener('activate', e => {
  e.waitUntil(caches.keys()
    .then(keys => Promise.all(keys.filter(k => k !== VERSION).map(k => caches.delete(k))))
    .then(() => self.clients.claim()));
});

self.addEventListener('fetch', e => {
  const r = e.request;
  if (r.method !== 'GET') return;
  const u = new URL(r.url);
  const own = u.origin === location.origin;
  const font = /(^|\.)fonts\.(googleapis|gstatic)\.com$/.test(u.hostname);
  if (!own && !font) return;
  // stale-while-revalidate
  e.respondWith(caches.open(VERSION).then(cache => cache.match(r).then(hit => {
    const net = fetch(r).then(res => { if (res && (res.ok || res.type === 'opaque')) cache.put(r, res.clone()); return res; })
      .catch(() => hit || (own ? cache.match('index.html') : undefined));
    return hit || net;
  })));
});

self.addEventListener('notificationclick', e => {
  e.notification.close();
  e.waitUntil(self.clients.matchAll({ type: 'window', includeUncontrolled: true }).then(list => {
    for (const c of list) { if ('focus' in c) return c.focus(); }
    return self.clients.openWindow('./');
  }));
});

/* Optional: Web Push from your own server (see README). */
self.addEventListener('push', e => {
  let d = {}; try { d = e.data ? e.data.json() : {}; } catch (_) {}
  e.waitUntil(self.registration.showNotification(d.title || '[SYSTEM] Quest', {
    body: d.body || '', tag: d.tag || 'push', icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [200, 100, 200], data: { url: './' }
  }));
});

/* The page sends a snapshot of today's tasks so the worker can check them in the background. */
self.addEventListener('message', e => {
  const d = e.data || {};
  if (d.type === 'snap') e.waitUntil(idbSet('snap', d.snap));
});

/* Best effort: browsers run this rarely (installed apps only, interval chosen by the browser). */
self.addEventListener('periodicsync', e => {
  if (e.tag === 'quest-check') e.waitUntil(check());
});

function idb() {
  return new Promise((res, rej) => {
    const r = indexedDB.open('the-system', 1);
    r.onupgradeneeded = () => r.result.createObjectStore('kv');
    r.onsuccess = () => res(r.result);
    r.onerror = () => rej(r.error);
  });
}
async function idbSet(k, v) {
  const d = await idb();
  return new Promise((res, rej) => { const t = d.transaction('kv', 'readwrite'); t.objectStore('kv').put(v, k); t.oncomplete = res; t.onerror = () => rej(t.error); });
}
async function idbGet(k) {
  const d = await idb();
  return new Promise((res, rej) => { const q = d.transaction('kv').objectStore('kv').get(k); q.onsuccess = () => res(q.result); q.onerror = () => rej(q.error); });
}
async function check() {
  const s = await idbGet('snap'); if (!s) return;
  const n = new Date(), nm = n.getHours() * 60 + n.getMinutes();
  const k = n.getFullYear() + '-' + String(n.getMonth() + 1).padStart(2, '0') + '-' + String(n.getDate()).padStart(2, '0');
  const done = s.date === k ? s.done : [];
  for (const t of s.tasks) {
    const [h, m] = t.start.split(':').map(Number), tm = h * 60 + m;
    const today = t.core || (t.on ? t.on === k : t.days.includes(n.getDay()));
    if (today && tm <= nm && tm >= nm - 20 && !done.includes(t.id)) {
      await self.registration.showNotification('[SYSTEM] ' + t.title, {
        tag: 'bg-' + k + t.id, body: t.start + ' - ' + t.end, icon: 'icons/icon-192.png', badge: 'icons/icon-192.png', vibrate: [200, 100, 200], data: { url: './' }
      });
    }
  }
}
