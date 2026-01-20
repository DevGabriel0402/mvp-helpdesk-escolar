import { initializeApp } from "firebase/app";
import { getAuth, setPersistence, browserLocalPersistence } from "firebase/auth";
import {
  initializeFirestore,
  persistentLocalCache,
  persistentMultipleTabManager,
} from "firebase/firestore";

// ✅ Se voce ja tem esse config no arquivo, mantenha o seu.
// Se voce usa .env, mantenha assim. Se nao usa, pode deixar hardcoded.
const firebaseConfig = {
  apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
  authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
  projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
  storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
  messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_FIREBASE_APP_ID,
};

const app = initializeApp(firebaseConfig);

// AUTH
export const auth = getAuth(app);

// ✅ garante que o admin/usuario fica logado ate sair
setPersistence(auth, browserLocalPersistence).catch(() => {
  // se falhar, usa persistencia padrao do browser (ok)
});

// FIRESTORE com cache persistente (nova API - sem deprecação)
export const db = initializeFirestore(app, {
  localCache: persistentLocalCache({
    tabManager: persistentMultipleTabManager(),
  }),
});
