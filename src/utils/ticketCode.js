export function gerarTicketCode({ numero }) {
  const numeroFormatado = String(numero).padStart(5, "0");
  return `OS N°${numeroFormatado}`;
}
