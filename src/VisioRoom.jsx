import React, { useEffect, useRef, useState } from "react";
import { Video, X, ExternalLink, Bell } from "lucide-react";
import { canEmbedVisio, parseVisioLink, loadJitsiApi, debutReunion, etatReunion } from "./visio.js";

const NOM_KEY = "mpv-visio-nom";

/* ------------------------------------------------------------------ */
/*  Bouton « Rejoindre la visio »                                       */
/*  - serveur de l'église : ouvre la salle dans l'app                   */
/*  - autre lien (meet.jit.si, Zoom, Google Meet) : ouvre le lien       */
/* ------------------------------------------------------------------ */
export function RejoindreVisio({ annonce, label = "Rejoindre la visio", small }) {
  const [ouvert, setOuvert] = useState(false);
  const style = {
    display: "flex", alignItems: "center", gap: small ? 4 : 5, background: "var(--primary)", color: "#fff",
    fontSize: small ? 11.5 : 12, fontWeight: 700, padding: small ? "6px 9px" : "7px 11px", borderRadius: 8,
    textDecoration: "none", border: "none", cursor: "pointer",
  };

  if (!canEmbedVisio(annonce.lienVisio)) {
    return (
      <a href={annonce.lienVisio} target="_blank" rel="noopener noreferrer" style={style}>
        <Video size={small ? 12 : 13} /> {label}
      </a>
    );
  }
  return (
    <>
      <button onClick={() => setOuvert(true)} style={style}>
        <Video size={small ? 12 : 13} /> {label}
      </button>
      {ouvert && <SalleVisio annonce={annonce} onClose={() => setOuvert(false)} />}
    </>
  );
}

/* ------------------------------------------------------------------ */
/*  Salle de visio intégrée (Jitsi IFrame API)                         */
/* ------------------------------------------------------------------ */
function SalleVisio({ annonce, onClose }) {
  const [nom, setNom] = useState(() => { try { return localStorage.getItem(NOM_KEY) || ""; } catch (e) { return ""; } });
  const [entre, setEntre] = useState(false);
  const [erreur, setErreur] = useState("");
  const zone = useRef(null);
  const api = useRef(null);
  const { domain, room } = parseVisioLink(annonce.lienVisio);

  // Empêche la page derrière de défiler pendant la visio
  useEffect(() => {
    const avant = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = avant; };
  }, []);

  useEffect(() => {
    if (!entre) return;
    let annule = false;
    loadJitsiApi(domain).then((JitsiMeetExternalAPI) => {
      if (annule || !zone.current) return;
      api.current = new JitsiMeetExternalAPI(domain, {
        roomName: room,
        parentNode: zone.current,
        width: "100%",
        height: "100%",
        lang: "fr",
        userInfo: { displayName: nom.trim() },
        configOverwrite: {
          subject: annonce.titre,
          prejoinConfig: { enabled: false },
          disableDeepLinking: true,        // reste dans l'app au lieu de proposer l'app Jitsi
          // Économie de données : on entre caméra coupée, micro coupé à partir de 10 personnes
          startWithVideoMuted: true,
          startAudioMuted: 10,
          channelLastN: 8,                 // au plus 8 vidéos reçues en même temps
          resolution: 360,
          constraints: { video: { height: { ideal: 360, max: 360 } } },
          toolbarButtons: [
            "microphone", "camera", "desktop", "chat", "raisehand", "participants-pane",
            "tileview", "security", "recording", "toggle-camera", "settings", "hangup",
          ],
        },
        interfaceConfigOverwrite: { MOBILE_APP_PROMO: false, SHOW_JITSI_WATERMARK: false },
      });
      api.current.addListener("readyToClose", onClose);
    }).catch(() => setErreur("Le serveur de visioconférence ne répond pas. Vérifiez votre connexion internet."));

    return () => {
      annule = true;
      if (api.current) { api.current.dispose(); api.current = null; }
    };
  }, [entre]);

  function entrer() {
    if (!nom.trim()) return;
    try { localStorage.setItem(NOM_KEY, nom.trim()); } catch (e) {}
    setEntre(true);
  }

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 1000, background: "#111", display: "flex", flexDirection: "column" }}>
      <div style={{
        display: "flex", alignItems: "center", gap: 8, padding: "calc(env(safe-area-inset-top) + 8px) 12px 8px",
        background: "var(--primary)", color: "#fff",
      }}>
        <Video size={16} />
        <div style={{ flex: 1, minWidth: 0, fontSize: 14, fontWeight: 700, whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
          {annonce.titre}
        </div>
        <button onClick={onClose} aria-label="Quitter la visio" style={{ display: "flex", alignItems: "center", gap: 4, background: "rgba(255,255,255,.15)", color: "#fff", border: "none", borderRadius: 8, padding: "6px 10px", fontSize: 12, fontWeight: 700 }}>
          <X size={14} /> Quitter
        </button>
      </div>

      {!entre ? (
        <div style={{ flex: 1, overflowY: "auto", background: "#EDEEE6", padding: 20 }}>
          <div style={{ maxWidth: 420, margin: "0 auto", background: "#fff", borderRadius: 14, padding: 18, border: "1px solid var(--border)" }}>
            <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 4 }}>Rejoindre la réunion</div>
            <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.45 }}>
              Votre nom sera affiché aux autres participants.
            </div>
            <input
              value={nom} onChange={e => setNom(e.target.value)} onKeyDown={e => e.key === "Enter" && entrer()}
              placeholder="Ex. Pasteur Joseph Saré" autoFocus
              style={{ width: "100%", boxSizing: "border-box", padding: "11px 12px", borderRadius: 10, border: "1px solid var(--border)", fontSize: 15, marginBottom: 12 }}
            />
            <button onClick={entrer} disabled={!nom.trim()} style={{ width: "100%", background: nom.trim() ? "var(--primary)" : "#9AA0AE", color: "#fff", border: "none", borderRadius: 10, padding: 13, fontSize: 15, fontWeight: 700 }}>
              Entrer dans la réunion
            </button>

            <ul style={{ fontSize: 12, color: "var(--ink-soft)", lineHeight: 1.55, paddingLeft: 18, margin: "16px 0 0" }}>
              <li>Vous entrez <b>caméra coupée</b> pour économiser vos données ; allumez-la si besoin.</li>
              <li>Si la <b>salle d'attente</b> est active, patientez : l'organisateur vous fera entrer.</li>
              <li>Le <b>chat</b> est dans la barre du bas (bulle de message).</li>
              <li>Pour <b>partager l'écran d'un téléphone</b>, utilisez plutôt l'application Jitsi Meet :</li>
            </ul>
            <a href={`org.jitsi.meet://${domain}/${encodeURIComponent(room)}`} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, marginTop: 10, fontSize: 12.5, fontWeight: 700, color: "var(--primary)", textDecoration: "none" }}>
              <ExternalLink size={13} /> Ouvrir dans l'application Jitsi Meet
            </a>
          </div>
        </div>
      ) : erreur ? (
        <div style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", color: "#fff", padding: 24, textAlign: "center", fontSize: 14 }}>
          {erreur}
        </div>
      ) : (
        <div ref={zone} style={{ flex: 1, minHeight: 0 }} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge « En cours » / « Dans 12 min »                               */
/* ------------------------------------------------------------------ */
export function BadgeReunion({ annonce }) {
  const [, tic] = useState(0);
  useEffect(() => { const t = setInterval(() => tic(x => x + 1), 30000); return () => clearInterval(t); }, []);
  const etat = etatReunion(annonce);
  if (!etat) return null;
  return (
    <span style={{
      display: "inline-block", marginLeft: 6, padding: "1px 7px", borderRadius: 99, fontSize: 10.5, fontWeight: 700,
      background: etat.enCours ? "#E3F1EA" : "#FFF3D6", color: etat.enCours ? "#1F7A5C" : "#8A5A00",
      textTransform: "none", letterSpacing: 0,
    }}>{etat.texte}</span>
  );
}

/* ------------------------------------------------------------------ */
/*  Rappels : notification 15 min avant chaque réunion en visio.       */
/*  Fonctionne quand l'app est ouverte (ou en arrière-plan récent).    */
/* ------------------------------------------------------------------ */
const RAPPEL_MIN = 15;
const DEJA_KEY = "mpv-visio-rappels";

export function RappelsVisio({ annonces }) {
  const support = typeof window !== "undefined" && "Notification" in window;
  const [permission, setPermission] = useState(support ? Notification.permission : "denied");

  useEffect(() => {
    if (permission !== "granted") return;
    const verifier = () => {
      let deja = {};
      try { deja = JSON.parse(localStorage.getItem(DEJA_KEY) || "{}"); } catch (e) {}
      const maintenant = Date.now();
      (annonces || []).forEach(a => {
        if (a.type !== "Réunion" || !a.heure) return;
        const debut = debutReunion(a);
        if (!debut) return;
        const min = (debut - maintenant) / 60000;
        const cle = `${a.id}-${a.date}-${a.heure}`;
        if (min > 0 && min <= RAPPEL_MIN && !deja[cle]) {
          deja[cle] = maintenant;
          notifier(`Réunion dans ${Math.round(min)} min`, `${a.titre}${a.lienVisio ? " — touchez pour rejoindre la visio" : ""}`);
        }
      });
      // Oublie les rappels de plus de 2 jours
      Object.keys(deja).forEach(k => { if (maintenant - deja[k] > 2 * 86400000) delete deja[k]; });
      try { localStorage.setItem(DEJA_KEY, JSON.stringify(deja)); } catch (e) {}
    };
    verifier();
    const t = setInterval(verifier, 60000);
    return () => clearInterval(t);
  }, [permission, annonces]);

  if (!support || permission !== "default") return null;
  return (
    <button
      onClick={() => Notification.requestPermission().then(setPermission)}
      style={{ display: "flex", alignItems: "center", gap: 5, background: "#fff", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 9px", fontSize: 11.5, fontWeight: 700, color: "var(--primary)" }}
    >
      <Bell size={12} /> Activer les rappels
    </button>
  );
}

function notifier(titre, corps) {
  const options = { body: corps, icon: "/icon-192.png", badge: "/icon-192.png", tag: titre };
  if ("serviceWorker" in navigator) {
    navigator.serviceWorker.ready.then(reg => reg.showNotification(titre, options)).catch(() => {
      try { new Notification(titre, options); } catch (e) {}
    });
  } else {
    try { new Notification(titre, options); } catch (e) {}
  }
}
