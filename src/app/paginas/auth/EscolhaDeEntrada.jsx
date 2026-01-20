import styled from "styled-components";
import { Botao } from "../../../componentes/ui/Botao";
import { useNavigate } from "react-router-dom";
import { entrarComoVisitante } from "../../../servicos/firebase/authServico";
import { toast } from "react-toastify";
import { FaUserShield, FaTicketAlt } from "react-icons/fa";
import { usePainelPublico } from "../../../hooks/usePainelPublico";

const Caixa = styled.div`
  background: ${({ theme }) => theme.cores.fundo2};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 8px;
  width: min(360px, 100%);
  padding: 32px;
  text-align: center;
  box-shadow: ${({ theme }) => theme.sombras.suave};
`;

const LogoImg = styled.img`
  width: 80px;
  height: 80px;
  object-fit: contain;
  border-radius: 12px;
  margin-bottom: 12px;
`;

const Texto = styled.p`
  margin: 6px 0 24px 0;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

const Coluna = styled.div`
  display: grid;
  gap: 12px;
`;

// Helper for button content alignment
const BtnContent = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  font-weight: 600;
`;

export default function EscolhaDeEntrada() {
  const navegar = useNavigate();
  const { painel } = usePainelPublico();

  async function iniciarComoVisitante() {
    try {
      await entrarComoVisitante();
      toast.success("Voce entrou como visitante.");
      navegar("/app/chamados/novo");
    } catch (e) {
      console.error(e);
      toast.error("Nao foi possivel entrar como visitante.");
    }
  }

  return (
    <Caixa>
      {painel?.logoUrl && <LogoImg src={painel.logoUrl} alt="Logo" />}
      <h1 style={{ margin: "0 0 4px 0" }}>{painel?.nomePainel || "Helpdesk"}</h1>
      <Texto>Bem-vindo! Escolha como deseja acessar.</Texto>

      <Coluna>
        <Botao $larguraTotal onClick={() => navegar("/login-admin")}>
          <BtnContent>
            <FaUserShield size={18} />
            Entrar como Administrador
          </BtnContent>
        </Botao>

        <Botao
          $larguraTotal
          onClick={iniciarComoVisitante}
          style={{
            background: "rgba(255,255,255,0.1)",
            border: "1px solid rgba(255,255,255,0.1)",
          }}
        >
          <BtnContent>
            <FaTicketAlt size={18} />
            Abrir chamado como Visitante
          </BtnContent>
        </Botao>
      </Coluna>

      <Texto style={{ marginTop: 20, fontSize: "0.85rem" }}>
        Visitantes podem abrir chamados instantaneamente sem senha.
      </Texto>
    </Caixa>
  );
}
