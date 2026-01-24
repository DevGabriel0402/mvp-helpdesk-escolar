import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { auth, db } from "./firebaseConfig";
import { doc, setDoc, serverTimestamp } from "firebase/firestore";

// Função auxiliar para aguardar Service Worker estar ativo
async function aguardarServiceWorkerAtivo(registration) {
    if (registration.active) {
        return registration;
    }

    return new Promise((resolve, reject) => {
        const worker = registration.installing || registration.waiting;

        if (!worker) {
            reject(new Error('Service Worker não encontrado'));
            return;
        }

        const timeout = setTimeout(() => {
            reject(new Error('Timeout ao ativar Service Worker'));
        }, 10000);

        worker.addEventListener('statechange', function handler(e) {
            if (e.target.state === 'activated') {
                clearTimeout(timeout);
                worker.removeEventListener('statechange', handler);
                resolve(registration);
            } else if (e.target.state === 'redundant') {
                clearTimeout(timeout);
                worker.removeEventListener('statechange', handler);
                reject(new Error('Service Worker tornou-se redundante'));
            }
        });
    });
}

export async function registrarPushAdmin({ escolaId = "escola_padrao" } = {}) {
    try {
        // 1. Verifica suporte
        const suportado = await isSupported();
        if (!suportado) {
            return { ok: false, motivo: "Navegador não suporta push." };
        }

        if (!("Notification" in window)) {
            return { ok: false, motivo: "Notificações não suportadas." };
        }

        // 2. Pede permissão
        let perm = Notification.permission;
        if (perm === 'default') {
            perm = await Notification.requestPermission();
        }

        if (perm !== "granted") {
            return { ok: false, motivo: "Permissão negada." };
        }

        // 3. Registra Service Worker SEM escopo customizado
        console.log('Registrando Service Worker...');
        let regFCM;

        // Verifica se já existe
        const existingReg = await navigator.serviceWorker.getRegistration('/firebase-messaging-sw.js');

        if (existingReg) {
            console.log('Service Worker já registrado');
            regFCM = existingReg;
        } else {
            regFCM = await navigator.serviceWorker.register(
                "/firebase-messaging-sw.js"
                // ✅ SEM scope customizado - usa o padrão '/'
            );
            console.log('Service Worker registrado:', regFCM);
        }

        // 4. Aguarda o Service Worker estar ativo
        console.log('Aguardando Service Worker ativar...');
        await aguardarServiceWorkerAtivo(regFCM);

        // Aguarda mais um pouco para garantir
        await new Promise(resolve => setTimeout(resolve, 500));

        console.log('Service Worker ativo!');

        // 5. Obtém o messaging
        const messaging = getMessaging();

        // 6. Obtém o token
        console.log('Obtendo token FCM...');
        const token = await getToken(messaging, {
            vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
            serviceWorkerRegistration: regFCM,
        });

        if (!token) {
            return { ok: false, motivo: "Não foi possível obter token." };
        }

        console.log('Token obtido:', token.substring(0, 20) + '...');

        // 7. Salva no Firestore
        const uid = auth.currentUser?.uid;
        if (!uid) {
            return { ok: false, motivo: "Sem usuário logado." };
        }

        await setDoc(
            doc(db, "escolas", escolaId, "tokensPush", token),
            {
                token,
                tipo: "admin",
                uidAdmin: uid,
                criadoEm: serverTimestamp(),
                ultimoAcessoEm: serverTimestamp(),
                userAgent: navigator.userAgent,
            },
            { merge: true }
        );

        console.log('Token salvo no Firestore');

        return { ok: true, token };

    } catch (error) {
        console.error('Erro completo ao registrar push:', error);
        return {
            ok: false,
            motivo: error.message || "Erro desconhecido",
            erro: error
        };
    }
}