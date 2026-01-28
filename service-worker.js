const CACHE_NAME = 'edubrinca-v1';
const STATIC_ASSETS = [
  './',
  './index.html',
  './manifest.json',
  './icon.svg'
];

// 1. Instalação: Cache inicial dos arquivos estáticos críticos
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log('[Service Worker] Caching static assets');
      return cache.addAll(STATIC_ASSETS);
    })
  );
  self.skipWaiting();
});

// 2. Ativação: Limpeza de caches antigos
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((keyList) => {
      return Promise.all(
        keyList.map((key) => {
          if (key !== CACHE_NAME) {
            console.log('[Service Worker] Removing old cache', key);
            return caches.delete(key);
          }
        })
      );
    })
  );
  self.clients.claim();
});

// 3. Interceptação de Requisições (Fetch)
// Estratégia: Stale-While-Revalidate para a maioria dos recursos
// (Mostra o cache rápido, mas atualiza em segundo plano)
self.addEventListener('fetch', (event) => {
  // Ignora requisições que não sejam GET ou sejam da API do Google (pois precisam de rede)
  if (event.request.method !== 'GET' || event.request.url.includes('generativelanguage')) {
    return;
  }

  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      const fetchPromise = fetch(event.request).then((networkResponse) => {
        return caches.open(CACHE_NAME).then((cache) => {
          // Atualiza o cache com a nova versão
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });
      }).catch(() => {
        // Se falhar a rede e não tiver cache (ex: offline na primeira vez)
        // Apenas retorna o que tem ou erro, mas o app já deve ter carregado via cache
      });

      // Retorna o cache se existir, senão espera a rede
      return cachedResponse || fetchPromise;
    })
  );
});