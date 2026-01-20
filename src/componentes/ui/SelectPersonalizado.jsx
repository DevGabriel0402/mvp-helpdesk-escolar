import { useEffect, useMemo, useRef, useState } from "react";
import styled from "styled-components";
import { FaChevronDown, FaCheck } from "react-icons/fa";
import { Cartao } from "./Cartao";

const Wrapper = styled.div`
  position: relative;
  width: 100%;
`;

const BotaoSelect = styled.button`
  width: 100%;
  padding: 12px 14px;
  border-radius: 14px;

  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.pretoTransparente};
  color: ${({ theme }) => theme.cores.texto};

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  cursor: pointer;
  outline: none;

  &:focus {
    border-color: rgba(255,255,255,0.25);
    box-shadow: 0 0 0 3px rgba(255,255,255,0.10);
  }
`;

const Texto = styled.span`
  display: inline-block;
  text-align: left;
  color: ${({ theme, $placeholder }) =>
        $placeholder ? theme.cores.textoFraco : theme.cores.texto};
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const Menu = styled(Cartao)`
  position: absolute;
  left: 0;
  right: 0;
  ${({ $direcao }) => ($direcao === "cima" ? "bottom: calc(100% + 8px);" : "top: calc(100% + 8px);")}
  z-index: 9999;

  max-height: 260px;
  overflow: auto;

  padding: 6px;
  padding: 6px;
  background: ${({ theme }) => theme.cores.menuFundo};
  backdrop-filter: blur(24px);
  border-color: ${({ theme }) => theme.cores.borda};

  display: grid;
  gap: 4px;
`;

const Item = styled.button`
  width: 100%;
  border: 1px solid transparent;
  background: ${({ theme }) => theme.nome === 'claro' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.04)'};
  color: ${({ theme }) => theme.cores.texto};

  padding: 10px 10px;
  border-radius: 12px;

  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;

  cursor: pointer;
  text-align: left;

  &:hover {
    background: rgba(255,255,255,0.08);
    border-color: rgba(255,255,255,0.10);
  }
`;

function useCliqueFora(refs, aoClicarFora) {
    useEffect(() => {
        function onClick(e) {
            const clicouDentro = refs.some((r) => r.current && r.current.contains(e.target));
            if (!clicouDentro) aoClicarFora();
        }
        document.addEventListener("mousedown", onClick);
        document.addEventListener("touchstart", onClick, { passive: true });
        return () => {
            document.removeEventListener("mousedown", onClick);
            document.removeEventListener("touchstart", onClick);
        };
    }, [refs, aoClicarFora]);
}

export default function SelectPersonalizado({
    valor,
    onChange,
    opcoes = [],
    placeholder = "Selecione...",
    desabilitado = false,
    direcao = "baixo", // "baixo" ou "cima"
}) {
    const [aberto, setAberto] = useState(false);
    const refWrapper = useRef(null);
    const refBotao = useRef(null);

    const opcaoSelecionada = useMemo(
        () => opcoes.find((o) => o.value === valor) || null,
        [opcoes, valor]
    );

    useCliqueFora([refWrapper], () => setAberto(false));

    function alternar() {
        if (desabilitado) return;
        setAberto((v) => !v);
    }

    function selecionar(opcao) {
        onChange?.(opcao.value);
        setAberto(false);
    }

    return (
        <Wrapper ref={refWrapper}>
            <BotaoSelect
                type="button"
                onClick={alternar}
                disabled={desabilitado}
                ref={refBotao}
                aria-haspopup="listbox"
                aria-expanded={aberto}
            >
                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    {opcaoSelecionada?.icone && <span style={{ display: 'flex' }}>{opcaoSelecionada.icone}</span>}
                    <Texto $placeholder={!opcaoSelecionada}>
                        {opcaoSelecionada ? opcaoSelecionada.label : placeholder}
                    </Texto>
                </div>
                <FaChevronDown style={{ opacity: 0.85 }} />
            </BotaoSelect>

            {aberto && (
                <Menu role="listbox" $direcao={direcao}>
                    {opcoes.map((o) => {
                        const ativo = o.value === valor;
                        return (
                            <Item
                                key={o.value}
                                type="button"
                                onClick={() => selecionar(o)}
                                aria-selected={ativo}
                            >
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {o.icone && <span style={{ display: 'flex' }}>{o.icone}</span>}
                                    <span>{o.label}</span>
                                </div>
                                {ativo ? <FaCheck style={{ opacity: 0.9 }} /> : <span />}
                            </Item>
                        );
                    })}
                </Menu>
            )}
        </Wrapper>
    );
}
