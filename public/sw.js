const CACHE_NAME = "v1-cache-app";
const ASSETS_TO_CACHE = [
  "/",
  "/index.html",
  "/css/style.css",
  "/js/main.js",
  "/images/logo.png",
  "/offline.html", // Página exibida quando não há internet
];

// 1. Instalação: Salva os arquivos essenciais no cache
self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) => {
      console.log("Cache aberto");
      return cache.addAll(ASSETS_TO_CACHE);
    }),
  );
});

// 2. Ativação: Limpa caches antigos quando o app é atualizado
self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames.map((cache) => {
          if (cache !== CACHE_NAME) {
            console.log("Limpando cache antigo...");
            return caches.delete(cache);
          }
        }),
      );
    }),
  );
});

// 3. Estratégia de Fetch: Tenta o cache primeiro, depois a rede
self.addEventListener("fetch", (event) => {
  event.respondWith(
    caches.match(event.request).then((response) => {
      // Retorna o cache se encontrar, senão vai para a rede
      return (
        response ||
        fetch(event.request).catch(() => {
          // Se a rede falhar e não estiver no cache, mostra página offline
          if (event.request.mode === "navigate") {
            return caches.match("/offline.html");
          }
        })
      );
    }),
  );
});
