const CACHE_NAME = 'liams-rymdaventyr-v1';
const urlsToCache = [
  './',
  './index.html',
  './manifest.json',
  './icon-192.png',
  './icon-512.png',
  './Nova_bild.png',
  './SPELMUSIK_Liams_space_adventure.mp3',
  './SPELMUSIK_Liams_rymdäventyr_lugn_fokus.mp3',
  'https://fonts.googleapis.com/css2?family=Fredoka:wght@400;500;600;700&family=Space+Mono:wght@400;700&display=swap'
];

// Installera service worker och cacha filer
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Caching app files...');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

// Aktivera och rensa gamla cacher
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Removing old cache:', cacheName);
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Hämta från cache först, sedan nätverk
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Returnera cachad version om den finns
        if (response) {
          return response;
        }
        
        // Annars hämta från nätverk
        return fetch(event.request).then(response => {
          // Cacha inte om det inte är en giltig respons
          if (!response || response.status !== 200 || response.type !== 'basic') {
            return response;
          }
          
          // Cacha den nya resursen
          const responseToCache = response.clone();
          caches.open(CACHE_NAME)
            .then(cache => {
              cache.put(event.request, responseToCache);
            });
          
          return response;
        });
      })
      .catch(() => {
        // Om offline och ingen cache, returnera en fallback för HTML
        if (event.request.destination === 'document') {
          return caches.match('./index.html');
        }
      })
  );
});
