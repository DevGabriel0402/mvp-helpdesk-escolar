import { createGlobalStyle } from "styled-components";

export const GlobalStyle = createGlobalStyle`
  * { box-sizing: border-box; }
  html, body { height: 100%; }

  body {
    margin: 0;
    font-family: ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, Arial, "Noto Sans", "Helvetica Neue";
    color: ${({ theme }) => theme.cores.texto};

    /* fundo preto clean com profundidade sutil */
    background:
      radial-gradient(900px 600px at 20% 10%, rgba(255,255,255,0.06), transparent 55%),
      radial-gradient(700px 520px at 90% 20%, rgba(255,255,255,0.04), transparent 55%),
      linear-gradient(180deg, ${({ theme }) => theme.cores.fundo}, ${({ theme }) => theme.cores.fundo2});
  }

  a { color: inherit; text-decoration: none; }
  button { font-family: inherit; }

  ::selection {
    background: ${({ theme }) => theme.cores.primaria ? `${theme.cores.primaria}1A` : "rgba(59, 130, 246, 0.1)"};
    color: ${({ theme }) => theme.nome === "claro" ? "#000000" : "#ffffff"};
  }

  /* Toastify Customization */
  :root {
    --toastify-color-light: ${({ theme }) => theme.cores.fundo2};
    --toastify-color-dark: ${({ theme }) => theme.cores.fundo2};
    --toastify-text-color-light: ${({ theme }) => theme.cores.texto};
    --toastify-text-color-dark: ${({ theme }) => theme.cores.texto};
    --toastify-font-family: inherit;
  }

  .Toastify__toast {
    border-radius: 8px;
    border: 1px solid ${({ theme }) => theme.cores.borda};
    box-shadow: ${({ theme }) => theme.sombras.suave};
    background: ${({ theme }) => theme.cores.fundo2} !important;
    color: ${({ theme }) => theme.cores.texto} !important;
  }
  
  .Toastify__close-button {
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;
