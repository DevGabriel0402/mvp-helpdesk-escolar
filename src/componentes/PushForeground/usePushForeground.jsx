import { useEffect } from "react";
import { getMessaging, onMessage } from "firebase/messaging";
import { toast } from "react-toastify";

export function usePushForeground() {
    useEffect(() => {
        let unsubscribe = null;

        (async () => {
            try {
                const messaging = getMessaging();
                unsubscribe = onMessage(messaging, (payload) => {
                    console.log("Mensagem recebida (foreground):", payload);

                    const title = payload.notification?.title || "Notificação";
                    const body = payload.notification?.body || "";

                    toast.info(`${title}${body ? `\n${body}` : ""}`, { autoClose: 5000 });
                });
            } catch (e) {
                console.warn("Foreground messaging falhou:", e);
            }
        })();

        return () => {
            if (unsubscribe) unsubscribe();
        };
    }, []);
}
