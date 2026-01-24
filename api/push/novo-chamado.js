import admin from "firebase-admin";
import { GoogleAuth } from "google-auth-library";

function initAdmin() {
    if (admin.apps.length) return;

    admin.initializeApp({
        credential: admin.credential.cert({
            project_id: process.env.FIREBASE_PROJECT_ID,
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        }),
    });
}

async function pegarAccessToken() {
    const auth = new GoogleAuth({
        credentials: {
            client_email: process.env.FIREBASE_CLIENT_EMAIL,
            private_key: process.env.FIREBASE_PRIVATE_KEY?.replace(/\\n/g, "\n"),
        },
        scopes: ["https://www.googleapis.com/auth/firebase.messaging"],
    });

    const token = await auth.getAccessToken();
    return token?.token || token;
}

export default async function handler(req, res) {
    try {
        if (req.method !== "POST") return res.status(405).json({ ok: false });

        const { chamadoId, escolaId = "escola_padrao" } = req.body || {};
        if (!chamadoId) return res.status(400).json({ ok: false, erro: "chamadoId obrigatório" });

        // ✅ valida o caller via Firebase ID Token (anon ou admin)
        const authHeader = req.headers.authorization || "";
        const idToken = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;
        if (!idToken) return res.status(401).json({ ok: false, erro: "Sem Bearer token" });

        initAdmin();

        let decoded;
        try {
            decoded = await admin.auth().verifyIdToken(idToken);
        } catch {
            return res.status(401).json({ ok: false, erro: "Token inválido" });
        }

        const db = admin.firestore();

        // ✅ pega dados do chamado real (não confia no front)
        const snapChamado = await db.doc(`chamados/${chamadoId}`).get();
        if (!snapChamado.exists) return res.status(404).json({ ok: false, erro: "Chamado não existe" });

        const chamado = snapChamado.data();
        if (chamado?.escolaId !== escolaId) {
            return res.status(403).json({ ok: false, erro: "Escola inválida" });
        }

        // ✅ tokens do admin
        const snapTokens = await db.collection(`escolas/${escolaId}/tokensPush`).get();
        const tokens = snapTokens.docs.map((d) => d.id).filter(Boolean);

        if (!tokens.length) return res.status(200).json({ ok: true, enviado: 0 });

        const accessToken = await pegarAccessToken();
        const endpoint = `https://fcm.googleapis.com/v1/projects/${process.env.FIREBASE_PROJECT_ID}/messages:send`;

        const titulo = "Novo chamado aberto";
        const body = `${chamado?.codigoChamado || `#${chamado?.numeroChamado || ""}`} — ${chamado?.titulo || "Sem título"}`;
        const url = `/app/admin/chamados/${chamadoId}`;

        let enviados = 0;

        for (const token of tokens) {
            const payload = {
                message: {
                    token,
                    notification: { title: titulo, body },
                    data: { url, chamadoId },
                    webpush: { fcm_options: { link: url } },
                },
            };

            const resp = await fetch(endpoint, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${accessToken}`,
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(payload),
            });

            if (resp.ok) enviados++;
            // opcional: se token inválido, deletar do Firestore aqui
        }

        return res.status(200).json({ ok: true, enviado: enviados });
    } catch (e) {
        return res.status(500).json({ ok: false, erro: String(e) });
    }
}
