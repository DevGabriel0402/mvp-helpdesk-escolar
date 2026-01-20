export const formatarData = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleDateString('pt-BR');
};

export const formatarHora = (data) => {
    if (!data) return '';
    const d = new Date(data);
    return d.toLocaleTimeString('pt-BR');
};
