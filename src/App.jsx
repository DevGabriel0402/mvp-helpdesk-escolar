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

function AppConteudo() {
  const { temaAtual } = usarTema();

  return (
    <ThemeProvider theme={temaAtual}>
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
