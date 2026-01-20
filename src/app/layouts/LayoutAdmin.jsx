import { Outlet, Link } from "react-router-dom";
import styled from "styled-components";

const Linha = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-bottom: 16px;
`;

const Aba = styled(Link)`
  padding: 10px 12px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidro};
`;

export default function LayoutAdmin() {
  return (
    <div>
      <Linha>
        <Aba to="/app/admin/dashboard">Dashboard</Aba>
        <Aba to="/app/admin/chamados">Chamados</Aba>
        <Aba to="/app/admin/kanban">Kanban</Aba>
        <Aba to="/app/admin/configuracoes">Configuracoes</Aba>
      </Linha>
      <Outlet />
    </div>
  );
}
