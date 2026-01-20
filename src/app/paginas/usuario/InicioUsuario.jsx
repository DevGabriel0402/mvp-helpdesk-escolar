import { Link } from "react-router-dom";
import styled from "styled-components";
import { Botao } from "../../../componentes/ui/Botao";
import { FaPlus, FaSearch } from "react-icons/fa";

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  padding: 24px;
  width: 100%;
`;

const Titulo = styled.h2`
  margin: 0 0 8px 0;
  font-size: 1.25rem;
  font-weight: 600;
`;

const Descricao = styled.p`
  margin: 0;
  font-size: 0.9rem;
  color: ${({ theme }) => theme.cores.textoFraco};
  line-height: 1.5;
`;

const Linha = styled.div`
  display: flex;
  gap: 12px;
  flex-wrap: wrap;
  margin-top: 20px;
`;

const BotaoAcao = styled(Botao)`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export default function InicioUsuario() {
  return (
    <Caixa>
      <Titulo>Painel do Visitante</Titulo>
      <Descricao>
        Abra um novo chamado ou busque pelo número para acompanhar o status e atualizações.
      </Descricao>

      <Linha>
        <Link to="/app/chamados/novo" style={{ textDecoration: 'none' }}>
          <BotaoAcao>
            <FaPlus /> Abrir Chamado
          </BotaoAcao>
        </Link>
        <Link to="/app/buscar" style={{ textDecoration: 'none' }}>
          <BotaoAcao>
            <FaSearch /> Buscar por Número
          </BotaoAcao>
        </Link>
      </Linha>
    </Caixa>
  );
}
