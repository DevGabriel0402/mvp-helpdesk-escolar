import { useMemo, useRef } from "react";
import html2canvas from "html2canvas";
import { toast } from "react-toastify";
import styled from "styled-components";
import Modal from "../ui/Modal";
import { Botao } from "../ui/Botao";
import { Cartao } from "../ui/Cartao";

const Linha = styled.div`
  display: grid;
  gap: 10px;
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

import { jsPDF } from "jspdf";

// ... (existing styled components)

export default function ModalChamadoCriado({ aberto, aoFechar, dados }) {
    const refArea = useRef(null);

    const dataFormatada = useMemo(() => {
        return dados?.dataCriacao ? formatarDataBr(dados.dataCriacao) : "";
    }, [dados]);

    async function copiarCodigo() {
        try {
            await navigator.clipboard.writeText(dados.codigoChamado);
            toast.success("Codigo copiado!");
        } catch {
            toast.info("Nao foi possivel copiar automaticamente. Selecione e copie manualmente.");
        }
    }

    async function baixarComprovanteImagem() {
        if (!refArea.current) return;

        try {
            const canvas = await html2canvas(refArea.current, {
                backgroundColor: "#ffffff",
                scale: 2
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

    function baixarPDF() {
        try {
            const doc = new jsPDF();

            // Cores
            const corPrimaria = [31, 41, 55]; // Dark Grey #1f2937
            const corFundo = [245, 247, 250]; // Light Grey
            const corTexto = [50, 50, 50];

            // Cabeçalho
            doc.setFillColor(...corPrimaria);
            doc.rect(0, 0, 210, 40, "F");

            doc.setTextColor(255, 255, 255);
            doc.setFontSize(22);
            doc.setFont("helvetica", "bold");
            doc.text("HelpDesk Escola", 105, 20, { align: "center" });

            doc.setFontSize(12);
            doc.setFont("helvetica", "normal");
            doc.text("Comprovante de Abertura de Chamado", 105, 30, { align: "center" });

            // Caixa do Código
            doc.setDrawColor(200, 200, 200);
            doc.setFillColor(...corFundo);
            doc.roundedRect(20, 55, 170, 30, 3, 3, "FD");

            doc.setFontSize(10);
            doc.setTextColor(100, 100, 100);
            doc.text("CÓDIGO DO CHAMADO", 105, 65, { align: "center" });

            doc.setFontSize(18);
            doc.setTextColor(...corPrimaria);
            doc.setFont("courier", "bold");
            doc.text(dados?.codigoChamado || "---", 105, 78, { align: "center" });

            // Detalhes
            let y = 110;
            const linhaAltura = 10;
            const xLabel = 20;
            const xValor = 70;

            doc.setFont("helvetica", "normal");

            function adicionarLinha(rotulo, valor) {
                doc.setFontSize(11);
                doc.setTextColor(120, 120, 120);
                doc.text(rotulo, xLabel, y);

                doc.setFontSize(11);
                doc.setTextColor(...corTexto);
                // Quebrar texto se for muito longo (para Descrição/Título)
                const valorSplit = doc.splitTextToSize(valor || "-", 120);
                doc.text(valorSplit, xValor, y);

                // Calcular nova posição Y baseada na altura do texto
                y += (valorSplit.length * 6) + 8;
            }

            adicionarLinha("Data:", dataFormatada);
            adicionarLinha("Solicitante:", dados?.solicitante || "Anônimo");
            adicionarLinha("Local:", dados?.localDoProblema);
            adicionarLinha("Categoria:", dados?.categoriaLabel);
            adicionarLinha("Prioridade:", dados?.prioridadeLabel?.toUpperCase());

            // Linha divisória
            doc.setDrawColor(230, 230, 230);
            doc.line(20, y, 190, y);
            y += 10;

            adicionarLinha("Título:", dados?.titulo);
            adicionarLinha("Descrição:", dados?.descricao);

            // Rodapé
            doc.setFontSize(9);
            doc.setTextColor(150, 150, 150);
            doc.text("Este documento serve como comprovante de solicitação.", 105, 270, { align: "center" });
            doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, 105, 275, { align: "center" });

            doc.save(`chamado_${dados?.codigoChamado || "novo"}.pdf`);
            toast.success("PDF baixado com sucesso!");

        } catch (e) {
            console.error(e);
            toast.error("Erro ao gerar PDF.");
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
                                Categoria: {dados?.categoriaLabel} • Prioridade: {dados?.prioridadeLabel}
                            </TextoFraco>
                        </div>

                        <div style={{ marginTop: 10 }}>
                            <TextoFraco>Descricao geral</TextoFraco>
                            <div style={{ marginTop: 6 }}>{dados?.descricao || "Sem descricao"}</div>
                        </div>
                    </CaixaComprovante>
                </div>

                <div style={{ display: "grid", gap: 10 }}>
                    <Botao $larguraTotal onClick={copiarCodigo}>Copiar codigo</Botao>
                    <Botao $larguraTotal onClick={baixarComprovanteImagem}>Baixar comprovante (imagem)</Botao>
                    <Botao $larguraTotal onClick={baixarPDF}>Baixar PDF Personalizado</Botao>
                    <Botao $larguraTotal onClick={aoFechar}>Ok, entendi</Botao>
                </div>
            </Linha>
        </Modal>
    );
}
