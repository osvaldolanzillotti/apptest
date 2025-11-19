// Service Worker minimale per soddisfare i requisiti PWA
self.addEventListener('install', (event) => {
    self.skipWaiting();
  });
  
  self.addEventListener('fetch', (event) => {
    // Semplice pass-through per ora
    event.respondWith(fetch(event.request));
  });