// Vestekaart – service worker
// Toont pushmeldingen en zet het getal op het app-icoon.

self.addEventListener("install", () => self.skipWaiting());
self.addEventListener("activate", (e) => e.waitUntil(self.clients.claim()));

self.addEventListener("push", (e) => {
  let d = {};
  try { d = e.data ? e.data.json() : {}; } catch { d = { tekst: e.data ? e.data.text() : "" }; }
  e.waitUntil((async () => {
    try {
      if (typeof d.badge === "number" && self.navigator.setAppBadge) {
        if (d.badge > 0) await self.navigator.setAppBadge(d.badge);
        else await self.navigator.clearAppBadge();
      }
    } catch { /* getal niet ondersteund */ }
    await self.registration.showNotification(d.titel || "Vestekaart", {
      body: d.tekst || "",
      icon: "logo.png",
      badge: "logo.png",
      tag: d.tag || undefined,
      data: { url: d.url || "./" },
    });
  })());
});

self.addEventListener("notificationclick", (e) => {
  e.notification.close();
  const url = (e.notification.data && e.notification.data.url) || "./";
  e.waitUntil((async () => {
    const vensters = await self.clients.matchAll({ type: "window", includeUncontrolled: true });
    for (const v of vensters) {
      v.postMessage({ open: url });
      if ("focus" in v) return v.focus();
    }
    return self.clients.openWindow(url);
  })());
});
