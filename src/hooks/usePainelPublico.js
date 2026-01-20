import { useEffect, useState } from "react";
import {
  buscarPainelPublico,
  carregarPainelLocal,
  salvarPainelLocal,
} from "../servicos/firebase/painelServico";

export function usePainelPublico(escolaId = "escola_padrao") {
  const [painel, setPainel] = useState({
    nomePainel: "Helpdesk",
    logo: { url256: "" },
  });

  useEffect(() => {
    async function carregar() {
      const local = carregarPainelLocal(escolaId);
      if (local?.nomePainel || local?.logo) {
        setPainel({
          nomePainel: local?.nomePainel || "Helpdesk",
          logo: local?.logo || { url256: "" },
        });
      }

      const remoto = await buscarPainelPublico(escolaId);
      if (remoto?.nomePainel || remoto?.logo) {
        const novo = {
          nomePainel: remoto?.nomePainel || "Helpdesk",
          logo: remoto?.logo || { url256: "" },
        };
        setPainel(novo);
        salvarPainelLocal(escolaId, novo);
      }
    }

    carregar();
  }, [escolaId]);

  return painel;
}
