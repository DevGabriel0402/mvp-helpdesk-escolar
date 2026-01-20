export function salvarNoLocalStorage(chave, valor) {
    try {
        localStorage.setItem(chave, JSON.stringify(valor));
    } catch (e) {
        console.warn("Falha ao salvar no localStorage:", e);
    }
}

export function lerDoLocalStorage(chave, valorPadrao) {
    try {
        const bruto = localStorage.getItem(chave);
        if (!bruto) return valorPadrao;
        return JSON.parse(bruto);
    } catch (e) {
        return valorPadrao;
    }
}
