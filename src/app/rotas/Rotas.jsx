import { Routes, Route, Navigate } from "react-router-dom";
import LayoutPublico from "../layouts/LayoutPublico";
import LayoutApp from "../layouts/LayoutApp";

import EscolhaDeEntrada from "../paginas/auth/EscolhaDeEntrada";
import LoginAdmin from "../paginas/auth/LoginAdmin";
import RecuperarSenha from "../paginas/auth/RecuperarSenha"; // Nova pagina

import NovoChamado from "../paginas/usuario/NovoChamado";
import BuscarChamado from "../paginas/usuario/BuscarChamado";
import DetalhesDoChamado from "../paginas/usuario/DetalhesDoChamado";

import AreaAdmin from "../paginas/admin/AreaAdmin"; // Antiga "AreaAdmin" agora é "Chamados"
import DashboardAdmin from "../paginas/admin/DashboardAdmin"; // NOVO
import NotificacoesAdmin from "../paginas/admin/NotificacoesAdmin";
import PerfilAdmin from "../paginas/admin/PerfilAdmin";

// Protecao simples
import RotaProtegida from "./RotaProtegida";
import { useAuth } from "../../contextos/AuthContexto";

// Componente interno para redirecionar Home
function InicioApp() {
  const { eVisitante, eAdmin } = useAuth();

  if (eAdmin) {
    // Admin: Redireciona para o Dashboard novo
    return <Navigate to="dashboard" replace />;
  }

  // Visitante OU Usuario Comum: Vai direto pra Novo Chamado (fluxo rapido)
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
        <Route index element={<InicioApp />} />

        {/* Rotas Comuns */}
        <Route path="buscar" element={<BuscarChamado />} />
        <Route path="chamados/novo" element={<NovoChamado />} />
        <Route path="chamados/:id" element={<DetalhesDoChamado />} />

        {/* Rotas Admin */}
        <Route path="dashboard" element={<DashboardAdmin />} />
        <Route path="admin" element={<AreaAdmin />} />
        <Route path="notificacoes" element={<NotificacoesAdmin />} />
        <Route path="perfil" element={<PerfilAdmin />} />
      </Route>

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}
