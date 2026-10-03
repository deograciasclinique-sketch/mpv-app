/*
 * VISIOCONFÉRENCE DE L'ÉGLISE (Jitsi Meet)
 *
 * VISIO_SERVER = adresse du serveur Jitsi de l'église.
 *  - Tant qu'il vaut "meet.jit.si" (serveur public gratuit), la visio s'ouvre
 *    dans un nouvel onglet / l'application Jitsi Meet, comme avant : le serveur
 *    public coupe au bout de 5 minutes les réunions intégrées dans une app.
 *  - Dès que le serveur de l'église est installé (voir serveur/INSTALL-JITSI.md),
 *    remplacez par son adresse, ex. "visio.mpvburkina.org" : la réunion s'ouvre
 *    alors DANS l'app, avec chat, salle d'attente, partage d'écran et enregistrement.
 */
export const VISIO_SERVER = "meet.jit.si";

const PUBLIC_SERVER = "meet.jit.si";

export function newVisioLink(titre) {
  const slug = (titre || "reunion").normalize("NFD").replace(/[̀-ͯ]/g, "")
    .replace(/[^A-Za-z0-9]+/g, "").slice(0, 24) || "Reunion";
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `https://${VISIO_SERVER}/MPV-${slug}-${rnd}`;
}

// Découpe un lien Jitsi en { domain, room }, ou null si ce n'est pas un lien Jitsi de l'église.
export function parseVisioLink(lien) {
  try {
    const u = new URL(lien);
    const room = decodeURIComponent(u.pathname.replace(/^\/+/, "").split("/")[0] || "");
    if (!room) return null;
    return { domain: u.host, room };
  } catch (e) {
    return null;
  }
}

// La réunion peut-elle s'ouvrir dans l'app ? (seulement sur le serveur de l'église)
export function canEmbedVisio(lien) {
  const p = parseVisioLink(lien);
  return !!p && VISIO_SERVER !== PUBLIC_SERVER && p.domain === VISIO_SERVER;
}

// Charge le script officiel de Jitsi depuis le serveur de l'église (une seule fois).
let apiPromise = null;
export function loadJitsiApi(domain) {
  if (window.JitsiMeetExternalAPI) return Promise.resolve(window.JitsiMeetExternalAPI);
  if (!apiPromise) {
    apiPromise = new Promise((resolve, reject) => {
      const s = document.createElement("script");
      s.src = `https://${domain}/external_api.js`;
      s.async = true;
      s.onload = () => resolve(window.JitsiMeetExternalAPI);
      s.onerror = () => { apiPromise = null; reject(new Error("Serveur de visio injoignable")); };
      document.head.appendChild(s);
    });
  }
  return apiPromise;
}

// Moment de début d'une réunion (date "AAAA-MM-JJ" + heure "HH:MM"), en millisecondes.
export function debutReunion(a) {
  if (!a?.date) return null;
  const t = new Date(`${a.date}T${a.heure || "00:00"}:00`).getTime();
  return Number.isNaN(t) ? null : t;
}

// "en cours", "dans 12 min", ou null si la réunion est loin ou finie depuis plus de 3 h.
export function etatReunion(a, maintenant = Date.now()) {
  const debut = debutReunion(a);
  if (!debut || !a.heure) return null;
  const min = Math.round((debut - maintenant) / 60000);
  if (min <= 0 && min > -180) return { enCours: true, texte: "En cours" };
  if (min > 0 && min <= 60) return { enCours: false, texte: `Dans ${min} min` };
  return null;
}
