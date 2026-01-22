import { useEffect, useState, useMemo } from "react";
import styled from "styled-components";
import {
  BarChart,
  Bar,
  Cell,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
} from "recharts";
import { ouvirChamadosDaEscola } from "../../../servicos/firebase/chamadosServico";
import { useAuth } from "../../../contextos/AuthContexto";
import { Cartao } from "../../../componentes/ui/Cartao";
import Skeleton from "../../../componentes/ui/Skeleton";

const Container = styled.div`
  display: flex;
  flex-direction: column;
  gap: 24px;
  animation: fadeIn 0.5s ease-out;

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }
`;

const Header = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
`;

const Titulo = styled.h1`
  font-size: 1.8rem;
  font-weight: 700;
  color: ${({ theme }) => theme.cores.texto};
`;

const GridCharts = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 24px;

  @media (min-width: 1024px) {
    grid-template-columns: repeat(3, 1fr);
    
    /* O primeiro item (Chamados por Dia) ocupa todas as colunas */
    & > *:first-child {
      grid-column: 1 / -1;
    }
  }
`;

const ChartCard = styled(Cartao)`
  padding: 24px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  min-height: 350px;
`;

const ChartTitle = styled.h2`
  font-size: 1.1rem;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.texto};
  margin-bottom: 8px;
`;

const CORES_STATUS = {
  aberto: "#3B82F6", // Azul
  andamento: "#EAB308", // Amarelo
  resolvido: "#22C55E", // Verde
  prodabel: "#8B5CF6", // Roxo
};

const CORES_SITUACAO = {
  pendente: "#F59E0B", // Laranja
  resolvido: "#10B981", // Emerald
};

const CORES_PRIORIDADE = {
  baixa: "#3B82F6", // Azul
  normal: "#10B981", // Verde
  alta: "#F97316", // Laranja Padronizado
  urgente: "#EF4444", // Vermelho
};

// --- Custom Shape for Bar Chart ---
const getPath = (x, y, width, height) => {
  return `M${x},${y + height}C${x + width / 3},${y + height} ${x + width / 2},${y + height / 3}
  ${x + width / 2}, ${y}
  C${x + width / 2},${y + height / 3} ${x + (2 * width) / 3},${y + height} ${x + width}, ${y + height}
  Z`;
};

const TriangleBar = (props) => {
  const { fill, x, y, width, height } = props;
  return <path d={getPath(x, y, width, height)} stroke="none" fill={fill} />;
};

// --- Custom Label for Pie Chart ---
const RADIAN = Math.PI / 180;
const renderCustomizedLabel = ({ cx, cy, midAngle, innerRadius, outerRadius, percent, index }) => {
  const radius = innerRadius + (outerRadius - innerRadius) * 0.5;
  const x = cx + radius * Math.cos(-midAngle * RADIAN);
  const y = cy + radius * Math.sin(-midAngle * RADIAN);

  return (
    <text x={x} y={y} fill="white" textAnchor={x > cx ? 'start' : 'end'} dominantBaseline="central">
      {`${(percent * 100).toFixed(0)}%`}
    </text>
  );
};

export default function DashboardAdmin() {
  const { perfil: usuario } = useAuth();
  const [chamados, setChamados] = useState([]);
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    if (usuario?.escolaId) {
      const unsubscribe = ouvirChamadosDaEscola(usuario.escolaId, (dados) => {
        setChamados(dados);
        setCarregando(false);
      });
      return () => unsubscribe();
    }
  }, [usuario?.escolaId]);

  // DATA: Por Dia
  const dadosPorDia = useMemo(() => {
    if (!chamados.length) return [];

    // Agrupar por dia (últimos 7 dias ou todos)
    const agrupado = {};

    chamados.forEach(c => {
      if (!c.criadoEm) return;
      const data = c.criadoEm.toDate ? c.criadoEm.toDate() : new Date(c.criadoEm);
      const chave = data.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' });

      if (!agrupado[chave]) agrupado[chave] = 0;
      agrupado[chave]++;
    });

    // Converter para array e ordenar
    return Object.entries(agrupado)
      .map(([name, value]) => ({ name, value }))
      .sort((a, b) => {
        const [diaA, mesA] = a.name.split('/');
        const [diaB, mesB] = b.name.split('/');
        return new Date(2024, mesA - 1, diaA) - new Date(2024, mesB - 1, diaB);
      })
      .slice(-7); // Pegar apenas os últimos 7 dias com dados
  }, [chamados]);

  // DATA: Por Status
  const dadosPorStatus = useMemo(() => {
    const counts = {
      aberto: 0,
      andamento: 0,
      prodabel: 0,
      resolvido: 0
    };

    chamados.forEach(c => {
      const s = c.status || 'aberto';
      if (counts[s] !== undefined) counts[s]++;
    });

    return [
      { name: "Aberto", value: counts.aberto, color: CORES_STATUS.aberto },
      { name: "Andamento", value: counts.andamento, color: CORES_STATUS.andamento },
      { name: "Prodabel", value: counts.prodabel, color: CORES_STATUS.prodabel },
      { name: "Resolvido", value: counts.resolvido, color: CORES_STATUS.resolvido },
    ].filter(d => d.value > 0);
  }, [chamados]);

  // DATA: Por Situação
  const dadosPorSituacao = useMemo(() => {
    let pendentes = 0;
    let resolvidos = 0;

    chamados.forEach(c => {
      if (c.status === 'resolvido') {
        resolvidos++;
      } else {
        pendentes++;
      }
    });

    return [
      { name: "Pendente", value: pendentes, color: CORES_SITUACAO.pendente },
      { name: "Resolvido", value: resolvidos, color: CORES_SITUACAO.resolvido },
    ];
  }, [chamados]);

  // DATA: Por Prioridade
  const dadosPorPrioridade = useMemo(() => {
    const counts = {
      baixa: 0,
      normal: 0,
      alta: 0,
      urgente: 0
    };

    chamados.forEach(c => {
      const p = c.prioridade || 'normal';
      if (counts[p] !== undefined) counts[p]++;
    });

    return [
      { name: "Baixa", value: counts.baixa, color: CORES_PRIORIDADE.baixa },
      { name: "Normal", value: counts.normal, color: CORES_PRIORIDADE.normal },
      { name: "Alta", value: counts.alta, color: CORES_PRIORIDADE.alta },
      { name: "Urgente", value: counts.urgente, color: CORES_PRIORIDADE.urgente },
    ].filter(d => d.value > 0);
  }, [chamados]);

  if (carregando) {
    return (
      <Container>
        <Header><Skeleton width="200px" height="40px" /></Header>
        <GridCharts>
          <Skeleton height="350px" />
          <Skeleton height="350px" />
          <Skeleton height="350px" />
          <Skeleton height="350px" />
        </GridCharts>
      </Container>
    );
  }

  return (
    <Container>
      <Header>
        <Titulo>Dashboard</Titulo>
      </Header>

      <GridCharts>
        {/* 1. Chamados dos ultimos sete dias - TinyLine Charts */}
        <ChartCard>
          <ChartTitle>Chamados por Dia (Últimos 7 dias)</ChartTitle>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={dadosPorDia} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <XAxis dataKey="name" hide />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Line type="monotone" dataKey="value" stroke="#8884d8" strokeWidth={2} dot={false} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 2. Chamados por Status - TinyBar Charts */}
        <ChartCard>
          <ChartTitle>Chamados por Status</ChartTitle>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorStatus}>
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8884d8">
                  {dadosPorStatus.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 3. Chamados por situação - Custom Shape Bar Chart */}
        <ChartCard>
          <ChartTitle>Situação (Pendente vs Resolvido)</ChartTitle>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={dadosPorSituacao} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#9CA3AF' }} />
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(255,255,255,0.1)" />
                <Tooltip
                  cursor={{ fill: 'transparent' }}
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
                <Bar dataKey="value" fill="#8884d8" shape={<TriangleBar />} label={{ position: 'top' }}>
                  {dadosPorSituacao.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>

        {/* 4. Chamados por Prioridade - Pie Chart With Customized Label */}
        <ChartCard>
          <ChartTitle>Chamados por Prioridade</ChartTitle>
          <div style={{ flex: 1, minHeight: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={dadosPorPrioridade}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={renderCustomizedLabel}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {dadosPorPrioridade.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Legend
                  layout="vertical"
                  verticalAlign="middle"
                  align="right"
                  formatter={(value) => <span style={{ color: '#9CA3AF', marginLeft: 5 }}>{value}</span>}
                />
                <Tooltip
                  contentStyle={{ backgroundColor: '#1f2937', borderRadius: '8px', border: 'none', color: '#fff' }}
                  itemStyle={{ color: '#fff' }}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </ChartCard>
      </GridCharts>
    </Container>
  );
}
