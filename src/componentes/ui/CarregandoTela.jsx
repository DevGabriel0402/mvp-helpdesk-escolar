import styled from "styled-components";
import { Cartao } from "./Cartao";

const Centro = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
`;

const Caixa = styled(Cartao)`
  padding: 18px;
  width: min(420px, 100%);
  text-align: center;
  color: ${({ theme }) => theme.cores.textoFraco};
`;

export default function CarregandoTela() {
  return (
    <Centro>
      <Caixa>Carregando...</Caixa>
    </Centro>
  );
}
