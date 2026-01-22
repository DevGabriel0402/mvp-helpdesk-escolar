import { useEffect, useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import styled from "styled-components";
import { useAuth } from "../../../contextos/AuthContexto";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import TabelaChamados from "../../../componentes/admin/TabelaChamados";
import Skeleton, { SkeletonRow } from "../../../componentes/ui/Skeleton";
import SelectPersonalizado from "../../../componentes/ui/SelectPersonalizado";
import { FaTicketAlt, FaCheckCircle, FaExclamationCircle, FaPlusCircle } from "react-icons/fa";
import DatePickerPersonalizado from "../../../componentes/ui/DatePickerPersonalizado";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 16px;
`;

const StatsGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 16px;
`;

const StatCard = styled(Cartao)`
  padding: 20px;
  display: flex;
  align-items: center;
  gap: 16px;
`;

const StatIcon = styled.div`
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: ${({ $bg }) => $bg || "rgba(255,255,255,0.1)"};
  color: ${({ $color }) => $color || "white"};
  display: grid;
  place-items: center;
  font-size: 1.5rem;
`;

const StatInfo = styled.div`
  display: flex;
  flex-direction: column;
`;

const StatValue = styled.span`
  font-size: 1.5rem;
  font-weight: 800;
  line-height: 1.1;
`;

const StatLabel = styled.span`
  font-size: 0.85rem;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const FiltroWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;

  @media (max-width: 600px) {
    flex-direction: column;
    width: 100%;
    align-items: stretch;
  }
`;

const InputDataWrapper = styled.div`
  width: 160px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const SelectWrapper = styled.div`
  width: 160px;
  @media (max-width: 600px) {
    width: 100%;
  }
`;

const ListaHeader = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  flex-wrap: wrap;
  gap: 12px;
  margin-bottom: 16px;
`;

const OPCOES_FILTRO = [
  { value: "todos", label: "Todos" },
  { value: "pendentes", label: "Pendentes" },
  { value: "concluido", label: "Concluídos" },
];

export default function AreaAdmin() {
  const { perfil, eAdmin } = useAuth();
  const navegar = useNavigate();
  const [chamados, setChamados] = useState(null); // null = loading, [] = vazio
  const [filtro, setFiltro] = useState("todos");

  const [filtroData, setFiltroData] = useState(() => {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    return `${y}-${m}-${day}`;
  });

  useEffect(() => {
    if (!perfil?.escolaId) return;

    const unsubscribe = ouvirChamadosDaEscola(perfil.escolaId, (lista) => {
      setChamados(lista);
    });

    return () => unsubscribe();
  }, [perfil?.escolaId]);

  const carregando = chamados === null;

  const stats = useMemo(() => {
    if (!chamados) return { total: 0, abertos: 0, resolvidos: 0 };
    return {
      total: chamados.length,
      abertos: chamados.filter((c) => c.status === "aberto" || c.status === "andamento")
        .length,
      resolvidos: chamados.filter(
        (c) => c.status === "resolvido" || c.status === "prodabel",
      ).length,
    };
  }, [chamados]);

  const chamadosFiltrados = useMemo(() => {
    let lista = chamados || [];

    // Filtro por Status
    if (filtro === "pendentes") {
      lista = lista.filter((c) =>
        ["aberto", "andamento", "prodabel"].includes(c.status),
      );
    } else if (filtro === "concluido") {
      lista = lista.filter((c) => c.status === "resolvido");
    }

    // Filtro por Data
    if (filtroData) {
      lista = lista.filter((c) => {
        if (!c.criadoEm?.toDate) return false;
        const dataDoc = c.criadoEm.toDate();
        const dataFiltro = new Date(filtroData + "T00:00:00");

        return (
          dataDoc.getDate() === dataFiltro.getDate() &&
          dataDoc.getMonth() === dataFiltro.getMonth() &&
          dataDoc.getFullYear() === dataFiltro.getFullYear()
        );
      });
    }

    return lista;
  }, [chamados, filtro, filtroData]);

  if (!eAdmin) {
    return <p>Acesso negado.</p>;
  }

  return (
    <Container>
      <Header>
        <div>
          <h2 style={{ margin: 0 }}>Chamados</h2>
          <p style={{ margin: "4px 0 0 0", opacity: 0.6 }}>
            Bem-vindo, {perfil?.nome?.split(" ")[0]}.
          </p>
        </div>

        <button
          onClick={() => navegar("/app/chamados/novo")}
          style={{
            display: "flex",
            alignItems: "center",
            gap: 8,
            padding: "10px 18px",
            borderRadius: 12,
            border: "1px solid rgba(128, 128, 128, 0.2)",
            background: "transparent",
            color: "inherit",
            fontWeight: 600,
            cursor: "pointer",
            transition: "all 0.2s",
            marginRight: window.innerWidth >= 768 ? "60px" : "0",
          }}
          onMouseOver={(e) => {
            e.currentTarget.style.background = "rgba(128, 128, 128, 0.1)";
            e.currentTarget.style.transform = "translateY(-2px)";
          }}
          onMouseOut={(e) => {
            e.currentTarget.style.background = "transparent";
            e.currentTarget.style.transform = "translateY(0)";
          }}
        >
          <FaPlusCircle /> Novo Chamado
        </button>
      </Header>

      <StatsGrid>
        {carregando ? (
          <>
            <Skeleton variant="stat" />
            <Skeleton variant="stat" />
            <Skeleton variant="stat" />
          </>
        ) : (
          <>
            <StatCard>
              <StatIcon $bg="rgba(50, 200, 255, 0.15)" $color="#32c8ff">
                <FaTicketAlt />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.total}</StatValue>
                <StatLabel>Total de Chamados</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard>
              <StatIcon $bg="rgba(255, 200, 50, 0.15)" $color="#ffc832">
                <FaExclamationCircle />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.abertos}</StatValue>
                <StatLabel>Pendentes</StatLabel>
              </StatInfo>
            </StatCard>

            <StatCard>
              <StatIcon $bg="rgba(50, 255, 100, 0.15)" $color="#32ff64">
                <FaCheckCircle />
              </StatIcon>
              <StatInfo>
                <StatValue>{stats.resolvidos}</StatValue>
                <StatLabel>Resolvidos</StatLabel>
              </StatInfo>
            </StatCard>
          </>
        )}
      </StatsGrid>

      <Cartao style={{ padding: 0, overflow: "visible" }}>
        <div style={{ padding: "16px 16px 0 16px" }}>
          <ListaHeader>
            <h3 style={{ margin: 0 }}>Lista de Chamados</h3>
            <FiltroWrapper>
              <InputDataWrapper>
                <DatePickerPersonalizado
                  valor={filtroData}
                  onChange={setFiltroData}
                  placeholder="Filtrar por data"
                />
              </InputDataWrapper>
              <SelectWrapper>
                <SelectPersonalizado
                  valor={filtro}
                  onChange={setFiltro}
                  opcoes={OPCOES_FILTRO}
                  placeholder="Status..."
                />
              </SelectWrapper>
            </FiltroWrapper>
          </ListaHeader>
        </div>
        {carregando ? (
          <div style={{ padding: 16 }}>
            <Skeleton variant="row" count={5} />
          </div>
        ) : (
          <TabelaChamados chamados={chamadosFiltrados} />
        )}
      </Cartao>
    </Container>
  );
}
