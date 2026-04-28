// Service Worker for "Using Social Media Islamically" PWA
// Strategy: Cache-first for assets, Network-first for HTML

const CACHE_NAME = "islamic-media-v1";
const OFFLINE_URL = "./index.html";

// All assets to pre-cache on install
const PRE_CACHE_URLS = [
  "./index.html",
  "./manifest.json",
  "./icons/icon-72.png",
  "./icons/icon-96.png",
  "./icons/icon-128.png",
  "./icons/icon-144.png",
  "./icons/icon-152.png",
  "./icons/icon-192.png",
  "./icons/icon-384.png",
  "./icons/icon-512.png",
];

// External fonts – cache on first fetch
const FONT_CACHE_NAME = "islamic-media-fonts-v1";

// ── INSTALL ────────────────────────────────────────────────────────────────
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("[SW] Pre-caching app shell");
      return cache.addAll(PRE_CACHE_URLS);
    })
  );
  // Activate immediately without waiting for old SW to die
  self.skipWaiting();
});

// ── ACTIVATE ───────────────────────────────────────────────────────────────
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) =>
      Promise.all(
        cacheNames
          .filter(
            (name) =>
              name !== CACHE_NAME && name !== FONT_CACHE_NAME
          )
          .map((name) => {
            console.log("[SW] Deleting old cache:", name);
            return caches.delete(name);
          })
      )
    )
  );
  // Take control of all open clients immediately
  self.clients.claim();
});

// ── FETCH ──────────────────────────────────────────────────────────────────
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Skip non-GET requests
  if (request.method !== "GET") return;

  // Skip browser-extension and chrome-extension requests
  if (!url.protocol.startsWith("http")) return;

  // ── Google Fonts: Cache-first (they rarely change)
  if (
    url.hostname === "fonts.googleapis.com" ||
    url.hostname === "fonts.gstatic.com"
  ) {
    event.respondWith(
      caches.open(FONT_CACHE_NAME).then((cache) =>
        cache.match(request).then((cached) => {
          if (cached) return cached;
          return fetch(request).then((response) => {
            if (response.ok) {
              cache.put(request, response.clone());
            }
            return response;
          });
        })
      )
    );
    return;
  }

  // ── Same-origin HTML: Network-first, fallback to cache
  if (
    url.origin === self.location.origin &&
    request.headers.get("accept") &&
    request.headers.get("accept").includes("text/html")
  ) {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok) {
            const cloned = response.clone();
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, cloned)
            );
          }
          return response;
        })
        .catch(() =>
          caches
            .match(request)
            .then((cached) => cached || caches.match(OFFLINE_URL))
        )
    );
    return;
  }

  // ── All other same-origin assets: Cache-first, update in background
  if (url.origin === self.location.origin) {
    event.respondWith(
      caches.match(request).then((cached) => {
        const networkFetch = fetch(request).then((response) => {
          if (response.ok) {
            caches.open(CACHE_NAME).then((cache) =>
              cache.put(request, response.clone())
            );
          }
          return response;
        });
        return cached || networkFetch;
      })
    );
    return;
  }
});

// ── PUSH NOTIFICATIONS (optional, no-op if not used) ──────────────────────
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  self.registration.showNotification(data.title || "Islamic Media", {
    body: data.body || "",
    icon: "./icons/icon-192.png",
    badge: "./icons/icon-96.png",
  });
});
