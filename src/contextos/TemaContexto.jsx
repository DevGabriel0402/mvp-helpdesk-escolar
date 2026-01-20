import { createContext, useContext, useEffect, useState } from "react";
import { temas } from "../estilos/tema";

const TemaContexto = createContext({});

export function ProvedorTema({ children }) {
  const [modo, setModo] = useState(() => {
    return localStorage.getItem("tema_preferido") || "escuro";
  });

  useEffect(() => {
    localStorage.setItem("tema_preferido", modo);
  }, [modo]);

  // Atualizar meta theme-color dinamicamente
  useEffect(() => {
    const themeColor = temas[modo]?.cores?.fundo || "#0a0b0e";
    let metaTag = document.querySelector('meta[name="theme-color"]');
    if (metaTag) {
      metaTag.setAttribute("content", themeColor);
    } else {
      metaTag = document.createElement("meta");
      metaTag.name = "theme-color";
      metaTag.content = themeColor;
      document.head.appendChild(metaTag);
    }
  }, [modo]);

  function alternarTema() {
    setModo((atual) => (atual === "escuro" ? "claro" : "escuro"));
  }

  const temaAtual = temas[modo];

  return (
    <TemaContexto.Provider value={{ modo, alternarTema, temaAtual }}>
      {children}
    </TemaContexto.Provider>
  );
}

export function usarTema() {
  return useContext(TemaContexto);
}
