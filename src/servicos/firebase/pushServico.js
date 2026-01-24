import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { auth, db } from "./firebaseConfig"; // ajuste o caminho se precisar
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export async function registrarPushAdmin() {
    const suportado = await isSupported();
    if (!suportado) return { ok: false, motivo: "Navegador não suporta push." };

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, motivo: "Permissão negada." };

    const uid = auth.currentUser?.uid;
    if (!uid) return { ok: false, motivo: "Sem usuário logado." };

    const originalUA = navigator.userAgent;

    const cacheKey = "fcm_token_admin";

    const tokenSalvo = localStorage.getItem(cacheKey);
    if (tokenSalvo) {
        // opcional: só atualiza ultimoAcessoEm no Firestore e sai
    }


    Object.defineProperty(navigator, 'userAgent', {
        get: function () {
            if (originalUA.includes('iPhone')) {
                return 'iPhone-App';
            } else if (originalUA.includes('Windows')) {
                return 'Web-Windows';
            } else if (originalUA.includes('Android')) {
                return 'Android-App';
            } else {
                return 'Dispositivo-Desconhecido';
            }
        },
        configurable: true
    });

    // garante que o SW está pronto
    const reg = await navigator.serviceWorker.ready;

    const messaging = getMessaging();

    const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
        serviceWorkerRegistration: reg,
    });

    if (!token) return { ok: false, motivo: "Não foi possível gerar token." };

    // docId = token (padrão recomendado)
    await setDoc(
        doc(db, "escolas", "escola_padrao", "tokensPush", token),
        {
            token,
            tipo: "admin",
            uidAdmin: uid,
            ativo: true,
            criadoEm: serverTimestamp(),
            ultimoAcessoEm: serverTimestamp(),
            plataforma: originalUA,
        },
        { merge: true }
    );

    localStorage.setItem(cacheKey, token);

    return { ok: true, token };
}
