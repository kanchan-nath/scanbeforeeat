/**
 * ScanBeforeEat Service Worker (v1.0)
 * Caches app shell, stylesheets, scripts, and static resources.
 * Strictly avoids caching private API responses, user tokens, or reports.
 */

const CACHE_NAME = 'scanbeforeeat-shell-v3';

const STATIC_ASSETS = [
  '/',
  '/index.html',
  '/manifest.webmanifest',
  '/css/variables.css',
  '/css/base.css',
  '/css/components.css',
  '/css/desktop-blocker.css',
  '/vendor/tesseract/tesseract.min.js',
  '/vendor/tesseract/worker.min.js',
  '/vendor/tesseract/tesseract-core-lstm.wasm.js',
  '/vendor/tesseract/tesseract-core-simd-lstm.wasm.js',
  '/tessdata/eng.traineddata.gz',
  '/js/app.js',
  '/js/api.js',
  '/js/router.js',
  '/js/camera.js',
  '/js/ocr.js',
  '/js/barcode.js',
  '/js/report.js',
  '/js/history.js',
  '/js/comparison.js'
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[SW] Pre-caching application shell v2');
      return cache.addAll(STATIC_ASSETS);
    }).then(() => self.skipWaiting())
  );
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keys) => {
      return Promise.all(
        keys.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[SW] Clearing old cache:', key);
            return caches.delete(key);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url);

  // 1. NEVER cache API requests (privacy & security mandate)
  if (url.pathname.startsWith('/api/')) {
    return event.respondWith(
      fetch(event.request).catch(() => {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'You are currently offline. AI analysis and cloud sync require internet connectivity.',
            isOffline: true
          }),
          {
            status: 503,
            headers: { 'Content-Type': 'application/json' }
          }
        );
      })
    );
  }

  // 2. Navigation Requests: Network-first falling back to cached shell
  if (event.request.mode === 'navigate') {
    return event.respondWith(
      fetch(event.request).catch(() => {
        return caches.match('/index.html');
      })
    );
  }

  // 3. Static Assets: Network-first with cache fallback (ensures fresh scripts while retaining offline capability)
  event.respondWith(
    fetch(event.request).then((networkResponse) => {
      if (networkResponse && networkResponse.status === 200) {
        const clone = networkResponse.clone();
        caches.open(CACHE_NAME).then((cache) => cache.put(event.request, clone));
      }
      return networkResponse;
    }).catch(() => {
      return caches.match(event.request);
    })
  );
});
