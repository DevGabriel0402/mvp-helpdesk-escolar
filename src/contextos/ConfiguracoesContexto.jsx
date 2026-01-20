import { createContext, useContext, useEffect, useMemo, useState } from "react";
import {
  buscarConfigUI,
  carregarConfigLocal,
  salvarConfigUI,
} from "../servicos/firebase/configuracoesServico";
import { useAuth } from "./AuthContexto";

const ConfiguracoesContexto = createContext(null);

const configPadrao = {
  cores: {
    fundo: "#0a0b0e",
    fundo2: "#12141a",
    texto: "#f5f5f5",
    textoFraco: "rgba(245,245,245,0.6)",
    vidro: "rgba(255,255,255,0.04)",
    vidroForte: "rgba(255,255,255,0.08)",
    borda: "rgba(255,255,255,0.1)",
    pretoTransparente: "rgba(0,0,0,0.25)",
    brancoTransparente: "rgba(255,255,255,0.06)",
    menuFundo: "rgba(5, 5, 10, 0.9)",
    destaque: "rgba(255,255,255,0.06)",
    icone: "#ffffff",
    badgeFundo: "rgba(255, 60, 60, 0.95)",
    badgeTexto: "#ffffff",
    botaoFundo: "rgba(255,255,255,0.10)",
    botaoTexto: "#ffffff",
    cartao: "#1a1a1a",
    vermelho: "#ff4d4d",
  },
  logo: {
    url: "",
    publicId: "",
    largura: 0,
    altura: 0,
  },
  preferencias: {
    modo: "escuro",
    raio: 6,
    blur: 16,
  },
  status: [
    { id: "aberto", label: "Recebido", color: "#32c8ff" },
    { id: "andamento", label: "Em Progresso", color: "#ffc832" },
    { id: "prodabel", label: "Encaminhado Prodabel", color: "#a855f7" },
    { id: "resolvido", label: "Resolvido", color: "#32ff64" },
    { id: "fechado", label: "Concluído", color: "#94a3b8" },
  ],
  prioridades: [
    { id: "urgente", label: "Urgente", color: "#ff4d4d" },
    { id: "alta", label: "Alta", color: "#f97316" },
    { id: "normal", label: "Normal", color: "#10b981" },
    { id: "baixa", label: "Baixa", color: "#64748b" },
  ],
};

export function ProvedorConfiguracoes({ children }) {
  const { usuarioAuth, eAdmin } = useAuth();
  const uid = usuarioAuth?.uid;

  const [configUI, setConfigUI] = useState(configPadrao);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    async function carregar() {
      if (!uid || !eAdmin) {
        setConfigUI(configPadrao);
        setCarregando(false);
        return;
      }

      // 1) carrega do localStorage instantâneo
      const local = carregarConfigLocal(uid);
      if (local) setConfigUI((prev) => ({ ...prev, ...local }));

      // 2) busca do Firestore e substitui
      try {
        const remoto = await buscarConfigUI(uid);
        if (remoto) setConfigUI((prev) => ({ ...prev, ...remoto }));
      } finally {
        setCarregando(false);
      }
    }

    carregar();
  }, [uid, eAdmin]);

  async function atualizarConfig(novaConfig) {
    if (!uid) return;
    setConfigUI(novaConfig);
    await salvarConfigUI(uid, novaConfig);
  }

  const valor = useMemo(
    () => ({ configUI, setConfigUI, atualizarConfig, carregando }),
    [configUI, carregando],
  );

  return (
    <ConfiguracoesContexto.Provider value={valor}>
      {children}
    </ConfiguracoesContexto.Provider>
  );
}

export function usarConfiguracoes() {
  return useContext(ConfiguracoesContexto);
}
