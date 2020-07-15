const staticCache = "static-pwa-v10";
const dynamicCache = "dynamic-pwa-v10";
const assets = ["/", "/index.html", "/favicon.ico"];

self.addEventListener("install", (e) => {
  e.waitUntil(
    caches.open(staticCache).then((cache) => {
      cache.addAll(assets);
    })
  );
});

self.addEventListener("activate", (e) => {
  caches.keys().then((keys) => {
    return Promise.all(
      keys
        .filter((key) => key !== staticCache && key !== dynamicCache)
        .map((key) => caches.delete(key))
    );
  });
});

self.addEventListener("fetch", (e) => {
  e.respondWith(
    caches
      .match(e.request)
      .then((cacheRes) => {
        return (
          cacheRes ||
          fetch(e.request).then((fetchRes) => {
            if (fetchRes.clone().status === 404) {
              if (e.request.url.includes(".html")) {
                return caches.match("/pages/fallback.html");
              } else if (
                e.request.url.includes(".png") ||
                e.request.url.includes(".jpg")
              ) {
                return caches.match("/images/noimage-250.png");
              }
            }
            return caches.open(dynamicCache).then((cache) => {
              cache.put(e.request.url, fetchRes.clone());
              return fetchRes;
            });
          })
        );
      })
      .catch(() => {
        if (e.request.url.includes(".html")) {
          return caches.match("/pages/fallback.html");
        } else if (
          e.request.url.includes(".png") ||
          e.request.url.includes(".jpg")
        ) {
          return caches.match("/images/noimage-250.png");
        }
      })
  );
});
