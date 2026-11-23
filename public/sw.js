// Service Worker for Go'Buzz
const CACHE_NAME = 'gobuzz-v1';

// Install
self.addEventListener('install', (event) => {
  self.skipWaiting();
});

// Activate
self.addEventListener('activate', (event) => {
  event.waitUntil(clients.claim());
});

// Push notification
self.addEventListener('push', (event) => {
  let data = {};

  try {
    data = event.data ? event.data.json() : {};
  } catch (e) {
    data = {
      title: "Go'Buzz",
      body: event.data?.text() || 'New update',
    };
  }

  const options = {
    body: data.body || "New update from Go'Buzz",
    icon: data.icon || '/icon-192.png',
    badge: data.badge || '/icon-192.png',
    image: data.image,
    tag: data.tag || 'gobuzz',
    renotify: true,
    requireInteraction: false,
    data: {
      url: data.url || '/',
      dateOfArrival: Date.now(),
    },
    vibrate: [100, 50, 100],
    actions: [
      {
        action: 'open',
        title: 'Open',
      },
      {
        action: 'close',
        title: 'Close',
      },
    ],
  };

  event.waitUntil(
    self.registration.showNotification(data.title || "Go'Buzz", options)
  );
});

// Notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();

  if (event.action === 'close') return;

  const url = event.notification.data?.url || '/';

  event.waitUntil(
    clients
      .matchAll({ type: 'window', includeUncontrolled: true })
      .then((clientList) => {
        // If a window is already open, focus it
        for (const client of clientList) {
          if (client.url.includes(self.location.origin) && 'focus' in client) {
            client.navigate(url);
            return client.focus();
          }
        }
        // Otherwise open new
        if (clients.openWindow) {
          return clients.openWindow(url);
        }
      })
  );
});