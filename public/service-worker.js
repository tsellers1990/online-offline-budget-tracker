const CACHE_NAME = "my-site-cache-v1"; //might need to be var... I dont think it does though, reference me if it breaks
const DATA_CACHE_NAME = "data-cache-v1";

const urlsToCache = [
    "/",
    "/db.js",
    "/index.js",
    "/manifest.json",
    "/styles.css",
    "/icons/icon-192x192.png",
    "/icons/icon-512x512.png"
];

self.addEventListener("install", function(event) {
    event.waitUntil(
        caches.open(CACHE_NAME).then(function(event) {
            console.log("Opened Cache");
            return caches.addAll(urlsToCache);
        })
    );
});

self.addEventListener("fetch", function(event) {
    if (event.request.url.includes("/api/")) {
        event.respondWith(
            caches.open(DATA_CACHE_NAME).then(cache => {
                return fetch(event.request)
                    .then(response => {
                        if(response.status === 200) {
                            cache.put(event.request.url, response.clone());
                        }

                        return response;
                    })
                    .catch(err=> {
                        return cache.match(event.request);
                    });
            }).catch(err => console.log(err))
        );

        return;
    }

    event.respondWith(
        fetch(event.request).catch(function() {
            return caches.match(event.request).then(function(response) {
                if(response) {
                    return response;
                }
                else if (event.request.headers.get("accept").includes("text/html")) {
                    return caches.match ("/");
                }
            })
        })
    )
})