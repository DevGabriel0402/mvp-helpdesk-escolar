import React, { createContext, useContext, useMemo, useState } from "react";
import styled, { keyframes } from "styled-components";

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
      <Spinner />
    </Overlay>
  );
}

const spin = keyframes`
  0% { transform: rotate(0deg); }
  100% { transform: rotate(360deg); }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  z-index: 9999;
  pointer-events: none;
`;

const Spinner = styled.div`
  width: 40px;
  height: 40px;
  border: 3px solid ${({ theme }) => theme.cores.texto}20;
  border-top-color: ${({ theme }) => theme.cores.primaria};
  border-radius: 50%;
  animation: ${spin} 0.8s linear infinite;
`;
