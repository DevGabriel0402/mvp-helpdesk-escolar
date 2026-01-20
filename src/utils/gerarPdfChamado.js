import { jsPDF } from "jspdf";

/**
 * Converte imagem URL para base64 (dataURL)
 */
async function urlParaDataUrl(url) {
  if (!url) return null;
  try {
    const resp = await fetch(url, { mode: "cors" });
    const blob = await resp.blob();
    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return null;
  }
}

/**
 * Gera PDF do chamado usando jsPDF puro (sem html2canvas)
 */
export async function gerarPdfChamado({ chamado, painel }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Cores (paleta ultra soft)
  const corHeader = [241, 245, 249]; // #f1f5f9 - cinza bem claro
  const corTextoHeader = [71, 85, 105]; // #475569 - texto do header
  const corTexto = [51, 65, 85]; // #334155
  const corFraco = [148, 163, 184]; // #94a3b8
  const corBorda = [226, 232, 240]; // #e2e8f0
  const corFundoDesc = [248, 250, 252]; // #f8fafc
  const corAzul = [186, 230, 253]; // #bae6fd - azul quase transparente

  // Dados
  const nomePainel = painel?.nomePainel || "Helpdesk";
  const codigo = chamado?.codigoChamado || `#${chamado?.numeroChamado || ""}`;
  const criadoEm = chamado?.criadoEm?.toDate
    ? chamado.criadoEm.toDate().toLocaleString("pt-BR")
    : chamado?.criadoEm || "-";

  // ========== HEADER ==========
  doc.setFillColor(...corHeader);
  doc.roundedRect(margin, margin, contentWidth, 28, 4, 4, "F");

  // Logo (se disponível)
  let logoX = margin + 6;
  const logoY = margin + 5;
  const logoSize = 18;
  let logoLoaded = false;

  try {
    const urlLogo = painel?.logo?.url256 || "";
    if (urlLogo) {
      const logoDataUrl = await urlParaDataUrl(urlLogo);
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", logoX, logoY, logoSize, logoSize);
        logoLoaded = true;
      }
    }
  } catch {
    // sem logo
  }

  // Nome do painel
  const textX = logoLoaded ? logoX + logoSize + 6 : margin + 10;
  doc.setTextColor(...corTextoHeader);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(nomePainel, textX, margin + 13);

  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...corFraco);
  doc.text("Comprovante de abertura de chamado", textX, margin + 20);

  // Caixa do código (lado direito)
  const caixaW = 48;
  const caixaH = 20;
  const caixaX = margin + contentWidth - caixaW - 6;
  const caixaY = margin + 4;

  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...corAzul);
  doc.setLineWidth(0.6);
  doc.roundedRect(caixaX, caixaY, caixaW, caixaH, 3, 3, "FD");

  doc.setTextColor(...corFraco);
  doc.setFontSize(7);
  doc.setFont("helvetica", "bold");
  doc.text("NÚMERO DO CHAMADO", caixaX + 4, caixaY + 7);

  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text(codigo, caixaX + 4, caixaY + 15);

  // ========== CARD DE DETALHES ==========
  let y = margin + 36;

  doc.setDrawColor(...corBorda);
  doc.setLineWidth(0.3);
  doc.roundedRect(margin, y, contentWidth, 110, 4, 4, "S");

  y += 10;
  const labelX = margin + 8;
  const valueX = margin + 50;

  function addLinha(label, value, maxWidth = 120) {
    doc.setTextColor(...corFraco);
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.text(label, labelX, y);

    doc.setTextColor(...corTexto);
    doc.setFont("helvetica", "normal");
    const lines = doc.splitTextToSize(value || "-", maxWidth);
    doc.text(lines, valueX, y);

    y += lines.length * 5 + 4;
  }

  addLinha("Título:", chamado?.titulo);
  addLinha("Local:", chamado?.localDoProblema);

  // Metas em linha
  y += 2;
  doc.setFillColor(...corFundoDesc);
  doc.roundedRect(margin + 6, y - 4, contentWidth - 12, 14, 2, 2, "F");

  doc.setFontSize(9);
  const metaY = y + 4;

  doc.setTextColor(...corFraco);
  doc.setFont("helvetica", "bold");
  doc.text("Categoria:", margin + 10, metaY);
  doc.setTextColor(...corTexto);
  doc.setFont("helvetica", "normal");
  doc.text(chamado?.categoriaId || "-", margin + 32, metaY);

  doc.setTextColor(...corFraco);
  doc.setFont("helvetica", "bold");
  doc.text("Prioridade:", margin + 65, metaY);
  doc.setTextColor(...corTexto);
  doc.setFont("helvetica", "normal");
  doc.text(chamado?.prioridade || "-", margin + 90, metaY);

  doc.setTextColor(...corFraco);
  doc.setFont("helvetica", "bold");
  doc.text("Status:", margin + 120, metaY);
  doc.setTextColor(...corTexto);
  doc.setFont("helvetica", "normal");
  doc.text(chamado?.status || "Aberto", margin + 138, metaY);

  y += 16;

  // Descrição
  doc.setTextColor(...corFraco);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text("Descrição:", labelX, y);
  y += 5;

  doc.setFillColor(...corFundoDesc);
  const descLines = doc.splitTextToSize(chamado?.descricao || "-", contentWidth - 20);
  const descHeight = Math.max(descLines.length * 5 + 8, 20);
  doc.roundedRect(margin + 6, y - 3, contentWidth - 12, descHeight, 2, 2, "F");

  doc.setTextColor(...corTexto);
  doc.setFont("helvetica", "normal");
  doc.setFontSize(9);
  doc.text(descLines, margin + 10, y + 3);

  y += descHeight + 6;

  addLinha("Criado por:", chamado?.criadoPorNome || "Anônimo");
  addLinha("Data:", criadoEm);

  // ========== RODAPÉ ==========
  y = margin + 155;
  doc.setTextColor(...corFraco);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.text(
    "Guarde este comprovante. Para acompanhar atualizações, consulte pelo código do chamado.",
    margin,
    y,
  );

  doc.setFontSize(8);
  doc.text(`Gerado em ${new Date().toLocaleString("pt-BR")}`, margin, y + 6);

  // Salvar
  const nomeArquivo = `${(painel?.nomePainel || "helpdesk").replace(/\s+/g, "_")}_${chamado?.codigoChamado || "chamado"}.pdf`;
  doc.save(nomeArquivo);
}
