import { Navigate } from "react-router-dom";
import { useAuth } from "../../contextos/AuthContexto";

export default function RotaSomenteNaoVisitante({ children }) {
    const { eVisitante, carregando } = useAuth();

    if (carregando) return null;

    // Se for visitante, redireciona para a busca (onde ele pode ver algo util)
    if (eVisitante) {
        return <Navigate to="/app/buscar" replace />;
    }

    return children;
}
