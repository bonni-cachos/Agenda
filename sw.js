const CACHE_NAME = 'bonni-cachos-v1';
const ASSETS_TO_CACHE = [
  './',
  './index.html',
  './manifest.json',
  './Icon/Favicon.png',
  './Icon/Icon180.png',
  './Icon/Icon192.png',
  './Icon/Icon512.png'
];

// Evento de Instalação: Salva em cache local os arquivos estáticos essenciais (App Shell)
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      return cache.addAll(ASSETS_TO_CACHE);
    }).then(() => {
      return self.skipWaiting();
    })
  );
});

// Evento de Ativação: Limpa de forma limpa caches obsoletos de versões antigas
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cacheName) => {
          if (cacheName !== CACHE_NAME) {
            return caches.delete(cacheName);
          }
        })
      );
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Evento Fetch: Intercepta e gerencia de forma inteligente o tráfego de dados
self.addEventListener('fetch', (event) => {
  const requestUrl = new URL(event.request.url);

  // REGRA DE SEGURANÇA SÊNIOR: Se a requisição for para o back-end do Google Sheets/GAS,
  // força a passagem direta pela internet (Network Only) e nunca tenta cachear dados dinâmicos
  if (requestUrl.hostname === 'script.google.com' || requestUrl.hostname === 'script.googleusercontent.com') {
    event.respondWith(fetch(event.request));
    return;
  }

  // Para o esqueleto e ícones locais, carrega de forma imediata do cache local
  event.respondWith(
    caches.match(event.request).then((cachedResponse) => {
      if (cachedResponse) {
        return cachedResponse;
      }
      return fetch(event.request);
    })
  );
});
