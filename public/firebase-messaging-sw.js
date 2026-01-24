/* eslint-disable no-undef */

// ✅ Use a versão 10.12.4 que funciona corretamente
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-app-compat.js");
importScripts("https://www.gstatic.com/firebasejs/10.12.4/firebase-messaging-compat.js");

// Inicializa Firebase
firebase.initializeApp({
    apiKey: "AIzaSyDpQW9e358KVj9vjJQCQCdGCd6DZ99MDEI",
    authDomain: "helpdesk-app-mvp.firebaseapp.com",
    projectId: "helpdesk-app-mvp",
    storageBucket: "helpdesk-app-mvp.appspot.com",
    messagingSenderId: "1015556716256",
    appId: "1:1015556716256:web:72c145d2b6c2b6c2b6c2b6",
});

const messaging = firebase.messaging();

// Manipula mensagens em background
messaging.onBackgroundMessage((payload) => {
    console.log('[SW] Mensagem recebida em background:', payload);

    const title = payload?.notification?.title || "Novo chamado";
    const options = {
        body: payload?.notification?.body || "Um novo chamado foi criado.",
        icon: "/pwa-192x192.png",
        badge: "/pwa-192x192.png",
        data: payload?.data || {},
        tag: 'helpdesk-notification',
        requireInteraction: false,
    };

    return self.registration.showNotification(title, options);
});

// Manipula cliques nas notificações
self.addEventListener("notificationclick", (event) => {
    console.log('[SW] Notificação clicada:', event);

    event.notification.close();

    const url = event.notification?.data?.url || "/app/admin";

    event.waitUntil(
        clients.matchAll({ type: 'window', includeUncontrolled: true })
            .then((clientList) => {
                // Tenta focar em uma janela já aberta
                for (const client of clientList) {
                    if (client.url.includes(self.location.origin) && 'focus' in client) {
                        return client.focus();
                    }
                }
                // Se não encontrou, abre nova janela
                if (clients.openWindow) {
                    return clients.openWindow(url);
                }
            })
    );
});

// Instalação
self.addEventListener('install', (event) => {
    console.log('[SW] Instalando Service Worker...');
    self.skipWaiting(); // Ativa imediatamente
});

// Ativação
self.addEventListener('activate', (event) => {
    console.log('[SW] Ativando Service Worker...');
    event.waitUntil(clients.claim()); // Toma controle imediatamente
});