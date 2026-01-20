import styled from "styled-components";
import { useNavigate } from "react-router-dom";
import { FaCheck, FaTrash } from "react-icons/fa";
import { useAuth } from "../../../contextos/AuthContexto";
import { useNotificacoesChamados } from "../../../hooks/useNotificacoesChamados";

const Container = styled.div`
  display: grid;
  gap: 12px;
`;

const Cartao = styled.div`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidro};
  backdrop-filter: blur(16px);
  border-radius: 18px;
  padding: 14px;
`;

const Titulo = styled.h2`
  margin: 0;
  font-size: 18px;
  color: ${({ theme }) => theme.cores.texto};
`;

const Acoes = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 10px;
`;

const Botao = styled.button`
  height: 40px;
  padding: 0 12px;
  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(59, 130, 246, 0.1);
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;
  display: inline-flex;
  align-items: center;
  gap: 8px;
  font-weight: 500;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cores.destaque};
    border-color: ${({ theme }) => theme.cores.destaque};
    color: white;
    box-shadow: 0 4px 12px rgba(59, 130, 246, 0.2);
  }
`;

const Item = styled.button`
  text-align: left;
  width: 100%;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ $lida, theme }) =>
    $lida ? "transparent" : `rgba(59, 130, 246, 0.1)`};
  color: ${({ theme }) => theme.cores.texto};
  padding: 16px;
  cursor: pointer;
  transition: all 0.2s;

  &:hover {
    background: ${({ theme }) => theme.cores.vidroForte};
    border-color: ${({ theme }) => theme.cores.destaque};
  }
`;

const Linha1 = styled.div`
  font-weight: 900;
  display: flex;
  justify-content: space-between;
  gap: 10px;
  margin-bottom: 4px;
`;

const Linha2 = styled.div`
  opacity: 0.8;
  font-size: 0.9rem;
  line-height: 1.4;
`;

function formatarMs(ms) {
  if (!ms) return "";
  return new Date(ms).toLocaleString("pt-BR");
}

export default function NotificacoesAdmin() {
  const navigate = useNavigate();
  const { usuarioAuth, perfil, eAdmin } = useAuth();

  const escolaId = perfil?.escolaId;
  const { notificacoes, marcarTudoComoLido, limparTudo, marcarComoLida } =
    useNotificacoesChamados();

  if (!eAdmin) return <p>Acesso negado.</p>;

  return (
    <Container>
      <Cartao>
        <Titulo>Notificações</Titulo>
        <Acoes>
          <Botao onClick={marcarTudoComoLido}>
            <FaCheck /> Marcar tudo como lido
          </Botao>
          <Botao onClick={limparTudo}>
            <FaTrash /> Limpar
          </Botao>
        </Acoes>
      </Cartao>

      {notificacoes.length === 0 && (
        <Cartao style={{ textAlign: "center", opacity: 0.7, padding: 30 }}>
          Nenhuma notificação nova.
        </Cartao>
      )}

      {notificacoes.map((n) => (
        <Item
          key={n.id}
          $lida={n.lida}
          onClick={() => {
            marcarComoLida(n.chamadoId);
            navigate(`/app/chamados/${n.chamadoId}`);
          }}
        >
          <Linha1>
            <span style={{ color: n.lida ? "inherit" : "#3B82F6", fontWeight: 700 }}>
              {n.codigoChamado || "Novo chamado"}
            </span>
            <span style={{ opacity: 0.7, fontSize: 12, fontWeight: 400 }}>
              {formatarMs(n.criadoMs)}
            </span>
          </Linha1>
          <Linha2>
            <b style={{ fontWeight: 600 }}>{n.titulo}</b>
            {n.mensagem ? ` — ${n.mensagem}` : ""}
          </Linha2>
        </Item>
      ))}
    </Container>
  );
}
