import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

const chaveLS = (uid) => `helpdesk:config_ui:${uid}`;

export function carregarConfigLocal(uid) {
    try {
        const bruto = localStorage.getItem(chaveLS(uid));
        return bruto ? JSON.parse(bruto) : null;
    } catch {
        return null;
    }
}

export function salvarConfigLocal(uid, config) {
    localStorage.setItem(chaveLS(uid), JSON.stringify(config));
}

export async function buscarConfigUI(uid) {
    const ref = doc(db, "usuarios", uid, "configuracoes", "ui");
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

export async function salvarConfigUI(uid, config) {
    const ref = doc(db, "usuarios", uid, "configuracoes", "ui");
    await setDoc(ref, { ...config, atualizadoEm: serverTimestamp() }, { merge: true });
    salvarConfigLocal(uid, config);
}
