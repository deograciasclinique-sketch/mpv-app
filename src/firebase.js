import { initializeApp } from "firebase/app";
import { getFirestore, doc, getDoc, setDoc, runTransaction } from "firebase/firestore";

/*
 * CONFIGURATION DE VOTRE PROJET FIREBASE (lwm-burkina).
 * Ne touchez pas à ces valeurs — elles sont déjà correctes.
 */
const firebaseConfig = {
  apiKey: "AIzaSyB-EfzHPJ6IrKMB0_mDX9CrhD3vWhoKI0g",
  authDomain: "lwm-burkina.firebaseapp.com",
  projectId: "lwm-burkina",
  storageBucket: "lwm-burkina.firebasestorage.app",
  messagingSenderId: "116196588202",
  appId: "1:116196588202:web:7338263b1a8af6119f6ed3",
};

const app = initializeApp(firebaseConfig);
export const db = getFirestore(app);

// Toutes les données de l'app (répertoire, séminaires, rapports…) sont
// stockées comme des documents dans la collection "mpv-data".
// Chaque "clé" (ex: "seminars-list") correspond à un document.

export async function loadKey(key, fallback) {
  try {
    const ref = doc(db, "mpv-data", key);
    const snap = await getDoc(ref);
    if (snap.exists() && snap.data().value) {
      return JSON.parse(snap.data().value);
    }
    return fallback;
  } catch (e) {
    console.error("Erreur de chargement Firestore:", key, e);
    return fallback;
  }
}

export async function saveKey(key, value) {
  try {
    const ref = doc(db, "mpv-data", key);
    await setDoc(ref, { value: JSON.stringify(value), updatedAt: Date.now() });
    return true;
  } catch (e) {
    console.error("Erreur de sauvegarde Firestore:", key, e);
    return false;
  }
}

// Met à jour une clé à partir de sa version la plus récente sur le serveur.
// Utile quand plusieurs assemblées déposent en même temps : le dépôt de l'une
// n'efface jamais celui d'une autre. Renvoie la nouvelle valeur, ou null en cas d'échec.
export async function updateKey(key, fallback, updater) {
  try {
    const ref = doc(db, "mpv-data", key);
    let next = null;
    await runTransaction(db, async (tx) => {
      const snap = await tx.get(ref);
      const current = snap.exists() && snap.data().value ? JSON.parse(snap.data().value) : fallback;
      next = updater(current);
      tx.set(ref, { value: JSON.stringify(next), updatedAt: Date.now() });
    });
    return next;
  } catch (e) {
    console.error("Erreur de mise à jour Firestore:", key, e);
    return null;
  }
}
