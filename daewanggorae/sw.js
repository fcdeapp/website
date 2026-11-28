/* Scoped to /daewanggorae/. Never caches authentication or other services. */
const CACHE = "daewanggorae-web-v2";
self.addEventListener("install", (event) =>
  event.waitUntil(self.skipWaiting()),
);
self.addEventListener("activate", (event) =>
  event.waitUntil((async () => { for (const key of await caches.keys()) { if (key.startsWith("daewanggorae-web-") && key !== CACHE) await caches.delete(key); } await self.clients.claim(); })()),
);
self.addEventListener("fetch", (event) => {
  const request = event.request,
    url = new URL(request.url);
  if (request.method !== "GET" || url.origin !== self.location.origin) return;
  const content = url.pathname.startsWith("/daewanggorae/runtime/");
  const chunk = url.pathname.startsWith("/_next/static/");
  const page =
    request.mode === "navigate" &&
    (url.pathname === "/daewanggorae" ||
      url.pathname.startsWith("/daewanggorae/"));
  if (!content && !chunk && !page) return;
  const immutable =
    chunk ||
    url.pathname.includes("/runtime/content/") ||
    url.pathname.includes("/runtime/models/");
  event.respondWith(
    (async () => {
      const cache = await caches.open(CACHE);
      const saved = await cache.match(request);
      if (saved && immutable) return saved;
      try {
        const response = await fetch(request);
        if (response.ok) await cache.put(request, response.clone());
        return response;
      } catch (error) {
        if (saved) return saved;
        throw error;
      }
    })(),
  );
});
