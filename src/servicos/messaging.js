import { getMessaging, getToken, isSupported } from "firebase/messaging";
import { auth, db } from "../servicos/firebase";
import { doc, serverTimestamp, setDoc } from "firebase/firestore";

export async function registrarPushAdmin() {
    const suportado = await isSupported();
    if (!suportado) return { ok: false, motivo: "Navegador não suporta push." };

    const perm = await Notification.requestPermission();
    if (perm !== "granted") return { ok: false, motivo: "Permissão negada." };

    // ✅ registra o SW do FCM separado do PWA
    const reg = await navigator.serviceWorker.register(
        "/firebase-messaging-sw.js",
        { scope: "/fcm/" }
    );

    const messaging = getMessaging();

    const token = await getToken(messaging, {
        vapidKey: import.meta.env.VITE_FCM_VAPID_KEY,
        serviceWorkerRegistration: reg,
    });


    console.log("Permissão:", perm);
    console.log("Token FCM:", token);

    if (!token) return { ok: false, motivo: "Token FCM vazio (falha no getToken)." };

    const uid = auth.currentUser?.uid;
    if (!uid) return { ok: false, motivo: "Sem usuário logado." };

    await setDoc(
        doc(db, "escolas", "escola_padrao", "tokensPush", token),
        {
            token,
            tipo: "admin",
            uidAdmin: uid,
            criadoEm: serverTimestamp(),
            ultimoAcessoEm: serverTimestamp(),
        },
        { merge: true }
    );

    return { ok: true, token };
}
