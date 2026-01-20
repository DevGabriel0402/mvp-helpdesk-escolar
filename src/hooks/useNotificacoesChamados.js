import { useEffect, useMemo, useState } from "react";
import { collection, onSnapshot, orderBy, query, where } from "firebase/firestore";
import { db } from "../servicos/firebase/firebaseConfig";

function chaveStorage({ uid, escolaId }) {
    return `helpdesk:notificacoes:${uid}:${escolaId}`;
}

function carregarStorage({ uid, escolaId }) {
    try {
        const bruto = localStorage.getItem(chaveStorage({ uid, escolaId }));
        return bruto ? JSON.parse(bruto) : [];
    } catch {
        return [];
    }
}

function salvarStorage({ uid, escolaId }, itens) {
    localStorage.setItem(chaveStorage({ uid, escolaId }), JSON.stringify(itens));
}

export function useNotificacoesChamados({ uid, escolaId, ativo }) {
    const [notificacoes, setNotificacoes] = useState(() => {
        if (!uid || !escolaId) return [];
        return carregarStorage({ uid, escolaId });
    });

    // ✅ badge
    const naoLidas = useMemo(
        () => notificacoes.filter((n) => !n.lida).length,
        [notificacoes]
    );

    useEffect(() => {
        if (!ativo || !uid || !escolaId) return;

        // carrega do storage sempre que trocar uid/escola
        const iniciais = carregarStorage({ uid, escolaId });
        setNotificacoes(iniciais);

        // pega o "marco" do ultimo visto (timestamp em ms)
        const ultimoVistoMs = Number(localStorage.getItem(`helpdesk:ultimoVisto:${uid}:${escolaId}`) || 0);

        // listener de chamados novos
        const q = query(
            collection(db, "chamados"),
            where("escolaId", "==", escolaId),
            orderBy("criadoEm", "desc")
        );

        const off = onSnapshot(q, (snap) => {
            const atuais = carregarStorage({ uid, escolaId });

            // cria um set pra evitar duplicar
            const jaTem = new Set(atuais.map((x) => x.chamadoId));

            let mudou = false;

            snap.docChanges().forEach((change) => {
                if (change.type !== "added") return;

                const d = change.doc.data();
                const criadoEm = d.criadoEm;
                const criadoMs = criadoEm?.toMillis ? criadoEm.toMillis() : 0;

                // só considera como "notificacao" se for depois do ultimoVisto
                if (criadoMs <= ultimoVistoMs) return;

                const chamadoId = change.doc.id;
                if (jaTem.has(chamadoId)) return;

                atuais.unshift({
                    id: `${chamadoId}_${criadoMs}`,
                    chamadoId,
                    codigoChamado: d.codigoChamado || "",
                    titulo: d.titulo || "Novo chamado",
                    mensagem: d.descricao || "",
                    criadoMs,
                    lida: false,
                });

                mudou = true;
                jaTem.add(chamadoId);
            });

            if (mudou) {
                salvarStorage({ uid, escolaId }, atuais);
                setNotificacoes(atuais);
            }
        });

        return () => off();
    }, [ativo, uid, escolaId]);

    function marcarTudoComoLido() {
        if (!uid || !escolaId) return;
        const atual = notificacoes.map((n) => ({ ...n, lida: true }));
        salvarStorage({ uid, escolaId }, atual);
        setNotificacoes(atual);
        localStorage.setItem(`helpdesk:ultimoVisto:${uid}:${escolaId}`, String(Date.now()));
    }

    function marcarComoLida(chamadoId) {
        if (!uid || !escolaId) return;
        const atual = notificacoes.map((n) =>
            n.chamadoId === chamadoId ? { ...n, lida: true } : n
        );
        salvarStorage({ uid, escolaId }, atual);
        setNotificacoes(atual);
    }

    function limparTudo() {
        if (!uid || !escolaId) return;
        salvarStorage({ uid, escolaId }, []);
        setNotificacoes([]);
        localStorage.setItem(`helpdesk:ultimoVisto:${uid}:${escolaId}`, String(Date.now()));
    }

    return {
        notificacoes,
        naoLidas,
        marcarComoLida,
        marcarTudoComoLido,
        limparTudo,
    };
}
