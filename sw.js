// Portal GDL — Service Worker v1.0
// Estrategia: Cache-First para assets estáticos, Network-First para API

const CACHE_NAME = 'portal-gdl-v1';
const ASSETS = [
  '/ultima_parisienne/',
  '/ultima_parisienne/index.html',
  '/ultima_parisienne/css/style.css',
  '/ultima_parisienne/js/app.js',
  'https://cdn.jsdelivr.net/npm/chart.js@4.4.0/dist/chart.umd.min.js',
  'https://fonts.googleapis.com/css2?family=DM+Serif+Display:ital@0;1&family=DM+Sans:opsz,wght@9..40,300;9..40,400;9..40,500;9..40,600;9..40,700&display=swap'
];

// Instalar: cachear todos los assets estáticos
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return Promise.allSettled(ASSETS.map(url => cache.add(url).catch(() => {})));
    }).then(() => self.skipWaiting())
  );
});

// Activar: limpiar caches viejos
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(keys =>
      Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k)))
    ).then(() => self.clients.claim())
  );
});

// Fetch: cache-first para assets, network-first para API de Apps Script
self.addEventListener('fetch', event => {
  const url = event.request.url;

  // Apps Script / Google API → siempre network, sin caché
  if (url.includes('script.google.com') || url.includes('googleapis.com')) {
    event.respondWith(fetch(event.request).catch(() =>
      new Response(JSON.stringify({ ok: false, error: 'Sin conexión a internet' }), {
        headers: { 'Content-Type': 'application/json' }
      })
    ));
    return;
  }

  // Assets estáticos → cache-first con fallback a network
  event.respondWith(
    caches.match(event.request).then(cached => {
      if (cached) return cached;
      return fetch(event.request).then(response => {
        // Solo cachear respuestas exitosas de GET
        if (event.request.method === 'GET' && response.status === 200) {
          const clone = response.clone();
          caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
        }
        return response;
      }).catch(() => {
        // Offline fallback: devolver index.html para cualquier navegación
        if (event.request.mode === 'navigate') {
          return caches.match('/ultima_parisienne/index.html');
        }
      });
    })
  );
});
