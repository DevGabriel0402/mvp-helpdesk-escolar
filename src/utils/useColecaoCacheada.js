import { useEffect, useState } from "react";
import { lerDoLocalStorage, salvarNoLocalStorage } from "./armazenamentoLocal";

export function useColecaoCacheada({ chave, buscarAoVivo }) {
    const [dados, setDados] = useState(() => lerDoLocalStorage(chave, []));
    const [carregando, setCarregando] = useState(true);

    useEffect(() => {
        // buscarAoVivo deve retornar uma funcao de "desinscrever" (unsubscribe)
        const desinscrever = buscarAoVivo(async (lista) => {
            setDados(lista);
            salvarNoLocalStorage(chave, lista);
            setCarregando(false);
        });

        // Se já tinha cache, não precisa travar tela
        if (dados.length > 0) setCarregando(false);

        return () => desinscrever?.();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [chave]);

    return { dados, setDados, carregando };
}
