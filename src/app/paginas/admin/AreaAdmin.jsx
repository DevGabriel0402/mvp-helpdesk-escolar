import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import { usarAuth } from "../../../contextos/AuthContexto";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { Cartao } from "../../../componentes/ui/Cartao";
import TabelaChamados from "../../../componentes/admin/TabelaChamados";
import Skeleton, { SkeletonRow } from "../../../componentes/ui/Skeleton";
import { FaTicketAlt, FaCheckCircle, FaExclamationCircle } from "react-icons/fa";

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

export default function AreaAdmin() {
    const { perfil, eAdmin } = usarAuth();
    const [chamados, setChamados] = useState(null); // null = loading, [] = vazio

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
            abertos: chamados.filter(c => c.status === "aberto" || c.status === "andamento").length,
            resolvidos: chamados.filter(c => c.status === "resolvido" || c.status === "prodabel").length,
        };
    }, [chamados]);

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

            <Cartao style={{ padding: 0, overflow: 'hidden' }}>
                {carregando ? (
                    <div style={{ padding: 16 }}>
                        <Skeleton variant="row" count={5} />
                    </div>
                ) : (
                    <TabelaChamados chamados={chamados} />
                )}
            </Cartao>
        </Container>
    );
}
