/*
 * PAYS — Life Word Mission est utilisée par toutes les coordinations
 * nationales d'Afrique et de la diaspora. Chaque pays a ses propres données
 * (assemblées, séminaires, rapports, finances, membres, districts).
 *
 * Le pays choisi est gardé sur le téléphone (localStorage « lwm-pays »).
 * Changer de pays recharge l'application.
 */

export const APP_NOM = "Life Word Mission";
export const APP_NOM_COURT = "LWM";

// Pays dont les données sont stockées sans préfixe (données historiques de l'app).
export const PAYS_HISTORIQUE = "BF";

// code ISO, nom, indicatif téléphonique, monnaie affichée, zone.
const A = (code, nom, indicatif, devise) => ({ code, nom, indicatif, devise, zone: "afrique" });
const D = (code, nom, indicatif, devise) => ({ code, nom, indicatif, devise, zone: "diaspora" });

export const PAYS = [
  // ----- Afrique -----
  A("ZA", "Afrique du Sud", "27", "ZAR"),
  A("DZ", "Algérie", "213", "DZD"),
  A("AO", "Angola", "244", "AOA"),
  A("BJ", "Bénin", "229", "FCFA"),
  A("BW", "Botswana", "267", "BWP"),
  A("BF", "Burkina Faso", "226", "FCFA"),
  A("BI", "Burundi", "257", "BIF"),
  A("CV", "Cap-Vert", "238", "CVE"),
  A("CM", "Cameroun", "237", "FCFA"),
  A("CF", "Centrafrique", "236", "FCFA"),
  A("KM", "Comores", "269", "KMF"),
  A("CG", "Congo (Brazzaville)", "242", "FCFA"),
  A("CD", "Congo (RDC)", "243", "CDF"),
  A("CI", "Côte d'Ivoire", "225", "FCFA"),
  A("DJ", "Djibouti", "253", "DJF"),
  A("EG", "Égypte", "20", "EGP"),
  A("ER", "Érythrée", "291", "ERN"),
  A("SZ", "Eswatini", "268", "SZL"),
  A("ET", "Éthiopie", "251", "ETB"),
  A("GA", "Gabon", "241", "FCFA"),
  A("GM", "Gambie", "220", "GMD"),
  A("GH", "Ghana", "233", "GHS"),
  A("GN", "Guinée", "224", "GNF"),
  A("GW", "Guinée-Bissau", "245", "FCFA"),
  A("GQ", "Guinée équatoriale", "240", "FCFA"),
  A("KE", "Kenya", "254", "KES"),
  A("LS", "Lesotho", "266", "LSL"),
  A("LR", "Liberia", "231", "LRD"),
  A("LY", "Libye", "218", "LYD"),
  A("MG", "Madagascar", "261", "MGA"),
  A("MW", "Malawi", "265", "MWK"),
  A("ML", "Mali", "223", "FCFA"),
  A("MA", "Maroc", "212", "MAD"),
  A("MU", "Maurice", "230", "MUR"),
  A("MR", "Mauritanie", "222", "MRU"),
  A("MZ", "Mozambique", "258", "MZN"),
  A("NA", "Namibie", "264", "NAD"),
  A("NE", "Niger", "227", "FCFA"),
  A("NG", "Nigeria", "234", "NGN"),
  A("UG", "Ouganda", "256", "UGX"),
  A("RW", "Rwanda", "250", "RWF"),
  A("ST", "Sao Tomé-et-Principe", "239", "STN"),
  A("SN", "Sénégal", "221", "FCFA"),
  A("SC", "Seychelles", "248", "SCR"),
  A("SL", "Sierra Leone", "232", "SLE"),
  A("SO", "Somalie", "252", "SOS"),
  A("SD", "Soudan", "249", "SDG"),
  A("SS", "Soudan du Sud", "211", "SSP"),
  A("TZ", "Tanzanie", "255", "TZS"),
  A("TD", "Tchad", "235", "FCFA"),
  A("TG", "Togo", "228", "FCFA"),
  A("TN", "Tunisie", "216", "TND"),
  A("ZM", "Zambie", "260", "ZMW"),
  A("ZW", "Zimbabwe", "263", "USD"),
  // ----- Diaspora -----
  D("DE", "Allemagne", "49", "EUR"),
  D("BE", "Belgique", "32", "EUR"),
  D("CA", "Canada", "1", "CAD"),
  D("CN", "Chine", "86", "CNY"),
  D("KR", "Corée du Sud", "82", "KRW"),
  D("AE", "Émirats arabes unis", "971", "AED"),
  D("ES", "Espagne", "34", "EUR"),
  D("US", "États-Unis", "1", "USD"),
  D("FR", "France", "33", "EUR"),
  D("IT", "Italie", "39", "EUR"),
  D("NL", "Pays-Bas", "31", "EUR"),
  D("PT", "Portugal", "351", "EUR"),
  D("GB", "Royaume-Uni", "44", "GBP"),
  D("RU", "Russie", "7", "RUB"),
  D("CH", "Suisse", "41", "CHF"),
  D("TR", "Turquie", "90", "TRY"),
];

// Drapeau à partir du code ISO (ex : BF → 🇧🇫).
export function drapeau(code) {
  if (!code || code.length !== 2) return "🌍";
  return String.fromCodePoint(...[...code.toUpperCase()].map(c => 0x1F1E6 + c.charCodeAt(0) - 65));
}

export function paysParCode(code) {
  return PAYS.find(p => p.code === code) || null;
}

const CLE_PAYS = "lwm-pays";

function lireCodePays() {
  try { return localStorage.getItem(CLE_PAYS) || ""; } catch (e) { return ""; }
}

// Pays de cette session : lu une seule fois au démarrage.
const CODE_COURANT = lireCodePays();
const COURANT = paysParCode(CODE_COURANT);

export function paysChoisi() { return !!COURANT; }
export function paysCourant() { return COURANT || paysParCode(PAYS_HISTORIQUE); }
export function devise() { return paysCourant().devise; }
export function nomPays() { return paysCourant().nom; }

// Choisir (ou changer de) pays : l'app redémarre sur les données de ce pays.
export function choisirPays(code) {
  try { localStorage.setItem(CLE_PAYS, code); } catch (e) {}
  window.location.reload();
}

// Préfixe des documents Firebase du pays : vide pour le Burkina (données historiques).
export function prefixePays(code) {
  const c = code || paysCourant().code;
  return c === PAYS_HISTORIQUE ? "" : `${c}__`;
}
