// Service worker: cangkang aplikasi tersimpan di HP agar bisa dibuka tanpa internet.
// Data (data.enc.json) tidak lewat sini: salinan terenkripsinya disimpan aplikasi sendiri di IndexedDB.
const C = "wsm-shell-v1";
const SHELL = ["./", "index.html", "manifest.webmanifest", "icon-180.png"];
self.addEventListener("install", e => { e.waitUntil(caches.open(C).then(c => c.addAll(SHELL)).then(() => self.skipWaiting())); });
self.addEventListener("activate", e => { e.waitUntil(caches.keys().then(ks => Promise.all(ks.filter(k => k !== C).map(k => caches.delete(k)))).then(() => self.clients.claim())); });
self.addEventListener("fetch", e => {
  const u = new URL(e.request.url);
  if (e.request.method !== "GET" || u.origin !== location.origin || u.pathname.endsWith("data.enc.json")) return;
  // jaringan dulu (supaya versi baru langsung terpakai), bila gagal pakai salinan tersimpan
  e.respondWith(fetch(e.request).then(r => { if (r.ok) { const cp = r.clone(); caches.open(C).then(c => c.put(e.request, cp)); } return r; })
    .catch(() => caches.match(e.request, { ignoreSearch: true }).then(r => r || (e.request.mode === "navigate" ? caches.match("index.html") : Response.error()))));
});
