function garantirLink(rel) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

// Gera URL do Cloudinary com tamanho específico
function gerarUrlTamanho(url256, tamanho) {
  if (!url256) return null;
  // Se já é uma URL Cloudinary com transformação, substitui o tamanho
  if (url256.includes("/c_fill,w_256,h_256/")) {
    return url256.replace("/c_fill,w_256,h_256/", `/c_fill,w_${tamanho},h_${tamanho}/`);
  }
  // Se é URL Cloudinary sem transformação, adiciona
  if (url256.includes("cloudinary.com")) {
    return url256.replace("/upload/", `/upload/c_fill,w_${tamanho},h_${tamanho}/`);
  }
  return url256;
}

export function aplicarFavicon(url256) {
  if (!url256) return;

  const favicon = garantirLink("icon");
  favicon.setAttribute("type", "image/png");
  favicon.setAttribute("href", url256);

  const apple = garantirLink("apple-touch-icon");
  apple.setAttribute("href", gerarUrlTamanho(url256, 180) || url256);

  // alguns navegadores usam shortcut icon
  const shortcut = garantirLink("shortcut icon");
  shortcut.setAttribute("href", url256);
}

export function aplicarManifestDinamico({ nomePainel, url256 }) {
  if (!nomePainel && !url256) return;

  const icons = [];

  if (url256) {
    // Gera múltiplos tamanhos para o PWA
    const tamanhos = [72, 96, 128, 144, 152, 192, 384, 512];

    tamanhos.forEach((size) => {
      const urlSize = gerarUrlTamanho(url256, size);
      if (urlSize) {
        icons.push({
          src: urlSize,
          sizes: `${size}x${size}`,
          type: "image/png",
        });
      }
    });

    // Adiciona versão maskable para Android
    const url512 = gerarUrlTamanho(url256, 512);
    if (url512) {
      icons.push({
        src: url512,
        sizes: "512x512",
        type: "image/png",
        purpose: "maskable",
      });
    }
  } else {
    // Fallback para ícones padrão
    icons.push({
      src: "/favicon.svg",
      sizes: "any",
      type: "image/svg+xml",
    });
  }

  const manifest = {
    name: nomePainel || "Helpdesk",
    short_name: nomePainel ? nomePainel.slice(0, 12) : "Helpdesk",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0e",
    theme_color: "#0a0b0e",
    icons,
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = garantirLink("manifest");
  link.setAttribute("href", url);

  // Salva no localStorage para usar na próxima vez
  try {
    localStorage.setItem(
      "helpdesk:manifest_data",
      JSON.stringify({ nomePainel, url256 }),
    );
  } catch {
    // ignore
  }
}

// Aplica manifest salvo (para carregar antes do Firebase)
export function aplicarManifestSalvo() {
  try {
    const saved = localStorage.getItem("helpdesk:manifest_data");
    if (saved) {
      const { nomePainel, url256 } = JSON.parse(saved);
      if (url256) {
        aplicarFavicon(url256);
        aplicarManifestDinamico({ nomePainel, url256 });
      }
    }
  } catch {
    // ignore
  }
}
