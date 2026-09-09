const CACHE_NAME = "yubimoji-v2";

self.addEventListener("install", e => {
  e.waitUntil(
    caches.open(CACHE_NAME).then(cache =>
      cache.addAll([
        "index.html",
        "app.js",
        "style.css",
        "manifest.json"
      ])
    )
  );
});
