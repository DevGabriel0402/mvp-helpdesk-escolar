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

// Elemento de áudio para som de notificação
let audioElement = null;

function tocarSomNotificacao() {
  try {
    // Usar som de notificação público
    if (!audioElement) {
      audioElement = new Audio(
        "https://assets.mixkit.co/active_storage/sfx/591/591-preview.mp3",
      );
      audioElement.volume = 0.5;
    }

    // Reiniciar e tocar
    audioElement.currentTime = 0;
    audioElement.play().catch(() => {
      // Ignorar erro se autoplay bloqueado
    });
  } catch (err) {
    console.warn("Erro ao tocar som:", err);
  }
}

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

  // Flag para ignorar o primeiro snapshot (carregamento inicial)
  const primeiroSnapshot = useRef(true);

  // Estado inicial baseado nas condições
  const estadoInicial = useMemo(() => {
    if (!ativo || !uid || !escolaId) return [];
    return carregarStorage({ uid, escolaId });
  }, [ativo, uid, escolaId]);

  const [notificacoes, setNotificacoes] = useState(estadoInicial);
  const [ultimoVistoMs, setUltimoVistoMs] = useState(() => {
    if (!ativo || !uid || !escolaId) return 0;
    const estadoLocal = carregarEstadoNotificacoesLocal(uid, escolaId);
    return estadoLocal?.ultimoVistoMs || 0;
  });
  const ultimoVistoRef = useRef(ultimoVistoMs);

  // Mantém o ref sincronizado com o state
  useEffect(() => {
    ultimoVistoRef.current = ultimoVistoMs;
  }, [ultimoVistoMs]);

  // ✅ badge
  const naoLidas = useMemo(
    () => notificacoes.filter((n) => !n.lida).length,
    [notificacoes],
  );

  // Sincronizar com Firestore quando ativo
  useEffect(() => {
    if (!ativo || !uid || !escolaId) return;

    async function sincronizarEstado() {
      try {
        const estadoRemoto = await buscarEstadoNotificacoes(uid, escolaId);
        if (estadoRemoto?.ultimoVistoMs) {
          setUltimoVistoMs(estadoRemoto.ultimoVistoMs);
          // Se o remoto é mais recente, limpa notificações antigas
          const atuais = carregarStorage({ uid, escolaId });
          const notifsFiltradas = atuais.filter(
            (n) => n.criadoMs > estadoRemoto.ultimoVistoMs,
          );
          if (notifsFiltradas.length !== atuais.length) {
            salvarStorage({ uid, escolaId }, notifsFiltradas);
            setNotificacoes(notifsFiltradas);
          }
        }
      } catch (err) {
        console.error("Erro ao carregar estado de notificações:", err);
      }
    }

    sincronizarEstado();
  }, [ativo, uid, escolaId]);

  // Listener de chamados novos
  useEffect(() => {
    if (!ativo || !uid || !escolaId) {
      return;
    }

    // Reset flag no início do listener
    primeiroSnapshot.current = true;

    const q = query(
      collection(db, "chamados"),
      where("escolaId", "==", escolaId),
      orderBy("criadoEm", "desc"),
    );

    const off = onSnapshot(q, (snap) => {
      // Ignorar primeiro snapshot (carregamento inicial)
      if (primeiroSnapshot.current) {
        primeiroSnapshot.current = false;
        // Só carrega os dados sem tocar som
        const atuais = carregarStorage({ uid, escolaId });
        setNotificacoes(atuais);
        return;
      }

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
        // Tocar som de notificação
        tocarSomNotificacao();
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

// eslint-disable-next-line react-refresh/only-export-components
export function useNotificacoes() {
  const ctx = useContext(NotificacoesContexto);
  if (!ctx)
    throw new Error("useNotificacoes deve ser usado dentro de ProvedorNotificacoes");
  return ctx;
}

// eslint-disable-next-line react-refresh/only-export-components
export const usarNotificacoes = useNotificacoes;
