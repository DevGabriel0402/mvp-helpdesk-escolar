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
/**
 * Gera PDF do chamado usando jsPDF puro (sem html2canvas)
 */
export async function gerarPdfChamado({ chamado, painel, atualizacoes = [], comentarios = [] }) {
  const doc = new jsPDF({ unit: "mm", format: "a4" });
  const pageWidth = 210;
  const pageHeight = 297;
  const margin = 14;
  const contentWidth = pageWidth - margin * 2;

  // Cores (paleta ultra soft)
  const corHeader = [241, 245, 249]; // #f1f5f9
  const corTextoHeader = [71, 85, 105]; // #475569
  const corTexto = [51, 65, 85]; // #334155
  const corFraco = [148, 163, 184]; // #94a3b8
  const corBorda = [226, 232, 240]; // #e2e8f0
  const corFundoDesc = [248, 250, 252]; // #f8fafc
  const corAzul = [186, 230, 253]; // #bae6fd

  const formatarDataPdf = (data) => {
    if (!data) return "-";
    let d = data;
    if (data.toDate) d = data.toDate();
    else if (typeof data === "number" || typeof data === "string") d = new Date(data);
    if (isNaN(d.getTime())) return String(data);
    return `${d.toLocaleDateString("pt-BR")} - ${d.toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`;
  };

  const checkPageBreak = (currentY, needed) => {
    if (currentY + needed > pageHeight - 20) {
      doc.addPage();
      return margin + 10;
    }
    return currentY;
  };

  const codigo = chamado?.codigoChamado || `#${chamado?.numeroChamado || ""}`;
  const criadoEm = formatarDataPdf(chamado?.criadoEm);

  // ========== HEADER ==========
  doc.setFillColor(...corHeader);
  doc.roundedRect(margin, margin, contentWidth, 28, 4, 4, "F");

  let logoLoaded = false;
  try {
    const urlLogo = painel?.logo?.url256 || "";
    if (urlLogo) {
      const logoDataUrl = await urlParaDataUrl(urlLogo);
      if (logoDataUrl) {
        doc.addImage(logoDataUrl, "PNG", margin + 6, margin + 5, 18, 18);
        logoLoaded = true;
      }
    }
  } catch { }

  const textX = logoLoaded ? margin + 30 : margin + 10;
  doc.setTextColor(...corTextoHeader);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(painel?.nomePainel || "Helpdesk", textX, margin + 13);
  doc.setFontSize(9);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...corFraco);
  doc.text("Detalhamento Completo do Chamado", textX, margin + 20);

  const caixaW = 58;
  const caixaX = margin + contentWidth - caixaW - 6;
  doc.setFillColor(255, 255, 255);
  doc.setDrawColor(...corAzul);
  doc.roundedRect(caixaX, margin + 2, caixaW, 24, 3, 3, "FD");
  doc.setTextColor(...corTexto);
  doc.setFontSize(20);
  doc.setFont("helvetica", "bold");
  doc.text(codigo, caixaX + caixaW / 2, margin + 16, { align: "center" });

  let y = margin + 36;

  // Detalhes Básicos
  doc.setDrawColor(...corBorda);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...corFraco);
  doc.text("Informações do Chamado", margin, y);
  y += 6;

  function addCampo(label, value, currentY) {
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...corFraco);
    doc.text(label, margin + 5, currentY);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(...corTexto);
    const lines = doc.splitTextToSize(value || "-", contentWidth - 50);
    doc.text(lines, margin + 45, currentY);
    return currentY + (lines.length * 5) + 2;
  }

  y = addCampo("Título:", chamado?.titulo, y);
  y = addCampo("Localização:", chamado?.localDoProblema, y);
  y = addCampo("Categoria:", chamado?.categoriaId, y);
  y = addCampo("Prioridade:", chamado?.prioridade, y);
  y = addCampo("Status Atual:", chamado?.status, y);
  y = addCampo("Aberto por:", chamado?.criadoPorNome, y);
  y = addCampo("Data Abertura:", criadoEm, y);

  y += 4;
  doc.setFont("helvetica", "bold");
  doc.setTextColor(...corFraco);
  doc.text("Descrição:", margin + 5, y);
  y += 5;
  const descLines = doc.splitTextToSize(chamado?.descricao || "-", contentWidth - 15);
  doc.setFillColor(...corFundoDesc);
  doc.roundedRect(margin + 5, y - 4, contentWidth - 10, (descLines.length * 5) + 6, 2, 2, "F");
  doc.setFont("helvetica", "normal");
  doc.setTextColor(...corTexto);
  doc.text(descLines, margin + 8, y + 1);
  y += (descLines.length * 5) + 12;

  const drawTimelineLine = (startY, endY) => {
    doc.setDrawColor(226, 232, 240); // corBorda
    doc.setLineWidth(0.5);
    doc.line(margin + 8, startY, margin + 8, endY);
  };

  const drawTimelineIcon = (yCoord) => {
    const xIcon = margin + 8;
    // Círculo de fundo unificado (azul suave)
    doc.setFillColor(...corFundoDesc);
    doc.setDrawColor(226, 232, 240);
    doc.circle(xIcon, yCoord - 1, 2.5, "FD");
  };

  // Histórico de Atualizações
  if (atualizacoes && atualizacoes.length > 0) {
    y = checkPageBreak(y, 25);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...corFraco);
    doc.setFontSize(10);
    doc.text("Histórico de Mudanças", margin, y);
    y += 10;

    let startTimelineY = y - 5;

    atualizacoes.forEach((att, idx) => {
      const formatarValor = (v) => {
        const nomes = {
          aberto: "Recebido", andamento: "Em Andamento", prodabel: "Prodabel", resolvido: "Resolvido",
          baixa: "Baixa", normal: "Normal", alta: "Alta", urgente: "Urgente",
        };
        return nomes[v] || v;
      };

      let textoAtt = "";
      if (att.tipo === "mudanca_status") {
        textoAtt = `${att.adminNome || "Sistema"} alterou o status para ${formatarValor(att.para)}`;
      } else if (att.tipo === "mudanca_prioridade") {
        textoAtt = `${att.adminNome || "O administrador"} atualizou a prioridade para ${formatarValor(att.para)}`;
      } else if (att.tipo === "criacao") {
        textoAtt = "Chamado Criado";
      } else if (att.tipo === "nota" && att.texto?.startsWith("Prioridade:")) {
        // Fallback para logs antigos
        const val = att.texto.split(": ")[1];
        textoAtt = `${att.adminNome || "O administrador"} atualizou a prioridade para ${val}`;
      } else if (att.tipo === "nota") {
        const prefixo = att.adminNome ? "Nova atualização do suporte: " : "";
        textoAtt = `${prefixo}${att.texto || "Atualização no chamado"}`;
      } else {
        textoAtt = att.texto || "Atualização no chamado";
      }

      const dataAtt = formatarDataPdf(att.criadoEm);
      const attLines = doc.splitTextToSize(textoAtt, contentWidth - 25);

      const isPrio = att.tipo === "mudanca_prioridade" || (att.tipo === "nota" && att.texto?.startsWith("Prioridade:"));
      const isStatus = att.tipo === "mudanca_status";
      const needed = (attLines.length * 5) + ((isPrio || isStatus) ? 15 : 10);

      y = checkPageBreak(y, needed);
      const iconY = y; // Posição do ícone atual
      drawTimelineIcon(iconY);

      // 1. Título
      doc.setTextColor(...corTexto);
      doc.setFontSize(9);

      if (att.tipo === "nota" && !att.texto?.startsWith("Prioridade:")) {
        const prefixo = att.adminNome ? "Nova atualização do suporte: " : "";
        const notaLimpa = att.texto || "Atualização no chamado";

        if (prefixo) {
          // Versão Mista: Prefixo Negrito + Texto Normal
          doc.setFont("helvetica", "bold");
          doc.text(prefixo, margin + 15, y);

          const larguraPrefixo = doc.getTextWidth(prefixo);
          doc.setFont("helvetica", "normal");

          // Precisamos quebrar o texto da nota considerando o espaço ocupado pelo prefixo na primeira linha
          const restoNotaLines = doc.splitTextToSize(notaLimpa, contentWidth - 25 - larguraPrefixo);
          const primeiraLinhaNota = restoNotaLines[0];

          doc.text(primeiraLinhaNota, margin + 15 + larguraPrefixo, y);

          // Se houver mais linhas, elas voltam para a margem normal
          if (restoNotaLines.length > 1) {
            const notaCompletaResto = notaLimpa.substring(primeiraLinhaNota.length).trim();
            const linhasRestantes = doc.splitTextToSize(notaCompletaResto, contentWidth - 25);
            y += 5;
            doc.text(linhasRestantes, margin + 15, y);
            y += (linhasRestantes.length * 5) - 5;
          }
        } else {
          // Nota comum sem prefixo
          doc.setFont("helvetica", "normal");
          doc.text(attLines, margin + 15, y);
        }
      } else {
        // Atualizações de sistema (Negrito)
        doc.setFont("helvetica", "bold");
        doc.text(attLines, margin + 15, y);
      }

      const totalLinesHeight = (attLines.length * 5);
      y = checkPageBreak(iconY + totalLinesHeight, 5); // Garante que a data/hora caiba
      y = iconY + totalLinesHeight;

      // 2. Data/Hora
      doc.setFont("helvetica", "normal");
      doc.setTextColor(...corFraco);
      doc.setFontSize(7);
      doc.text(dataAtt, margin + 15, y);
      y += 5;

      // 3. Sub-linhas específicas
      if (isPrio) {
        const cores = { baixa: [50, 200, 255], normal: [16, 185, 129], alta: [249, 115, 22], urgente: [178, 79, 255] };
        let valor = att.para;
        if (att.tipo === "nota" && att.texto) {
          doc.setFont("helvetica", "normal");
          valor = att.texto.split(": ")[1]?.toLowerCase();
        }
        const corFinal = cores[valor] || [128, 128, 128];
        const labelPrio = valor ? valor.charAt(0).toUpperCase() + valor.slice(1) : "";

        doc.setTextColor(...corFinal);
        doc.setFont("helvetica", "bold");
        doc.setFontSize(8);
        y += 5;
      } else if (isStatus) {
        const nomes = { aberto: "Recebido", andamento: "Em Andamento", prodabel: "Prodabel", resolvido: "Resolvido" };
        const de = nomes[att.de] || att.de || "Início";
        const para = nomes[att.para] || att.para;
        const textoStatus = (att.de === "aberto" && att.para === "aberto")
          ? `Criado -> ${para}`
          : `${de} -> ${para}`;

        doc.setTextColor(...corTexto);
        doc.setFont("helvetica", "normal");
        doc.setFontSize(8);

        y += 5;
      }

      if (idx < atualizacoes.length - 1 || (comentarios && comentarios.length > 0)) {
        drawTimelineLine(iconY + 2.5, y - 2);
      }
    });
    y += 5;
  }

  // Comentários/Notas
  if (comentarios && comentarios.length > 0) {
    y = checkPageBreak(y, 25);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(...corFraco);
    doc.setFontSize(10);
    doc.text("Conversa e Notas", margin, y);
    y += 10;

    comentarios.forEach((com, idx) => {
      const autor = com.nome || "Anônimo";
      const papel = com.papel ? ` (${com.papel})` : "";
      const dataCom = formatarDataPdf(com.criadoEm);
      const prefixo = (com.papel === "admin") ? "nova atualização do suporte: " : "";
      const textoCom = `${prefixo}${com.mensagem || ""}`;

      const headerCom = `${autor}${papel} - ${dataCom}`;
      const bodyLines = doc.splitTextToSize(textoCom, contentWidth - 30);

      const needed = (bodyLines.length * 5) + 15;
      y = checkPageBreak(y, needed);

      drawTimelineIcon(y);

      doc.setFillColor(...corFundoDesc);
      doc.roundedRect(margin + 15, y - 4, contentWidth - 20, (bodyLines.length * 5) + 10, 2, 2, "F");

      doc.setFont("helvetica", "bold");
      doc.setTextColor(...corTextoHeader);
      doc.setFontSize(8);
      doc.text(headerCom, margin + 18, y + 1);

      doc.setFont("helvetica", "normal");
      doc.setTextColor(...corTexto);
      doc.text(bodyLines, margin + 18, y + 6);

      const oldY = y;
      y += needed;

      if (idx < comentarios.length - 1) {
        drawTimelineLine(oldY + 2.5, y - 1);
      }
    });
  }

  // Rodapé em todas as páginas se necessário, mas aqui faremos no final
  y = checkPageBreak(y, 20);
  doc.setFontSize(8);
  doc.setTextColor(...corFraco);
  doc.text(
    `Gerado em ${new Date().toLocaleDateString("pt-BR")} - ${new Date().toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}`,
    margin,
    pageHeight - 10,
  );

  const blobUrl = doc.output("bloburl");
  window.open(blobUrl, "_blank");
}
