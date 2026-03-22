/**
 * EduTutor India — Service Worker (Offline-First PWA)
 * ====================================================
 * Strategy:
 *   - App Shell (HTML, manifest): Cache-First → serve from cache, update in background.
 *   - PDF.js CDN assets: Cache on first fetch.
 *   - Scaledown API calls: Network-First → on failure, return a mock fallback so the
 *     app keeps working offline (mock mode activates automatically).
 */

const CACHE_NAME    = 'edututor-v1';
const SCALEDOWN_URL = 'https://api.scaledown.xyz/compress/raw/';

/* App-shell assets to pre-cache on install */
const PRECACHE_ASSETS = [
  './index.html',
  './manifest.json',
  /* PDF.js from CDN — cached on first use, listed here for explicit pre-warm */
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.min.mjs',
  'https://cdnjs.cloudflare.com/ajax/libs/pdf.js/4.4.168/pdf.worker.min.mjs',
];

/* ── Install: pre-cache app shell ─────────────────────────── */
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(PRECACHE_ASSETS.filter(url => !url.startsWith('https://cdnjs'))))
      .then(() => self.skipWaiting())
  );
});

/* ── Activate: remove stale caches ───────────────────────── */
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys()
      .then(keys => Promise.all(
        keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))
      ))
      .then(() => self.clients.claim())
  );
});

/* ── Fetch: routing logic ─────────────────────────────────── */
self.addEventListener('fetch', event => {
  const { request } = event;
  const url = request.url;

  /* Scaledown API → Network-First with offline mock fallback */
  if (url.startsWith(SCALEDOWN_URL)) {
    event.respondWith(networkFirstWithFallback(request));
    return;
  }

  /* CDN assets (PDF.js) → Cache-First */
  if (url.includes('cdnjs.cloudflare.com') || url.includes('pdf.js')) {
    event.respondWith(cacheFirst(request));
    return;
  }

  /* App shell & everything else → Cache-First, fallback to network */
  event.respondWith(cacheFirst(request));
});

/* ── Strategies ───────────────────────────────────────────── */

async function cacheFirst(request) {
  const cached = await caches.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response.ok) {
      const cache = await caches.open(CACHE_NAME);
      cache.put(request, response.clone());
    }
    return response;
  } catch {
    return new Response('Offline and not cached.', { status: 503 });
  }
}

async function networkFirstWithFallback(request) {
  try {
    const response = await fetch(request.clone());
    return response;
  } catch {
    /* Offline: return a mock compressed response so the UI keeps working */
    const body  = await request.clone().json().catch(() => ({ text: '' }));
    const words = (body.text || '').split(/\s+/).filter(Boolean);
    const slice = words.slice(0, Math.max(1, Math.floor(words.length / 5))).join(' ');
    return new Response(
      JSON.stringify({ compressed: slice, offline_fallback: true }),
      { status: 200, headers: { 'Content-Type': 'application/json' } }
    );
  }
}
