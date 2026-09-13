self.addEventListener('push', function(event) {
  // Handle push if needed
});

self.addEventListener('notificationclick', function(event) {
  event.notification.close();
  // Focus the window if needed
  event.waitUntil(
    clients.matchAll({ type: 'window' }).then(windowClients => {
      if (windowClients.length > 0) {
        windowClients[0].focus();
      } else {
        clients.openWindow('/');
      }
    })
  );
});
