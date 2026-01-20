export function gerarTicketCode({ numero, ano }) {
    const anoFinal = ano || new Date().getFullYear();
    const numeroFormatado = String(numero).padStart(6, "0");
    return `HD-${anoFinal}-${numeroFormatado}`;
}
