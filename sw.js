var CACHE_NAME = 'ni-v10';
var CORE_ASSETS = [
    '/',
    '/index.html',
    '/contact.html',
    '/mentions-legales.html',
    '/404.html',
    '/css/theme.css',
    '/js/components.js',
    '/js/theme.js',
    '/js/ab-test.js',
    '/assets/favicon.ico',
    '/assets/images/nathanibguiProfile.webp',
    '/assets/images/nathanibguiProfile-og.jpg',
    '/solutions/audit-performance-it.html',
    '/solutions/automation-n8n.html',
    '/solutions/cybersecurite-infrastructure.html',
    '/solutions/data-erp.html',
    '/solutions/dsi-externalise.html',
    '/solutions/geo-referencement-ia.html',
    '/solutions/google-business-profile.html',
    '/solutions/publicite-digitale.html',
    '/solutions/seo-acquisition-digitale.html',
    '/solutions/strategie-ia.html',
    '/solutions/strategie-marketing-branding.html',
    '/blog/index.html',
    '/blog/ia-pme-guide-2026.html',
    '/blog/audit-it-checklist-30-points.html',
    '/blog/seo-ia-generative-chatgpt-2026.html',
    '/blog/impact-micro-influenceurs-strategie-marketing.html',
    '/blog/google-ads-meta-ads-pme-roi-2026.html',
    '/blog/automatisation-processus-n8n-guide-pme.html',
    '/blog/n8n-ia-workflows-agents-automatises.html',
    '/blog/geo-guide-complet-referencement-ia-2026.html',
    '/blog/agents-ia-rag-entreprise-guide-pratique.html',
    '/tools/index.html',
    '/tools/calculateur-roi-automatisation.html',
    '/tools/simulateur-budget-it.html',
    '/tools/audit-ia-readiness.html'
];

self.addEventListener('install', function (e) {
    e.waitUntil(
        caches.open(CACHE_NAME).then(function (cache) {
            return cache.addAll(CORE_ASSETS);
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
    var url = new URL(e.request.url);

    // Only handle same-origin GET requests
    if (e.request.method !== 'GET' || url.origin !== location.origin) return;

    // HTML pages: network first, fallback to cache, then 404
    if (e.request.headers.get('accept') && e.request.headers.get('accept').indexOf('text/html') !== -1) {
        e.respondWith(
            fetch(e.request).then(function (res) {
                var clone = res.clone();
                caches.open(CACHE_NAME).then(function (cache) {
                    cache.put(e.request, clone);
                });
                return res;
            }).catch(function () {
                return caches.match(e.request).then(function (cached) {
                    return cached || caches.match('/404.html');
                });
            })
        );
        return;
    }

    // Static assets: network first, fallback to cache
    e.respondWith(
        fetch(e.request).then(function (res) {
            if (res.status === 200) {
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
