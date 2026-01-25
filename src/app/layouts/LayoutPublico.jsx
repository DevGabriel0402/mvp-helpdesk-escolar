import { Outlet, useLocation } from "react-router-dom";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import { FaMoon, FaSun } from "react-icons/fa";
import { usarTema } from "../../contextos/TemaContexto";

const Container = styled.div`
  min-height: 100vh;
  display: grid;
  place-items: center;
  padding: 24px;
  position: relative; /* Para o botao absoluto funcionar */
`;

const ToggleBtn = styled.button`
  position: absolute;
  top: 24px;
  right: 24px;
  background: ${({ theme }) => theme.cores.vidro};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  width: 44px;
  height: 44px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s;
  backdrop-filter: blur(10px);

  &:hover {
    background: ${({ theme }) => theme.cores.brancoTransparente};
    transform: scale(1.05);
  }
`;

export default function LayoutPublico() {
  const { modo, alternarTema } = usarTema();
  const location = useLocation();
  const Icone = modo === "escuro" ? FaSun : FaMoon;

  return (
    <Container>
      <ToggleBtn onClick={alternarTema} title="Alternar Tema">
        <Icone size={20} />
      </ToggleBtn>
      <AnimatePresence mode="wait">
        <motion.div
          key={location.pathname} // Se houver rotas internas, senão pode ser fixo ou removido
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          style={{ width: '100%', display: 'grid', placeItems: 'center' }}
        >
          <Outlet />
        </motion.div>
      </AnimatePresence>
    </Container>
  );
}
