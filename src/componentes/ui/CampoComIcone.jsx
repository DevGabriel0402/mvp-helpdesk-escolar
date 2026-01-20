import React, { useState } from "react";
import styled from "styled-components";
import { FaEye, FaEyeSlash } from "react-icons/fa";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const IconeEsquerda = styled.div`
  position: absolute;
  left: 14px;
  top: 50%;
  transform: translateY(-50%);
  color: ${({ theme }) => theme.cores.textoFraco};
  pointer-events: none;
  font-size: 1.1rem;
`;

const BotaoOlho = styled.button`
  position: absolute;
  right: 14px;
  top: 50%;
  transform: translateY(-50%);
  background: transparent;
  border: none;
  color: ${({ theme }) => theme.cores.textoFraco};
  cursor: pointer;
  display: grid;
  place-items: center;
  font-size: 1.1rem;

  &:hover {
    color: ${({ theme }) => theme.cores.texto};
  }
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px;
  padding-left: ${({ $temIcone }) => ($temIcone ? "42px" : "14px")}; /* Espaco pro icone */
  padding-right: ${({ type }) => (type === "password" || type === "text" ? "42px" : "14px")}; /* Espaco pro olho */
  border-radius: 14px;

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};
  outline: none;
  font-size: 0.95rem;

  &::placeholder {
    color: ${({ theme }) => theme.cores.textoFraco};
  }

  &:focus {
    /* Manter borda da mesma cor */
    box-shadow: 0 0 0 3px rgba(255,255,255,0.10);
  }
`;

export default function CampoComIcone({ icon: Icon, type = "text", ...props }) {
  const [mostrarSenha, setMostrarSenha] = useState(false);

  const isPassword = type === "password";
  const inputType = isPassword ? (mostrarSenha ? "text" : "password") : type;

  return (
    <Wrapper>
      {Icon && (
        <IconeEsquerda>
          <Icon />
        </IconeEsquerda>
      )}

      <Input
        $temIcone={!!Icon}
        type={inputType}
        {...props}
      />

      {isPassword && (
        <BotaoOlho type="button" onClick={() => setMostrarSenha(!mostrarSenha)}>
          {mostrarSenha ? <FaEyeSlash /> : <FaEye />}
        </BotaoOlho>
      )}
    </Wrapper>
  );
}
