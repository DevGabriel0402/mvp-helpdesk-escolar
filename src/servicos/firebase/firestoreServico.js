import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function buscarPerfilDoUsuario(uid) {
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);
    return snap.exists() ? snap.data() : null;
}

// Opcional (so se voce quiser criar doc admin via app)
export async function criarPerfilAdminSeNaoExiste({ uid, nome, email, escolaId }) {
    const ref = doc(db, "usuarios", uid);
    const snap = await getDoc(ref);

    if (snap.exists()) return snap.data();

    const dados = {
        nome: nome || "Admin",
        email: email || "",
        escolaId: escolaId || "escola_padrao",
        papel: "admin",
        criadoEm: serverTimestamp(),
    };

    await setDoc(ref, dados);
    return dados;
}
