// A CHAVE MÁGICA DA ATUALIZAÇÃO:
// Sempre que você mexer no index.html e quiser forçar a atualização em todos os celulares, 
// basta vir aqui e mudar o nome do cache (ex: mude de 'v1' para 'v2', depois 'v3'...).
const CACHE_NAME = 'setlist-pro-v1';

// Arquivos que precisam ser salvos para o app abrir sem internet
const urlsToCache = [
  './',
  './index.html',
  './logo.png',
  './manifest.json'
];

// INSTALAÇÃO: Baixa os arquivos e FORÇA a atualização imediata
self.addEventListener('install', event => {
  self.skipWaiting(); // PULO DO GATO 1: Não espera o usuário fechar o app, atualiza na hora!
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => cache.addAll(urlsToCache))
  );
});

// ATIVAÇÃO: Limpa o lixo da versão velha e assume o controle
self.addEventListener('activate', event => {
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cacheName => {
          if (cacheName !== CACHE_NAME) {
            console.log('Limpando cache antigo:', cacheName);
            return caches.delete(cacheName); // Deleta a versão antiga
          }
        })
      );
    }).then(() => self.clients.claim()) // PULO DO GATO 2: Força todos os celulares a usarem a versão nova imediatamente
  );
});

// ESTRATÉGIA "A INTERNET MANDA" (Network First):
// 1. Tenta baixar a versão mais recente do GitHub.
// 2. Se conseguir, salva uma cópia nova no celular e mostra pro usuário.
// 3. Se falhar (sem internet no palco), puxa a cópia salva no celular.
self.addEventListener('fetch', event => {
  event.respondWith(
    fetch(event.request)
      .then(response => {
        // Se a internet tá pegando, atualiza o cache silenciosamente
        if (response && response.status === 200) {
          const responseClone = response.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
        }
        return response;
      })
      .catch(() => {
        // Se a internet caiu, puxa do cache offline
        return caches.match(event.request);
      })
  );
});