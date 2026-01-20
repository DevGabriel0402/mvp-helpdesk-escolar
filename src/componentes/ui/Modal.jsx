import styled from "styled-components";

const Fundo = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.55);
  display: grid;
  place-items: center;
  padding: 18px;
  z-index: 999;
  overflow-y: auto;
`;

const Caixa = styled.div`
  width: min(520px, 100%);
  max-height: calc(100vh - 36px);
  border-radius: 18px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) =>
    theme.cores.menuFundo}; /* Using theme color for background */
  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
  padding: 16px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
`;

const Topo = styled.div`
  display: flex;
  align-items: start;
  justify-content: space-between;
  gap: 12px;
  flex-shrink: 0;
`;

const Conteudo = styled.div`
  margin-top: 12px;
  overflow-y: auto;
  flex: 1;
  min-height: 0;

  /* Scrollbar estilizada */
  &::-webkit-scrollbar {
    width: 6px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(255, 255, 255, 0.2);
    border-radius: 3px;
  }
  &::-webkit-scrollbar-thumb:hover {
    background: rgba(255, 255, 255, 0.3);
  }
`;

const Titulo = styled.h3`
  margin: 0;
  color: ${({ theme }) => theme.cores.texto};
`;

const BotaoX = styled.button`
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(255, 255, 255, 0.06);
  color: ${({ theme }) => theme.cores.texto};
  width: 36px;
  height: 36px;
  border-radius: 12px;
  cursor: pointer;
  display: grid;
  place-items: center;

  &:hover {
    background: rgba(255, 255, 255, 0.1);
  }
`;

export default function Modal({ aberto, aoFechar, titulo, children }) {
  if (!aberto) return null;

  return (
    <Fundo onMouseDown={aoFechar}>
      <Caixa onMouseDown={(e) => e.stopPropagation()}>
        <Topo>
          <div>
            <Titulo>{titulo}</Titulo>
          </div>
          <BotaoX onClick={aoFechar} aria-label="Fechar">
            ✕
          </BotaoX>
        </Topo>

        <Conteudo>{children}</Conteudo>
      </Caixa>
    </Fundo>
  );
}
