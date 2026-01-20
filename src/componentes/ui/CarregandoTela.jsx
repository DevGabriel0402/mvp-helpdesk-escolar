import styled, { keyframes } from "styled-components";
import { MdSupportAgent } from "react-icons/md";

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const Centro = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
`;

const IconeWrap = styled.div`
  color: ${({ theme }) => theme.cores.primaria};
  animation: ${pulse} 1.2s ease-in-out infinite;
`;

export default function CarregandoTela() {
  return (
    <Centro>
      <IconeWrap>
        <MdSupportAgent size={48} />
      </IconeWrap>
    </Centro>
  );
}
