import React, { createContext, useContext, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";
import { MdSupportAgent } from "react-icons/md";

const CarregandoContexto = createContext(null);

export function ProvedorCarregando({ children }) {
  const [contador, setContador] = useState(0);
  const carregando = contador > 0;

  function iniciarCarregando() {
    setContador((c) => c + 1);
  }

  function finalizarCarregando() {
    setContador((c) => Math.max(0, c - 1));
  }

  const valor = useMemo(
    () => ({ carregando, iniciarCarregando, finalizarCarregando }),
    [carregando],
  );

  return (
    <CarregandoContexto.Provider value={valor}>
      {children}
      {carregando && <TelaCarregando />}
    </CarregandoContexto.Provider>
  );
}

// eslint-disable-next-line react-refresh/only-export-components
export function useCarregando() {
  const ctx = useContext(CarregandoContexto);
  if (!ctx) throw new Error("useCarregando deve ser usado dentro de ProvedorCarregando");
  return ctx;
}

/* ================= UI LOADING ================= */

function TelaCarregando() {
  return (
    <Overlay>
      <IconeWrap>
        <MdSupportAgent size={48} />
      </IconeWrap>
    </Overlay>
  );
}

const pulse = keyframes`
  0%, 100% { transform: scale(1); opacity: 0.6; }
  50% { transform: scale(1.1); opacity: 1; }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 9999;
  pointer-events: none;
`;

const IconeWrap = styled.div`
  color: ${({ theme }) => theme.cores.primaria};
  animation: ${pulse} 1.2s ease-in-out infinite;
`;
