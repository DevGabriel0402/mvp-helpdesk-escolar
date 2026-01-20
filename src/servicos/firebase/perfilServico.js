import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const chaveLS = (uid) => `helpdesk:perfil_basico:${uid}`;

export function carregarPerfilBasicoLocal(uid) {
  try {
    const bruto = localStorage.getItem(chaveLS(uid));
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function salvarPerfilBasicoLocal(uid, dados) {
  localStorage.setItem(chaveLS(uid), JSON.stringify(dados));
}

export async function buscarPerfilBasico(uid) {
  const ref = doc(db, "usuarios", uid, "configuracoes", "perfil");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function salvarPerfilBasico(uid, dados) {
  const ref = doc(db, "usuarios", uid, "configuracoes", "perfil");
  const payload = { ...dados, atualizadoEm: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  salvarPerfilBasicoLocal(uid, dados);
}
