import { useMemo, useRef, useState } from "react";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import styled from "styled-components";
import { FaCopy, FaDownload, FaFilePdf, FaCheck } from "react-icons/fa";
import Modal from "../ui/Modal";
import { Cartao } from "../ui/Cartao";
import { gerarPdfChamado } from "../../utils/gerarPdfChamado";

const Linha = styled.div`
  display: grid;
  gap: 10px;
`;

const BotoesAcao = styled.div`
  display: flex;
  justify-content: center;
  gap: 12px;
  margin-top: 8px;
`;

const BotaoIcone = styled.button`
  width: 52px;
  height: 52px;
  border-radius: 14px;
  border: 1px solid ${({ theme }) => theme.cores.borda};
  background: ${({ theme }) => theme.cores.vidro};
  color: ${({ theme }) => theme.cores.texto};
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 4px;
  cursor: pointer;
  transition: all 0.2s;
  font-size: 10px;

  svg {
    font-size: 18px;
  }

  &:hover {
    background: ${({ theme }) => theme.cores.primaria};
    color: white;
    border-color: ${({ theme }) => theme.cores.primaria};
  }

  &:active {
    transform: scale(0.95);
  }
`;

const CaixaComprovante = styled(Cartao)`
  padding: 12px;
  background: ${({ theme }) => theme.cores.fundo}; /* Better contrast for screenshot */
  border: 1px solid ${({ theme }) => theme.cores.borda};
`;

const TextoFraco = styled.div`
  color: ${({ theme }) => theme.cores.textoFraco};
  font-size: 14px;
`;

const Codigo = styled.div`
  font-size: 20px;
  font-weight: 900;
  letter-spacing: 0.5px;
  margin-top: 6px;
  color: ${({ theme }) => theme.cores.texto};
`;

function formatarDataBr(data) {
  return new Date(data).toLocaleString("pt-BR");
}

export default function ModalChamadoCriado({ aberto, aoFechar, dados, painel }) {
  const refArea = useRef(null);
  const [gerandoPdf, setGerandoPdf] = useState(false);

  const dataFormatada = useMemo(() => {
    return dados?.dataCriacao ? formatarDataBr(dados.dataCriacao) : "";
  }, [dados]);

  async function copiarCodigo() {
    try {
      await navigator.clipboard.writeText(dados.codigoChamado);
      toast.success("Codigo copiado!");
    } catch {
      toast.info(
        "Nao foi possivel copiar automaticamente. Selecione e copie manualmente.",
      );
    }
  }

  async function baixarComprovanteImagem() {
    if (!refArea.current) return;

    try {
      const canvas = await html2canvas(refArea.current, {
        backgroundColor: "#ffffff",
        scale: 2,
      });
      const url = canvas.toDataURL("image/png");

      const a = document.createElement("a");
      a.href = url;
      a.download = `comprovante_${dados.codigoChamado}.png`;
      a.click();

      toast.success("Comprovante baixado (imagem).");
    } catch (e) {
      console.error(e);
      toast.error("Nao foi possivel gerar o comprovante.");
    }
  }

  async function baixarPDF() {
    if (gerandoPdf) return;
    setGerandoPdf(true);

    try {
      // Monta o objeto chamado no formato esperado pelo gerador
      const chamadoParaPdf = {
        codigoChamado: dados?.codigoChamado,
        numeroChamado: dados?.numeroChamado,
        titulo: dados?.titulo,
        descricao: dados?.descricao,
        localDoProblema: dados?.localDoProblema,
        categoriaId: dados?.categoriaLabel || dados?.categoriaId,
        prioridade: dados?.prioridadeLabel || dados?.prioridade || null,
        status: dados?.status || "Aberto",
        criadoPorNome: dados?.solicitante || "Anônimo",
        criadoEm: dados?.dataCriacao,
      };

      await gerarPdfChamado({ chamado: chamadoParaPdf, painel });
      toast.success("PDF baixado com sucesso!");
    } catch (e) {
      console.error(e);
      toast.error("Erro ao gerar PDF.");
    } finally {
      setGerandoPdf(false);
    }
  }

  return (
    <Modal aberto={aberto} aoFechar={aoFechar} titulo="Chamado criado com sucesso">
      <Linha>
        <TextoFraco>
          **Anote o numero do chamado** para acompanhar atualizacoes na aba <b>Buscar</b>.
        </TextoFraco>

        <div ref={refArea}>
          <CaixaComprovante>
            <TextoFraco>Codigo do chamado</TextoFraco>
            <Codigo>{dados?.codigoChamado}</Codigo>

            <div style={{ marginTop: 10 }}>
              <TextoFraco>Data</TextoFraco>
              <div style={{ fontWeight: 700 }}>{dataFormatada}</div>
            </div>

            <div style={{ marginTop: 10 }}>
              <TextoFraco>Resumo</TextoFraco>
              <div style={{ fontWeight: 700 }}>
                {dados?.titulo} — {dados?.localDoProblema}
              </div>
              <TextoFraco style={{ marginTop: 6 }}>
                Categoria: {dados?.categoriaLabel}
                {dados?.prioridadeLabel && ` • Prioridade: ${dados?.prioridadeLabel}`}
              </TextoFraco>
            </div>

            <div style={{ marginTop: 10 }}>
              <TextoFraco>Descricao geral</TextoFraco>
              <div style={{ marginTop: 6 }}>{dados?.descricao || "Sem descricao"}</div>
            </div>
          </CaixaComprovante>
        </div>

        <BotoesAcao>
          <BotaoIcone onClick={copiarCodigo} title="Copiar código">
            <FaCopy />
            <span>Copiar</span>
          </BotaoIcone>
          <BotaoIcone onClick={baixarComprovanteImagem} title="Baixar imagem">
            <FaDownload />
            <span>Imagem</span>
          </BotaoIcone>
          <BotaoIcone onClick={baixarPDF} title="Baixar PDF" disabled={gerandoPdf}>
            <FaFilePdf />
            <span>{gerandoPdf ? "..." : "PDF"}</span>
          </BotaoIcone>
          <BotaoIcone onClick={aoFechar} title="Fechar">
            <FaCheck />
            <span>OK</span>
          </BotaoIcone>
        </BotoesAcao>
      </Linha>
    </Modal>
  );
}
