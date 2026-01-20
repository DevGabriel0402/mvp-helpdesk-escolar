/**
 * Adiciona indicador de status (online/offline) ao favicon
 * Desenha uma bolinha verde ou vermelha no canto do favicon
 */

let faviconOriginal = null;
let ultimoStatus = null;

// Busca a URL do favicon original (prioriza o salvo no localStorage)
function obterFaviconOriginal() {
  if (faviconOriginal) return faviconOriginal;

  // Tenta buscar do localStorage (logo do painel)
  try {
    const painelSalvo = localStorage.getItem("painel_publico");
    if (painelSalvo) {
      const dados = JSON.parse(painelSalvo);
      if (dados?.logoUrl) {
        faviconOriginal = dados.logoUrl;
        return faviconOriginal;
      }
    }
  } catch {
    // ignora erro de parse
  }

  const link =
    document.querySelector("link[rel='icon']") ||
    document.querySelector("link[rel='shortcut icon']");

  if (link?.href) {
    faviconOriginal = link.href;
    return faviconOriginal;
  }

  // Fallback para favicon padrão
  return "/favicon.ico";
}

// Desenha o favicon com a bolinha de status
function desenharFaviconComStatus(online) {
  const canvas = document.createElement("canvas");
  const ctx = canvas.getContext("2d");
  const size = 40;
  canvas.width = size;
  canvas.height = size;

  const img = new Image();
  img.crossOrigin = "anonymous";

  img.onload = () => {
    // Desenha o favicon original
    ctx.drawImage(img, 0, 0, size, size);

    // Desenha a bolinha de status no canto inferior direito
    const raio = 6;
    const x = size - raio - 2;
    const y = size - raio - 2;

    // Sombra para contraste
    ctx.beginPath();
    ctx.arc(x, y, raio + 1, 0, Math.PI * 2);
    ctx.fillStyle = "rgba(0, 0, 0, 0.3)";
    ctx.fill();

    // Bolinha colorida
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = online ? "#22c55e" : "#ef4444";
    ctx.fill();

    // Borda branca
    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    // Aplica o novo favicon
    aplicarFavicon(canvas.toDataURL("image/png"));
  };

  img.onerror = () => {
    // Se não conseguir carregar a imagem, cria um favicon simples
    ctx.fillStyle = "#3b82f6";
    ctx.fillRect(0, 0, size, size);

    // Bolinha de status
    const raio = 6;
    const x = size - raio - 2;
    const y = size - raio - 2;

    ctx.beginPath();
    ctx.arc(x, y, raio, 0, Math.PI * 2);
    ctx.fillStyle = online ? "#22c55e" : "#ef4444";
    ctx.fill();
    ctx.strokeStyle = "#ffffff";
    ctx.lineWidth = 1.5;
    ctx.stroke();

    aplicarFavicon(canvas.toDataURL("image/png"));
  };

  img.src = obterFaviconOriginal();
}

// Aplica uma URL de favicon
function aplicarFavicon(url) {
  let link = document.querySelector("link[rel='icon']");

  if (!link) {
    link = document.createElement("link");
    link.rel = "icon";
    document.head.appendChild(link);
  }

  link.href = url;
}

// Atualiza o status no favicon
export function atualizarFaviconStatus(online) {
  // Evita redesenhar se o status não mudou
  if (ultimoStatus === online) return;
  ultimoStatus = online;

  desenharFaviconComStatus(online);
}

// Inicia o monitoramento do status de conexão
export function iniciarMonitoramentoFavicon() {
  // Salva o favicon original antes de modificar
  faviconOriginal = obterFaviconOriginal();

  // Atualiza com o status atual
  atualizarFaviconStatus(navigator.onLine);

  // Escuta mudanças de conexão
  const handleOnline = () => atualizarFaviconStatus(true);
  const handleOffline = () => atualizarFaviconStatus(false);

  window.addEventListener("online", handleOnline);
  window.addEventListener("offline", handleOffline);

  // Retorna função de limpeza
  return () => {
    window.removeEventListener("online", handleOnline);
    window.removeEventListener("offline", handleOffline);
  };
}
