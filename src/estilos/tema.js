const temaEscuro = {
    nome: "escuro",
    cores: {
        fundo: "#17191D",
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
    },
    raios: {
        card: "6px",
        botao: "6px",
        icone: "4px",
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
        destaque: "#1f2937", // Dark grey for high contrast in light mode
    },
    raios: {
        card: "6px",
        botao: "6px",
        icone: "4px",
    },
    sombras: {
        suave: "0 2px 8px rgba(0,0,0,0.04)",
    },
};

export const temas = {
    escuro: temaEscuro,
    claro: temaClaro,
};

