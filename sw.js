const CACHE_NAME = 'autobeheer-v1';
const ASSETS = [
  '/',
  '/index.html'
];

// Installeer service worker en cache de app
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
  self.skipWaiting();
});

// Verwijder oude caches bij activatie
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(
        keys.filter(key => key !== CACHE_NAME).map(key => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

// Network first strategie: probeer altijd vers van het netwerk
// Val terug op cache als er geen verbinding is
self.addEventListener('fetch', event => {
  // Sla Google Apps Script requests niet op in cache
  if (event.request.url.includes('script.google.com')) {
    return;
  }

  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Sla verse versie op in cache
        const clone = response.clone();
        caches.open(CACHE_NAME).then(cache => {
          cache.put(event.request, clone);
        });
        return response;
      })
      .catch(() => {
        // Geen internet - gebruik cache
        return caches.match(event.request);
      })
  );
});
