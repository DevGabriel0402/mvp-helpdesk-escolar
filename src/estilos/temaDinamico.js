const temaEscuro = {
  nome: "escuro",
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
  raios: {
    card: "6px",
    botao: "6px",
    icone: "4px",
    padrao: "6px",
  },
  sombras: {
    suave: "0 4px 16px rgba(0,0,0,0.4)",
  },
};

const temaClaro = {
  nome: "claro",
  cores: {
    fundo: "#f5f6f8",
    fundo2: "#ffffff",
    texto: "#1f2937",
    textoFraco: "#6b7280",
    vidro: "rgba(255,255,255,0.8)",
    vidroForte: "rgba(255,255,255,0.95)",
    borda: "rgba(0,0,0,0.08)",
    pretoTransparente: "rgba(255,255,255,0.5)",
    brancoTransparente: "rgba(0,0,0,0.03)",
    menuFundo: "rgba(255, 255, 255, 0.9)",
    destaque: "#1f2937",
    icone: "#1f2937",
    badgeFundo: "rgba(255, 60, 60, 0.95)",
    badgeTexto: "#ffffff",
    botaoFundo: "rgba(0,0,0,0.08)",
    botaoTexto: "#1f2937",
    cartao: "#ffffff",
    vermelho: "#ef4444",
  },
  raios: {
    card: "6px",
    botao: "6px",
    icone: "4px",
    padrao: "6px",
  },
  sombras: {
    suave: "0 2px 8px rgba(0,0,0,0.04)",
  },
};

export const temas = {
  escuro: temaEscuro,
  claro: temaClaro,
};

export function criarTema(configUI) {
  const p = configUI?.preferencias || {};
  const modo = p.modo || "escuro";
  const temaBase = modo === "escuro" ? temaEscuro : temaClaro;

  // Valores calculados baseados nas preferencias
  const raioBase = Number(p.raio ?? 6);
  const blurBase = Number(p.blur ?? 16);

  // Mesclar cores customizadas do configUI (Firestore) com o tema base
  const coresCustom = configUI?.cores || {};

  return {
    nome: modo,
    cores: {
      ...temaBase.cores,
      ...coresCustom,
    },
    ui: {
      raio: raioBase,
      blur: blurBase,
      modo: modo,
    },
    raios: {
      card: `${raioBase}px`,
      botao: `${raioBase}px`,
      icone: `${Math.max(2, raioBase - 2)}px`,
      padrao: `${raioBase}px`,
    },
    sombras: temaBase.sombras,
    logo: configUI?.logo || {},
  };
}
