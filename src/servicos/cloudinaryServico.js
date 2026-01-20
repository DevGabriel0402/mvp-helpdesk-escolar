export async function enviarImagemParaCloudinary(file) {
    // ✅ Troque esses 2 valores:
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    const UPLOAD_PRESET = import.meta.env.VITE_CLOUDINARY_UPLOAD_PRESET;

    if (!CLOUD_NAME || !UPLOAD_PRESET) {
        throw new Error("Cloudinary nao configurado (env).");
    }

    const url = `https://api.cloudinary.com/v1_1/${CLOUD_NAME}/image/upload`;

    const formData = new FormData();
    formData.append("file", file);
    formData.append("upload_preset", UPLOAD_PRESET);

    // ✅ opcional: organiza no Cloudinary
    formData.append("folder", "helpdesk/perfis");

    // ✅ força “encaixar” num tamanho padrão (logo quadrada por ex.)
    const resp = await fetch(url, { method: "POST", body: formData });

    if (!resp.ok) {
        const erro = await resp.text();
        throw new Error(erro);
    }

    const data = await resp.json();

    return {
        url: data.secure_url,
        publicId: data.public_id,
        largura: data.width,
        altura: data.height,
    };
}

// gera url transformada (ex: 256x256, crop fill)
export function gerarUrlCloudinaryTransformada(publicId, tamanho = 256) {
    const CLOUD_NAME = import.meta.env.VITE_CLOUDINARY_CLOUD_NAME;
    if (!CLOUD_NAME || !publicId) return "";

    // c_fill = corta preenchendo, q_auto = qualidade auto, f_auto = formato auto
    return `https://res.cloudinary.com/${CLOUD_NAME}/image/upload/c_fill,w_${tamanho},h_${tamanho},q_auto,f_auto/${publicId}`;
}
