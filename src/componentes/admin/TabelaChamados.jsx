import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaEye } from "react-icons/fa";

const ListaContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1px;
  background: ${({ theme }) => theme.cores.borda};
`;

const CardChamado = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  padding: 20px 24px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  transition: background 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cores.vidroForte};
  }

  @media (max-width: 768px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

const CardConteudo = styled.div`
  flex: 1;
  min-width: 0;
`;

const CardHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 8px;
`;

const CodigoChamado = styled.span`
  font-family: monospace;
  font-weight: 700;
  color: ${({ theme }) => theme.cores.textoFraco}; /* Mais escuro que o destaque (branco/azul) */
  font-size: 0.9rem;
  opacity: 0.8;
`;

const StatusBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${({ $status }) => {
    switch ($status) {
      case "aberto": return "rgba(50, 200, 255, 0.15)";
      case "andamento": return "rgba(255, 200, 50, 0.15)";
      case "prodabel": return "rgba(155, 89, 182, 0.15)"; // Purple
      case "resolvido": return "rgba(50, 255, 100, 0.15)";
      default: return "rgba(255, 255, 255, 0.1)";
    }
  }};

  color: ${({ $status }) => {
    switch ($status) {
      case "aberto": return "#32c8ff";
      case "andamento": return "#ffc832";
      case "prodabel": return "#9b59b6"; // Purple
      case "resolvido": return "#32ff64";
      default: return "#ccc";
    }
  }};
`;

const PrioridadeBadge = styled.span`
  display: inline-flex;
  align-items: center;
  padding: 4px 10px;
  border-radius: 4px;
  font-size: 0.7rem;
  font-weight: 600;
  text-transform: capitalize;
  
  background: ${({ $prio }) => {
    switch ($prio) {
      case "urgente": return "rgba(255, 77, 77, 0.15)"; // Vermelho
      case "alta": return "rgba(255, 153, 51, 0.15)"; // Laranja
      case "normal": return "rgba(50, 255, 100, 0.15)"; // Verde
      case "baixa": return "rgba(153, 153, 153, 0.15)"; // Cinza
      default: return "rgba(255, 255, 255, 0.1)";
    }
  }};

  color: ${({ $prio }) => {
    switch ($prio) {
      case "urgente": return "#ff4d4d";
      case "alta": return "#FF9933";
      case "normal": return "#32ff64";
      case "baixa": return "#999999";
      default: return "#ccc";
    }
  }};
`;

const Titulo = styled.h3`
  margin: 0 0 6px 0;
  font-size: 1rem;
  font-weight: 500;
  color: ${({ theme }) => theme.cores.texto};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;

  @media (max-width: 768px) {
    white-space: normal;
  }
`;

const Meta = styled.div`
  font-size: 0.8rem;
  color: ${({ theme }) => theme.cores.textoFraco};
  display: flex;
  align-items: center;
  gap: 8px;
`;

const BotaoDetalhes = styled.button`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 10px 16px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  font-size: 0.85rem;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s;
  white-space: nowrap;

  &:hover {
    background: ${({ theme }) => theme.cores.destaque};
    border-color: ${({ theme }) => theme.cores.destaque};
    color: white;
  }

  svg {
    font-size: 0.9rem;
  }
`;

const Vazio = styled.div`
  padding: 60px 20px;
  text-align: center;
  color: ${({ theme }) => theme.cores.textoFraco};
  background: ${({ theme }) => theme.cores.cartao};
`;

function formatarData(data) {
  if (!data?.toDate) return "-";
  return data.toDate().toLocaleDateString("pt-BR", { day: '2-digit', month: '2-digit', year: 'numeric' });
}

function traduzirStatus(status) {
  switch (status) {
    case "aberto": return "Recebido";
    case "andamento": return "Em Progresso";
    case "prodabel": return "Encaminhado para Prodabel";
    case "resolvido": return "Resolvido";
    default: return status;
  }
}

function traduzirPrioridade(prio) {
  switch (prio) {
    case "alta": return "Alta";
    case "media": return "Média";
    case "baixa": return "Baixa";
    default: return prio;
  }
}

export default function TabelaChamados({ chamados }) {
  const navegar = useNavigate();

  if (!chamados || chamados.length === 0) {
    return (
      <Vazio>
        Nenhum chamado encontrado.
      </Vazio>
    );
  }

  return (
    <ListaContainer>
      {chamados.map(c => (
        <CardChamado key={c.id}>
          <CardConteudo>
            <CardHeader>
              <CodigoChamado>{c.codigoChamado || `#${c.numeroChamado}`}</CodigoChamado>
              <StatusBadge $status={c.status}>{traduzirStatus(c.status)}</StatusBadge>
              <PrioridadeBadge $prio={c.prioridade}>{traduzirPrioridade(c.prioridade)}</PrioridadeBadge>
            </CardHeader>
            <Titulo>{c.titulo}</Titulo>
            <Meta>
              <span>{c.localDoProblema || "Local não definido"}</span>
              <span>•</span>
              <span>{formatarData(c.criadoEm)}</span>
            </Meta>
          </CardConteudo>

          <BotaoDetalhes onClick={() => navegar(`/app/chamados/${c.id}`)}>
            <FaEye /> Ver Detalhes
          </BotaoDetalhes>
        </CardChamado>
      ))}
    </ListaContainer>
  );
}
