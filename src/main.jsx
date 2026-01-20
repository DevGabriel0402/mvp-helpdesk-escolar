import React from "react";
import ReactDOM from "react-dom/client";
import App from "./App";
import { registerSW } from "virtual:pwa-register";
import { aplicarManifestSalvo } from "./utils/aplicarIconesPWA";
import { iniciarMonitoramentoFavicon } from "./utils/faviconStatus";

// Aplica manifest/favicon salvo imediatamente (antes do Firebase carregar)
aplicarManifestSalvo();

// Inicia monitoramento de status online/offline no favicon
iniciarMonitoramentoFavicon();

// Registrar Service Worker para PWA
registerSW({ immediate: true });

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
