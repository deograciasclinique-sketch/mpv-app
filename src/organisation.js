/*
 * ORGANISATION DE L'ÉGLISE — d'après le Document cadre d'Africa Life Word Mission (ALWM)
 * (Mission de la Parole de Vie en Afrique). Mission Parole de Vie Burkina est la
 * Coordination nationale d'ALWM au Burkina Faso.
 *
 * Ce fichier ne contient que des données (aucun composant) : niveaux, rôles et
 * attributions, départements, rencontres, formations et circuit des rapports.
 * Les textes sont des résumés fidèles du document cadre.
 */

/* ------------------------------------------------------------------ */
/*  Les 4 niveaux de l'Église                                          */
/* ------------------------------------------------------------------ */

export const NIVEAUX = [
  {
    id: "afrique", label: "Bureau Afrique", court: "Afrique",
    instance: "Bureau Afrique (BA)",
    resume: "Instance dirigeante supérieure d'ALWM, en Afrique et dans la diaspora. Il fixe la politique générale, le plan d'évangélisation et le calendrier des conventions et formations.",
  },
  {
    id: "national", label: "Coordination nationale", court: "National",
    instance: "Bureau de la Coordination Nationale (BCN)",
    resume: "Couvre tout le pays. Elle applique les décisions du Bureau Afrique, élabore le plan d'évangélisation du pays et le soumet au BA, adopte le budget et examine les rapports des districts.",
  },
  {
    id: "district", label: "District", court: "District",
    instance: "Bureau de la Coordination de District (BCD)",
    resume: "Regroupe au moins deux assemblées. Il applique les décisions de la Coordination nationale, consolide le budget et examine les rapports d'activités des assemblées.",
  },
  {
    id: "assemblee", label: "Assemblée", court: "Assemblée",
    instance: "Comité Directeur (CD)",
    resume: "Rassemblement des frères et sœurs sauvés d'une localité. Elle est dirigée par un Pasteur principal et son adjoint, nommés par le Coordonnateur national, avec le Comité Directeur.",
  },
  {
    id: "membre", label: "Membre", court: "Membre",
    instance: "Assemblée générale",
    resume: "Tout frère ou sœur sauvé, résidant ou de passage dans la localité, est d'office convié à l'assemblée, qui est une réunion de famille.",
  },
];

/* ------------------------------------------------------------------ */
/*  Les 8 départements officiels (+ « Autres » pour les anciennes      */
/*  données). Chaque département existe aux 4 niveaux :               */
/*  Chef Afrique → Chef national → Délégué de district →              */
/*  Porte-parole d'assemblée.                                          */
/* ------------------------------------------------------------------ */

export const DEPARTEMENTS_ALWM = [
  {
    nom: "Mission et Formation", sigle: "DMF",
    role: "Coordonne les missions évangéliques et les formations.",
    missions: [
      "Enseigner les nouveaux sauvés : bases de la marche chrétienne et points doctrinaux.",
      "Former les sauvés appelés à devenir prédicateurs ou pasteurs (École des prédicateurs).",
      "Mettre à niveau et recycler ceux qui sont déjà sur le terrain.",
      "Avec le Pasteur principal, assigner les prédicateurs et les thèmes des séminaires.",
    ],
  },
  {
    nom: "Communication", sigle: "DC",
    role: "Chargé de la communication et de l'information au sein de l'Église.",
    missions: [
      "Diffuser les informations, programmes et décisions à tous les niveaux.",
      "Relayer les enseignements (QG, conventions) sur les réseaux autorisés.",
    ],
  },
  {
    nom: "Arts et Culture", sigle: "DAC",
    role: "Promeut l'art, la culture et la louange au service de la propagation de l'Évangile.",
    missions: [
      "Organiser la louange, les chorales et les groupes musicaux.",
      "Valoriser les talents artistiques des membres.",
    ],
  },
  {
    nom: "Finances", sigle: "DF",
    role: "Responsable du budget, de la gestion financière, de la comptabilité et de la centrale d'achats.",
    missions: [
      "Élaborer et suivre le budget ; tenir les comptes et les états financiers.",
      "Tenir la caisse et le journal de caisse ; payer les factures et le soutien des pasteurs.",
      "Cosigner les paiements avec le responsable (Pasteur, Coordonnateur).",
      "À l'assemblée : l'agent comptable est le porte-parole des Finances, le trésorier tient la caisse unique.",
    ],
  },
  {
    nom: "Protocole", sigle: "DP",
    role: "Chargé des affaires protocolaires et événementielles, sur deux axes : le protocole et la sécurité.",
    missions: [
      "Assurer la bienséance et l'accueil dans les cérémonies officielles.",
      "Veiller à la sécurité des membres pendant les rencontres.",
    ],
  },
  {
    nom: "Développement Socioéconomique et Famille", sigle: "DDSEF",
    role: "Responsable des activités économiques et de l'épanouissement social de l'Église en tant que famille.",
    missions: [
      "Animer les quatre groupes d'action : Hommes, Femmes, Jeunes et Plus jeunes.",
      "Porter les projets à caractère économique et social.",
    ],
  },
  {
    nom: "Patrimoine, Logistique et Investissements", sigle: "DPLI",
    role: "Organise et gère au mieux le patrimoine, la logistique et les investissements.",
    missions: [
      "Inventorier et entretenir les biens (terrains, bâtiments, matériel).",
      "Organiser la logistique des activités et suivre les investissements.",
    ],
  },
  {
    nom: "Affaires Juridiques et Règlementation", sigle: "DAJR",
    role: "Veille à la conformité juridique et administrative de l'Église.",
    missions: [
      "Préparer et suivre les documents officiels déposés auprès des autorités.",
      "Conseiller les instances sur les règles et la réglementation en vigueur.",
    ],
  },
];

export const DEPT_AUTRES = "Autres";
export const DEPARTEMENTS_NOMS = [...DEPARTEMENTS_ALWM.map(d => d.nom), DEPT_AUTRES];

const sansAccent = (x) => (x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();

// Ramène un ancien nom de département (ou un texte libre) au nom officiel.
// Ex : « Missions et Formations » → « Mission et Formation » ; « Finance » → « Finances ».
export function normDept(text) {
  const t = sansAccent(text);
  if (!t.trim()) return text || "";
  // Mots entiers seulement : « département » ne doit pas être lu comme « art ».
  const a = (re) => re.test(t);
  if (a(/\bmissions?\b/) || a(/\bformations?\b/) || a(/\bdmf\b/)) return "Mission et Formation";
  if (a(/\bcommunication\b/)) return "Communication";
  if (a(/\bsocio/) || a(/\bfamilles?\b/)) return "Développement Socioéconomique et Famille";
  if (a(/\bfinances?\b/) || a(/\bfinanc/)) return "Finances";
  if (a(/\barts?\b/) || a(/\bculture\b/) || a(/\blouange\b/) || a(/\bchorale\b/)) return "Arts et Culture";
  if (a(/\bprotocole\b/) || a(/\bsecurite\b/)) return "Protocole";
  if (a(/\bpatrimoine\b/) || a(/\blogistique\b/) || a(/\binvestissements?\b/)) return "Patrimoine, Logistique et Investissements";
  if (a(/\bjuridiques?\b/) || a(/\breglement/)) return "Affaires Juridiques et Règlementation";
  if (a(/\bautres?\b/)) return DEPT_AUTRES;
  return text;
}

export function deptInfo(nom) {
  return DEPARTEMENTS_ALWM.find(d => d.nom === normDept(nom)) || null;
}

/* ------------------------------------------------------------------ */
/*  Postes du Comité Directeur d'une assemblée                         */
/* ------------------------------------------------------------------ */

export const POSTES_CD = [
  "Pasteur principal",
  "Pasteur principal adjoint",
  "Secrétaire d'assemblée",
  "Secrétaire adjoint",
  "Trésorier(e)",
  "Agent comptable",
  ...DEPARTEMENTS_ALWM.map(d => `Porte-parole ${d.nom}`),
  "Conseiller",
];

// Responsabilités hors Comité Directeur que les assemblées utilisaient déjà.
export const POSTES_AUTRES = [
  "Responsable des Hommes",
  "Responsable des Femmes",
  "Responsable des Jeunes",
  "Responsable des Plus jeunes",
  "Responsable Évangélisation",
  "Responsable Intercession / Prière",
  "Coordonnateur des cultes",
  "Trésorier adjoint",
  "Président du comité",
  "Vice-président",
];

// Anciens libellés → libellés du document cadre.
const ANCIENS_POSTES = {
  "Pasteur titulaire": "Pasteur principal",
  "Secrétaire": "Secrétaire d'assemblée",
  "Trésorier / Financier": "Trésorier(e)",
  "Responsable Mission et Formation": "Porte-parole Mission et Formation",
  "Responsable Communication": "Porte-parole Communication",
  "Responsable Patrimoine": "Porte-parole Patrimoine, Logistique et Investissements",
  "Responsable Socioculturel et Famille": "Porte-parole Développement Socioéconomique et Famille",
  "Responsable Accueil / Protocole": "Porte-parole Protocole",
  "Responsable Chorale / Louange": "Porte-parole Arts et Culture",
  "Responsable des Enfants": "Responsable des Plus jeunes",
};
export function normPoste(p) {
  return (p && ANCIENS_POSTES[p]) || p || "";
}

/* ------------------------------------------------------------------ */
/*  Fonctions proposées dans le répertoire (anciennes conservées)      */
/* ------------------------------------------------------------------ */

export const FONCTIONS_ORGANISATION = [
  "Point focal",
  "Coordonnateur national",
  "Chef de département national",
  "Coordonnateur de district",
  "Délégué de district",
  "Pasteur principal",
  "Pasteur principal adjoint",
  "Porte-parole de département",
];

/* ------------------------------------------------------------------ */
/*  Rôles : qui fait quoi                                              */
/*  actions : raccourcis vers les onglets de l'app (id d'onglet).       */
/* ------------------------------------------------------------------ */

export const ROLES = [
  // ---------------- BUREAU AFRIQUE ----------------
  {
    id: "pa", niveau: "afrique", titre: "Président Afrique (PA)",
    nommePar: "Dirige le Bureau Afrique.",
    missions: [
      "Garde l'unité du corps de Christ avec Korea Life Word Mission et les nations d'ALWM.",
      "Supervise la mission en Afrique et ouvre les nouveaux champs missionnaires.",
      "Désigne les membres du Bureau Afrique, les points focaux et les coordonnateurs nationaux.",
      "Choisit et envoie les missionnaires internationaux.",
      "Convoque et préside la Convention internationale et les réunions du Bureau Afrique.",
      "Supervise la gestion financière et ordonne les dépenses d'ALWM.",
      "Représente ALWM auprès des autorités ; tranche les divergences sur la base des Écritures.",
    ],
    actions: [["Direction", "direction"], ["Organigramme", "eglise:organigramme"]],
  },
  {
    id: "vpa", niveau: "afrique", titre: "Vice-Président Afrique",
    nommePar: "Ancien désigné par le Président Afrique.",
    missions: [
      "Seconde le Président Afrique dans ses tâches.",
      "Le remplace de plein droit en cas de décès ou d'invalidité totale.",
    ],
    actions: [["Organigramme", "eglise:organigramme"]],
  },
  {
    id: "sba", niveau: "afrique", titre: "Secrétaire du Bureau Afrique",
    nommePar: "Placé sous l'autorité directe du Président Afrique.",
    missions: [
      "Tient le projet d'activités annuel du Bureau Afrique et rappelle son exécution.",
      "Gère les voyages des missionnaires et les tâches administratives du BA.",
      "Centralise les statistiques générales et les archives d'ALWM.",
      "Prépare les réunions et le compte rendu de la réunion précédente.",
    ],
    actions: [["Réunions & comptes rendus", "messagerie"]],
  },
  {
    id: "cpa", niveau: "afrique", titre: "Conseiller du Président Afrique",
    nommePar: "Choisi par le PA parmi les frères qui ne sont pas nouvellement convertis.",
    missions: [
      "Donne son avis selon les Écritures et son expérience quand il est consulté.",
      "Conduit des missions particulières confiées par le PA et lui en rend compte.",
    ],
    actions: [],
  },
  {
    id: "cda", niveau: "afrique", titre: "Chef de Département Afrique",
    nommePar: "Désigné par le Président Afrique pour ses compétences et sa probité.",
    missions: [
      "Conçoit les fiches techniques et tutoriels de son domaine pour les départements pays.",
      "Suit leur mise en œuvre dans les pays.",
      "Soumet au BA un projet d'activités annuel avec un budget prévisionnel.",
      "Assiste les chefs de département nationaux et garde une copie de leur projet d'activités.",
    ],
    actions: [["Plans des départements", "coordination"]],
  },
  {
    id: "pf", niveau: "afrique", titre: "Point focal",
    nommePar: "Émissaire permanent du PA auprès des coordinations nationales d'une zone.",
    missions: [
      "Porte et explique aux coordonnateurs nationaux les décisions et programmes du BA.",
      "Fait faire aux coordonnateurs ce qui leur est demandé, sans le faire à leur place.",
      "Fait chaque mois la synthèse de sa zone et un bilan annuel détaillé pour le PA.",
      "Achemine au BA les projets d'activités, synthèses de séminaires, rapports financiers, journaux de caisse et statistiques de chaque pays.",
      "Présente au BA les besoins des pays (matériel, missionnaires, appui financier, prière).",
    ],
    actions: [["Rapports", "rapport"], ["Finances", "finances"]],
  },

  // ---------------- COORDINATION NATIONALE ----------------
  {
    id: "cn", niveau: "national", titre: "Coordonnateur national",
    nommePar: "Nommé par le Président Afrique ; dirige le Bureau de la Coordination Nationale.",
    missions: [
      "Garde l'unité avec le Bureau Afrique et avec les districts du pays.",
      "Supervise la mission dans le pays et ouvre les nouveaux champs missionnaires.",
      "Propose au PA les membres du BCN ; nomme les pasteurs principaux et les coordonnateurs de district.",
      "Choisit les missionnaires avec le chef du département Mission et Formation.",
      "Convoque et préside le BCN, la Convention nationale et la CNPP.",
      "Supervise la gestion financière et ordonne les dépenses de la coordination.",
      "Représente l'Église auprès des autorités et dépose ses documents officiels.",
    ],
    actions: [["Valider les séminaires", "coordination"], ["Districts", "eglise:districts"], ["Finances nationales", "finances"]],
  },
  {
    id: "sbcn", niveau: "national", titre: "Secrétaire du BCN",
    nommePar: "Placé sous l'autorité directe du Coordonnateur national.",
    missions: [
      "Tient le projet d'activités annuel du BCN et rappelle son exécution aux districts et départements.",
      "Gère les voyages des missionnaires nationaux et les tâches administratives.",
      "Centralise les statistiques et les archives de la coordination ; dresse les états de synthèse.",
      "Prépare les réunions du bureau et le compte rendu de la précédente.",
    ],
    actions: [["Réunions & comptes rendus", "messagerie"], ["Membres (vue nationale)", "coordination"]],
  },
  {
    id: "ccn", niveau: "national", titre: "Conseiller du Coordonnateur national",
    nommePar: "Choisi parmi les plus anciens ayant un ministère d'autorité ou de service.",
    missions: [
      "Donne son avis quand il est consulté.",
      "Conduit des missions particulières et en rend compte au Coordonnateur national.",
    ],
    actions: [],
  },
  {
    id: "cdn", niveau: "national", titre: "Chef de département national",
    nommePar: "Désigné par le Coordonnateur national ; rattaché fonctionnellement au Chef de département Afrique.",
    missions: [
      "Applique dans le pays les instructions du BA pour son domaine.",
      "Tient à jour les fiches techniques et tutoriels de son domaine.",
      "Soumet au BCN un projet d'activités annuel avec un budget prévisionnel.",
      "Assiste les délégués de district et suit les rapports avec les coordonnateurs de district.",
    ],
    actions: [["Plan de mon département", "coordination"], ["Réunions", "messagerie"]],
  },

  // ---------------- DISTRICT ----------------
  {
    id: "cd", niveau: "district", titre: "Coordonnateur de district",
    nommePar: "Nommé par le Coordonnateur national ; dirige le Bureau de la Coordination de District.",
    missions: [
      "Garde l'unité avec la Coordination nationale et avec les assemblées du district.",
      "Coordonne la mission d'évangélisation dans le district.",
      "Convoque et préside le BCD, les réunions des pasteurs et des délégués, la CPPD et le culte d'ensemble.",
      "Examine les rapports d'activités des assemblées et consolide leur budget.",
      "Toute activité qui implique plus d'une assemblée demande son avis.",
      "Supervise la gestion financière du district et ordonne ses dépenses.",
    ],
    actions: [["Suivi des rapports du district", "eglise:districts"], ["Réunions", "messagerie"]],
  },
  {
    id: "sbcd", niveau: "district", titre: "Secrétaire du Bureau du district",
    nommePar: "Au service du Coordonnateur de district.",
    missions: [
      "Gère l'agenda et les tâches administratives du coordonnateur.",
      "Tient le projet d'activités annuel du district et rappelle son exécution.",
      "Centralise les statistiques et les archives du district ; dresse les états de synthèse.",
      "Prépare les réunions et le compte rendu de la précédente.",
    ],
    actions: [["Suivi des rapports du district", "eglise:districts"], ["Comptes rendus", "messagerie"]],
  },
  {
    id: "ccd", niveau: "district", titre: "Conseiller du Coordonnateur de district",
    nommePar: "Choisi parmi les plus anciens du district.",
    missions: [
      "Donne son avis quand il est consulté.",
      "Conduit des missions particulières et en rend compte au Coordonnateur de district.",
    ],
    actions: [],
  },
  {
    id: "dd", niveau: "district", titre: "Délégué de district (d'un département)",
    nommePar: "Nommé par le Coordonnateur national sur proposition du Coordonnateur de district et du chef de département national.",
    missions: [
      "Applique dans le district les instructions de son département.",
      "Reste en relation permanente avec le chef de département national.",
      "Soumet au BCD un projet d'activités annuel avec un budget prévisionnel.",
      "Nomme les porte-parole des assemblées avec les pasteurs principaux.",
    ],
    actions: [["Plan de mon département", "coordination"]],
  },

  // ---------------- ASSEMBLÉE ----------------
  {
    id: "pp", niveau: "assemblee", titre: "Pasteur principal",
    nommePar: "Nommé par le Coordonnateur national ; dirige l'assemblée et son Comité Directeur.",
    missions: [
      "Garde l'unité avec le district et entre les membres de l'assemblée.",
      "Représente l'assemblée auprès des autorités locales ; garant de l'éthique, de la sécurité et du bien-être des membres.",
      "Met en place le Comité Directeur et nomme les porte-parole avec les délégués de district.",
      "Préside le Comité Directeur (au moins une fois par mois) et la CPPA.",
      "Propose le calendrier des séminaires, décide des thèmes et assigne les prédicateurs avec le porte-parole Mission et Formation.",
      "Ordonne les dépenses en signant chaque pièce.",
      "Envoie au district son rapport d'activités et le journal de caisse de l'assemblée.",
    ],
    actions: [["Rapport de la semaine", "rapport"], ["Séminaires", "seminaires"], ["Comité & membres", "repertoire"]],
  },
  {
    id: "ppa", niveau: "assemblee", titre: "Pasteur principal adjoint",
    nommePar: "Nommé par le Coordonnateur national.",
    missions: [
      "Assiste le Pasteur principal dans son travail.",
      "Le remplace en cas d'empêchement ou d'absence.",
    ],
    actions: [["Rapport de la semaine", "rapport"], ["Séminaires", "seminaires"]],
  },
  {
    id: "sa", niveau: "assemblee", titre: "Secrétaire d'assemblée",
    nommePar: "Membre du Comité Directeur.",
    missions: [
      "Rédige les comptes rendus du Comité Directeur et des réunions importantes.",
      "Transmet les informations du Pasteur principal à leurs destinataires.",
      "Prépare la note de synthèse des rapports d'activités pour le Pasteur principal.",
      "Enregistre les demandes de baptême et de mariage ; tient les registres et les archives.",
    ],
    actions: [["Membres de l'assemblée", "repertoire"], ["Comptes rendus", "messagerie"], ["Rapport de la semaine", "rapport"]],
  },
  {
    id: "saa", niveau: "assemblee", titre: "Secrétaire adjoint",
    nommePar: "Membre du Comité Directeur.",
    missions: [
      "Assiste le secrétaire d'assemblée.",
      "Le remplace en cas d'empêchement ou d'absence.",
    ],
    actions: [["Membres de l'assemblée", "repertoire"]],
  },
  {
    id: "tres", niveau: "assemblee", titre: "Trésorier(e)",
    nommePar: "Désigné(e) par le Pasteur principal.",
    missions: [
      "Tient la caisse unique de l'assemblée et suit la collecte des fonds.",
      "Met à disposition l'argent des projets programmés et règle les factures.",
      "Paie le soutien des pasteurs, des prédicateurs et du personnel.",
      "Cosigne les paiements avec le Pasteur principal.",
      "Dépose chaque semaine le rapport financier de l'assemblée.",
    ],
    actions: [["Déposer le rapport financier", "finances"]],
  },
  {
    id: "ac", niveau: "assemblee", titre: "Agent comptable",
    nommePar: "Désigné par le Pasteur principal ; porte-parole du département des Finances.",
    missions: [
      "Élabore et suit le budget de toutes les entités de l'assemblée.",
      "Tient les comptes, le tableau de bord budgétaire et les documents financiers.",
      "Vérifie le financement des projets présentés au Comité Directeur.",
      "Rédige les rapports financiers périodiques et annuels pour le Comité Directeur.",
    ],
    actions: [["Finances & caisse", "finances"]],
  },
  {
    id: "pdep", niveau: "assemblee", titre: "Porte-parole de département",
    nommePar: "Nommé par le Pasteur principal avec le Délégué de district.",
    missions: [
      "Applique les instructions du Pasteur principal sous la supervision technique du délégué de district.",
      "Soumet au Comité Directeur un projet d'activités annuel avec un budget prévisionnel.",
      "Réalise ce projet et en fait le rapport avec le Pasteur principal.",
    ],
    actions: [["Plan de mon département", "coordination"], ["Rapport de la semaine", "rapport"]],
  },
  {
    id: "cons", niveau: "assemblee", titre: "Conseiller (pasteur de l'assemblée)",
    nommePar: "Tout pasteur membre de l'assemblée est d'office conseiller du Comité Directeur.",
    missions: [
      "Donne son avis au Pasteur principal quand il est consulté.",
      "Accomplit les missions particulières qu'il lui confie.",
    ],
    actions: [["Séminaires", "seminaires"]],
  },
  {
    id: "pred", niveau: "assemblee", titre: "Prédicateur / Aspirant prédicateur",
    nommePar: "Membre de la Communion des Pasteurs et Prédicateurs de l'assemblée (CPPA).",
    missions: [
      "Prêche dans les séminaires bibliques auxquels il est affecté.",
      "Participe à la CPPA : prière, communion fraternelle, renforcement des capacités.",
      "Rend compte de ses séminaires et de sa lecture de la Bible.",
    ],
    actions: [["Mes séminaires", "seminaires"], ["Bible & rapport de lecture", "bible"]],
  },

  // ---------------- MEMBRE ----------------
  {
    id: "membre", niveau: "membre", titre: "Membre de l'assemblée",
    nommePar: "Frère ou sœur sauvé(e).",
    missions: [
      "Participe au culte d'assemblée, au QG et aux conventions.",
      "Prend part à la casse de béquilles : inviter d'autres âmes aux séminaires bibliques.",
      "Suit les formations (formation classique) et la lecture de la Bible.",
    ],
    actions: [["Programme", "programme"], ["Bible", "bible"], ["Réunions & annonces", "messagerie"]],
  },
];

export function roleById(id) {
  return ROLES.find(r => r.id === id) || null;
}

/* ------------------------------------------------------------------ */
/*  Rencontres (convocations) et formations                             */
/* ------------------------------------------------------------------ */

export const RENCONTRES = [
  { nom: "Convention internationale", niveau: "afrique", quand: "Selon le calendrier du Bureau Afrique", qui: "Convoquée et présidée par le Président Afrique", but: "Rassemble tous les membres d'Afrique et de la diaspora." },
  { nom: "QG Afrique", niveau: "afrique", quand: "Chaque lundi, 17h – 21h30 (Yaoundé), en ligne", qui: "Président Afrique", but: "Chaque pays se connecte et suit ses enseignements." },
  { nom: "Réunion du Bureau Afrique", niveau: "afrique", quand: "Sur convocation du PA", qui: "Président Afrique", but: "Décisions stratégiques ; présence obligatoire ou représentation avec rapport." },
  { nom: "Convention nationale", niveau: "national", quand: "À la demande du Coordonnateur national, validée par le PA", qui: "Coordonnateur national, avec un Président du comité d'organisation (PCO)", but: "Rapports des districts, enseignements, ateliers ; rapport final envoyé au BA." },
  { nom: "QG national", niveau: "national", quand: "Une fois par semaine", qui: "Principal responsable national", but: "Informer sur la vie de l'Église et édifier les sauvés." },
  { nom: "Réunion du BCN", niveau: "national", quand: "Sur convocation du Coordonnateur national", qui: "Coordonnateur national", but: "Présence obligatoire ou représentation avec rapport." },
  { nom: "CNPP — Communion nationale des pasteurs et prédicateurs", niveau: "national", quand: "Sur convocation du Coordonnateur national", qui: "Coordonnateur national, avec un Secrétaire permanent", but: "Prière, communion fraternelle, renforcement des capacités, questions doctrinales." },
  { nom: "QG du district", niveau: "district", quand: "Chaque semaine, un autre jour que le QG national", qui: "Sous la supervision du Coordonnateur national", but: "Relaie les enseignements au niveau régional." },
  { nom: "Culte d'ensemble", niveau: "district", quand: "Sur convocation du Coordonnateur de district", qui: "Coordonnateur de district", but: "Rassemble toutes les assemblées du district." },
  { nom: "Réunion du BCD", niveau: "district", quand: "Sur convocation du Coordonnateur de district", qui: "Coordonnateur de district", but: "Diffusée largement ; rappel par SMS, WhatsApp ou téléphone." },
  { nom: "CPPD — Communion des pasteurs et prédicateurs du district", niveau: "district", quand: "Sur convocation du Coordonnateur de district", qui: "Coordonnateur de district", but: "Prière pour les besoins du district et communion fraternelle." },
  { nom: "Comité Directeur", niveau: "assemblee", quand: "Au moins une fois par mois", qui: "Pasteur principal", but: "Planifier, suivre le budget, examiner les rapports, discipline." },
  { nom: "CPPA — Communion des pasteurs et prédicateurs de l'assemblée", niveau: "assemblee", quand: "Sur convocation du Pasteur principal", qui: "Pasteur principal", but: "Prière et communion fraternelle entre pasteurs et prédicateurs." },
  { nom: "Culte d'assemblée", niveau: "assemblee", quand: "Selon l'horaire de l'assemblée", qui: "Pasteur principal", but: "Rassemblement de base ; premier lieu d'accueil des nouveaux nés." },
];

export const FORMATIONS = [
  { nom: "Séminaire biblique", detail: "Rencontre entre un ou plusieurs prédicateurs et des âmes prêtes à écouter l'Évangile. C'est l'instrument majeur d'évangélisation ; il peut avoir plusieurs sessions et être organisé par presque toutes les entités." },
  { nom: "Casse de béquilles", detail: "Évangélisation menée avant un séminaire pour y inviter des âmes : personnelle, planifiée par l'assemblée, ou par un groupe missionnaire." },
  { nom: "Formation classique", detail: "Entrée en matière dans les enseignements bibliques pour le né de nouveau : 6 jours en internat, ou durée variable en externat." },
  { nom: "Capacitation (École des prédicateurs)", detail: "Cycle de 2 ans pour les futurs pasteurs et prédicateurs. Il faut au moins 3 ans dans la foi et 2 formations classiques." },
  { nom: "Renforcement des capacités", detail: "Mise à niveau des ministères d'autorité et de service déjà actifs, ou harmonisation de nouvelles orientations." },
];

/* ------------------------------------------------------------------ */
/*  Circuit des rapports (du terrain jusqu'au Bureau Afrique)           */
/* ------------------------------------------------------------------ */

export const CIRCUIT_RAPPORTS = [
  { qui: "Assemblée", quoi: "Le Pasteur principal fait la synthèse des rapports de son Comité Directeur et envoie au district le rapport d'activités et le journal de caisse, avec les pièces justificatives.", tab: "rapport" },
  { qui: "District", quoi: "Le Bureau du district examine les rapports des assemblées, relève les écarts et consolide le budget.", tab: "eglise:districts" },
  { qui: "Coordination nationale", quoi: "Le BCN examine les rapports des districts : écarts sur les prévisions, le budget, les objectifs et les décisions de la Convention.", tab: "coordination" },
  { qui: "Point focal", quoi: "Achemine au Bureau Afrique les projets d'activités, la synthèse mensuelle des séminaires, les rapports financiers, les journaux de caisse et les statistiques.", tab: "finances" },
  { qui: "Bureau Afrique", quoi: "Fait la synthèse et la renvoie aux coordinations nationales.", tab: null },
];
