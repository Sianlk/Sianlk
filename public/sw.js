/**
 * Service Worker — offline-first PWA with stale-while-revalidate caching.
 * Supports background sync for deferred form submissions.
 */
const CACHE_NAME = "app-v1.0.0";
const STATIC_ASSETS = ["/", "/index.html", "/style.css", "/script.js", "/public/manifest.json"];
const API_CACHE_TTL = 60 * 1000; // 1 minute for API responses

// Install: pre-cache static assets
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => cache.addAll(STATIC_ASSETS))
  );
  self.skipWaiting();
});

// Activate: delete old caches
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(keys.filter((k) => k !== CACHE_NAME).map((k) => caches.delete(k)))
    )
  );
  self.clients.claim();
});

// Fetch: network-first for API, cache-first for static
self.addEventListener("fetch", (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Never cache auth or payment endpoints
  if (url.pathname.startsWith("/api/v1/auth") || url.pathname.startsWith("/api/v1/payments")) {
    return;
  }

  if (url.pathname.startsWith("/api/")) {
    // Network-first with cache fallback for API
    event.respondWith(
      fetch(request.clone())
        .then((response) => {
          if (response.ok) {
            const clone = response.clone();
            caches.open(CACHE_NAME).then((cache) => cache.put(request, clone));
          }
          return response;
        })
        .catch(() => caches.match(request))
    );
  } else {
    // Cache-first for static assets
    event.respondWith(
      caches.match(request).then((cached) => cached || fetch(request))
    );
  }
});

// Background sync — retry failed form submissions when back online
self.addEventListener("sync", (event) => {
  if (event.tag === "sync-pending-forms") {
    event.waitUntil(syncPendingForms());
  }
});

async function syncPendingForms() {
  const db = await openIndexedDB();
  const pending = await getAllPending(db);
  for (const item of pending) {
    try {
      await fetch(item.url, { method: item.method, body: item.body,
        headers: { "Content-Type": "application/json" } });
      await deleteItem(db, item.id);
    } catch (_) { /* Will retry next sync */ }
  }
}

function openIndexedDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open("offline-db", 1);
    req.onupgradeneeded = (e) => e.target.result.createObjectStore("pending", { keyPath: "id", autoIncrement: true });
    req.onsuccess = (e) => resolve(e.target.result);
    req.onerror = reject;
  });
}
function getAllPending(db) {
  return new Promise((res) => {
    const tx = db.transaction("pending", "readonly");
    tx.objectStore("pending").getAll().onsuccess = (e) => res(e.target.result);
  });
}
function deleteItem(db, id) {
  return new Promise((res) => {
    const tx = db.transaction("pending", "readwrite");
    tx.objectStore("pending").delete(id).onsuccess = res;
  });
}

// Push notifications
self.addEventListener("push", (event) => {
  if (!event.data) return;
  const data = event.data.json();
  event.waitUntil(
    self.registration.showNotification(data.title || "Notification", {
      body: data.body || "",
      icon: "/assets/icon.svg",
      badge: "/assets/icon.svg",
      data: data.url || "/",
      actions: data.actions || [],
      requireInteraction: data.urgent || false,
    })
  );
});

self.addEventListener("notificationclick", (event) => {
  event.notification.close();
  event.waitUntil(clients.openWindow(event.notification.data || "/"));
});
