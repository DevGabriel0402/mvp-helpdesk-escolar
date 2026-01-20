import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { buscarConfigUI, carregarConfigLocal, salvarConfigUI } from "../servicos/firebase/configuracoesServico";
import { usarAuth } from "./AuthContexto";

const ConfiguracoesContexto = createContext(null);

const configPadrao = {
    cores: {
        texto: "#ffffff",
        fundo: "#0b0b0c",
        vidro: "rgba(255,255,255,0.06)",
        borda: "rgba(255,255,255,0.12)",
        icone: "#ffffff",
        badgeFundo: "rgba(255, 60, 60, 0.95)",
        badgeTexto: "#ffffff",
        botaoFundo: "rgba(255,255,255,0.10)",
        botaoTexto: "#ffffff",
        destaque: "#ffffff",
    },
    logo: {
        url: "",
        publicId: "",
        largura: 0,
        altura: 0,
    },
    preferencias: {
        modo: "escuro",
        raio: 18,
        blur: 16,
    },
};

export function ProvedorConfiguracoes({ children }) {
    const { usuarioAuth, eAdmin } = usarAuth();
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
        [configUI, carregando]
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
