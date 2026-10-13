/*
 * CODES D'ACCÈS — qui peut ouvrir quel pays.
 *
 * - Chaque pays peut avoir son « code pays » : sans lui, on voit le pays dans
 *   la liste (Église → Pays) mais on ne peut pas ouvrir ses données.
 * - Le « code Afrique » (Bureau Afrique) ouvre tous les pays.
 * - Un pays sans code reste ouvert (comme avant) jusqu'à ce qu'on lui en donne un.
 *
 * Les codes ne sont jamais enregistrés en clair : seule leur empreinte (SHA-256)
 * est gardée, dans le document commun « codes-acces » :
 *   { afrique: "<empreinte>", pays: { BF: "<empreinte>", CI: "<empreinte>" } }
 *
 * Sur le téléphone (localStorage « lwm-acces ») on garde les empreintes déjà
 * saisies : si un code change, il faut le retaper.
 */
import { doc, getDoc } from "firebase/firestore";
import { db, updateKey } from "./firebase.js";

const DOC = "codes-acces";
const CLE_LOCAL = "lwm-acces";
const CLE_CACHE = "lwm-codes-cache";
const CLE_PRECEDENT = "lwm-pays-precedent";

function lireJSON(cle, defaut) {
  try { const v = JSON.parse(localStorage.getItem(cle) || "null"); return v && typeof v === "object" ? v : defaut; } catch (e) { return defaut; }
}
function ecrireJSON(cle, v) { try { localStorage.setItem(cle, JSON.stringify(v)); } catch (e) {} }

// Empreinte d'un code (majuscules/minuscules et espaces autour ignorés).
export async function empreinte(code) {
  const texte = "lwm|" + String(code || "").trim().toLowerCase();
  try {
    const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(texte));
    return [...new Uint8Array(buf)].map(b => b.toString(16).padStart(2, "0")).join("");
  } catch (e) {
    // navigateur très ancien : empreinte simple (FNV-1a), toujours sans le code en clair
    let h = 0x811c9dc5;
    for (const c of texte) { h ^= c.charCodeAt(0); h = Math.imul(h, 0x01000193) >>> 0; }
    return "f" + h.toString(16);
  }
}

function normaliser(c) {
  return { afrique: (c && typeof c.afrique === "string") ? c.afrique : "", pays: (c && c.pays && typeof c.pays === "object") ? c.pays : {} };
}

// Codes à jour (serveur) ; hors connexion, les derniers connus sur ce téléphone.
export async function chargerCodes() {
  try {
    const snap = await getDoc(doc(db, "mpv-data", DOC));
    const c = normaliser(snap.exists() && snap.data().value ? JSON.parse(snap.data().value) : {});
    ecrireJSON(CLE_CACHE, c);
    return c;
  } catch (e) {
    return normaliser(lireJSON(CLE_CACHE, {}));
  }
}

export function accesLocal() { const a = lireJSON(CLE_LOCAL, {}); return { afrique: a.afrique || "", pays: a.pays || {} }; }
function ecrireAcces(a) { ecrireJSON(CLE_LOCAL, a); }

export function estAfrique(codes) {
  return !!codes.afrique && accesLocal().afrique === codes.afrique;
}
export function paysProtege(codes, code) { return !!codes.pays[code]; }
// Ce téléphone peut-il ouvrir ce pays ?
export function peutOuvrir(codes, code) {
  if (!paysProtege(codes, code)) return true;
  if (estAfrique(codes)) return true;
  return accesLocal().pays[code] === codes.pays[code];
}

// Essaie un code pour un pays : code du pays OU code Afrique. Renvoie "pays", "afrique" ou "".
export async function essayerCode(codes, codePays, saisie) {
  const h = await empreinte(saisie);
  const a = accesLocal();
  if (codes.afrique && h === codes.afrique) { a.afrique = h; ecrireAcces(a); return "afrique"; }
  if (codes.pays[codePays] && h === codes.pays[codePays]) { a.pays = { ...a.pays, [codePays]: h }; ecrireAcces(a); return "pays"; }
  return "";
}

// Enregistre (ou change) le code d'un pays. Ce téléphone garde l'accès.
export async function definirCodePays(codePays, nouveau) {
  const h = await empreinte(nouveau);
  const res = await updateKey(DOC, {}, (cur) => { const c = normaliser(cur); return { ...c, pays: { ...c.pays, [codePays]: h } }; });
  if (!res) return null;
  const a = accesLocal(); a.pays = { ...a.pays, [codePays]: h }; ecrireAcces(a);
  const c = normaliser(res); ecrireJSON(CLE_CACHE, c); return c;
}
// Retire le code d'un pays (le pays redevient ouvert).
export async function retirerCodePays(codePays) {
  const res = await updateKey(DOC, {}, (cur) => { const c = normaliser(cur); const pays = { ...c.pays }; delete pays[codePays]; return { ...c, pays }; });
  if (!res) return null;
  const c = normaliser(res); ecrireJSON(CLE_CACHE, c); return c;
}
// Crée (ou change) le code Afrique. Ce téléphone devient « Bureau Afrique ».
export async function definirCodeAfrique(nouveau) {
  const h = await empreinte(nouveau);
  const res = await updateKey(DOC, {}, (cur) => ({ ...normaliser(cur), afrique: h }));
  if (!res) return null;
  const a = accesLocal(); a.afrique = h; ecrireAcces(a);
  const c = normaliser(res); ecrireJSON(CLE_CACHE, c); return c;
}
// Quitter le mode Bureau Afrique sur ce téléphone.
export function oublierAfrique() { const a = accesLocal(); a.afrique = ""; ecrireAcces(a); }

// Pays d'où l'on vient (pour revenir si on n'a pas le code du nouveau pays).
export function retenirPaysPrecedent(code) { try { localStorage.setItem(CLE_PRECEDENT, code); } catch (e) {} }
export function paysPrecedent() { try { return localStorage.getItem(CLE_PRECEDENT) || ""; } catch (e) { return ""; } }
