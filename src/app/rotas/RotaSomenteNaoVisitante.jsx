import { Navigate } from "react-router-dom";
import { usarAuth } from "../../contextos/AuthContexto";

export default function RotaSomenteNaoVisitante({ children }) {
    const { eVisitante, carregando } = usarAuth();

    if (carregando) return null;

    // Se for visitante, redireciona para a busca (onde ele pode ver algo util)
    if (eVisitante) {
        return <Navigate to="/app/buscar" replace />;
    }

    return children;
}
