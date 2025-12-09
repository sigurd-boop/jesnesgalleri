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
  
  // Only handle GET requests
  if (request.method !== 'GET') {
    return;
  }

  const url = new URL(request.url);

  // Strategy selection based on resource type
  let responsePromise;

  // Cache images - cache first strategy
  if (/\.(jpg|jpeg|png|gif|webp|svg)(\?.*)?$/i.test(url.pathname)) {
    responsePromise = caches.open(IMAGE_CACHE).then((cache) => {
      return cache.match(request).then((cachedResponse) => {
        if (cachedResponse) {
          return cachedResponse;
        }
        
        return fetch(request)
          .then((response) => {
            // Only cache successful responses
            if (response && response.status === 200 && response.type === 'basic') {
              cache.put(request, response.clone());
            }
            return response;
          })
          .catch(() => {
            // Silently fail - let browser handle missing images
            return new Response('', { status: 404 });
          });
      });
    });
  }
  // Cache API responses - network first with cache fallback
  else if (url.pathname.startsWith('/api/')) {
    responsePromise = fetch(request)
      .then((response) => {
        // Cache successful API responses
        if (response && response.status === 200 && response.type === 'basic') {
          caches.open(API_CACHE).then((cache) => {
            cache.put(request, response.clone());
          });
        }
        return response;
      })
      .catch(() => {
        // Return cached version if network fails
        return caches.open(API_CACHE).then((cache) => {
          return cache.match(request).then((cachedResponse) => {
            return cachedResponse || new Response('', { status: 503 });
          });
        });
      });
  }
  // Default: network first for everything else
  else {
    responsePromise = fetch(request).catch(() => {
      return caches.match(request).then((cachedResponse) => {
        return cachedResponse || new Response('', { status: 503 });
      });
    });
  }

  // Single respondWith call
  event.respondWith(responsePromise);
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
