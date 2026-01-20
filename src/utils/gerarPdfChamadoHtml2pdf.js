import html2pdf from "html2pdf.js";

async function imagemParaDataUrl(url) {
  if (!url) return "";
  try {
    const resp = await fetch(url, { mode: "cors" });
    const blob = await resp.blob();

    return await new Promise((resolve) => {
      const reader = new FileReader();
      reader.onloadend = () => resolve(reader.result);
      reader.readAsDataURL(blob);
    });
  } catch {
    return "";
  }
}

function montarHtml({ chamado, painel, logoDataUrl }) {
  const nomePainel = painel?.nomePainel || "Helpdesk";
  const codigo = chamado?.codigoChamado || `#${chamado?.numeroChamado || ""}`;

  const criadoEm = chamado?.criadoEm?.toDate
    ? chamado.criadoEm.toDate().toLocaleString("pt-BR")
    : chamado?.criadoEm || "";

  return `
  <div style="font-family: Arial, sans-serif; padding: 18px;">
    <div style="
      display:flex; justify-content:space-between; align-items:center;
      background:#0a0b0e; color:#fff; padding:14px; border-radius:12px;
    ">
      <div style="display:flex; gap:12px; align-items:center;">
        <div style="
          width:56px;height:56px;border-radius:12px; overflow:hidden;
          border:1px solid rgba(255,255,255,0.12); background:rgba(255,255,255,0.06);
          display:flex; align-items:center; justify-content:center;
        ">
          ${
            logoDataUrl
              ? `<img src="${logoDataUrl}" style="width:56px;height:56px;object-fit:cover;" />`
              : `<div style="width:56px;height:56px;"></div>`
          }
        </div>
        <div>
          <div style="font-size:16px; font-weight:700; line-height:1.2;">${nomePainel}</div>
          <div style="font-size:12px; opacity:0.65;">Comprovante de abertura de chamado</div>
        </div>
      </div>

      <div style="
        background:#fff; color:#111; border-radius:12px; padding:10px 14px;
        min-width:170px; border:2px solid #38bdf8; text-align:left;
      ">
        <div style="font-size:11px; font-weight:700; letter-spacing:0.6px;">CHAMADO</div>
        <div style="font-size:16px; font-weight:800; margin-top:3px;">${codigo}</div>
      </div>
    </div>

    <div style="margin-top:16px; border:1px solid #e5e7eb; border-radius:12px; padding:14px;">
      <div style="display:grid; gap:10px;">
        <div><b>Título:</b> ${chamado?.titulo || "-"}</div>
        <div><b>Descrição:</b><br/>${(chamado?.descricao || "-").replace(/\n/g, "<br/>")}</div>
        <div><b>Local do problema:</b> ${chamado?.localDoProblema || "-"}</div>
        <div style="display:flex; gap:18px; flex-wrap:wrap;">
          <div><b>Categoria:</b> ${chamado?.categoriaId || "-"}</div>
          <div><b>Prioridade:</b> ${chamado?.prioridade || "-"}</div>
          <div><b>Status:</b> ${chamado?.status || "-"}</div>
        </div>
        <div><b>Criado por:</b> ${chamado?.criadoPorNome || "-"}</div>
        <div><b>Data:</b> ${criadoEm || "-"}</div>
      </div>
    </div>

    <div style="margin-top:12px; font-size:11px; opacity:0.65;">
      Guarde este comprovante para consultar atualizações do chamado.
    </div>
  </div>
  `;
}

export async function gerarPdfChamadoHtml2pdf({ chamado, painel }) {
  // tenta embutir a logo (melhor pra offline e evita CORS)
  let logoDataUrl = "";
  try {
    const urlLogo = painel?.logo?.url256 || "";
    if (urlLogo) logoDataUrl = await imagemParaDataUrl(urlLogo);
  } catch {
    logoDataUrl = "";
  }

  const html = montarHtml({ chamado, painel, logoDataUrl });

  const container = document.createElement("div");
  container.innerHTML = html;
  container.style.position = "fixed";
  container.style.left = "-99999px";
  container.style.top = "0";
  document.body.appendChild(container);

  const nomeArquivo = `${(painel?.nomePainel || "helpdesk").replace(/\s+/g, "_")}_${chamado?.codigoChamado || "chamado"}.pdf`;

  await html2pdf()
    .from(container)
    .set({
      margin: 10,
      filename: nomeArquivo,
      image: { type: "jpeg", quality: 0.98 },
      html2canvas: { scale: 2, useCORS: true },
      jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
    })
    .save();

  document.body.removeChild(container);
}
