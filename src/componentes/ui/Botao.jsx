import styled from "styled-components";

export const Botao = styled.button`
  width: ${({ $larguraTotal }) => ($larguraTotal ? "100%" : "auto")};
  padding: 12px 14px;
  border-radius: ${({ theme }) => theme.raios.botao};

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidroForte};
  color: ${({ theme }) => theme.cores.texto};

  cursor: pointer;
  font-weight: 700;

  transition: transform 0.12s ease, background 0.12s ease, border-color 0.12s ease;

  &:hover {
    transform: translateY(-1px);
    filter: brightness(0.85); /* Darken on hover */
    border-color: rgba(255,255,255,0.3);
  }

  &:active {
    transform: translateY(0px);
  }

  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
    transform: none;
  }
`;
