/*
 * APPLICATION ANDROID (APK) — tout ce qui ne concerne que le téléphone :
 *  - bouton « retour » d'Android : ferme la fenêtre ouverte, sinon revient à l'Accueil,
 *    sinon « appuyez encore pour quitter » (jamais de sortie brutale) ;
 *  - barre d'état aux couleurs de l'Église ;
 *  - version installée, recherche de mise à jour (GitHub Releases) ;
 *  - envoi de l'APK par WhatsApp (fonctionne sans internet).
 * Dans le navigateur (site web), ces fonctions ne font rien ou se replient sur le web.
 */
import { useEffect, useRef } from "react";
import { Capacitor, registerPlugin } from "@capacitor/core";
import { App as CapApp } from "@capacitor/app";
import { StatusBar, Style } from "@capacitor/status-bar";

export const NATIF = Capacitor.isNativePlatform();
const AppShare = registerPlugin("AppShare");
export const APK_LINK = "https://github.com/deograciasclinique-sketch/mpv-app/releases/latest/download/Life-Word-Mission.apk";
const RELEASES_API = "https://api.github.com/repos/deograciasclinique-sketch/mpv-app/releases/latest";

/* ---------- pile des fenêtres ouvertes (pour le bouton retour) ---------- */
const pile = [];
// À appeler dans chaque fenêtre (feuille, formulaire) : le bouton retour la fermera.
export function useRetour(fermer, actif = true) {
  const ref = useRef(fermer);
  ref.current = fermer;
  useEffect(() => {
    if (!actif) return;
    const h = () => ref.current && ref.current();
    pile.push(h);
    return () => { const i = pile.lastIndexOf(h); if (i >= 0) pile.splice(i, 1); };
  }, [actif]);
}

// Branche le bouton retour : accueil() renvoie true si on était ailleurs qu'à l'Accueil (et y retourne).
export function brancherRetour(accueil, avertir) {
  if (!NATIF) return () => {};
  let dernier = 0;
  const p = CapApp.addListener("backButton", () => {
    if (pile.length) { pile[pile.length - 1](); return; }
    if (accueil()) return;
    const t = Date.now();
    if (t - dernier < 2000) CapApp.exitApp();
    else { dernier = t; avertir("Appuyez encore sur retour pour quitter"); }
  });
  return () => { p.then(h => h.remove()).catch(() => {}); };
}

/* ---------- démarrage natif ---------- */
export function demarrerNatif() {
  if (!NATIF) return;
  StatusBar.setStyle({ style: Style.Dark }).catch(() => {});
  StatusBar.setBackgroundColor({ color: "#1E2A4A" }).catch(() => {});
}

/* ---------- version et mises à jour ---------- */
export async function versionInstallee() {
  if (!NATIF) return null;
  try { return await AppShare.getVersion(); } catch (e) { return null; }
}
// Renvoie { version, url } si une version plus récente que celle installée est publiée.
export async function chercherMiseAJour() {
  if (!NATIF || navigator.onLine === false) return null;
  try {
    const cur = await AppShare.getVersion();
    const ctrl = new AbortController(); const t = setTimeout(() => ctrl.abort(), 10000);
    const r = await fetch(RELEASES_API, { cache: "no-store", signal: ctrl.signal }); clearTimeout(t);
    if (!r.ok) return null;
    const rel = await r.json();
    const derniere = Number(String(rel.tag_name || "").split(".").pop()) || 0;
    const asset = (rel.assets || []).find(a => /\.apk$/i.test(a.name));
    if (asset && derniere > (Number(cur && cur.build) || 0)) return { version: rel.tag_name, url: asset.browser_download_url };
  } catch (e) {}
  return null;
}

/* ---------- liens et partage ---------- */
export function ouvrirLien(url) {
  if (NATIF) return AppShare.openUrl({ url }).catch(() => { window.location.href = url; });
  window.open(url, "_blank", "noopener");
  return Promise.resolve();
}
const MODE_EMPLOI = "Pour installer : ouvrir le fichier, autoriser « installer des applications inconnues », puis Installer.";
// Envoie le fichier APK de l'application installée (pas besoin d'internet sur ce téléphone).
export function envoyerApk() {
  return AppShare.shareApk({ text: "📲 Application Life Word Mission — Afrique et diaspora.\n" + MODE_EMPLOI });
}
export function envoyerLienApk() {
  const text = "📲 Application Life Word Mission — Afrique et diaspora.\nTélécharger pour Android : " + APK_LINK + "\n" + MODE_EMPLOI;
  if (NATIF) return AppShare.shareText({ text });
  window.open("https://wa.me/?text=" + encodeURIComponent(text), "_blank");
  return Promise.resolve();
}
