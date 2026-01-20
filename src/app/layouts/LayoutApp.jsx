import { Outlet, NavLink, useLocation, useNavigate } from "react-router-dom";
import styled, { keyframes } from "styled-components";
import { motion } from "framer-motion";
import { useEffect, useMemo, useState } from "react";
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
import { usePainelPublico } from "../../hooks/usePainelPublico";

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

const MarcaPainel = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
  margin-bottom: 20px;
  padding-left: 10px;
`;

const LogoPainel = styled.img`
  width: 40px;
  height: 40px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(0, 0, 0, 0.25);
  flex-shrink: 0;
`;

const LogoFallback = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(255, 255, 255, 0.06);
  flex-shrink: 0;
`;

const NomePainel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 18px;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.texto};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 200px;

  @media (min-width: 720px) {
    max-width: 280px;
  }
`;

const pulseOnline = keyframes`
  0%, 100% { box-shadow: 0 0 0 0 rgba(34, 197, 94, 0.4); }
  50% { box-shadow: 0 0 0 4px rgba(34, 197, 94, 0); }
`;

const StatusBolinha = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $online }) => ($online ? "#22c55e" : "#ef4444")};
  animation: ${({ $online }) => ($online ? pulseOnline : "none")} 2s ease-in-out infinite;
  flex-shrink: 0;
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
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 0;
`;

const MobileLogoPainel = styled.img`
  width: 44px;
  height: 44px;
  border-radius: 8px;
  object-fit: cover;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(0, 0, 0, 0.25);
`;

const MobileLogoFallback = styled.div`
  width: 34px;
  height: 34px;
  border-radius: 8px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: rgba(255, 255, 255, 0.06);
`;

const MobileNomePainel = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.texto};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 140px;
`;

const HeaderActions = styled.div`
  display: flex;
  gap: 8px;
`;

const MobileLogoutBtn = styled.button`
  background: transparent;
  border: 1px solid rgba(255, 77, 77, 0.2);
  color: #ff4d4d;
  width: 52px;
  height: 52px;
  border-radius: 12px;
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
  width: 52px;
  height: 52px;
  border-radius: 12px;
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
  width: 52px;
  height: 52px;
  border-radius: 12px;
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
  bottom: 8px;
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
  height: 68px;
  border-radius: 16px;
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

// eslint-disable-next-line no-unused-vars
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
// eslint-disable-next-line no-unused-vars
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
            width: 68,
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
  const painel = usePainelPublico("escola_padrao");
  const navigate = useNavigate();
  const [online, setOnline] = useState(navigator.onLine);

  // Detectar mudanças de conexão
  useEffect(() => {
    function handleOnline() {
      setOnline(true);
    }
    function handleOffline() {
      setOnline(false);
    }

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

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
        <MobileLogo>
          {painel?.logo?.url256 ? (
            <MobileLogoPainel src={painel.logo.url256} alt="Logo do painel" />
          ) : (
            <MobileLogoFallback />
          )}
          <MobileNomePainel>
            {painel?.nomePainel || "Helpdesk"}
            <StatusBolinha $online={online} title={online ? "Online" : "Offline"} />
          </MobileNomePainel>
        </MobileLogo>
        <HeaderActions>
          {!eVisitante && (
            <MobileBellBtn
              onClick={() => navigate("/app/notificacoes")}
              title="Notificações"
            >
              <FaBell size={20} />
              {naoLidas > 0 && <Badge>{naoLidas > 99 ? "99+" : naoLidas}</Badge>}
            </MobileBellBtn>
          )}
          <MobileThemeBtn onClick={alternarTema}>
            <IconeTema size={20} />
          </MobileThemeBtn>
          <MobileLogoutBtn onClick={sair}>
            <FaSignOutAlt size={20} />
          </MobileLogoutBtn>
        </HeaderActions>
      </MobileHeader>

      {/* Desktop Sidebar */}
      <Sidebar>
        <MarcaPainel>
          {painel?.logo?.url256 ? (
            <LogoPainel src={painel.logo.url256} alt="Logo do painel" />
          ) : (
            <LogoFallback />
          )}
          <NomePainel>
            {painel?.nomePainel || "Helpdesk"}
            <StatusBolinha $online={online} title={online ? "Online" : "Offline"} />
          </NomePainel>
        </MarcaPainel>

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
