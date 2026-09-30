const CACHE = "polyglot-cards-v1";

// Every file the app needs to run offline. These must match your real file names exactly.
const FILES = [
  "./",
  "index.html",
  "manifest.json",
  "css/output.css",
  "js/app.js",
  "js/storage.js",
  "js/ui.js",
  "js/srs.js",
  "js/review.js",
  "js/reader.js",
  "js/speech.js",
  "js/stats.js",
  "js/backup.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// 1. Install: save all the files
self.addEventListener("install", (event) => {
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(FILES)));
  self.skipWaiting();
});

// 2. Activate: delete old caches from previous versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// 3. Fetch: try the internet first (so you always get the newest version),
//    and fall back to the saved copy when offline
self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;

  event.respondWith(
    fetch(request)
      .then((response) => {
        if (response.ok) {
          const copy = response.clone();
          caches.open(CACHE).then((cache) => cache.put(request, copy));
        }
        return response;
      })
      .catch(() => caches.match(request).then((cached) => cached ?? caches.match("index.html")))
  );
});