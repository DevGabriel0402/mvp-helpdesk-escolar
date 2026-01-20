import { useEffect, useState } from "react";
import styled from "styled-components";
import TabelaChamados from "../../../componentes/admin/TabelaChamados";
import ErrorBoundary from "../../../componentes/ui/ErrorBoundary";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { usarAuth } from "../../../contextos/AuthContexto";
import { CarregandoTela } from "../../../componentes/ui/CarregandoTela";

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

  h2 {
    margin: 0;
  }
`;

export default function DashboardAdmin() {
  const { perfil, eAdmin } = usarAuth();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (!perfil?.escolaId) return;

    // Escutar chamados da escola
    const unsub = ouvirChamadosDaEscola(perfil.escolaId, (dados) => {
      setChamados(dados);
      setCarregando(false);
    });

    return () => unsub();
  }, [perfil?.escolaId]);

  if (carregando) return <CarregandoTela />;

  return (
    <Container>
      <Header>
        <h2>Lista de Chamados</h2>
        {/* Futuros filtros ou botoes aqui */}
      </Header>

      {/* Lista de Chamados (Tabela) com Protecao de Erro */}
      <ErrorBoundary>
        <TabelaChamados chamados={chamados} />
      </ErrorBoundary>
    </Container>
  );
}
