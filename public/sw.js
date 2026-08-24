/* JTCQI+ service worker — leitura offline de todo o sistema.
   Estratégia:
   - navegações e assets do app: cache-first com revalidação em background
   - dados da API (Supabase REST GET): network-first com fallback para o cache
   - imagens/arquivos (storage, signed URLs): cache-first
   - busca por face (modelos de IA / pesos): NÃO é cacheada (exige internet) */

const VERSION = "jtcqi-v4";
const SHELL = `${VERSION}-shell`;
const DATA = `${VERSION}-data`;
const MEDIA = `${VERSION}-media`;

const SHELL_URLS = ["/", "/manifest.webmanifest", "/logo.png", "/favicon.ico"];

self.addEventListener("install", (event) => {
  event.waitUntil(
    (async () => {
      const cache = await caches.open(SHELL);
      await Promise.allSettled(SHELL_URLS.map((url) => cache.add(url)));
      await self.skipWaiting();
    })(),
  );
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    (async () => {
      const keys = await caches.keys();
      await Promise.all(
        keys.filter((k) => !k.startsWith(VERSION)).map((k) => caches.delete(k)),
      );
      await self.clients.claim();
    })(),
  );
});

const isFaceModel = (url) =>
  /face-api|human|\/models?\//i.test(url.pathname) || /\.(bin|onnx)$/i.test(url.pathname);

const isSupabaseRest = (url) =>
  /\/rest\/v1\//.test(url.pathname) || /\/auth\/v1\//.test(url.pathname);

const isSupabaseStorage = (url) => /\/storage\/v1\/object\//.test(url.pathname);

async function cacheFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  const hit = await cache.match(request);
  if (hit) {
    // revalida silenciosamente quando houver rede
    fetch(request)
      .then((res) => res.ok && cache.put(request, res.clone()))
      .catch(() => undefined);
    return hit;
  }
  const res = await fetch(request);
  if (res.ok) cache.put(request, res.clone()).catch(() => undefined);
  return res;
}

async function networkFirst(request, cacheName) {
  const cache = await caches.open(cacheName);
  try {
    const res = await fetch(request);
    if (res.ok) cache.put(request, res.clone()).catch(() => undefined);
    return res;
  } catch (err) {
    const hit = await cache.match(request);
    if (hit) return hit;
    throw err;
  }
}

self.addEventListener("fetch", (event) => {
  // O shell do Vite muda durante desenvolvimento e preview. Interceptá-lo
  // pode combinar módulos de gerações diferentes e duplicar o React.
  const hostname = self.location.hostname;
  const isDevelopmentHost =
    hostname === "localhost" ||
    hostname === "127.0.0.1" ||
    hostname.endsWith(".lovableproject.com") ||
    hostname.includes("-preview--");
  if (isDevelopmentHost) return;

  const { request } = event;
  if (request.method !== "GET") return;

  let url;
  try {
    url = new URL(request.url);
  } catch {
    return;
  }
  if (!/^https?:$/.test(url.protocol)) return;

  // modelos de reconhecimento facial ficam sempre online
  if (isFaceModel(url)) return;

  // nunca cachear artefatos do dev server / módulos versionados do Vite:
  // servir uma versão antiga junto de outra nova quebra o React (hooks nulos)
  if (
    url.pathname.startsWith("/node_modules/") ||
    url.pathname.startsWith("/@") ||
    url.pathname.startsWith("/src/") ||
    url.searchParams.has("v") ||
    url.searchParams.has("t")
  ) {
    return;
  }

  if (request.mode === "navigate") {
    event.respondWith(
      (async () => {
        const cache = await caches.open(SHELL);
        try {
          const res = await fetch(request);
          if (res.ok) {
            // guarda a rota específica e o shell genérico
            cache.put(request, res.clone()).catch(() => undefined);
            cache.put("/", res.clone()).catch(() => undefined);
          }
          return res;
        } catch {
          return (
            (await cache.match(request)) ||
            (await cache.match("/")) ||
            new Response("Offline", { status: 503, statusText: "Offline" })
          );
        }
      })(),
    );
    return;
  }


  if (isSupabaseRest(url)) {
    event.respondWith(networkFirst(request, DATA));
    return;
  }

  if (isSupabaseStorage(url) || request.destination === "image" || request.destination === "font") {
    event.respondWith(cacheFirst(request, MEDIA));
    return;
  }

  if (url.origin === self.location.origin) {
    event.respondWith(cacheFirst(request, SHELL));
  }
});
