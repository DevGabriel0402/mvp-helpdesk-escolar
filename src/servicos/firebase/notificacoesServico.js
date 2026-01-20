import { addDoc, collection, serverTimestamp } from "firebase/firestore";
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
        chamadoId,       // ✅ ID REAL do Firestore
        codigoChamado,   // ✅ protocolo humano
        tipo,
        titulo,
        mensagem,
        lido: false,
        criadoEm: serverTimestamp(),
    });
}
