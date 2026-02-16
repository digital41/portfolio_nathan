var CACHE_NAME = 'ni-v1';
var ASSETS = [
    '/',
    '/index.html',
    '/css/theme.css',
    '/js/components.js',
    '/js/theme.js',
    '/assets/favicon.ico',
    '/assets/images/nathanibguiProfile.webp'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(ASSETS);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', function (e) {
    e.waitUntil(
        caches.keys().then(function (names) {
            return Promise.all(
                names.filter(function (n) { return n !== CACHE_NAME; })
                    .map(function (n) { return caches.delete(n); })
            );
        })
    );
    self.clients.claim();
});

self.addEventListener('fetch', function (e) {
    // Network first, fallback to cache
    e.respondWith(
        fetch(e.request).then(function (res) {
            // Cache successful GET responses
            if (e.request.method === 'GET' && res.status === 200) {
                var clone = res.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(e.request, clone);
                });
            }
            return res;
        }).catch(function () {
            return caches.match(e.request);
        })
    );
});
