import { BrowserRouter } from "react-router-dom";
import { ThemeProvider } from "styled-components";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { GlobalStyle } from "./estilos/GlobalStyle";
import { ProvedorAuth } from "./contextos/AuthContexto";
import { ProvedorTema, usarTema } from "./contextos/TemaContexto";
import { ProvedorConfiguracoes } from "./contextos/ConfiguracoesContexto";
import { ProvedorNotificacoes } from "./contextos/NotificacoesContexto";
import Rotas from "./app/rotas/Rotas";

function AppConteudo() {
  const { temaAtual } = usarTema();

  return (
    <ThemeProvider theme={temaAtual}>
      <GlobalStyle />
      <ToastContainer autoClose={3000} theme={temaAtual.nome === "claro" ? "light" : "dark"} />
      <BrowserRouter>
        <Rotas />
      </BrowserRouter>
    </ThemeProvider>
  );
}

function App() {
  return (
    <ProvedorAuth>
      <ProvedorConfiguracoes>
        <ProvedorNotificacoes>
          <ProvedorTema>
            <AppConteudo />
          </ProvedorTema>
        </ProvedorNotificacoes>
      </ProvedorConfiguracoes>
    </ProvedorAuth>
  );
}

export default App;
