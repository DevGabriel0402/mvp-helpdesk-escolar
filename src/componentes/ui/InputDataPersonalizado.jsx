import styled from "styled-components";
import { FaCalendarAlt } from "react-icons/fa";

const Container = styled.div`
  position: relative;
  width: 100%;
  display: flex;
  align-items: center;
`;

const Icone = styled.div`
  position: absolute;
  left: 14px;
  color: #32c8ff;
  display: flex;
  align-items: center;
  pointer-events: none;
  z-index: 2;
  opacity: 0.8;
`;

const Input = styled.input`
  width: 100%;
  padding: 12px 14px 12px 40px;
  border-radius: 16px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};
  font-family: inherit;
  font-size: 0.9rem;
  font-weight: 500;
  outline: none;
  transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
  appearance: none;
  -webkit-appearance: none;

  &::-webkit-calendar-picker-indicator {
    background: transparent;
    bottom: 0;
    color: transparent;
    cursor: pointer;
    height: auto;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    width: auto;
    z-index: 3;
  }

  &:focus {
    border-color: rgba(255, 255, 255, 0.3);
    box-shadow: 0 0 0 4px rgba(255, 255, 255, 0.05);
    background: ${({ theme }) => theme.nome === 'escuro' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  }

  &:hover {
    background: ${({ theme }) => theme.nome === 'escuro' ? 'rgba(255, 255, 255, 0.05)' : 'rgba(0, 0, 0, 0.05)'};
  }

  &::-webkit-datetime-edit {
    padding: 0;
  }

  &::-webkit-datetime-edit-fields-wrapper {
    padding: 0;
  }

  &::-webkit-datetime-edit-text,
  &::-webkit-datetime-edit-month-field,
  &::-webkit-datetime-edit-day-field,
  &::-webkit-datetime-edit-year-field {
    color: ${({ theme }) => theme.cores.texto};
  }

  &::placeholder {
    color: ${({ theme }) => theme.cores.textoFraco};
  }
`;

export default function InputDataPersonalizado({ valor, onChange, placeholder = "Filtrar por data" }) {
    return (
        <Container>
            <Icone>
                <FaCalendarAlt size={14} />
            </Icone>
            <Input
                type="date"
                value={valor}
                onChange={(e) => onChange(e.target.value)}
                placeholder={placeholder}
                title={placeholder}
            />
        </Container>
    );
}
