// Self-destructing service worker v2: clears all caches, reloads clients, then unregisters
self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((names) => Promise.all(names.map((n) => caches.delete(n))))
      .then(() => self.clients.matchAll({ type: "window", includeUncontrolled: true }))
      .then((clients) => {
        clients.forEach((c) => {
          try { c.navigate(c.url); } catch (e) {}
        });
      })
      .then(() => self.registration.unregister())
  );
});
// Never serve from cache - always pass through to network
self.addEventListener("fetch", (event) => {
  // 학교 순위(/api/·허브)는 서비스 워커를 거치지 않는다 — 첫 응답에 굳지 않게(키트 게이트 S5)
  const u = new URL(event.request.url);
  if (u.pathname.startsWith("/api/") || u.origin !== self.location.origin) return;
  event.respondWith(fetch(event.request));
});
