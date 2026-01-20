import {
  collection,
  doc,
  runTransaction,
  serverTimestamp,
  getDocs,
  getDoc,
  query,
  where,
  limit,
  onSnapshot,
  orderBy,
  addDoc,
  updateDoc,
  deleteDoc,
} from "firebase/firestore";
import { db } from "./firebaseConfig";

// ===============================
// Helpers de Cache (localStorage)
// ===============================
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutos

function getCachedData(key) {
  try {
    const cached = localStorage.getItem(key);
    if (!cached) return null;

    const { data, timestamp } = JSON.parse(cached);
    const isValid = Date.now() - timestamp < CACHE_DURATION;

    return isValid ? data : null;
  } catch {
    return null;
  }
}

function setCachedData(key, data) {
  try {
    localStorage.setItem(
      key,
      JSON.stringify({
        data,
        timestamp: Date.now(),
      }),
    );
  } catch {
    // localStorage cheio ou indisponível
  }
}

// Helper interno
function gerarCodigoChamado(numeroChamado) {
  const numeroFormatado = String(numeroChamado).padStart(5, "0");
  return `OS N°${numeroFormatado}`;
}

export async function criarChamado({ escolaId, usuario, dadosChamado }) {
  if (!escolaId) throw new Error("escolaId obrigatorio");
  if (!usuario?.uid) throw new Error("usuario.uid obrigatorio");

  const refContador = doc(db, "contadores", escolaId);
  const refColecaoChamados = collection(db, "chamados");

  const resultado = await runTransaction(db, async (transacao) => {
    const snapContador = await transacao.get(refContador);

    let novoNumero;

    if (!snapContador.exists()) {
      // ✅ Primeira vez: criar com número 1
      novoNumero = 1;
      transacao.set(refContador, {
        ultimoNumeroChamado: novoNumero,
        atualizadoEm: serverTimestamp(),
      });
    } else {
      // ✅ Já existe: incrementar
      const ultimo = snapContador.data().ultimoNumeroChamado || 0;
      novoNumero = ultimo + 1;
      transacao.update(refContador, {
        ultimoNumeroChamado: novoNumero,
        atualizadoEm: serverTimestamp(),
      });
    }

    const codigoChamado = gerarCodigoChamado(novoNumero);

    // ID REAL AUTOMATICO
    const refNovoChamado = doc(refColecaoChamados);

    const payload = {
      escolaId,
      numeroChamado: novoNumero,
      codigoChamado,

      criadoPorUid: usuario.uid,
      criadoPorNome: usuario.nome || "Visitante",
      criadoPorTipo: usuario.tipo || "visitante",
      criadoPorEmail: usuario.email || null,

      titulo: dadosChamado.titulo || "",
      descricao: dadosChamado.descricao || "",
      localDoProblema: dadosChamado.localDoProblema || "",

      categoriaId: dadosChamado.categoriaId || "outros",
      prioridade: dadosChamado.prioridade || null,
      status: "aberto",

      responsavelUid: null,
      anexos: Array.isArray(dadosChamado.anexos) ? dadosChamado.anexos : [],

      criadoEm: serverTimestamp(),
      atualizadoEm: serverTimestamp(),
      ultimaAtividadeEm: serverTimestamp(),
    };

    transacao.set(refNovoChamado, payload);

    return {
      id: refNovoChamado.id,
      numeroChamado: novoNumero,
      codigoChamado,
    };
  });

  return resultado;
}

export async function buscarChamadoPorNumero({
  escolaId,
  ticketNumber,
  ticketCode,
  tipoConsulta,
}) {
  if (!escolaId) throw new Error("escolaId obrigatorio");

  // ✅ tipoConsulta:
  // - "visitante" => restringe query para bater com as rules
  // - "admin" => pode buscar livre dentro da escola do admin
  const filtros = [where("escolaId", "==", escolaId)];

  // ✅ Para visitante/usuario, precisamos bater com podeLerChamado:
  // escola_padrao + criadoPorTipo in ["visitante","usuario"]
  if (tipoConsulta === "visitante") {
    filtros.push(where("criadoPorTipo", "in", ["visitante", "usuario"]));
  }

  let q;

  if (ticketCode) {
    q = query(
      collection(db, "chamados"),
      ...filtros,
      where("codigoChamado", "==", ticketCode),
      limit(1),
    );
  } else {
    q = query(
      collection(db, "chamados"),
      ...filtros,
      where("numeroChamado", "==", Number(ticketNumber)),
      limit(1),
    );
  }

  const snap = await getDocs(q);
  if (snap.empty) return null;

  const docRef = snap.docs[0];
  return { id: docRef.id, ...docRef.data() };
}

export async function buscarChamadoPorId(chamadoId) {
  if (!chamadoId) throw new Error("chamadoId obrigatorio");

  const docRef = doc(db, "chamados", chamadoId);
  const snap = await getDoc(docRef);

  if (!snap.exists()) return null;

  return { id: snap.id, ...snap.data() };
}

// ===============================
// 1) Comentarios (admin e visitante)
// ===============================
export async function adicionarComentarioNoChamado({
  chamadoId,
  uid,
  nome,
  papel, // "admin" | "visitante"
  mensagem,
  anexos = [],
}) {
  const refComentarios = collection(db, "chamados", chamadoId, "comentarios");

  await addDoc(refComentarios, {
    uid,
    nome,
    papel,
    mensagem,
    anexos,
    criadoEm: serverTimestamp(),
  });

  // atualiza ultima atividade no chamado
  await updateDoc(doc(db, "chamados", chamadoId), {
    atualizadoEm: serverTimestamp(),
    ultimaAtividadeEm: serverTimestamp(),
  });
}

// ===============================
// 2) Atualizacoes (SOMENTE admin)
// ===============================
export async function adicionarAtualizacaoAdmin({
  chamadoId,
  tipo, // "nota" | "mudanca_status" | ...
  texto = "",
  de = null,
  para = null,
  adminUid,
  adminNome,
}) {
  const refAtualizacoes = collection(db, "chamados", chamadoId, "atualizacoes");

  await addDoc(refAtualizacoes, {
    tipo,
    de,
    para,
    texto,
    adminUid,
    adminNome,
    criadoEm: serverTimestamp(),
  });

  await updateDoc(doc(db, "chamados", chamadoId), {
    atualizadoEm: serverTimestamp(),
    ultimaAtividadeEm: serverTimestamp(),
  });
}

// ===============================
// 3) Mudar status + criar atualizacao (atomicamente)
// ===============================
export async function alterarStatusChamadoAdmin({
  chamadoId,
  novoStatus, // "aberto" | "andamento" | "resolvido"
  adminUid,
  adminNome,
}) {
  const refChamado = doc(db, "chamados", chamadoId);
  const refAtualizacoes = collection(db, "chamados", chamadoId, "atualizacoes");

  const statusValidos = ["aberto", "andamento", "resolvido", "prodabel"];
  if (!statusValidos.includes(novoStatus)) {
    throw new Error(`Status invalido: ${novoStatus}`);
  }

  await runTransaction(db, async (transacao) => {
    const snap = await transacao.get(refChamado);
    if (!snap.exists()) throw new Error("Chamado nao encontrado.");

    const atual = snap.data();
    const statusAtual = atual.status || "aberto";

    const hierarquia = {
      aberto: 0,
      andamento: 1,
      prodabel: 2,
      resolvido: 3,
    };

    // Regra: o status so pode avançar na hierarquia, nunca retroceder
    if (hierarquia[novoStatus] < hierarquia[statusAtual]) {
      throw new Error(`Nao e possivel retornar o status de ${statusAtual} para ${novoStatus}.`);
    }

    // atualiza o documento principal
    const dadosUpdate = {
      status: novoStatus,
      atualizadoEm: serverTimestamp(),
      ultimaAtividadeEm: serverTimestamp(),
    };

    // opcional: marcar finalizadoEm quando resolvido
    if (novoStatus === "resolvido") {
      dadosUpdate.finalizadoEm = serverTimestamp();
    } else {
      // se quiser “reabrir” e limpar finalizadoEm, comente essa linha
      // dadosUpdate.finalizadoEm = null;
    }

    transacao.update(refChamado, dadosUpdate);

    // cria atualizacao (log)
    const refNovaAtualizacao = doc(refAtualizacoes);
    transacao.set(refNovaAtualizacao, {
      tipo: "mudanca_status",
      de: statusAtual,
      para: novoStatus,
      texto: "",
      adminUid,
      adminNome,
      criadoEm: serverTimestamp(),
    });
  });
}

// ===============================
// 5) Listeners para timeline (comentarios + atualizacoes)
// ===============================
export function ouvirComentarios(chamadoId, callback) {
  const q = query(
    collection(db, "chamados", chamadoId, "comentarios"),
    orderBy("criadoEm", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const itens = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      _tipoItem: "comentario",
    }));
    callback(itens);
  });
}

export function ouvirAtualizacoes(chamadoId, callback) {
  const q = query(
    collection(db, "chamados", chamadoId, "atualizacoes"),
    orderBy("criadoEm", "asc"),
  );
  return onSnapshot(q, (snap) => {
    const itens = snap.docs.map((d) => ({
      id: d.id,
      ...d.data(),
      _tipoItem: "atualizacao",
    }));
    callback(itens);
  });
}

export function ouvirChamadosDaEscola(escolaId, callback) {
  const cacheKey = `chamados_escola_${escolaId}`;

  // Retornar dados do cache imediatamente (se existir)
  const cached = getCachedData(cacheKey);
  if (cached) {
    callback(cached);
  }

  const q = query(
    collection(db, "chamados"),
    where("escolaId", "==", escolaId),
    orderBy("criadoEm", "desc"),
  );

  return onSnapshot(q, (snap) => {
    const lista = snap.docs.map((d) => ({ id: d.id, ...d.data() }));
    // Atualizar cache
    setCachedData(cacheKey, lista);
    callback(lista);
  });
}

// ===============================
// Excluir chamado (SOMENTE admin)
// ===============================
export async function excluirChamadoAdmin(chamadoId) {
  if (!chamadoId) throw new Error("chamadoId obrigatório");

  const refChamado = doc(db, "chamados", chamadoId);
  await deleteDoc(refChamado);
}

// ===============================
// Alterar prioridade (SOMENTE admin)
// ===============================
export async function alterarPrioridadeChamadoAdmin({
  chamadoId,
  novaPrioridade,
  adminUid,
  adminNome,
}) {
  const refChamado = doc(db, "chamados", chamadoId);
  const refAtualizacoes = collection(db, "chamados", chamadoId, "atualizacoes");

  const prioridadesValidas = ["baixa", "normal", "alta", "urgente"];
  if (!prioridadesValidas.includes(novaPrioridade)) {
    throw new Error(`Prioridade inválida: ${novaPrioridade}`);
  }

  await runTransaction(db, async (transacao) => {
    const snap = await transacao.get(refChamado);
    if (!snap.exists()) throw new Error("Chamado não encontrado.");

    const atual = snap.data();
    const prioridadeAtual = atual.prioridade || "normal";

    // atualiza o documento principal
    transacao.update(refChamado, {
      prioridade: novaPrioridade,
      atualizadoEm: serverTimestamp(),
      ultimaAtividadeEm: serverTimestamp(),
    });

    // cria atualização (log)
    const refNovaAtualizacao = doc(refAtualizacoes);
    transacao.set(refNovaAtualizacao, {
      tipo: "mudanca_prioridade",
      de: prioridadeAtual,
      para: novaPrioridade,
      texto: "",
      adminUid,
      adminNome,
      criadoEm: serverTimestamp(),
    });
  });
}

// ===============================
// Confirmar Prioridade + "Receber" Chamado (Status aberto)
// ===============================
export async function confirmarPrioridadeEReceberChamado({
  chamadoId,
  novaPrioridade,
  adminUid,
  adminNome,
}) {
  const refChamado = doc(db, "chamados", chamadoId);
  const refAtualizacoes = collection(db, "chamados", chamadoId, "atualizacoes");

  await runTransaction(db, async (transacao) => {
    const snap = await transacao.get(refChamado);
    if (!snap.exists()) throw new Error("Chamado nao encontrado.");

    // 1) Atualiza prioridade e garante status "aberto" (Recebido)
    transacao.update(refChamado, {
      prioridade: novaPrioridade,
      status: "aberto",
      atualizadoEm: serverTimestamp(),
      ultimaAtividadeEm: serverTimestamp(),
    });

    // 2) Adiciona nota: "Prioridade: [Valor]"
    const refNotaPrio = doc(refAtualizacoes);
    transacao.set(refNotaPrio, {
      tipo: "nota",
      texto: `Prioridade: ${novaPrioridade.charAt(0).toUpperCase() + novaPrioridade.slice(1)}`,
      adminUid,
      adminNome,
      criadoEm: serverTimestamp(),
    });

    // 3) Log de status para transição visual no front
    const refStatusLog = doc(refAtualizacoes);
    transacao.set(refStatusLog, {
      tipo: "mudanca_status",
      de: "aberto",
      para: "aberto",
      adminUid,
      adminNome,
      criadoEm: serverTimestamp(),
    });
  });
}
