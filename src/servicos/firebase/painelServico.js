import { doc, getDoc, serverTimestamp, setDoc } from "firebase/firestore";
import { db } from "./firebaseConfig";

const chaveLS = (escolaId) => `helpdesk:painel_publico:${escolaId}`;

export function carregarPainelLocal(escolaId) {
  try {
    const bruto = localStorage.getItem(chaveLS(escolaId));
    return bruto ? JSON.parse(bruto) : null;
  } catch {
    return null;
  }
}

export function salvarPainelLocal(escolaId, dados) {
  localStorage.setItem(chaveLS(escolaId), JSON.stringify(dados));
}

export async function buscarPainelPublico(escolaId) {
  const ref = doc(db, "escolas", escolaId, "configuracoes", "painel");
  const snap = await getDoc(ref);
  return snap.exists() ? snap.data() : null;
}

export async function salvarPainelPublico(escolaId, dados) {
  const ref = doc(db, "escolas", escolaId, "configuracoes", "painel");
  const payload = { ...dados, atualizadoEm: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  salvarPainelLocal(escolaId, dados);
}
