import { Routes, Route, Navigate } from "react-router-dom";
import LayoutPublico from "../layouts/LayoutPublico";
import LayoutApp from "../layouts/LayoutApp";

import EscolhaDeEntrada from "../paginas/auth/EscolhaDeEntrada";
import LoginAdmin from "../paginas/auth/LoginAdmin";
import RecuperarSenha from "../paginas/auth/RecuperarSenha"; // Nova pagina

import NovoChamado from "../paginas/usuario/NovoChamado";
import BuscarChamado from "../paginas/usuario/BuscarChamado";
import DetalhesDoChamado from "../paginas/usuario/DetalhesDoChamado";

import AreaAdmin from "../paginas/admin/AreaAdmin";
import NotificacoesAdmin from "../paginas/admin/NotificacoesAdmin";
import PerfilAdmin from "../paginas/admin/PerfilAdmin";

// Protecao simples
import RotaProtegida from "./RotaProtegida";
import { useAuth } from "../../contextos/AuthContexto";

// Componente interno para redirecionar Home
function InicioApp() {
  const { eVisitante, eAdmin } = useAuth();

  if (eAdmin) {
    // Admin: Redireciona para a rota explicita do Dashboard
    return <Navigate to="admin" replace />;
  }

  // Visitante OU Usuario Comum: Vai direto pra Novo Chamado (fluxo rapido)
  // Futuramente podemos criar um Dashboard para Usuario Comum
  return <Navigate to="chamados/novo" replace />;
}

export default function Rotas() {
  return (
    <Routes>
      <Route element={<LayoutPublico />}>
        <Route path="/" element={<EscolhaDeEntrada />} />
        <Route path="/login-admin" element={<LoginAdmin />} />
        <Route path="/recuperar-senha" element={<RecuperarSenha />} />
      </Route>

      <Route
        path="/app"
        element={
          <RotaProtegida>
            <LayoutApp />
          </RotaProtegida>
        }
      >
        {/* 
                  Rota INDEX (/app):
                  - Se Admin: Renderiza AreaAdmin (Dashboard) e ABA Dashboard fica ativa.
                  - Se Visitante: Redireciona para NovoChamado e ABA NovoChamado fica ativa.
                  Isso resolve o "melhore isso" onde o usuario clicava Home e nada acontecia ou ia pra outro lugar confuso.
                */}
        <Route index element={<InicioApp />} />

        <Route path="buscar" element={<BuscarChamado />} />
        <Route path="chamados/novo" element={<NovoChamado />} />
        <Route path="chamados/:id" element={<DetalhesDoChamado />} />

        {/* Rotas Admin */}
        <Route path="admin" element={<AreaAdmin />} />
        <Route path="notificacoes" element={<NotificacoesAdmin />} />
        <Route path="perfil" element={<PerfilAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
