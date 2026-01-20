import { Navigate } from "react-router-dom";
import { useAuth } from "../../contextos/AuthContexto";
import CarregandoTela from "../../componentes/ui/CarregandoTela";

export default function RotaAdmin({ children }) {
    const { carregando, estaLogado, eAdmin } = useAuth();

    if (carregando) return <CarregandoTela />;

    if (!estaLogado) return <Navigate to="/login" replace />;
    if (!eAdmin) return <Navigate to="/app" replace />;

    return children;
}
