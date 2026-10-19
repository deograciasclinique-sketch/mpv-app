import React from "react";
import ReactDOM from "react-dom/client";
// Polices intégrées à l'application : même rendu avec ou sans internet.
import "@fontsource/inter/400.css";
import "@fontsource/inter/500.css";
import "@fontsource/inter/600.css";
import "@fontsource/inter/700.css";
import "@fontsource/fraunces/500.css";
import "@fontsource/fraunces/600.css";
import "@fontsource/fraunces/700.css";
import App from "./App.jsx";
import { demarrerNatif } from "./natif.js";
import "./index.css";

demarrerNatif();

/* Filet de sécurité : si une partie de l'app plante, on affiche un écran propre
   (au lieu d'un écran blanc) avec un bouton pour relancer. Aucune donnée n'est perdue. */
class FiletDeSecurite extends React.Component {
  constructor(p) { super(p); this.state = { erreur: null }; }
  static getDerivedStateFromError(erreur) { return { erreur }; }
  componentDidCatch(erreur, info) { try { console.error("Erreur Life Word Mission :", erreur, info && info.componentStack); } catch (e) {} }
  render() {
    if (!this.state.erreur) return this.props.children;
    const msg = String((this.state.erreur && this.state.erreur.message) || this.state.erreur).slice(0, 300);
    const s = {
      page: { minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", padding: 24, background: "#1E2A4A", fontFamily: "Inter, system-ui, sans-serif" },
      carte: { background: "#fff", borderRadius: 20, padding: "26px 20px", maxWidth: 380, width: "100%", textAlign: "center", boxShadow: "0 20px 40px rgba(0,0,0,.3)" },
      btn: { display: "block", width: "100%", border: 0, borderRadius: 12, padding: "14px", fontSize: 15, fontWeight: 700, marginTop: 10, cursor: "pointer" },
    };
    return (
      <div style={s.page}>
        <div style={s.carte}>
          <img src="/icon-192.png" alt="" width="72" height="72" style={{ borderRadius: 20 }} />
          <div style={{ fontFamily: "Fraunces, Georgia, serif", fontSize: 21, fontWeight: 700, color: "#1E2A4A", margin: "14px 0 6px" }}>Un petit souci est survenu</div>
          <div style={{ fontSize: 14, color: "#6A6D74", lineHeight: 1.5 }}>L'application a rencontré une erreur sur cet écran. Vos données sont en sécurité. Touchez « Relancer » pour continuer.</div>
          <button style={{ ...s.btn, background: "#1E2A4A", color: "#fff", marginTop: 18 }} onClick={() => window.location.reload()}>Relancer l'application</button>
          <button style={{ ...s.btn, background: "#F3E7C7", color: "#1E2A4A" }} onClick={() => window.open("https://wa.me/?text=" + encodeURIComponent("Erreur dans l'application Life Word Mission : " + msg), "_blank")}>Signaler le problème (WhatsApp)</button>
          <div style={{ fontSize: 11, color: "#9A9CA2", marginTop: 14, wordBreak: "break-word" }}>Détail technique : {msg}</div>
        </div>
      </div>
    );
  }
}

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <FiletDeSecurite>
      <App />
    </FiletDeSecurite>
  </React.StrictMode>
);
