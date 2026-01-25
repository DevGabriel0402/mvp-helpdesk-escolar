import admin from "firebase-admin";

// Inicializa uma vez só
function initAdmin() {
    if (admin.apps.length) return;

    // Você vai colocar isso como ENV na Vercel
    // FIREBASE_SERVICE_ACCOUNT_JSON = JSON inteiro da service account
    const json = process.env.FIREBASE_SERVICE_ACCOUNT_JSON;
    if (!json) throw new Error("FIREBASE_SERVICE_ACCOUNT_JSON não definido.");

    const serviceAccount = JSON.parse(json);

    admin.initializeApp({
        credential: admin.credential.cert(serviceAccount),
    });
}

export default async function handler(req, res) {
    try {
        initAdmin();

        if (req.method !== "POST") {
            return res.status(405).json({ ok: false, erro: "Método não permitido" });
        }

        // 1) Verifica Firebase ID Token (segurança)
        const authHeader = req.headers.authorization || "";
        const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!idToken) return res.status(401).json({ ok: false, erro: "Sem token" });

        const decoded = await admin.auth().verifyIdToken(idToken);

        // ✅ permite admin e visitante logado (inclui anônimo)
        // A regra de envio é: notificar ADMINs sempre
        const { escolaId, codigoChamado, numeroChamado, titulo, chamadoId } = req.body || {};

        if (!escolaId || !codigoChamado || !numeroChamado) {
            return res.status(400).json({ ok: false, erro: "Dados incompletos" });
        }

        // 2) Busca tokens de admin
        const snap = await admin
            .firestore()
            .collection("escolas")
            .doc(escolaId)
            .collection("tokensPush")
            .where("tipo", "==", "admin")
            .where("ativo", "==", true)
            .get();

        const tokens = [];
        snap.forEach((d) => {
            const data = d.data();
            const t = data.token || d.id;
            if (t) tokens.push(t);
        });

        if (tokens.length === 0) {
            return res.status(200).json({ ok: true, enviado: 0, motivo: "Sem tokens de admin" });
        }

        // 3) Envia push
        const message = {
            notification: {
                icon: "https://res.cloudinary.com/dxs92g9nu/image/upload/v1769286684/ICONE_DA_ESCOLA_-_SITE_zecz6r.png",
                image: "https://res.cloudinary.com/dxs92g9nu/image/upload/v1769286684/ICONE_DA_ESCOLA_-_SITE_zecz6r.png",
                badge: "https://res.cloudinary.com/dxs92g9nu/image/upload/v1769286684/ICONE_DA_ESCOLA_-_SITE_zecz6r.png",
                title: "Novo chamado criado",
                body: `${codigoChamado} - ${titulo || "Sem título"} \n Clique para ver detalhes`,
            },
            data: {
                escolaId,
                chamadoId: chamadoId || "",
                codigoChamado: String(codigoChamado),
                numeroChamado: String(numeroChamado),
                url: "/app/admin", // ao clicar
            },
            tokens,
        };

        const resp = await admin.messaging().sendEachForMulticast(message);

        // 4) Remove tokens inválidos automaticamente
        const invalidos = [];
        resp.responses.forEach((r, i) => {
            if (!r.success) {
                const code = r.error?.code || "";
                if (
                    code.includes("registration-token-not-registered") ||
                    code.includes("invalid-registration-token")
                ) {
                    invalidos.push(tokens[i]);
                }
            }
        });

        // apaga inválidos
        await Promise.all(
            invalidos.map((t) =>
                admin.firestore().collection("escolas").doc(escolaId).collection("tokensPush").doc(t).delete()
            )
        );

        return res.status(200).json({
            ok: true,
            enviado: resp.successCount,
            falhou: resp.failureCount,
            tokensInvalidosRemovidos: invalidos.length,
            uidChamador: decoded.uid,
        });
    } catch (e) {
        console.error(e);
        return res.status(500).json({ ok: false, erro: String(e.message || e) });
    }
}
