import html2pdf from "html2pdf.js";

async function urlParaDataUrl(url) {
  if (!url) return "";
  const resp = await fetch(url, { mode: "cors" });
  const blob = await resp.blob();

  return await new Promise((resolve) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(reader.result);
    reader.readAsDataURL(blob);
  });
}

function cssBase() {
  return `
    <style>
      * { box-sizing: border-box; }
      body { margin: 0; padding: 0; font-family: Arial, sans-serif; }
      .pagina {
        width: 210mm;
        min-height: 297mm;
        padding: 14mm;
        background: #ffffff;
      }

      .header {
        width: 100%;
        background: #0a0b0e;
        color: #fff;
        border-radius: 14px;
        padding: 14px;
      }

      /* ✅ tabela = mais estável que flex no html2canvas */
      .headerTabela {
        width: 100%;
        border-collapse: collapse;
      }
      .headerTabela td { vertical-align: middle; }

      .ladoEsquerdo {
        width: 70%;
      }
      .ladoDireito {
        width: 30%;
        text-align: right;
      }

      .marcaTabela {
        border-collapse: collapse;
      }
      .marcaTabela td { vertical-align: middle; }

      .logoBox {
        width: 56px;
        height: 56px;
        border-radius: 12px;
        overflow: hidden;
        border: 1px solid rgba(255,255,255,0.14);
        background: rgba(255,255,255,0.06);
      }
      .logoBox img {
        width: 56px;
        height: 56px;
        object-fit: cover;
        display: block;
      }

      .nomePainel {
        font-size: 16px;
        font-weight: 800;
        line-height: 1.2;
        margin: 0;
      }
      .subtitulo {
        font-size: 12px;
        opacity: 0.70;
        margin-top: 4px;
      }

      .caixaChamado {
        display: inline-block;
        text-align: left;
        background: #ffffff;
        color: #111;
        border-radius: 14px;
        padding: 10px 12px;
        border: 2px solid #38bdf8;
        min-width: 160px;
      }
      .rotuloChamado {
        font-size: 11px;
        font-weight: 800;
        letter-spacing: 0.6px;
      }
      .codigoChamado {
        font-size: 16px;
        font-weight: 900;
        margin-top: 4px;
      }

      .card {
        margin-top: 14px;
        border: 1px solid #e5e7eb;
        border-radius: 14px;
        padding: 14px;
      }

      .linha {
        margin-bottom: 10px;
        font-size: 12.5px;
        color: #111;
      }
      .linha b { font-weight: 800; }

      .descricao {
        margin-top: 6px;
        padding: 10px;
        border-radius: 12px;
        background: #f5f6f8;
        border: 1px solid #e5e7eb;
        white-space: pre-wrap;
      }

      .metas {
        margin-top: 10px;
        border-collapse: collapse;
        width: 100%;
      }
      .metas td {
        padding: 8px 10px;
        border: 1px solid #e5e7eb;
        border-radius: 10px;
        font-size: 12px;
      }

      .rodape {
        margin-top: 12px;
        font-size: 11px;
        color: rgba(0,0,0,0.6);
      }
    </style>
  `;
}

function montarHtml({ chamado, painel, logoDataUrl }) {
  const nomePainel = painel?.nomePainel || "Helpdesk";
  const codigo = chamado?.codigoChamado || `#${String(chamado?.numeroChamado ?? "")}`;

  const criadoEm = chamado?.criadoEm?.toDate
    ? chamado.criadoEm.toDate().toLocaleString()
    : chamado?.criadoEm || "";

  const logoHtml = logoDataUrl ? `<img src="${logoDataUrl}" alt="Logo" />` : ``;

  return `
    ${cssBase()}
    <div class="pagina">
      <div class="header">
        <table class="headerTabela">
          <tr>
            <td class="ladoEsquerdo">
              <table class="marcaTabela">
                <tr>
                  <td style="padding-right: 12px;">
                    <div class="logoBox">
                      ${logoHtml}
                    </div>
                  </td>
                  <td>
                    <div class="nomePainel">${nomePainel}</div>
                    <div class="subtitulo">Comprovante de abertura de chamado</div>
                  </td>
                </tr>
              </table>
            </td>

            <td class="ladoDireito">
              <div class="caixaChamado">
                <div class="rotuloChamado">CHAMADO</div>
                <div class="codigoChamado">${codigo}</div>
              </div>
            </td>
          </tr>
        </table>
      </div>

      <div class="card">
        <div class="linha"><b>Título:</b> ${chamado?.titulo || "-"}</div>
        <div class="linha"><b>Local do problema:</b> ${chamado?.localDoProblema || "-"}</div>

        <table class="metas">
          <tr>
            <td><b>Categoria:</b> ${chamado?.categoriaId || "-"}</td>
            <td><b>Prioridade:</b> ${chamado?.prioridade || "-"}</td>
            <td><b>Status:</b> ${chamado?.status || "-"}</td>
          </tr>
        </table>

        <div class="linha" style="margin-top: 10px;"><b>Descrição:</b></div>
        <div class="descricao">${chamado?.descricao || "-"}</div>

        <div class="linha" style="margin-top: 10px;"><b>Criado por:</b> ${chamado?.criadoPorNome || "-"}</div>
        <div class="linha"><b>Data:</b> ${criadoEm || "-"}</div>
      </div>

      <div class="rodape">
        Guarde este comprovante. Para acompanhar atualizações, consulte pelo número/código do chamado.
      </div>
    </div>
  `;
}

export async function gerarPdfChamadoHtml2pdf({ chamado, painel }) {
  // ✅ embute a logo (mais confiável e offline-friendly)
  let logoDataUrl = "";
  try {
    const urlLogo = painel?.logo?.url256 || "";
    if (urlLogo) logoDataUrl = await urlParaDataUrl(urlLogo);
  } catch {
    logoDataUrl = "";
  }

  const html = montarHtml({ chamado, painel, logoDataUrl });

  const container = document.createElement("div");
  container.innerHTML = html;
  // Importante: usar absolute com opacity 0 para o html2canvas funcionar
  container.style.position = "absolute";
  container.style.left = "0";
  container.style.top = "0";
  container.style.zIndex = "-9999";
  container.style.opacity = "0";
  container.style.pointerEvents = "none";
  container.style.width = "210mm";
  document.body.appendChild(container);

  const nomeArquivo = `${(painel?.nomePainel || "helpdesk").replace(/\s+/g, "_")}_${chamado?.codigoChamado || "chamado"}.pdf`;

  try {
    const pdfUrl = await html2pdf()
      .from(container)
      .set({
        margin: 0,
        filename: nomeArquivo,
        image: { type: "jpeg", quality: 0.98 },
        html2canvas: {
          scale: 2,
          useCORS: true,
          backgroundColor: "#ffffff",
          logging: false,
          windowWidth: 794, // A4 width in pixels at 96dpi
        },
        jsPDF: { unit: "mm", format: "a4", orientation: "portrait" },
        pagebreak: { mode: ["avoid-all", "css", "legacy"] },
      })
      .outputPdf("bloburl");

    window.open(pdfUrl, "_blank");
  } finally {
    document.body.removeChild(container);
  }
}
