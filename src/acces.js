/*
 * CODES D'ACCÈS — qui peut ouvrir quel pays.
 *
 * - Chaque pays peut avoir son « code pays » : sans lui, on voit le pays dans
 *   la liste (Église → Pays) mais on ne peut pas ouvrir ses données.
 * - Le « code Afrique » (Bureau Afrique) ouvre tous les pays.
 * - Un pays sans code reste ouvert (comme avant) jusqu'à ce qu'on lui en donne un.
 * - ZONES ECCLÉSIASTIQUES : chaque Point focal (PF) dirige une zone = plusieurs pays.
 *   Il crée sa zone avec un « code zone » (verrou) et y ajoute ses pays ; ou bien le
 *   coordonnateur d'un pays fait entrer son pays dans la zone avec ce code, donné par le PF.
 *   Le code zone ouvre tous les pays de la zone (comme le code Afrique, mais pour la zone).
 *
 * Les codes ne sont jamais enregistrés en clair : seule leur empreinte (SHA-256)
 * est gardée, dans le document commun « codes-acces » :
 *   { afrique: "<empreinte>", pays: { BF: "<empreinte>", CI: "<empreinte>" },
 *     zones: { "<id>": { nom, pf, tel, code: "<empreinte>", pays: ["BF", "CI"], creeLe } } }
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
  const zones = {};
  const z = (c && c.zones && typeof c.zones === "object") ? c.zones : {};
  Object.entries(z).forEach(([id, v]) => {
    if (v && typeof v === "object") zones[id] = { nom: String(v.nom || ""), pf: String(v.pf || ""), tel: String(v.tel || ""), code: String(v.code || ""), pays: Array.isArray(v.pays) ? v.pays.filter(x => typeof x === "string") : [], creeLe: v.creeLe || 0 };
  });
  return { afrique: (c && typeof c.afrique === "string") ? c.afrique : "", pays: (c && c.pays && typeof c.pays === "object") ? c.pays : {}, zones };
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

export function accesLocal() { const a = lireJSON(CLE_LOCAL, {}); return { afrique: a.afrique || "", pays: a.pays || {}, zones: a.zones || {} }; }
function ecrireAcces(a) { ecrireJSON(CLE_LOCAL, a); }

export function estAfrique(codes) {
  return !!codes.afrique && accesLocal().afrique === codes.afrique;
}
export function paysProtege(codes, code) { return !!codes.pays[code]; }
// Ce téléphone peut-il ouvrir ce pays ?
export function peutOuvrir(codes, code) {
  if (!paysProtege(codes, code)) return true;
  if (estAfrique(codes)) return true;
  const z = zoneDuPays(codes, code); if (z && estPF(codes, z.id)) return true;
  return accesLocal().pays[code] === codes.pays[code];
}

// Essaie un code pour un pays : code du pays OU code Afrique. Renvoie "pays", "afrique" ou "".
export async function essayerCode(codes, codePays, saisie) {
  const h = await empreinte(saisie);
  const a = accesLocal();
  if (codes.afrique && h === codes.afrique) { a.afrique = h; ecrireAcces(a); return "afrique"; }
  if (codes.pays[codePays] && h === codes.pays[codePays]) { a.pays = { ...a.pays, [codePays]: h }; ecrireAcces(a); return "pays"; }
  // code de la zone ecclésiastique du pays (Point focal)
  const z = zoneDuPays(codes, codePays);
  if (z && z.code && h === z.code) { a.zones = { ...a.zones, [z.id]: h }; ecrireAcces(a); return "zone"; }
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

/* ================= ZONES ECCLÉSIASTIQUES ================= */
export function listeZones(codes) {
  return Object.entries((codes && codes.zones) || {}).map(([id, z]) => ({ id, ...z })).sort((a, b) => a.nom.localeCompare(b.nom, "fr"));
}
export function zoneDuPays(codes, codePays) {
  return listeZones(codes).find(z => z.pays.includes(codePays)) || null;
}
// Ce téléphone est-il celui du Point focal de cette zone ?
export function estPF(codes, id) {
  const z = codes && codes.zones && codes.zones[id];
  return !!z && !!z.code && accesLocal().zones[id] === z.code;
}
export function mesZones(codes) { return listeZones(codes).filter(z => estPF(codes, z.id)); }
function idZone(nom) {
  const base = String(nom || "zone").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 30) || "zone";
  return base + "-" + Date.now().toString(36).slice(-4);
}
async function majZones(fn) {
  let refus = "";
  const res = await updateKey(DOC, {}, (cur) => { const c = normaliser(cur); const r = fn(c); if (typeof r === "string") { refus = r; return c; } return r; });
  if (!res) return { erreur: "Pas enregistré : vérifiez la connexion" };
  const c = normaliser(res); ecrireJSON(CLE_CACHE, c);
  return refus ? { erreur: refus, codes: c } : { codes: c };
}
// Le Point focal crée sa zone : ce téléphone devient celui du PF de la zone.
export async function creerZone({ nom, pf, tel }, code) {
  const h = await empreinte(code); const id = idZone(nom);
  const r = await majZones(c => {
    if (listeZones(c).some(z => z.nom.trim().toLowerCase() === String(nom).trim().toLowerCase())) return "Une zone porte déjà ce nom.";
    return { ...c, zones: { ...c.zones, [id]: { nom: String(nom).trim().slice(0, 60), pf: String(pf || "").trim().slice(0, 80), tel: String(tel || "").trim().slice(0, 30), code: h, pays: [], creeLe: Date.now() } } };
  });
  if (!r.erreur) { const a = accesLocal(); a.zones = { ...a.zones, [id]: h }; ecrireAcces(a); }
  return { ...r, id };
}
// Taper le code de la zone : ce téléphone devient celui du PF (ouvre tous les pays de la zone).
export async function entrerCodeZone(codes, id, saisie) {
  const z = codes.zones && codes.zones[id]; if (!z) return false;
  const h = await empreinte(saisie);
  if (h !== z.code) return false;
  const a = accesLocal(); a.zones = { ...a.zones, [id]: h }; ecrireAcces(a); return true;
}
export function quitterZone(id) { const a = accesLocal(); const z = { ...a.zones }; delete z[id]; a.zones = z; ecrireAcces(a); }
// Vérifie un code de zone sans rien garder (le coordonnateur qui fait entrer son pays).
export async function codeZoneJuste(codes, id, saisie) {
  const z = codes.zones && codes.zones[id]; return !!z && (await empreinte(saisie)) === z.code;
}
// Ajoute un pays à une zone. « deplacer » : le pays peut quitter sa zone actuelle (choix du coordonnateur ou du Bureau Afrique).
export async function ajouterPaysZone(id, codePays, deplacer) {
  return majZones(c => {
    if (!c.zones[id]) return "Cette zone n'existe plus.";
    const autre = listeZones(c).find(z => z.id !== id && z.pays.includes(codePays));
    if (autre && !deplacer) return `Ce pays est déjà dans la zone « ${autre.nom} ». Son coordonnateur ou le Bureau Afrique peut le changer de zone.`;
    const zones = {};
    Object.entries(c.zones).forEach(([k, z]) => { zones[k] = { ...z, pays: z.pays.filter(p => p !== codePays) }; });
    zones[id] = { ...zones[id], pays: [...zones[id].pays, codePays] };
    return { ...c, zones };
  });
}
export async function retirerPaysZone(id, codePays) {
  return majZones(c => (c.zones[id] ? { ...c, zones: { ...c.zones, [id]: { ...c.zones[id], pays: c.zones[id].pays.filter(p => p !== codePays) } } } : "Cette zone n'existe plus."));
}
export async function modifierZone(id, champs) {
  return majZones(c => (c.zones[id] ? { ...c, zones: { ...c.zones, [id]: { ...c.zones[id], nom: String(champs.nom || c.zones[id].nom).trim().slice(0, 60), pf: String(champs.pf ?? c.zones[id].pf).trim().slice(0, 80), tel: String(champs.tel ?? c.zones[id].tel).trim().slice(0, 30) } } } : "Cette zone n'existe plus."));
}
export async function changerCodeZone(id, nouveau) {
  const h = await empreinte(nouveau);
  const r = await majZones(c => (c.zones[id] ? { ...c, zones: { ...c.zones, [id]: { ...c.zones[id], code: h } } } : "Cette zone n'existe plus."));
  if (!r.erreur) { const a = accesLocal(); a.zones = { ...a.zones, [id]: h }; ecrireAcces(a); }
  return r;
}
export async function supprimerZone(id) {
  const r = await majZones(c => { const zones = { ...c.zones }; delete zones[id]; return { ...c, zones }; });
  if (!r.erreur) quitterZone(id);
  return r;
}
