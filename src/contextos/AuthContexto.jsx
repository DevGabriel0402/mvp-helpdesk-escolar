import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { observarAuth, sair as sairFirebase } from "../servicos/firebase/authServico";
import { buscarPerfilDoUsuario, observarPerfilUsuario } from "../servicos/firebase/firestoreServico";

const AuthContexto = createContext(null);

export function ProvedorAuth({ children }) {
  const [usuarioAuth, setUsuarioAuth] = useState(null);
  const [perfil, setPerfil] = useState(null);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    let desinscreverPerfil = null;

    const desinscreverAuth = observarAuth((user) => {
      setUsuarioAuth(user || null);

      if (!user) {
        setPerfil(null);
        setCarregando(false);
        if (desinscreverPerfil) desinscreverPerfil();
        return;
      }

      // Se for anonimo, nao tem perfil no banco usuarios
      if (user.isAnonymous) {
        setPerfil(null);
        setCarregando(false);
      } else {
        // Usar onSnapshot para perfil em tempo real
        if (desinscreverPerfil) desinscreverPerfil();
        desinscreverPerfil = observarPerfilUsuario(user.uid, (perfilBanco) => {
          setPerfil(perfilBanco);
          setCarregando(false);
        });
      }
    });

    return () => {
      desinscreverAuth();
      if (desinscreverPerfil) desinscreverPerfil();
    };
  }, []);

  async function sair() {
    await sairFirebase();
  }

  const valor = useMemo(
    () => ({
      usuarioAuth,
      perfil: perfil ? { ...perfil, uid: usuarioAuth?.uid } : null,
      carregando,
      sair,
      setPerfil,
      estaLogado: !!usuarioAuth,
      eVisitante: !!usuarioAuth?.isAnonymous,
      eAdmin: perfil?.papel === "admin",
      uid: usuarioAuth?.uid || null,
    }),
    [usuarioAuth, perfil, carregando],
  );

  return <AuthContexto.Provider value={valor}>{children}</AuthContexto.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const ctx = useContext(AuthContexto);
  if (!ctx) throw new Error("useAuth deve ser usado dentro de ProvedorAuth");
  return ctx;
}
