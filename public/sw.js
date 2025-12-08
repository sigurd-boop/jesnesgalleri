// Service Worker for caching images and API responses
const CACHE_NAME = 'jesne-gallery-v1';
const IMAGE_CACHE = 'jesne-images-v1';
const API_CACHE = 'jesne-api-v1';

const ASSETS_TO_CACHE = [
  '/',
  '/index.html',
];

self.addEventListener('install', (event) => {
  event.waitUntil(
    Promise.all([
      caches.open(CACHE_NAME).then((cache) => {
        return cache.addAll(ASSETS_TO_CACHE).catch(() => {
          // Fail gracefully if some assets can't be cached
        });
      }),
    ])
  );
  self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME && cacheName !== IMAGE_CACHE && cacheName !== API_CACHE) {
            return caches.delete(cacheName);
          }
        })
      );
    })
  );
  self.clients.claim();
});

self.addEventListener('fetch', (event) => {
  const { request } = event;
  const url = new URL(request.url);

  // Cache images for 30 days
  if (request.method === 'GET' && /\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url.pathname)) {
    event.respondWith(
      caches.open(IMAGE_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          if (response) {
            return response;
          }
          return fetch(request)
            .then((response) => {
              if (response && response.status === 200) {
                cache.put(request, response.clone());
              }
              return response;
            })
            .catch(() => {
              // Return a placeholder if offline
              return new Response('Image unavailable offline', {
                status: 503,
                statusText: 'Service Unavailable',
              });
            });
        });
      })
    );
  }

  // Cache API responses for 1 hour
  if (request.method === 'GET' && url.pathname.startsWith('/api/')) {
    event.respondWith(
      caches.open(API_CACHE).then((cache) => {
        return cache.match(request).then((response) => {
          return (
            response ||
            fetch(request)
              .then((fetchResponse) => {
                if (fetchResponse && fetchResponse.status === 200) {
                  cache.put(request, fetchResponse.clone());
                }
                return fetchResponse;
              })
              .catch(() => {
                // Try to return cached version even if stale
                return cache.match(request);
              })
          );
        });
      })
    );
  }

  // Default strategy for other requests
  if (request.method === 'GET') {
    event.respondWith(
      fetch(request)
        .then((response) => {
          return response;
        })
        .catch(() => {
          // Return offline page or cached response
          return caches.match(request);
        })
    );
  }
});

// Clean up old image cache entries
setInterval(() => {
  caches.open(IMAGE_CACHE).then((cache) => {
    cache.keys().then((requests) => {
      if (requests.length > 100) {
        // Keep only the 100 most recent images
        requests.slice(0, requests.length - 100).forEach((request) => {
          cache.delete(request);
        });
      }
    });
  });
}, 24 * 60 * 60 * 1000); // Clean up daily
