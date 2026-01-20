function garantirLink(rel) {
  let el = document.querySelector(`link[rel="${rel}"]`);
  if (!el) {
    el = document.createElement("link");
    el.setAttribute("rel", rel);
    document.head.appendChild(el);
  }
  return el;
}

export function aplicarFavicon(url256) {
  if (!url256) return;

  const favicon = garantirLink("icon");
  favicon.setAttribute("type", "image/png");
  favicon.setAttribute("href", url256);

  const apple = garantirLink("apple-touch-icon");
  apple.setAttribute("href", url256);

  // alguns navegadores usam shortcut icon
  const shortcut = garantirLink("shortcut icon");
  shortcut.setAttribute("href", url256);
}

export function aplicarManifestDinamico({ nomePainel, url256 }) {
  if (!nomePainel && !url256) return;

  const manifest = {
    name: nomePainel || "Helpdesk",
    short_name: nomePainel ? nomePainel.slice(0, 12) : "Helpdesk",
    start_url: "/",
    display: "standalone",
    background_color: "#0a0b0e",
    theme_color: "#0a0b0e",
    icons: [
      {
        src: url256 || "/favicon.svg",
        sizes: "256x256",
        type: "image/png",
        purpose: "any maskable",
      },
    ],
  };

  const blob = new Blob([JSON.stringify(manifest)], { type: "application/json" });
  const url = URL.createObjectURL(blob);

  const link = garantirLink("manifest");
  link.setAttribute("href", url);

  // IMPORTANTE: para PWA já instalado pode não atualizar o ícone automaticamente
}
