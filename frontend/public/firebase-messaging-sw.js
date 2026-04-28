// Scripts for Firebase Cloud Messaging in the background
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  // Fallback to hardcoded config if ENV vars don't work in SW scope
  apiKey: "YOUR_API_KEY",
  authDomain: "sevasetu-1ed86.firebaseapp.com",
  projectId: "sevasetu-1ed86",
  storageBucket: "sevasetu-1ed86.appspot.com",
  messagingSenderId: "1036881768822",
  appId: "YOUR_APP_ID"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage(function(payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  
  const notificationTitle = payload.notification.title || 'SevaSetu Alert';
  const notificationOptions = {
    body: payload.notification.body,
    icon: '/vite.svg', // Replace with your actual PWA icon
    data: payload.data // Pass data for click handler
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

self.addEventListener('notificationclick', function(event) {
  console.log('[firebase-messaging-sw.js] Notification click received.');
  
  event.notification.close();
  
  const targetUrl = event.notification.data.click_action || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If an app window is already open, focus it and navigate
      for (let i = 0; i < windowClients.length; i++) {
        const client = windowClients[i];
        if (client.url.includes(self.registration.scope) && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      // Otherwise, open a new window
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
