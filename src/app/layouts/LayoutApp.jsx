import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { FaPlusCircle, FaSearch, FaBell, FaUser, FaSignOutAlt, FaMoon, FaSun } from "react-icons/fa";
// Changed Home icon to Dashboard icon as requested
import { RxDashboard } from "react-icons/rx";
import { usarAuth } from "../../contextos/AuthContexto";
import { usarTema } from "../../contextos/TemaContexto";
import { useNotificacoesChamados } from "../../hooks/useNotificacoesChamados";

const Shell = styled.div`
  min-height: 100vh;
  display: flex;
  flex-direction: column;

  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Sidebar = styled.aside`
  display: none;

  @media (min-width: 768px) {
    display: flex;
    flex-direction: column;
    width: 210px;
    height: 100vh;
    position: sticky;
    top: 0;
    
    background: ${({ theme }) => theme.cores.vidro};
    border-right: 1px solid ${({ theme }) => theme.cores.borda};
    padding: 20px;
    gap: 10px;
  }
`;

const SidebarLogo = styled.div`
  font-size: 1rem;
  font-weight: 800;
  margin-bottom: 20px;
  padding-left: 10px;
  color: ${({ theme }) => theme.cores.texto};
`;

const ItemContainer = styled.div`
  position: relative;
`;

const ActiveBackground = styled(motion.div)`
  position: absolute;
  inset: 0;
  background: ${({ theme }) => theme.cores.destaque};
  border-radius: 6px;
  z-index: 0;
`;

const SidebarLink = styled(NavLink)`
  position: relative;
  width: 100%; /* Ensure full width as requested */
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 12px;
  border-radius: 6px;
  color: ${({ theme }) => theme.cores.textoFraco};
  font-weight: 500;
  transition: color 0.2s;
  z-index: 1; 
  text-decoration: none;

  &:hover {
    color: ${({ theme }) => theme.cores.texto};
  }

  &.active {
    color: white; 
    font-weight: 700;
  }
`;

const SidebarBottom = styled.div`
  margin-top: auto;
  padding-top: 12px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
  display: grid;
  gap: 8px;
`;

const BotaoLogout = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 12px 14px;
  border-radius: 6px;
  width: 100%;
  
  font-weight: 600;
  cursor: pointer;
  
  background: transparent;
  color: #ff4d4d;
  border: 1px solid rgba(255, 77, 77, 0.2);
  transition: all 0.2s;

  &:hover {
    background: rgba(255, 77, 77, 0.1);
    border-color: #ff4d4d;
  }
`;

const ThemeToggleBtn = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 10px;
  padding: 10px;
  border-radius: 6px;
  width: 100%;
  
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: transparent;
  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.cores.brancoTransparente};
  }
`;

const Conteudo = styled.div`
  flex: 1;
  padding: 16px;
  padding-bottom: 120px; /* espaço pra tab bar mobile (aumentado +) */
  width: 100%;

  @media (min-width: 768px) {
    padding: 24px;
    padding-bottom: 24px;
    width: auto;
  }
`;

// --- Mobile Header ---
const MobileHeader = styled.header`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 18px 16px;
  
  border-bottom: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidro};
  backdrop-filter: blur(12px);

  @media (min-width: 768px) {
    display: none;
  }
`;

const MobileLogo = styled.div`
  font-size: 1.1rem;
  font-weight: 800;
  color: ${({ theme }) => theme.cores.texto};
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MobileLogoutBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  width: 38px;
  height: 38px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: rgba(255, 77, 77, 0.1);
  }
`;

const MobileThemeBtn = styled.button`
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  width: 38px;
  height: 38px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.cores.brancoTransparente};
  }
`;

const MobileBellBtn = styled.button`
  position: relative;
  background: transparent;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  width: 38px;
  height: 38px;
  border-radius: 6px;
  display: grid;
  place-items: center;
  cursor: pointer;

  &:hover {
    background: ${({ theme }) => theme.cores.brancoTransparente};
  }
`;

const BotaoSinoFlutuante = styled.button`
  position: fixed;
  top: 16px;
  right: 16px;
  z-index: 120;

  width: 44px;
  height: 44px;
  border-radius: 14px;

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidroForte};
  backdrop-filter: blur(16px);

  color: ${({ theme }) => theme.cores.texto};
  cursor: pointer;

  display: none;

  @media (min-width: 768px) {
    display: grid;
    place-items: center;
  }
`;

const Badge = styled.div`
  position: absolute;
  top: -6px;
  right: -6px;
  min-width: 18px;
  height: 18px;
  padding: 0 6px;
  border-radius: 999px;
  background: rgba(255, 60, 60, 0.95);
  color: white;
  font-size: 12px;
  font-weight: 900;
  display: grid;
  place-items: center;
  border: 2px solid rgba(0,0,0,0.35);
`;

// --- Mobile TabBar ---

const TabBar = styled.div`
  position: fixed;
  left: 14px;
  right: 14px;
  bottom: 14px;
  z-index: 80;

  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidroForte};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  display: grid;
  padding: 8px;
  gap: 10px;

  @media (min-width: 768px) {
    display: none;
  }
`;

const AbaLink = styled(NavLink)`
  height: 72px;
  border-radius: 8px;
  position: relative;
  
  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.cores.texto};
  opacity: 0.6;
  transition: opacity 0.2s;
  z-index: 1;

  &.active {
    opacity: 1;
    color: white; 
  }
`;

function NavItemDesktop({ to, icon: Icon, label, end = false }) {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  // Separate layoutId for desktop
  const layoutId = "desktop-nav-bg";

  return (
    <ItemContainer>
      {isActive && (
        <ActiveBackground
          layoutId={layoutId}
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
        />
      )}
      <SidebarLink to={to} end={end ? 1 : 0} className={isActive ? 'active' : ''}>
        <Icon size={18} style={{ position: 'relative', zIndex: 1 }} />
        <span style={{ position: 'relative', zIndex: 1 }}>{label}</span>
      </SidebarLink>
    </ItemContainer>
  );
}

function AbaMobile({ to, icon: Icon, title, end = false }) {
  const location = useLocation();
  const isActive = end
    ? location.pathname === to
    : location.pathname.startsWith(to);

  // Separate layoutId for mobile
  const layoutId = "mobile-tab-bg";

  return (
    <div style={{ position: "relative", display: "grid", placeItems: "center" }}>
      {isActive && (
        <ActiveBackground
          layoutId={layoutId}
          initial={false}
          transition={{ type: "spring", stiffness: 500, damping: 30 }}
          style={{
            borderRadius: 16,
            width: 56,
            height: 56,
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            inset: 'auto' // override inset: 0 from styled component default
          }}
        />
      )}
      <AbaLink to={to} end={end ? 1 : 0} title={title} className={isActive ? 'active' : ''}>
        <Icon size={30} style={{ position: "relative", zIndex: 2 }} />
      </AbaLink>
    </div>
  );
}

export default function LayoutApp() {
  const navigate = useNavigate();
  const { sair, perfil, eVisitante, usuarioAuth } = usarAuth();
  const { modo, alternarTema } = usarTema();

  const { naoLidas } = useNotificacoesChamados({
    uid: usuarioAuth?.uid,
    escolaId: perfil?.escolaId,
    ativo: !eVisitante, // so admin
  });

  const IconeTema = modo === "escuro" ? FaSun : FaMoon;
  const labelTema = modo === "escuro" ? "Modo Claro" : "Modo Escuro";

  const colunas = eVisitante ? "repeat(2, 1fr)" : "repeat(5, 1fr)";

  return (
    <Shell>
      {!eVisitante && (
        <BotaoSinoFlutuante onClick={() => navigate("/app/notificacoes")} title="Notificacoes">
          <FaBell />
          {naoLidas > 0 && <Badge>{naoLidas > 99 ? "99+" : naoLidas}</Badge>}
        </BotaoSinoFlutuante>
      )}

      {/* Mobile Header */}
      <MobileHeader>
        <MobileLogo>Helpdesk</MobileLogo>
        <HeaderActions>
          {!eVisitante && (
            <MobileBellBtn onClick={() => navigate("/app/notificacoes")} title="Notificacoes">
              <FaBell />
              {naoLidas > 0 && <Badge>{naoLidas > 99 ? "99+" : naoLidas}</Badge>}
            </MobileBellBtn>
          )}
          <MobileThemeBtn onClick={alternarTema}>
            <IconeTema />
          </MobileThemeBtn>
          <MobileLogoutBtn onClick={sair}>
            <FaSignOutAlt />
          </MobileLogoutBtn>
        </HeaderActions>
      </MobileHeader>

      {/* Desktop Sidebar */}
      <Sidebar>
        <SidebarLogo>Helpdesk Escolar</SidebarLogo>

        {!eVisitante && (
          // Use RxDashboard for Admin Home
          <NavItemDesktop to="/app/admin" end icon={RxDashboard} label="Dashboard" />
        )}
        <NavItemDesktop to="/app/chamados/novo" icon={FaPlusCircle} label="Novo Chamado" />
        <NavItemDesktop to="/app/buscar" icon={FaSearch} label="Buscar" />

        {!eVisitante && (
          <>
            <NavItemDesktop to="/app/notificacoes" icon={FaBell} label="Notificacoes" />
            <NavItemDesktop to="/app/perfil" icon={FaUser} label={`Perfil (${perfil?.nome?.split(' ')[0]})`} />
          </>
        )}

        <SidebarBottom>
          <ThemeToggleBtn onClick={alternarTema}>
            <IconeTema /> {labelTema}
          </ThemeToggleBtn>
          <BotaoLogout onClick={sair}>
            <FaSignOutAlt /> Sair
          </BotaoLogout>
        </SidebarBottom>
      </Sidebar>

      <Conteudo>
        <Outlet />
      </Conteudo>

      {/* Mobile Tab Bar */}
      <TabBar style={{ gridTemplateColumns: colunas }}>
        {!eVisitante && (
          // Dashboard icon for Admin
          <AbaMobile to="/app/admin" end icon={RxDashboard} title="Dashboard" />
        )}
        <AbaMobile to="/app/buscar" icon={FaSearch} title="Buscar" />
        <AbaMobile to="/app/chamados/novo" icon={FaPlusCircle} title="Novo chamado" />

        {!eVisitante && (
          <>
            <AbaMobile to="/app/notificacoes" icon={FaBell} title="Notificacoes" />
            <AbaMobile to="/app/perfil" icon={FaUser} title="Perfil" />
          </>
        )}
      </TabBar>
    </Shell>
  );
}
