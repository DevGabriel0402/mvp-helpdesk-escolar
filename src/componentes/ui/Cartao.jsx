import styled from "styled-components";

export const Cartao = styled.div`
  background: ${({ theme }) => theme.cores.vidro};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: ${({ theme }) => theme.raios.card};
  box-shadow: ${({ theme }) => theme.sombras.suave};

  backdrop-filter: blur(16px);
  -webkit-backdrop-filter: blur(16px);
`;
