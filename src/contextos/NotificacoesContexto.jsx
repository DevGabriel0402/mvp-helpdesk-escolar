import { createContext, useContext, useEffect, useMemo, useRef, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../servicos/firebase/firebaseConfig";
import { useAuth } from "./AuthContexto";
import {
  buscarEstadoNotificacoes,
  carregarEstadoNotificacoesLocal,
  salvarEstadoNotificacoes,
} from "../servicos/firebase/notificacoesServico";

const NotificacoesContexto = createContext(null);

function chaveStorage({ uid, escolaId }) {
  return `helpdesk:notificacoes:${uid}:${escolaId}`;
}

function carregarStorage({ uid, escolaId }) {
  try {
    if (!uid || !escolaId) return [];
    const bruto = localStorage.getItem(chaveStorage({ uid, escolaId }));
    return bruto ? JSON.parse(bruto) : [];
  } catch {
    return [];
  }
}

function salvarStorage({ uid, escolaId }, itens) {
  if (!uid || !escolaId) return;
  localStorage.setItem(chaveStorage({ uid, escolaId }), JSON.stringify(itens));
}

export function ProvedorNotificacoes({ children }) {
  const { usuarioAuth, perfil, eAdmin } = useAuth();
  const uid = usuarioAuth?.uid;
  const escolaId = perfil?.escolaId;
  const ativo = !!eAdmin;

  const [notificacoes, setNotificacoes] = useState([]);
  const [ultimoVistoMs, setUltimoVistoMs] = useState(0);
  const ultimoVistoRef = useRef(0);

  // Mantém o ref sincronizado com o state
  useEffect(() => {
    ultimoVistoRef.current = ultimoVistoMs;
  }, [ultimoVistoMs]);

  // ✅ badge
  const naoLidas = useMemo(
    () => notificacoes.filter((n) => !n.lida).length,
    [notificacoes],
  );

  // Carregar estado inicial (localStorage + Firestore)
  useEffect(() => {
    if (!ativo || !uid || !escolaId) {
      setNotificacoes([]);
      setUltimoVistoMs(0);
      return;
    }

    async function carregarEstado() {
      // 1. Carrega do localStorage primeiro (instantâneo)
      const estadoLocal = carregarEstadoNotificacoesLocal(uid, escolaId);
      if (estadoLocal?.ultimoVistoMs) {
        setUltimoVistoMs(estadoLocal.ultimoVistoMs);
      }
      const iniciais = carregarStorage({ uid, escolaId });
      setNotificacoes(iniciais);

      // 2. Sincroniza com Firestore
      try {
        const estadoRemoto = await buscarEstadoNotificacoes(uid, escolaId);
        if (estadoRemoto?.ultimoVistoMs) {
          setUltimoVistoMs(estadoRemoto.ultimoVistoMs);
          // Se o remoto é mais recente, limpa notificações antigas
          const notifsFiltradas = iniciais.filter(
            (n) => n.criadoMs > estadoRemoto.ultimoVistoMs,
          );
          if (notifsFiltradas.length !== iniciais.length) {
            salvarStorage({ uid, escolaId }, notifsFiltradas);
            setNotificacoes(notifsFiltradas);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar estado de notificações:", err);
      }
    }

    carregarEstado();
  }, [ativo, uid, escolaId]);

  // Listener de chamados novos
  useEffect(() => {
    if (!ativo || !uid || !escolaId) return;

    const q = query(
      collection(db, "chamados"),
      where("escolaId", "==", escolaId),
      orderBy("criadoEm", "desc"),
    );

    const off = onSnapshot(q, (snap) => {
      // Se não há chamados no Firestore, limpar notificações locais
      if (snap.empty) {
        salvarStorage({ uid, escolaId }, []);
        setNotificacoes([]);
        return;
      }

      const atuais = carregarStorage({ uid, escolaId });
      const jaTem = new Set(atuais.map((x) => x.chamadoId));
      let mudou = false;

      snap.docChanges().forEach((change) => {
        if (change.type !== "added") return;

        const d = change.doc.data();
        const criadoEm = d.criadoEm;
        const criadoMs = criadoEm?.toMillis ? criadoEm.toMillis() : 0;

        // Usa o ref para ter sempre o valor mais atualizado
        if (criadoMs <= ultimoVistoRef.current) return;

        const chamadoId = change.doc.id;
        if (jaTem.has(chamadoId)) return;

        atuais.unshift({
          id: `${chamadoId}_${criadoMs}`,
          chamadoId,
          codigoChamado: d.codigoChamado || "",
          titulo: d.titulo || "Novo chamado",
          mensagem: d.descricao || "",
          criadoMs,
          lida: false,
        });

        mudou = true;
        jaTem.add(chamadoId);
      });

      if (mudou) {
        salvarStorage({ uid, escolaId }, atuais);
        setNotificacoes(atuais);
      }
    });

    return () => off();
  }, [ativo, uid, escolaId]);

  function marcarTudoComoLido() {
    if (!uid || !escolaId) return;
    const atual = notificacoes.map((n) => ({ ...n, lida: true }));
    salvarStorage({ uid, escolaId }, atual);
    setNotificacoes(atual);
  }

  function marcarComoLida(chamadoId) {
    if (!uid || !escolaId) return;
    const atual = notificacoes.map((n) =>
      n.chamadoId === chamadoId ? { ...n, lida: true } : n,
    );
    salvarStorage({ uid, escolaId }, atual);
    setNotificacoes(atual);
  }

  async function limparTudo() {
    if (!uid || !escolaId) return;

    const agora = Date.now();

    // Limpa localStorage
    salvarStorage({ uid, escolaId }, []);
    setNotificacoes([]);
    setUltimoVistoMs(agora);

    // Salva no Firestore para persistir entre dispositivos
    try {
      await salvarEstadoNotificacoes(uid, escolaId, {
        ultimoVistoMs: agora,
        limpadoEm: agora,
      });
    } catch (err) {
      console.error("Erro ao salvar estado de notificações:", err);
    }
  }

  const valor = {
    notificacoes,
    naoLidas,
    marcarComoLida,
    marcarTudoComoLido,
    limparTudo,
  };

  return (
    <NotificacoesContexto.Provider value={valor}>
      {children}
    </NotificacoesContexto.Provider>
  );
}

export function usarNotificacoes() {
  const ctx = useContext(NotificacoesContexto);
  if (!ctx)
    throw new Error("usarNotificacoes deve ser usado dentro de ProvedorNotificacoes");
  return ctx;
}
