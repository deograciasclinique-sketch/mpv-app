import { initializeApp } from "firebase/app";
import {
  getFirestore, doc, getDoc, setDoc, runTransaction, collection, getDocs, deleteDoc,
  query, where, getCountFromServer, writeBatch,
} from "firebase/firestore";

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

// ------------------------------------------------------------------
// MEMBRES DES ASSEMBLÉES : une fiche Firestore par membre.
// Les fiches sont rangées dans mpv-data/assembly-members/items/{id}
// (couvert par les règles existantes de "mpv-data"), ce qui supprime la
// limite de 1 Mo d'un document unique : le nombre de membres n'est plus limité.
// Les champs "assemblee", "categorie" et "comite" sont copiés en clair pour
// pouvoir filtrer et compter côté serveur.
// ------------------------------------------------------------------
const membresCol = () => collection(db, "mpv-data", "assembly-members", "items");

function membreDoc(m) {
  return {
    assemblee: m.assemblee || "",
    categorie: m.categorie || "",
    comite: !!m.responsabilite,
    value: JSON.stringify(m),
    updatedAt: Date.now(),
  };
}

// assemblee = nom d'une assemblée, ou null pour tout le pays.
export async function loadMembres(assemblee) {
  try {
    const q = assemblee ? query(membresCol(), where("assemblee", "==", assemblee)) : membresCol();
    const snap = await getDocs(q);
    return snap.docs.map(d => JSON.parse(d.data().value));
  } catch (e) {
    console.error("Erreur de chargement des membres:", e);
    return null;
  }
}

export async function saveMembre(m) {
  try {
    await setDoc(doc(membresCol(), m.id), membreDoc(m));
    return true;
  } catch (e) {
    console.error("Erreur d'enregistrement du membre:", e);
    return false;
  }
}

export async function deleteMembre(id) {
  try {
    await deleteDoc(doc(membresCol(), id));
    return true;
  } catch (e) {
    console.error("Erreur de suppression du membre:", e);
    return false;
  }
}

// Compte côté serveur (très peu coûteux, sans télécharger les fiches).
// filtres : { assemblee?, categorie?, comite? }
export async function countMembres(filtres = {}) {
  try {
    const conds = Object.entries(filtres).map(([k, v]) => where(k, "==", v));
    const snap = await getCountFromServer(query(membresCol(), ...conds));
    return snap.data().count;
  } catch (e) {
    console.error("Erreur de comptage des membres:", e);
    return null;
  }
}

// Ancien format : tous les membres dans une seule clé "assembly-members".
// Recopie chaque membre dans sa propre fiche, puis vide l'ancienne liste.
export async function migrerAnciensMembres(normaliser) {
  try {
    const ref = doc(db, "mpv-data", "assembly-members");
    const snap = await getDoc(ref);
    const anciens = snap.exists() && snap.data().value ? JSON.parse(snap.data().value) : [];
    if (!Array.isArray(anciens) || anciens.length === 0) return 0;
    for (let i = 0; i < anciens.length; i += 400) {
      const batch = writeBatch(db);
      anciens.slice(i, i + 400).forEach(m => {
        const n = normaliser ? normaliser(m) : m;
        batch.set(doc(membresCol(), n.id), membreDoc(n));
      });
      await batch.commit();
    }
    await setDoc(ref, { value: "[]", migre: true, updatedAt: Date.now() });
    return anciens.length;
  } catch (e) {
    console.error("Erreur de migration des membres:", e);
    return 0;
  }
}
