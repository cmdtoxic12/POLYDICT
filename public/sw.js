/* global self, caches, clients, fetch */

const CACHE_NAME = "polydict-shell-v1";
const APP_SHELL = [
  "/",
  "/offline.html",
  "/manifest.json",
  "/icon.svg",
  "/icon-192.png",
  "/icon-512.png",
  "/icon-maskable-512.png",
  "/apple-touch-icon.png",
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(CACHE_NAME);
      await cache.addAll(APP_SHELL.filter((url) => url !== "/"));

      const home = await fetch("/");
      if (!home.ok) throw new Error("PolyDict home page could not be cached");
      await cache.put("/", home.clone());

      const html = await home.text();
      const assetUrls = [...html.matchAll(/(?:src|href)=["']([^"']*\/_next\/static\/[^"']+)["']/g)]
        .map((match) => new URL(match[1], self.location.origin).href);
      await Promise.all(assetUrls.map(async (url) => {
        try {
          await cache.add(url);
        } catch {
          // One optional static asset should not block app installation.
        }
      }));

      await self.skipWaiting();
    })()
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(
        keys.filter((key) => key.startsWith("polydict-shell-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      ))
      .then(() => clients.claim())
  );
});

self.addEventListener("fetch", (event) => {
  const request = event.request;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (url.origin !== self.location.origin || url.pathname.startsWith("/api/")) return;

  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          if (response.ok && url.pathname === "/") {
            return caches.open(CACHE_NAME)
              .then((cache) => cache.put("/", response.clone()))
              .then(() => response);
          }
          return response;
        })
        .catch(async () => (await caches.match(request)) || (await caches.match("/")) || (await caches.match("/offline.html")))
    );
    return;
  }

  const isNextAsset = url.pathname.startsWith("/_next/static/");
  const isShellAsset = ["/manifest.json", "/icon.svg", "/icon-192.png", "/icon-512.png", "/icon-maskable-512.png", "/apple-touch-icon.png", "/offline.html"].includes(url.pathname);
  const isAsset = ["style", "script", "image", "font"].includes(request.destination);
  if (!isNextAsset && !isShellAsset && !isAsset) return;

  event.respondWith(
    caches.match(request).then((cached) => {
      if (cached) return cached;
      return fetch(request).then((response) => {
        if (!response.ok) return response;
        return caches.open(CACHE_NAME)
          .then((cache) => cache.put(request, response.clone()))
          .then(() => response);
      });
    })
  );
});
