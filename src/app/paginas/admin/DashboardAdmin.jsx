import { useEffect, useMemo, useState } from "react";
import styled from "styled-components";
import TabelaChamados from "../../../componentes/admin/TabelaChamados";
import ErrorBoundary from "../../../componentes/ui/ErrorBoundary";
import SelectPersonalizado from "../../../componentes/ui/SelectPersonalizado";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { useAuth } from "../../../contextos/AuthContexto";
import CarregandoTela from "../../../componentes/ui/CarregandoTela";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 20px;
  height: 100%;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;

  h2 {
    margin: 0;
  }
`;

const FiltroWrapper = styled.div`
  width: 200px;

  @media (max-width: 600px) {
    width: 100%;
  }
`;

const OPCOES_FILTRO = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes" },
  { value: "concluido", label: "Concluído" },
];

export default function DashboardAdmin() {
  const { perfil, eAdmin } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);
  const [filtro, setFiltro] = useState("todos");

  useEffect(() => {
    if (!perfil?.escolaId) return;

    // Escutar chamados da escola
    const unsub = ouvirChamadosDaEscola(perfil.escolaId, (dados) => {
      setChamados(dados);
      setCarregando(false);
    });

    return () => unsub();
  }, [perfil?.escolaId]);

  // Filtra chamados baseado na seleção
  const chamadosFiltrados = useMemo(() => {
    if (filtro === "todos") return chamados;

    if (filtro === "pendentes") {
      // Pendentes = aberto, andamento, prodabel
      return chamados.filter((c) =>
        ["aberto", "andamento", "prodabel"].includes(c.status),
      );
    }

    if (filtro === "concluido") {
      return chamados.filter((c) => c.status === "resolvido");
    }

    return chamados;
  }, [chamados, filtro]);

  if (carregando) return <CarregandoTela />;

  return (
    <Container>
      <Header>
        <h2>Lista de Chamados</h2>
        <FiltroWrapper>
          <SelectPersonalizado
            valor={filtro}
            onChange={setFiltro}
            opcoes={OPCOES_FILTRO}
            placeholder="Filtrar por..."
          />
        </FiltroWrapper>
      </Header>

      {/* Lista de Chamados (Tabela) com Protecao de Erro */}
      <ErrorBoundary>
        <TabelaChamados chamados={chamadosFiltrados} />
      </ErrorBoundary>
    </Container>
  );
}
