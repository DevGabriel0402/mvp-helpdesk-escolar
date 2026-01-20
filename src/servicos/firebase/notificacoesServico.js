import {
  addDoc,
  collection,
  doc,
  getDoc,
  serverTimestamp,
  setDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

export async function criarNotificacaoParaUsuario({
  uidDestino,
  chamadoId,
  codigoChamado,
  tipo,
  titulo,
  mensagem,
}) {
  if (!uidDestino) throw new Error("uidDestino obrigatorio");
  if (!chamadoId) throw new Error("chamadoId obrigatorio");

  const ref = collection(db, "usuarios", uidDestino, "notificacoes");

  await addDoc(ref, {
    chamadoId, // ✅ ID REAL do Firestore
    codigoChamado, // ✅ protocolo humano
    tipo,
    titulo,
    mensagem,
    lido: false,
    criadoEm: serverTimestamp(),
  });
}

// ===== Estado de notificações do admin (limpas/último visto) =====

const STORAGE_KEY_ESTADO = (uid, escolaId) => `helpdesk:notif_estado:${uid}:${escolaId}`;

export function carregarEstadoNotificacoesLocal(uid, escolaId) {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_ESTADO(uid, escolaId));
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function salvarEstadoNotificacoesLocal(uid, escolaId, estado) {
  try {
    localStorage.setItem(STORAGE_KEY_ESTADO(uid, escolaId), JSON.stringify(estado));
  } catch {
    // ignore
  }
}

export async function buscarEstadoNotificacoes(uid, escolaId) {
  if (!uid || !escolaId) return null;
  const ref = doc(db, "usuarios", uid, "configuracoes", "notificacoes");
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;

  const dados = snap.data();
  salvarEstadoNotificacoesLocal(uid, escolaId, dados);
  return dados;
}

export async function salvarEstadoNotificacoes(uid, escolaId, estado) {
  if (!uid || !escolaId) return;
  const ref = doc(db, "usuarios", uid, "configuracoes", "notificacoes");
  const payload = { ...estado, escolaId, atualizadoEm: serverTimestamp() };
  await setDoc(ref, payload, { merge: true });
  salvarEstadoNotificacoesLocal(uid, escolaId, estado);
}
