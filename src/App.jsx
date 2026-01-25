import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GlobalStyle } from "./estilos/GlobalStyle";
import { ProvedorAuth } from "./contextos/AuthContexto";
import { ProvedorTema, usarTema } from "./contextos/TemaContexto";
import { ProvedorNotificacoes } from "./contextos/NotificacoesContexto";
import { ProvedorCarregando } from "./contextos/CarregandoContexto";
import Rotas from "./app/rotas/Rotas";
import { UsePushForeground } from "./componentes/UsePushForeground";

function AppConteudo() {
  const { temaAtual } = usarTema();

  if ("serviceWorker" in navigator) {
    window.addEventListener("load", async () => {
      try {
        const reg = await navigator.serviceWorker.register("./public/firebase/firebase-messaging-sw.js");
        console.log("[SW] Registrado:", reg.scope);
      } catch (e) {
        console.error("[SW] Falha ao registrar:", e);
      }
    });
  }


  return (
    <ThemeProvider theme={temaAtual}>
      <UsePushForeground />
      <GlobalStyle />
      <ToastContainer
        autoClose={3000}
        theme={temaAtual.nome === "claro" ? "light" : "dark"}
      />
      <BrowserRouter>
        <ProvedorAuth>
          <ProvedorNotificacoes>
            <ProvedorCarregando>
              <Rotas />
            </ProvedorCarregando>
          </ProvedorNotificacoes>
        </ProvedorAuth>
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ProvedorTema>
      <AppConteudo />
    </ProvedorTema>
  );
}

export default App;
