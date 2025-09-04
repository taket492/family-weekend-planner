const CACHE_NAME = 'fw-planner-v1'
const ASSETS = [
  '/',
  '/manifest.json',
]

self.addEventListener('install', (e) => {
  e.waitUntil(caches.open(CACHE_NAME).then((cache) => cache.addAll(ASSETS)))
})

self.addEventListener('activate', (e) => {
  e.waitUntil(
    caches.keys().then((keys) => Promise.all(keys.filter(k => k !== CACHE_NAME).map(k => caches.delete(k))))
  )
})

// Cache strategy: network-first for API, cache-first for others
self.addEventListener('fetch', (e) => {
  const url = new URL(e.request.url)
  if (url.pathname.startsWith('/api/')) {
    e.respondWith(
      fetch(e.request).then((resp) => {
        const copy = resp.clone()
        caches.open(CACHE_NAME).then((cache) => cache.put(e.request, copy)).catch(()=>{})
        return resp
      }).catch(() => caches.match(e.request))
    )
  } else {
    e.respondWith(
      caches.match(e.request).then((cached) => cached || fetch(e.request))
    )
  }
})

