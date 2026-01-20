import {
    signInWithEmailAndPassword,
    signInAnonymously,
    signOut,
    onAuthStateChanged,
    sendPasswordResetEmail
} from "firebase/auth";
import { auth } from "./firebaseConfig";

export function observarAuth(callback) {
    return onAuthStateChanged(auth, callback);
}

export async function entrarComEmailSenha(email, senha) {
    const cred = await signInWithEmailAndPassword(auth, email, senha);
    return cred.user;
}

export async function entrarComoVisitante() {
    const cred = await signInAnonymously(auth);
    return cred.user;
}

export async function sair() {
    await signOut(auth);
}

export async function recuperarSenha(email) {
    await sendPasswordResetEmail(auth, email);
}
