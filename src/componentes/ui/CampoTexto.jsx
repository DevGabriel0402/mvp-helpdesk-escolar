import styled from "styled-components";

export const CampoTexto = styled.input`
  width: 100%;
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.raios.botao};

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};

  outline: none;

  &::placeholder {
    color: ${({ theme }) => theme.cores.textoFraco};
  }

  &:focus {
    /* Manter borda da mesma cor */
    box-shadow: 0 0 0 3px rgba(255,255,255,0.10);
  }
`;
