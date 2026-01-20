import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import styled from "styled-components";
import { motion } from "framer-motion";
import { useMemo } from "react";
import {
  FaPlusCircle,
  FaSearch,
  FaBell,
  FaUser,
  FaSignOutAlt,
  FaMoon,
  FaSun,
} from "react-icons/fa";
// Changed Home icon to Dashboard icon as requested
import { RxDashboard } from "react-icons/rx";
import { usarAuth } from "../../contextos/AuthContexto";
import { usarTema } from "../../contextos/TemaContexto";
import { usarNotificacoes } from "../../contextos/NotificacoesContexto";

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
  width: 48px;
  height: 48px;
  border-radius: 8px;
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
  width: 48px;
  height: 48px;
  border-radius: 8px;
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
  width: 48px;
  height: 48px;
  border-radius: 8px;
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
  border: 2px solid rgba(0, 0, 0, 0.35);
`;

// --- Mobile TabBar ---

const TabBar = styled.div`
  position: fixed;
  left: 14px;
  right: 14px;
  bottom: 24px;
  z-index: 80;

  border-radius: 12px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidroForte};
  backdrop-filter: blur(20px);
  -webkit-backdrop-filter: blur(20px);

  display: grid;
  padding: 8px;
  gap: 0;

  @media (min-width: 768px) {
    display: none;
  }
`;

const TabBarInner = styled.div`
  position: relative;
  display: grid;
  width: 100%;
`;

const TabIndicator = styled(motion.div)`
  position: absolute;
  top: 50%;
  height: 52px;
  border-radius: 12px;
  background: ${({ theme }) => theme.cores.destaque};
  z-index: 0;
  will-change: transform;
`;

const AbaLink = styled(NavLink)`
  height: 72px;
  border-radius: 8px;
  position: relative;

  display: grid;
  place-items: center;
  color: ${({ theme }) => theme.cores.texto};
  opacity: 0.6;
  transition:
    opacity 0.2s,
    color 0.2s;
  z-index: 1;
  text-decoration: none;

  &.active {
    opacity: 1;
    color: white;
  }
`;

function NavItemDesktop({ to, icon: Icon, label, end = false }) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

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
      <SidebarLink to={to} end={end ? 1 : 0} className={isActive ? "active" : ""}>
        <Icon size={18} style={{ position: "relative", zIndex: 1 }} />
        <span style={{ position: "relative", zIndex: 1 }}>{label}</span>
      </SidebarLink>
    </ItemContainer>
  );
}

function AbaMobile({ to, icon: Icon, title, end = false }) {
  const location = useLocation();
  const isActive = end ? location.pathname === to : location.pathname.startsWith(to);

  return (
    <AbaLink to={to} end={end ? 1 : 0} title={title} className={isActive ? "active" : ""}>
      <Icon size={28} style={{ position: "relative", zIndex: 2 }} />
    </AbaLink>
  );
}

// Componente da TabBar Mobile com indicador deslizante
function MobileTabBar({ eVisitante }) {
  const location = useLocation();

  // Define as rotas baseado no tipo de usuário
  const rotasVisitante = [
    { to: "/app/chamados/novo", icon: FaPlusCircle, title: "Novo chamado" },
    { to: "/app/buscar", icon: FaSearch, title: "Buscar" },
  ];

  const rotasAdmin = [
    { to: "/app/admin", icon: RxDashboard, title: "Dashboard", end: true },
    { to: "/app/buscar", icon: FaSearch, title: "Buscar" },
    { to: "/app/chamados/novo", icon: FaPlusCircle, title: "Novo chamado" },
    { to: "/app/notificacoes", icon: FaBell, title: "Notificacoes" },
    { to: "/app/perfil", icon: FaUser, title: "Perfil" },
  ];

  const rotas = eVisitante ? rotasVisitante : rotasAdmin;
  const totalAbas = rotas.length;

  // Calcula qual aba está ativa
  const indiceAtivo = useMemo(() => {
    return rotas.findIndex((rota) => {
      if (rota.end) {
        return location.pathname === rota.to;
      }
      return location.pathname.startsWith(rota.to);
    });
  }, [location.pathname, rotas]);

  // Calcula a posição do indicador (em %)
  // Fórmula: centro da aba = (indice + 0.5) * (100 / total)
  // O indicador tem 52px, então precisa deslocar 26px para a esquerda
  const centroAba =
    indiceAtivo >= 0 ? ((indiceAtivo + 0.5) * 100) / totalAbas : 50 / totalAbas;

  return (
    <TabBar>
      <TabBarInner style={{ gridTemplateColumns: `repeat(${totalAbas}, 1fr)` }}>
        {/* Indicador deslizante */}
        <TabIndicator
          animate={{
            left: `${centroAba}%`,
            x: "-50%",
            y: "-50%",
          }}
          initial={false}
          transition={{
            type: "spring",
            stiffness: 400,
            damping: 30,
            mass: 0.8,
          }}
          style={{
            width: 52,
          }}
        />

        {/* Abas */}
        {rotas.map((rota) => (
          <AbaMobile
            key={rota.to}
            to={rota.to}
            icon={rota.icon}
            title={rota.title}
            end={rota.end}
          />
        ))}
      </TabBarInner>
    </TabBar>
  );
}

export default function LayoutApp() {
  const { sair, perfil, eVisitante } = usarAuth();
  const { modo, alternarTema } = usarTema();
  const { naoLidas } = usarNotificacoes();
  const navigate = useNavigate();

  const IconeTema = modo === "escuro" ? FaSun : FaMoon;
  const labelTema = modo === "escuro" ? "Modo Claro" : "Modo Escuro";

  return (
    <Shell>
      {/* Botão flutuante de notificações (Desktop) */}
      {!eVisitante && (
        <BotaoSinoFlutuante
          onClick={() => navigate("/app/notificacoes")}
          title="Notificações"
        >
          <FaBell />
          {naoLidas > 0 && <Badge>{naoLidas > 99 ? "99+" : naoLidas}</Badge>}
        </BotaoSinoFlutuante>
      )}

      {/* Mobile Header */}
      <MobileHeader>
        <MobileLogo>Helpdesk</MobileLogo>
        <HeaderActions>
          {!eVisitante && (
            <MobileBellBtn
              onClick={() => navigate("/app/notificacoes")}
              title="Notificações"
            >
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
        <NavItemDesktop
          to="/app/chamados/novo"
          icon={FaPlusCircle}
          label="Novo Chamado"
        />
        <NavItemDesktop to="/app/buscar" icon={FaSearch} label="Buscar" />

        {!eVisitante && (
          <>
            <NavItemDesktop to="/app/notificacoes" icon={FaBell} label="Notificacoes" />
            <NavItemDesktop
              to="/app/perfil"
              icon={FaUser}
              label={`Perfil (${perfil?.nome?.split(" ")[0]})`}
            />
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
      <MobileTabBar eVisitante={eVisitante} />
    </Shell>
  );
}
