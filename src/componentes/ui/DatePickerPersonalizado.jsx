import { useState, useRef, useEffect } from "react";
import styled from "styled-components";
import { FaCalendarAlt, FaChevronDown, FaTimes } from "react-icons/fa";
import { motion, AnimatePresence } from "framer-motion";
import CalendarioCustom from "./CalendarioCustom";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const BotaoSelect = styled.button`
  width: 100%;
  padding: 12px 14px;
  border-radius: 16px;

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  cursor: pointer;
  outline: none;
  font-size: 0.9rem;
  transition: all 0.2s;

  &:focus {
    border-color: rgba(255,255,255,0.25);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.10);
  }

  &:hover {
    background: rgba(128, 128, 128, 0.1);
  }
`;

const Texto = styled.span`
  display: inline-block;
  text-align: left;
  color: ${({ theme, $vazio }) =>
        $vazio ? theme.cores.textoFraco : theme.cores.texto};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const MenuDropdown = styled(motion.div)`
  position: absolute;
  top: calc(100% + 8px);
  left: 0;
  z-index: 9999;
  
  @media (max-width: 600px) {
    left: 50%;
    transform: translateX(-50%) !important;
  }
`;

export default function DatePickerPersonalizado({ valor, onChange, placeholder = "Data..." }) {
    const [aberto, setAberto] = useState(false);
    const refWrapper = useRef(null);

    // Fechar ao clicar fora
    useEffect(() => {
        function handleClickFora(e) {
            if (refWrapper.current && !refWrapper.current.contains(e.target)) {
                setAberto(false);
            }
        }
        document.addEventListener("mousedown", handleClickFora);
        return () => document.removeEventListener("mousedown", handleClickFora);
    }, []);

    function formatarData(dataStr) {
        if (!dataStr) return null;
        const [ano, mes, dia] = dataStr.split("-");
        return (
            <span style={{ fontWeight: 600 }}>
                <span style={{ color: 'inherit' }}>{dia}</span>
                <span style={{ opacity: 0.4, padding: '0 2px' }}>/</span>
                <span style={{ color: 'inherit' }}>{mes}</span>
                <span style={{ opacity: 0.4, padding: '0 2px' }}>/</span>
                <span style={{ color: 'inherit' }}>{ano}</span>
            </span>
        );
    }

    function handleSelecionar(novaData) {
        onChange(novaData);
        setAberto(false);
    }

    return (
        <Wrapper ref={refWrapper}>
            <BotaoSelect
                type="button"
                onClick={() => setAberto(!aberto)}
                title="Clique para selecionar uma data"
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <FaCalendarAlt size={14} style={{ opacity: 0.6, color: '#32c8ff' }} />
                    <Texto $vazio={!valor}>
                        {valor ? formatarData(valor) : placeholder}
                    </Texto>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                    {valor && (
                        <FaTimes
                            size={12}
                            style={{ opacity: 0.5, cursor: 'pointer' }}
                            onClick={(e) => {
                                e.stopPropagation();
                                onChange("");
                                setAberto(false);
                            }}
                        />
                    )}
                </div>
            </BotaoSelect>

            <AnimatePresence>
                {aberto && (
                    <MenuDropdown
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -10 }}
                        transition={{ duration: 0.15 }}
                    >
                        <CalendarioCustom
                            valor={valor}
                            aoSelecionar={handleSelecionar}
                        />
                    </MenuDropdown>
                )}
            </AnimatePresence>
        </Wrapper>
    );
}
