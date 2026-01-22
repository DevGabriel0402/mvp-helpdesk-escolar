import { useState, useMemo } from "react";
import styled from "styled-components";
import { FaChevronLeft, FaChevronRight, FaCalendarDay } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";

const COR_DESTAQUE = "#32c8ff"; // Azul vibrante do sistema

const Container = styled.div`
  width: 310px;
  background: ${({ theme }) => theme.cores.menuFundo};
  backdrop-filter: blur(35px);
  -webkit-backdrop-filter: blur(35px);
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 24px;
  box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.5);
  padding: 24px;
  user-select: none;
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 24px;
`;

const MesAnoContainer = styled.div`
  display: flex;
  flex-direction: column;
`;

const MesTexto = styled.span`
  font-weight: 800;
  font-size: 1.2rem;
  color: ${({ theme }) => theme.cores.texto};
  text-transform: capitalize;
  letter-spacing: -0.02em;
`;

const AnoTexto = styled.span`
  font-size: 0.8rem;
  font-weight: 600;
  color: ${({ theme }) => theme.cores.textoFraco};
  margin-top: -2px;
`;

const HeaderAcoes = styled.div`
  display: flex;
  gap: 8px;
`;

const BotaoNav = styled.button`
  background: ${({ theme }) => theme.nome === 'escuro' ? 'rgba(255, 255, 255, 0.04)' : 'rgba(0, 0, 0, 0.04)'};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  color: ${({ theme }) => theme.cores.texto};
  width: 34px;
  height: 34px;
  border-radius: 12px;
  display: grid;
  place-items: center;
  cursor: pointer;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${COR_DESTAQUE};
    border-color: ${COR_DESTAQUE};
    color: #000;
    transform: translateY(-2px);
    box-shadow: 0 8px 15px ${COR_DESTAQUE}44;
  }

  &:active {
    transform: translateY(0);
  }
`;

const GridInterno = styled.div`
  position: relative;
  overflow: hidden;
  height: 240px; 
`;

const GridDias = styled(motion.div)`
  display: grid;
  grid-template-columns: repeat(7, 1fr);
  gap: 8px;
  width: 100%;
`;

const NomeDia = styled.span`
  font-size: 0.7rem;
  font-weight: 800;
  color: ${({ theme }) => theme.cores.textoFraco};
  text-align: center;
  margin-bottom: 12px;
  text-transform: uppercase;
  letter-spacing: 0.1em;
  opacity: 0.6;
`;

const Dia = styled.button`
  aspect-ratio: 1;
  border: ${({ $hoje, $selecionado }) =>
    $hoje && !$selecionado ? `2px solid ${COR_DESTAQUE}` : "none"};
  background: ${({ $selecionado }) =>
    $selecionado ? COR_DESTAQUE : "transparent"};
  color: ${({ $selecionado, $hoje, theme }) =>
    $selecionado ? "#000" : ($hoje ? COR_DESTAQUE : theme.cores.texto)};
  border-radius: 14px;
  font-size: 0.95rem;
  font-weight: ${({ $hoje, $selecionado }) => ($hoje || $selecionado ? "800" : "500")};
  cursor: pointer;
  display: grid;
  place-items: center;
  position: relative;
  transition: all 0.25s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${({ $selecionado }) => $selecionado ? COR_DESTAQUE : "rgba(128, 128, 128, 0.15)"};
    transform: scale(1.15);
    z-index: 10;
  }

  ${({ $outroMes }) => $outroMes && `
    opacity: 0.1;
    pointer-events: none;
  `}

  ${({ $selecionado }) => $selecionado && `
    box-shadow: 0 0 20px ${COR_DESTAQUE}88;
  `}

  &::after {
    content: '';
    position: absolute;
    bottom: 4px;
    width: 4px;
    height: 4px;
    border-radius: 50%;
    background: ${COR_DESTAQUE};
    display: ${({ $hoje, $selecionado }) => ($hoje && !$selecionado ? "block" : "none")};
  }
`;

const Rodape = styled.div`
  margin-top: 20px;
  padding-top: 20px;
  border-top: 1px solid ${({ theme }) => theme.cores.borda};
  display: flex;
  justify-content: center;
`;

const BotaoHoje = styled.button`
  background: ${({ theme }) => theme.nome === 'escuro' ? 'rgba(255, 255, 255, 0.03)' : 'rgba(0, 0, 0, 0.03)'};
  border: 1px solid ${({ theme }) => theme.cores.borda};
  border-radius: 14px;
  padding: 10px 20px;
  color: ${({ theme }) => theme.cores.texto};
  font-size: 0.85rem;
  font-weight: 700;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 10px;
  transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

  &:hover {
    background: ${COR_DESTAQUE};
    color: #000;
    border-color: ${COR_DESTAQUE};
    box-shadow: 0 10px 20px ${COR_DESTAQUE}44;
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const NOMES_MESES = [
  "Janeiro", "Fevereiro", "Março", "Abril", "Maio", "Junho",
  "Julho", "Agosto", "Setembro", "Outubro", "Novembro", "Dezembro"
];

const DIAS_SEMANA = ["dom", "seg", "ter", "qua", "qui", "sex", "sáb"];

export default function CalendarioCustom({ valor, aoSelecionar }) {
  const dataSelecionada = useMemo(() => {
    if (!valor) return null;
    const [ano, mes, dia] = valor.split("-").map(Number);
    return new Date(ano, mes - 1, dia);
  }, [valor]);

  const hoje = new Date();
  const [periodo, setPeriodo] = useState(() => {
    const d = dataSelecionada || hoje;
    return { mes: d.getMonth(), ano: d.getFullYear() };
  });
  const [direcao, setDirecao] = useState(0);

  const dias = useMemo(() => {
    const { mes, ano } = periodo;
    const primeiroDiaMes = new Date(ano, mes, 1).getDay();
    const ultimoDiaMes = new Date(ano, mes + 1, 0).getDate();

    const ultimoDiaMesAnterior = new Date(ano, mes, 0).getDate();
    const diasAnteriores = [];
    for (let i = primeiroDiaMes - 1; i >= 0; i--) {
      diasAnteriores.push({ dia: ultimoDiaMesAnterior - i, mes: mes - 1, ano, outroMes: true });
    }

    const diasAtuais = [];
    for (let i = 1; i <= ultimoDiaMes; i++) {
      diasAtuais.push({ dia: i, mes: mes, ano, outroMes: false });
    }

    const totalAteAgora = diasAnteriores.length + diasAtuais.length;
    const diasProximos = [];
    for (let i = 1; totalAteAgora + i <= 42; i++) {
      diasProximos.push({ dia: i, mes: mes + 1, ano, outroMes: true });
    }

    return [...diasAnteriores, ...diasAtuais, ...diasProximos];
  }, [periodo]);

  function mudarMes(delta) {
    setDirecao(delta);
    setPeriodo(prev => {
      const novaData = new Date(prev.ano, prev.mes + delta, 1);
      return { mes: novaData.getMonth(), ano: novaData.getFullYear() };
    });
  }

  function irParaHoje() {
    const d = new Date();
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    aoSelecionar(`${y}-${m}-${day}`);
  }

  function handleSelecionar(d) {
    const dataObj = new Date(d.ano, d.mes, d.dia);
    const y = dataObj.getFullYear();
    const m = String(dataObj.getMonth() + 1).padStart(2, "0");
    const day = String(dataObj.getDate()).padStart(2, "0");
    aoSelecionar(`${y}-${m}-${day}`);
  }

  const variacoes = {
    enter: (d) => ({ x: d > 0 ? 50 : -50, opacity: 0, scale: 0.9, filter: "blur(4px)" }),
    center: { x: 0, opacity: 1, scale: 1, filter: "blur(0px)" },
    exit: (d) => ({ x: d > 0 ? -50 : 50, opacity: 0, scale: 0.9, filter: "blur(4px)" })
  };

  return (
    <Container onClick={(e) => e.stopPropagation()}>
      <Header>
        <MesAnoContainer>
          <MesTexto>{NOMES_MESES[periodo.mes]}</MesTexto>
          <AnoTexto>{periodo.ano}</AnoTexto>
        </MesAnoContainer>
        <HeaderAcoes>
          <BotaoNav onClick={() => mudarMes(-1)} title="Mês anterior">
            <FaChevronLeft size={12} />
          </BotaoNav>
          <BotaoNav onClick={() => mudarMes(1)} title="Próximo mês">
            <FaChevronRight size={12} />
          </BotaoNav>
        </HeaderAcoes>
      </Header>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 8, marginBottom: 12 }}>
        {DIAS_SEMANA.map((d, i) => (
          <NomeDia key={i}>{d}</NomeDia>
        ))}
      </div>

      <GridInterno>
        <AnimatePresence initial={false} custom={direcao}>
          <GridDias
            key={`${periodo.mes}-${periodo.ano}`}
            custom={direcao}
            variants={variacoes}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.4, ease: [0.4, 0, 0.2, 1] }}
          >
            {dias.map((d, i) => {
              const isHoje =
                d.dia === hoje.getDate() &&
                d.mes === hoje.getMonth() &&
                d.ano === hoje.getFullYear();

              const isSelecionado = dataSelecionada &&
                d.dia === dataSelecionada.getDate() &&
                d.mes === dataSelecionada.getMonth() &&
                d.ano === dataSelecionada.getFullYear();

              return (
                <Dia
                  key={i}
                  $outroMes={d.outroMes}
                  $hoje={isHoje}
                  $selecionado={isSelecionado}
                  onClick={() => handleSelecionar(d)}
                >
                  {d.dia}
                </Dia>
              );
            })}
          </GridDias>
        </AnimatePresence>
      </GridInterno>

      <Rodape>
        <BotaoHoje onClick={irParaHoje}>
          <FaCalendarDay size={14} /> Selecionar Hoje
        </BotaoHoje>
      </Rodape>
    </Container>
  );
}
