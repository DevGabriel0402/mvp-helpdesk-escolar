import { createContext, useContext, useMemo } from "react";
import { usarConfiguracoes } from "./ConfiguracoesContexto";
import { criarTema } from "../estilos/temaDinamico";

const TemaContexto = createContext({});

export function ProvedorTema({ children }) {
    const { configUI, atualizarConfig } = usarConfiguracoes();

    function alternarTema() {
        if (!configUI) return;
        const atual = configUI.preferencias?.modo || "escuro";
        const novo = atual === "escuro" ? "claro" : "escuro";

        atualizarConfig({
            ...configUI,
            preferencias: {
                ...configUI.preferencias,
                modo: novo
            }
        });
    }

    const modo = configUI?.preferencias?.modo || "escuro";
    const temaAtual = useMemo(() => criarTema(configUI), [configUI]);

    return (
        <TemaContexto.Provider value={{ modo, alternarTema, temaAtual }}>
            {children}
        </TemaContexto.Provider>
    );
}

export function usarTema() {
    return useContext(TemaContexto);
}
