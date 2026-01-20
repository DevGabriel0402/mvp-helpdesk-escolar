export function criarTema(configUI) {
    const c = configUI?.cores || {};
    const p = configUI?.preferencias || {};

    const modo = p.modo || "escuro";
    const ehEscuro = modo === "escuro";

    // Valores calculados baseados nas preferencias
    const raioBase = Number(p.raio ?? 18);
    const blurBase = Number(p.blur ?? 16);

    return {
        nome: modo,
        cores: {
            // Cores configuraveis
            texto: c.texto || (ehEscuro ? "#f5f5f5" : "#1f2937"),
            fundo: c.fundo || (ehEscuro ? "#0a0b0e" : "#f5f6f8"),
            fundo2: c.fundo || (ehEscuro ? "#12141a" : "#ffffff"), // Fallback to fundo if not distinct

            vidro: c.vidro || (ehEscuro ? "rgba(255,255,255,0.04)" : "rgba(255,255,255,0.8)"),
            vidroForte: ehEscuro ? "rgba(255,255,255,0.08)" : "rgba(255,255,255,0.95)",

            borda: c.borda || (ehEscuro ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.08)"),
            icone: c.icone || (ehEscuro ? "#ffffff" : "#1f2937"),

            badgeFundo: c.badgeFundo || "rgba(255, 60, 60, 0.95)",
            badgeTexto: c.badgeTexto || "#ffffff",

            botaoFundo: c.botaoFundo || "rgba(255,255,255,0.10)",
            botaoTexto: c.botaoTexto || "#ffffff",

            destaque: c.destaque || (ehEscuro ? "rgba(255,255,255,0.06)" : "#1f2937"),

            // Fallbacks e cores fixas do sistema
            textoFraco: ehEscuro ? "rgba(245,245,245,0.6)" : "#6b7280",
            cartao: ehEscuro ? "#1a1a1a" : "#ffffff",
            vermelho: "#ff4d4d",

            pretoTransparente: ehEscuro ? "rgba(0,0,0,0.25)" : "rgba(255,255,255,0.5)",
            brancoTransparente: ehEscuro ? "rgba(255,255,255,0.06)" : "rgba(0,0,0,0.03)",
            menuFundo: ehEscuro ? "rgba(5, 5, 10, 0.9)" : "rgba(255, 255, 255, 0.9)",

            ...c // Sobrescreve tudo se vier da config explicita
        },
        ui: {
            raio: raioBase,
            blur: blurBase,
            modo: modo,
        },
        // Compatibilidade com tema antigo
        raios: {
            card: "6px",
            botao: "6px",
            icone: "4px",
            padrao: `${raioBase}px`
        },
        sombras: {
            suave: ehEscuro ? "0 4px 16px rgba(0,0,0,0.4)" : "0 2px 8px rgba(0,0,0,0.04)",
        },
        logo: configUI?.logo || {},
    };
}
