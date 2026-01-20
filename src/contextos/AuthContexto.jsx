import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { observarAuth, sair as sairFirebase } from "../servicos/firebase/authServico";
import { buscarPerfilDoUsuario } from "../servicos/firebase/firestoreServico";

const AuthContexto = createContext(null);

export function ProvedorAuth({ children }) {
    const [usuarioAuth, setUsuarioAuth] = useState(null);
    const [perfil, setPerfil] = useState(null);
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        const desinscrever = observarAuth(async (user) => {
            setUsuarioAuth(user || null);

            if (!user) {
                setPerfil(null);
                setCarregando(false);
                return;
            }

            try {
                // Se for anonimo, nao tem perfil no banco usuarios
                if (user.isAnonymous) {
                    setPerfil(null);
                } else {
                    const perfilBanco = await buscarPerfilDoUsuario(user.uid);
                    setPerfil(perfilBanco);
                }
            } catch (e) {
                console.error("Erro ao buscar perfil:", e);
                setPerfil(null);
            } finally {
                setCarregando(false);
            }
        });

        return () => desinscrever();
    }, []);

    async function sair() {
        await sairFirebase();
    }

    const valor = useMemo(() => ({
        usuarioAuth,
        perfil: perfil ? { ...perfil, uid: usuarioAuth?.uid } : null,
        carregando,
        sair,
        estaLogado: !!usuarioAuth,
        eVisitante: !!usuarioAuth?.isAnonymous,
        eAdmin: perfil?.papel === "admin",
        uid: usuarioAuth?.uid || null,
    }), [usuarioAuth, perfil, carregando]);

    return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

export function usarAuth() {
    const ctx = useContext(AuthContexto);
    if (!ctx) throw new Error("usarAuth deve ser usado dentro de ProvedorAuth");
    return ctx;
}
