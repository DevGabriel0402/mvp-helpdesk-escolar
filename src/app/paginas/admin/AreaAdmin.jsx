import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { usarAuth } from "../../../contextos/AuthContexto";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import TabelaChamados from "../../../componentes/admin/TabelaChamados";
import Skeleton, { SkeletonRow } from "../../../componentes/ui/Skeleton";
import { FaTicketAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";
import { usarConfiguracoes } from "../../../contextos/ConfiguracoesContexto";

const BarraFiltros = styled.div`
  display: flex;
  gap: 8px;
  background: ${({ theme }) => theme.cores.vidro};
  padding: 6px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  width: fit-content;
`;

const BotaoFiltro = styled.button`
  padding: 8px 16px;
  border-radius: 8px;
  border: none;
  background: ${({ $ativo, theme }) => $ativo ? theme.cores.destaque : 'transparent'};
  color: ${({ $ativo, theme }) => $ativo ? 'white' : theme.cores.textoFraco};
  font-size: 0.85rem;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ $ativo, theme }) => $ativo ? theme.cores.destaque : theme.cores.brancoTransparente};
    color: ${({ $ativo, theme }) => $ativo ? 'white' : theme.cores.texto};
  }
`;

export default function AreaAdmin() {
    const { perfil, eAdmin } = usarAuth();
    const { configUI } = usarConfiguracoes();
    const [chamados, setChamados] = useState(null);
    const [filtro, setFiltro] = useState("todos"); // todos, pendentes, concluidos

    // Lista de IDs que consideramos "concluidos"
    const idsConcluidos = ["resolvido", "prodabel", "fechado"];

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
            abertos: chamados.filter(c => !idsConcluidos.includes(c.status)).length,
            resolvidos: chamados.filter(c => idsConcluidos.includes(c.status)).length,
        };
    }, [chamados]);

    const chamadosFiltrados = useMemo(() => {
        if (!chamados) return [];
        if (filtro === "pendentes") {
            return chamados.filter(c => !idsConcluidos.includes(c.status));
        }
        if (filtro === "concluidos") {
            return chamados.filter(c => idsConcluidos.includes(c.status));
        }
        return chamados;
    }, [chamados, filtro]);

    if (!eAdmin) {
        return <p>Acesso negado.</p>;
    }

    return (
        <Container>
            <Header>
                <div>
                    <h2 style={{ margin: 0 }}>Dashboard</h2>
                    <p style={{ margin: "4px 0 0 0", opacity: 0.6 }}>
                        Bem-vindo, {perfil?.nome?.split(' ')[0]}.
                    </p>
                </div>

                {!carregando && (
                    <BarraFiltros>
                        <BotaoFiltro
                            $ativo={filtro === "todos"}
                            onClick={() => setFiltro("todos")}
                        >
                            Todos ({stats.total})
                        </BotaoFiltro>
                        <BotaoFiltro
                            $ativo={filtro === "pendentes"}
                            onClick={() => setFiltro("pendentes")}
                        >
                            Pendentes ({stats.abertos})
                        </BotaoFiltro>
                        <BotaoFiltro
                            $ativo={filtro === "concluidos"}
                            onClick={() => setFiltro("concluidos")}
                        >
                            Concluídos ({stats.resolvidos})
                        </BotaoFiltro>
                    </BarraFiltros>
                )}
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

                        <StatCard onClick={() => setFiltro("pendentes")} style={{ cursor: 'pointer' }}>
                            <StatIcon $bg="rgba(255, 200, 50, 0.15)" $color="#ffc832">
                                <FaExclamationCircle />
                            </StatIcon>
                            <StatInfo>
                                <StatValue>{stats.abertos}</StatValue>
                                <StatLabel>Pendentes</StatLabel>
                            </StatInfo>
                        </StatCard>

                        <StatCard onClick={() => setFiltro("concluidos")} style={{ cursor: 'pointer' }}>
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

            <Cartao style={{ padding: 0, overflow: 'hidden' }}>
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
