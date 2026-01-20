import { Navigate } from "react-router-dom";
import { useAuth } from "../../contextos/AuthContexto";
import CarregandoTela from "../../componentes/ui/CarregandoTela";

export default function RotaProtegida({ children }) {
    const { carregando, estaLogado } = useAuth();

    if (carregando) return <CarregandoTela />;

    if (!estaLogado) return <Navigate to="/login" replace />;

    return children;
}
