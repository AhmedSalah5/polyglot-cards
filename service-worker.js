const CACHE = "polyglot-cards-v5";

// Every file the app needs to run offline. Names must match your real files exactly.
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
  "js/languages.js",
  "js/theme.js",
  "icons/icon-192.png",
  "icons/icon-512.png",
];

// 1. Install: save each file separately, so one missing file doesn't break everything
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE).then((cache) =>
      Promise.all(
        FILES.map((file) =>
          cache.add(file).catch((error) => console.warn("Not cached:", file, error))
        )
      )
    )
  );
  self.skipWaiting();
});

// 2. Activate: delete caches from older versions
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches
      .keys()
      .then((keys) => Promise.all(keys.filter((key) => key !== CACHE).map((key) => caches.delete(key))))
      .then(() => self.clients.claim())
  );
});

// 3. Fetch: answer from the saved copy right away, and refresh it in the background
async function handle(event) {
  const { request } = event;
  const cache = await caches.open(CACHE);
  const cached = await cache.match(request, { ignoreSearch: true });

  const update = fetch(request)
    .then((response) => {
      if (response.ok) cache.put(request, response.clone());
      return response;
    })
    .catch(() => null);

  if (cached) {
    event.waitUntil(update); // keep the worker alive until the refresh finishes
    return cached;
  }
  return (await update) ?? (await cache.match("index.html")) ?? Response.error();
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET" || new URL(request.url).origin !== self.location.origin) return;
  event.respondWith(handle(event));
});