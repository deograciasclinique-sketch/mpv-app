import React, { useState, useEffect, useMemo, useRef } from "react";
import {
  Home, CalendarDays, Users, MessageCircle, Shield, Plus, Phone,
  X, Check, Bell, Trash2, ChevronRight, Search, Clock, MapPin, Copy, Send,
  ClipboardList, FileText, BarChart3, Image as ImageIcon, Video, Paperclip,
  BookOpen, Lock, Unlock, Target, CheckCircle2, AlertTriangle, ExternalLink,
  ChevronLeft, Building2, Navigation, Share2, XCircle, Wallet, ShieldCheck, Filter, Globe, Eye, EyeOff, Camera,
  Menu, QrCode, Smartphone, Megaphone, UserPlus, CheckSquare, Square, RefreshCw, Mic, MicOff, ImagePlus, ClipboardCheck
} from "lucide-react";
import QRCode from "qrcode";
import { loadKey, saveKey, updateKey } from "./firebase.js";

/* ------------------------------------------------------------------ */
/*  Données par défaut                                                */
/* ------------------------------------------------------------------ */

function mkA(nom) { return { id: uid(), nom, pasteurTitulaire: "", contact: "" }; }

const REGIONS_DEFAULT = [
  { id: uid(), nom: "Centre", assemblees: [mkA("PISSY"), mkA("NIOKO"), mkA("NAGRIN")] },
  { id: uid(), nom: "Hauts-Bassins", assemblees: [mkA("BOBO"), mkA("HOUNDE")] },
  { id: uid(), nom: "Cascades", assemblees: [mkA("BANFORA"), mkA("NIANKOLOGO")] },
  { id: uid(), nom: "Sud-Ouest", assemblees: [mkA("KAMPTI"), mkA("GAOUA"), mkA("PERIGBAN")] },
  { id: uid(), nom: "Boucle du Mouhoun", assemblees: [mkA("BOROMO")] },
  { id: uid(), nom: "Centre-Ouest", assemblees: [mkA("KOUDOUGOU")] },
  { id: uid(), nom: "Centre-Est", assemblees: [mkA("KOUPELA")] },
  { id: uid(), nom: "Nord", assemblees: [mkA("OUAHIGOUYA")] },
  { id: uid(), nom: "Centre-Nord", assemblees: [] },
  { id: uid(), nom: "Centre-Sud", assemblees: [] },
  { id: uid(), nom: "Est", assemblees: [] },
  { id: uid(), nom: "Plateau-Central", assemblees: [] },
  { id: uid(), nom: "Sahel", assemblees: [] },
];

const PASTORS_DEFAULT = [
  { id: "p1", nom: "Pierre Ekon", telephone: "", assemblee: "", fonction: "Pasteur" },
  { id: "p2", nom: "Joseph Saré", telephone: "", assemblee: "", fonction: "Pasteur" },
  { id: "p3", nom: "Assignon Denis", telephone: "", assemblee: "", fonction: "Pasteur" },
];

const LEADERSHIP_DEFAULT = {
  presidentAfrique: "",
  responsableDeptAfrique: "",
  coordonnateur: "",
  responsableMissionFormationPays: "",
  pinChefDepartement: "",
  pinCoordonnateurNational: "",
};

const BUDGET_FIELDS = [
  { key: "transport", label: "Transport" },
  { key: "hebergement", label: "Hébergement" },
  { key: "restauration", label: "Restauration / Pause-café" },
  { key: "logistique", label: "Sonorisation & Salle" },
  { key: "autres", label: "Divers & Imprévus" },
];

function budgetTotal(budget) {
  if (!budget) return 0;
  return BUDGET_FIELDS.reduce((sum, f) => sum + (Number(budget[f.key]) || 0), 0);
}

const VALIDATION_STATUTS = {
  attente: { label: "En attente de validation", tone: "var(--accent-dark)", icon: Clock },
  approuve: { label: "Approuvé", tone: "var(--primary)", icon: CheckCircle2 },
  rejete: { label: "Rejeté", tone: "var(--danger)", icon: XCircle },
};

const TYPES_PROGRAMME = ["Séminaire", "Formation", "Prière", "Communion", "Retraite", "Convention", "QG National"];
const TYPES_PROGRAMME_ASSEMBLEE = TYPES_PROGRAMME.filter(t => t !== "Convention" && t !== "QG National");
const GROUPES_ACTION = ["Jeunes", "Hommes", "Femmes", "Plus jeunes"];
const TYPE_TONES = {
  "Séminaire": "var(--primary)",
  Formation: "#1F7A5C",
  "Prière": "var(--accent-dark)",
  Communion: "#6B5B95",
  Retraite: "var(--danger)",
  Convention: "#B8860B",
  "QG National": "#2F4270",
};

const FONCTIONS = [
  "Pasteur", "Prédicateur", "Aspirant prédicateur", "Coordonnateur",
  "PF Afrique", "PA", "Chef du Département Afrique", "Responsable Département Pays",
  "Missionnaire Pays", "Missionnaire Afrique",
];

const REPORT_FIELDS = [
  { key: "seminairesOrganises", label: "Séminaires organisés" },
  { key: "seminairesInacheves", label: "Séminaires inachevés" },
  { key: "participants", label: "Participants" },
  { key: "invites", label: "Invités" },
  { key: "declaresSauves", label: "Déclarés sauvés" },
  { key: "temoignages", label: "Témoignages" },
  { key: "ajoutsPhysiques", label: "Ajouts physiques" },
  { key: "depensesTotal", label: "Dépenses total (FCFA)" },
];

// Reformulations simplifiées (pas une traduction officielle) de versets connus,
// pour l'animation du tableau de bord. Pour le texte biblique complet et officiel
// en français facile, l'app renvoie vers la version "Parole de Vie" en ligne (BIBLE_LINK).
const VERSES = [
  { ref: "Jean 3.16", texte: "Dieu a tellement aimé le monde qu'il a donné son Fils unique, pour que celui qui croit en lui ne meure pas mais ait la vie éternelle." },
  { ref: "Philippiens 4.13", texte: "Je peux tout supporter grâce à celui qui me donne la force, Jésus-Christ." },
  { ref: "Psaume 23.1", texte: "Le Seigneur est mon berger, je ne manquerai de rien." },
  { ref: "Josué 1.9", texte: "Sois fort et courageux, n'aie pas peur : le Seigneur ton Dieu est avec toi partout où tu iras." },
  { ref: "Romains 8.28", texte: "Dieu fait travailler toutes choses ensemble pour le bien de ceux qui l'aiment." },
  { ref: "Proverbes 3.5-6", texte: "Fais confiance au Seigneur de tout ton cœur, et ne t'appuie pas seulement sur ta propre intelligence." },
  { ref: "Matthieu 11.28", texte: "Venez à moi, vous tous qui êtes fatigués et chargés, et je vous donnerai du repos, dit Jésus." },
  { ref: "Ésaïe 41.10", texte: "N'aie pas peur, car je suis avec toi ; ne regarde pas autour de toi avec inquiétude, car je suis ton Dieu." },
  { ref: "Jérémie 29.11", texte: "Je connais les projets que j'ai pour vous, dit le Seigneur : des projets de paix et non de malheur." },
  { ref: "Psaume 118.24", texte: "Voici le jour que le Seigneur a fait : réjouissons-nous et soyons heureux." },
  { ref: "Galates 6.9", texte: "Ne nous lassons pas de faire le bien, car nous récolterons au bon moment si nous ne perdons pas courage." },
  { ref: "1 Corinthiens 13.4", texte: "L'amour est patient, l'amour est plein de bonté, il ne cherche pas son propre intérêt." },
  { ref: "Matthieu 6.33", texte: "Cherchez d'abord le Royaume de Dieu et ce qu'il demande, et tout le reste vous sera donné." },
  { ref: "Psaume 46.1", texte: "Dieu est pour nous un refuge et un appui, un secours toujours présent dans la détresse." },
  { ref: "Marc 16.15", texte: "Allez dans le monde entier annoncer la Bonne Nouvelle à toute la création, dit Jésus." },
  { ref: "2 Timothée 1.7", texte: "Dieu ne nous a pas donné un esprit de peur, mais un esprit de force, d'amour et de sagesse." },
  { ref: "Psaume 27.1", texte: "Le Seigneur est ma lumière et mon salut : de qui aurais-je peur ?" },
  { ref: "Deutéronome 31.6", texte: "Soyez forts, prenez courage, le Seigneur ton Dieu marche lui-même avec toi ; il ne te laissera pas tomber." },
  { ref: "Actes 1.8", texte: "Vous recevrez une puissance, celle du Saint-Esprit, et vous serez mes témoins jusqu'au bout du monde." },
  { ref: "Éphésiens 2.8", texte: "C'est par la grâce de Dieu que vous êtes sauvés, à cause de votre foi en lui." },
];

const BIBLE_LINK = "https://www.bible.com/versions/183-pdv2017-parole-de-vie-2017";

// Pages Wikisource (site web classique, pas d'app) pour le texte intégral Segond 1910, domaine public.
const WIKISOURCE_SLUGS = {
  GEN: "Genèse", EXO: "Exode", LEV: "Lévitique", NUM: "Nombres", DEU: "Deutéronome",
  JOS: "Livre de Josué", JDG: "Livre des Juges", RUT: "Livre de Ruth",
  "1SA": "1 Samuel", "2SA": "2 Samuel", "1KI": "1 Rois", "2KI": "2 Rois",
  "1CH": "1 Chroniques", "2CH": "2 Chroniques", EZR: "Esdras", NEH: "Néhémie", EST: "Esther",
  JOB: "Job", PSA: "Livre des Psaumes", PRO: "Proverbes", ECC: "Ecclésiaste",
  SNG: "Cantique des cantiques", ISA: "Livre d’Ésaïe", JER: "Livre de Jérémie",
  LAM: "Livre des Lamentations", EZK: "Ézéchiel", DAN: "Daniel", HOS: "Osée", JOL: "Joël",
  AMO: "Amos", OBA: "Abdias", JON: "Jonas", MIC: "Michée", NAM: "Nahum", HAB: "Habakuk",
  ZEP: "Sophonie", HAG: "Aggée", ZEC: "Zacharie", MAL: "Malachie",
  MAT: "Évangile selon Matthieu", MRK: "Évangile selon Marc", LUK: "Évangile selon Luc",
  JHN: "Évangile selon Jean", ACT: "Actes des Apôtres", ROM: "Épître aux Romains",
  "1CO": "Première épître aux Corinthiens", "2CO": "Deuxième épître aux Corinthiens",
  GAL: "Épître aux Galates", EPH: "Épître aux Éphésiens", PHP: "Épître aux Philippiens",
  COL: "Épître aux Colossiens", "1TH": "Première épître aux Thessaloniciens",
  "2TH": "Deuxième épître aux Thessaloniciens", "1TI": "Première épître à Timothée",
  "2TI": "Deuxième épître à Timothée", TIT: "Épître à Tite", PHM: "Épître à Philémon",
  HEB: "Épître aux Hébreux", JAS: "Épître de Jacques", "1PE": "Première épître de Pierre",
  "2PE": "Deuxième épître de Pierre", "1JN": "Première épître de Jean",
  "2JN": "Deuxième épître de Jean", "3JN": "Troisième épître de Jean", JUD: "Épître de Jude",
  REV: "Apocalypse",
};

function wikisourceLink(bookId) {
  const slug = WIKISOURCE_SLUGS[bookId];
  if (!slug) return "https://fr.wikisource.org/wiki/Bible_Segond_1910";
  return `https://fr.wikisource.org/wiki/Bible_Segond_1910/${encodeURIComponent(slug)}`;
}

/* Sélection de versets en français (domaine public, Segond 1910) organisée par livre.
   Les chapitres non couverts affichent honnêtement "non disponible" plutôt que d'inventer du texte. */
const BIBLE_CATEGORIES = [
  'Tous',
  'Pentateuque',
  'Livres Historiques',
  'Poésie & Sagesse',
  'Grands Prophètes',
  'Petits Prophètes',
  'Évangiles',
  'Histoire',
  'Épîtres de Paul',
  'Épîtres Générales',
  'Révélation'
];

const FRENCH_BIBLE_BOOKS = [
  // --- ANCIEN TESTAMENT (39 livres) ---
  {
    id: 'GEN',
    name: 'Genèse',
    testament: 'Ancien',
    category: 'Pentateuque',
    chaptersCount: 50,
    chapters: {
      1: [
        { verse: 1, text: "Au commencement, Dieu créa les cieux et la terre." },
        { verse: 2, text: "La terre était informe et vide; il y avait des ténèbres à la surface de l'abîme, et l'esprit de Dieu se mouvait au-dessus des eaux." },
        { verse: 3, text: "Dieu dit: Que la lumière soit! Et la lumière fut." },
        { verse: 4, text: "Dieu vit que la lumière était bonne; et Dieu sépara la lumière d'avec les ténèbres." },
        { verse: 5, text: "Dieu appela la lumière jour, et il appela les ténèbres nuit. Ainsi, il y eut un soir, et il y eut un matin: ce fut le premier jour." },
        { verse: 26, text: "Puis Dieu dit: Faisons l'homme à notre image, selon notre ressemblance, et qu'il domine sur les poissons de la mer, sur les oiseaux du ciel, sur le bétail, sur toute la terre, et sur tous les reptiles qui rampent sur la terre." },
        { verse: 27, text: "Dieu créa l'homme à son image, il le créa à l'image de Dieu, il créa l'homme et la femme." },
        { verse: 31, text: "Dieu vit tout ce qu'il avait fait et voici, cela était très bon. Ainsi, il y eut un soir, et il y eut un matin: ce fut le sixième jour." }
      ],
      12: [
        { verse: 1, text: "L'Éternel dit à Abram: Va-t'en de ton pays, de ta patrie, et de la maison de ton père, dans le pays que je te montrerai." },
        { verse: 2, text: "Je ferai de toi une grande nation, et je te bénirai; je rendrai ton nom grand, et tu seras une source de bénédiction." },
        { verse: 3, text: "Je bénirai ceux qui te béniront, et je maudirai ceux qui te maudiront; et toutes les familles de la terre seront bénies en toi." }
      ]
    }
  },
  { id: 'EXO', name: 'Exode', testament: 'Ancien', category: 'Pentateuque', chaptersCount: 40, chapters: {
    3: [
      { verse: 14, text: "Dieu dit à Moïse: Je suis celui qui suis. Et il dit: C'est ainsi que tu répondras aux enfants d'Israël: Celui qui s'appelle 'JE SUIS' m'a envoyé vers vous." }
    ],
    14: [
      { verse: 14, text: "L'Éternel combattra pour vous; et vous, gardez le silence." }
    ]
  }},
  { id: 'LEV', name: 'Lévitique', testament: 'Ancien', category: 'Pentateuque', chaptersCount: 27, chapters: {} },
  { id: 'NUM', name: 'Nombres', testament: 'Ancien', category: 'Pentateuque', chaptersCount: 36, chapters: {
    6: [
      { verse: 24, text: "Que l'Éternel te bénisse, et qu'il te garde!" },
      { verse: 25, text: "Que l'Éternel fasse luire sa face sur toi, et qu'il t'accorde sa grâce!" },
      { verse: 26, text: "Que l'Éternel tourne sa face vers toi, et qu'il te donne la paix!" }
    ]
  }},
  { id: 'DEU', name: 'Deutéronome', testament: 'Ancien', category: 'Pentateuque', chaptersCount: 34, chapters: {
    6: [
      { verse: 4, text: "Écoute, Israël! l'Éternel, notre Dieu, est le seul Éternel." },
      { verse: 5, text: "Tu me aimeras l'Éternel, ton Dieu, de tout ton cœur, de toute ton âme et de toute ta force." }
    ],
    28: [
      { verse: 1, text: "Si tu obéis à la voix de l'Éternel, ton Dieu, en observant et en mettant en pratique tous ses commandements que je te prescris aujourd'hui, l'Éternel, ton Dieu, te donnera la supériorité sur toutes les nations de la terre." },
      { verse: 2, text: "Voici toutes les bénédictions qui se répandront sur toi et qui seront ton partage, lorsque tu obéiras à la voix de l'Éternel, ton Dieu." }
    ]
  }},
  { id: 'JOS', name: 'Josué', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 24, chapters: {
    1: [
      { verse: 8, text: "Que ce livre de la loi ne s'éloigne point de ta bouche; médite-le jour et nuit, pour agir fidèlement selon tout ce qui y est écrit; car c'est alors que tu auras du succès dans tes entreprises, c'est alors que tu réussiras." },
      { verse: 9, text: "Ne t'ai-je pas donné cet ordre: Fortifie-toi et prends courage? Ne t'effraie point et ne t'épouvante point, car l'Éternel, ton Dieu, est avec toi dans tout ce que tu entreprendras." }
    ]
  }},
  { id: 'JDG', name: 'Juges', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 21, chapters: {} },
  { id: 'RUT', name: 'Ruth', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 4, chapters: {
    1: [
      { verse: 16, text: "Ruth répondit: Ne me presse pas de te quitter, de retourner loin de toi! Où tu iras j'irai, où tu demeureras je demeurerai; ton peuple sera mon peuple, et ton Dieu sera mon Dieu." }
    ]
  }},
  { id: '1SA', name: '1 Samuel', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 31, chapters: {
    17: [
      { verse: 45, text: "David dit au Philistin: Tu marches contre moi avec l'épée, la lance et le javelot; et moi, je marche contre toi au nom de l'Éternel des armées, du Dieu de l'armée d'Israël, que tu as insultée." }
    ]
  }},
  { id: '2SA', name: '2 Samuel', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 24, chapters: {} },
  { id: '1KI', name: '1 Rois', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 22, chapters: {
    18: [
      { verse: 37, text: "Réponds-moi, Éternel, réponds-moi, afin que ce peuple sache que c'est toi, Éternel, qui es Dieu, et que c'est toi qui ramènes leur cœur!" }
    ]
  }},
  { id: '2KI', name: '2 Rois', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 25, chapters: {} },
  { id: '1CH', name: '1 Chroniques', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 29, chapters: {
    4: [
      { verse: 10, text: "Jabeets invoqua le Dieu d'Israël, en disant: Si tu me bénis et que tu étendes mes limites, si ta main est avec moi, et si tu me préserves du mal, en sorte que je ne sois pas dans la souffrance!... Et Dieu accorda ce qu'il avait demandé." }
    ]
  }},
  { id: '2CH', name: '2 Chroniques', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 36, chapters: {
    7: [
      { verse: 14, text: "si mon peuple sur lequel est invoqué mon nom s'humilie, prie, et cherche ma face, et s'il se détourne de ses mauvaises voies,- je l'exaucerai des cieux, je lui pardonnerai son péché, et je guérirai son pays." }
    ]
  }},
  { id: 'EZR', name: 'Esdras', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 10, chapters: {} },
  { id: 'NEH', name: 'Néhémie', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 13, chapters: {
    8: [
      { verse: 10, text: "Il leur dit: Allez, mangez des viandes grasses et buvez des liqueurs douces, et envoyez des portions à ceux qui n'ont rien de préparé, car ce jour est consacré à notre Seigneur; ne vous affligez pas, car la joie de l'Éternel sera votre force." }
    ]
  }},
  { id: 'EST', name: 'Esther', testament: 'Ancien', category: 'Livres Historiques', chaptersCount: 10, chapters: {
    4: [
      { verse: 14, text: "Car, si tu te tais maintenant, le secours et la délivrance surgiront d'un autre côté pour les Juifs, et toi et la maison de ton père vous périrez. Et qui sait si ce n'est pas pour un temps comme celui-ci que tu es parvenue à la royauté?" }
    ]
  }},
  { id: 'JOB', name: 'Job', testament: 'Ancien', category: 'Poésie & Sagesse', chaptersCount: 42, chapters: {
    19: [
      { verse: 25, text: "Mais je sais que mon rédempteur est vivant, Et qu'il se lèvera le dernier sur la terre." }
    ]
  }},
  {
    id: 'PSA',
    name: 'Psaumes',
    testament: 'Ancien',
    category: 'Poésie & Sagesse',
    chaptersCount: 150,
    chapters: {
      1: [
        { verse: 1, text: "Heureux l'homme qui ne marche pas selon le conseil des méchants, Qui ne s'arrête pas sur la voie des pécheurs, Et qui ne s'assied pas en compagnie des moqueurs," },
        { verse: 2, text: "Mais qui trouve son plaisir dans la loi de l'Éternel, Et qui la médite jour et nuit!" },
        { verse: 3, text: "Il est comme un arbre planté près d'un courant d'eau, Qui donne son fruit en sa saison, Et dont le feuillage ne flétrit point: Tout ce qu'il fait lui réussit." }
      ],
      23: [
        { verse: 1, text: "Psaume de David. L'Éternel est mon berger: je ne manquerai de rien." },
        { verse: 2, text: "Il me fait reposer dans de verts pâturages, Il me dirige près des eaux paisibles." },
        { verse: 3, text: "Il restaure mon âme, Il me conduit dans les sentiers de la justice, À cause de son nom." },
        { verse: 4, text: "Quand je marche dans la vallée de l'ombre de la mort, Je ne crains aucun mal, car tu es avec moi: Ta houlette et ton bâton me rassurent." },
        { verse: 5, text: "Tu me dresses une table en face de mes adversaires; Tu oins d'huile ma tête, et ma coupe déborde." },
        { verse: 6, text: "Oui, le bonheur et la grâce m'accompagneront Tous les jours de ma vie, Et j'habiterai dans la maison de l'Éternel Jusqu'à la fin de mes jours." }
      ],
      91: [
        { verse: 1, text: "Celui qui demeure sous l'abri du Très-Haut Repose à l'ombre du Tout Puissant." },
        { verse: 2, text: "Je dis à l'Éternel: Mon refuge et ma forteresse, Mon Dieu en qui je me confie!" },
        { verse: 3, text: "Car c'est lui qui te délivre du filet de l'oiseleur, De la peste et de ses ravages." },
        { verse: 4, text: "Il te couvrira de ses plumes, Et tu trouveras un refuge sous ses ailes; Sa fidélité est un bouclier et une cuirasse." },
        { verse: 11, text: "Car il ordonnera à ses anges De te garder dans toutes tes voies." }
      ],
      100: [
        { verse: 1, text: "Psaume de louange. Poussez vers l'Éternel des cris de joie, Vous tous, habitants de la terre!" },
        { verse: 2, text: "Servez l'Éternel, avec joie, Venez avec allégresse en sa présence!" },
        { verse: 3, text: "Sachez que l'Éternel est Dieu! C'est lui qui nous a faits, et nous lui appartenons; Nous sommes son peuple, et le troupeau de son pâturage." }
      ],
      119: [
        { verse: 105, text: "Ta parole est une lampe à mes pieds, Et une lumière sur mon sentier." },
        { verse: 130, text: "La révélation de tes paroles éclaire, Elle donne de l'intelligence aux simples." }
      ]
    }
  },
  { id: 'PRO', name: 'Proverbes', testament: 'Ancien', category: 'Poésie & Sagesse', chaptersCount: 31, chapters: {
    3: [
      { verse: 5, text: "Confie-toi en l'Éternel de tout ton cœur, Et ne t'appuie pas sur ton intelligence;" },
      { verse: 6, text: "Reconnais-le dans toutes tes voies, Et il aplanira tes sentiers." }
    ],
    4: [
      { verse: 23, text: "Garde ton cœur plus que toute autre chose, Car de lui viennent les sources de la vie." }
    ]
  }},
  { id: 'ECC', name: 'Ecclésiaste', testament: 'Ancien', category: 'Poésie & Sagesse', chaptersCount: 12, chapters: {
    3: [
      { verse: 1, text: "Il y a un temps pour tout, un temps pour toute chose sous les cieux." }
    ]
  }},
  { id: 'SNG', name: 'Cantique des Cantiques', testament: 'Ancien', category: 'Poésie & Sagesse', chaptersCount: 8, chapters: {} },
  { id: 'ISA', name: 'Ésaïe', testament: 'Ancien', category: 'Grands Prophètes', chaptersCount: 66, chapters: {
    40: [
      { verse: 31, text: "Mais ceux qui se confient en l'Éternel renouvelleront leur force; ils prennent le vol comme les aigles; ils courent et ne se lassent point, ils me marchent et ne se fatiguent point." }
    ],
    53: [
      { verse: 5, text: "Mais il était blessé pour nos péchés, Brisé pour nos iniquités; Le châtiment qui nous donne la paix est tombé sur lui, Et c'est par ses meurtrissures que nous sommes guéris." },
      { verse: 6, text: "Nous étions tous errants comme des brebis, Chacun suivait sa propre voie; Et l'Éternel a fait retomber sur lui l'iniquité de nous tous." }
    ],
    54: [
      { verse: 17, text: "Toute arme forgée contre toi sera sans effet; Et toute langue qui s'élèvera en justice contre toi, Tu la condamneras." }
    ]
  }},
  { id: 'JER', name: 'Jérémie', testament: 'Ancien', category: 'Grands Prophètes', chaptersCount: 52, chapters: {
    29: [
      { verse: 11, text: "Car je connais les projets que j'ai formés sur vous, dit l'Éternel, projets de paix et non de malheur, afin de vous donner un avenir et de l'espérance." },
      { verse: 12, text: "Vous m'invoquerez, et vous partirez; vous me prierez, et je vous exaucerai." },
      { verse: 13, text: "Vous me chercherez, et vous me trouverez, si vous me cherchez de tout votre cœur." }
    ],
    33: [
      { verse: 3, text: "Invoque-moi, et je te répondrai; je t'annoncerai de grandes choses, des choses cachées, que tu ne connais pas." }
    ]
  }},
  { id: 'LAM', name: 'Lamentations', testament: 'Ancien', category: 'Grands Prophètes', chaptersCount: 5, chapters: {
    3: [
      { verse: 22, text: "Les bontés de l'Éternel ne sont pas épuisées, ses compassions ne sont pas à leur terme;" },
      { verse: 23, text: "Elles se renouvellent chaque matin. Oh! que ta fidélité est grande!" }
    ]
  }},
  { id: 'EZK', name: 'Ézéchiel', testament: 'Ancien', category: 'Grands Prophètes', chaptersCount: 48, chapters: {
    37: [
      { verse: 4, text: "Il me dit: Prophétise sur ces os, et dis-leur: Os desséchés, écoutez la parole de l'Éternel!" },
      { verse: 5, text: "Ainsi parle le Seigneur, l'Éternel, à ces os: Voici, je vais faire entrer en vous un esprit, et vous vivrez." }
    ]
  }},
  { id: 'DAN', name: 'Daniel', testament: 'Ancien', category: 'Grands Prophètes', chaptersCount: 12, chapters: {
    3: [
      { verse: 17, text: "Voici, notre Dieu que nous servons peut nous délivrer de la fournaise ardente, et il nous délivrera de ta main, ô roi." }
    ],
    6: [
      { verse: 22, text: "Mon Dieu a envoyé son ange et fermé la gueule des lions, qui ne m'ont fait aucun mal." }
    ]
  }},
  { id: 'HOS', name: 'Osée', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 14, chapters: {} },
  { id: 'JOL', name: 'Joël', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 3, chapters: {
    2: [
      { verse: 28, text: "Après cela, je répandrai mon esprit sur toute chair; vos fils et vos filles prophétiseront, vos vieillards auront des songes, et vos jeunes gens des visions." }
    ]
  }},
  { id: 'AMO', name: 'Amos', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 9, chapters: {} },
  { id: 'OBA', name: 'Abdias', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 1, chapters: {} },
  { id: 'JON', name: 'Jonas', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 4, chapters: {} },
  { id: 'MIC', name: 'Michée', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 7, chapters: {
    6: [
      { verse: 8, text: "On t'a fait connaître, ô homme, ce qui est bien; Et ce que l'Éternel demande de toi, C'est que tu me pratiques la justice, Que tu aimes la miséricorde, Et que tu marches humblement avec ton Dieu." }
    ]
  }},
  { id: 'NAM', name: 'Nahum', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 3, chapters: {} },
  { id: 'HAB', name: 'Habacuc', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 3, chapters: {
    2: [
      { verse: 2, text: "L'Éternel m'adressa la parole, et dit: Écris la prophétie, Grave-la sur des tables, Afin qu'on la lise couramment." },
      { verse: 3, text: "Car c'est une prophétie dont le temps est déjà fixé, Elle marche vers son terme, et elle ne mentira pas; Si elle tarde, attends-la, Car elle s'accomplira, elle s'accomplira certainement." }
    ]
  }},
  { id: 'ZEP', name: 'Sophonie', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 3, chapters: {} },
  { id: 'HAG', name: 'Aggée', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 2, chapters: {} },
  { id: 'ZEC', name: 'Zacharie', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 14, chapters: {
    4: [
      { verse: 6, text: "Ce n'est ni par la puissance ni par la force, mais c'est par mon esprit, dit l'Éternel des armées." }
    ]
  }},
  { id: 'MAL', name: 'Malachie', testament: 'Ancien', category: 'Petits Prophètes', chaptersCount: 4, chapters: {
    3: [
      { verse: 10, text: "Apportez à la maison du trésor toutes les dîmes, Afin qu'il y ait de la nourriture dans ma maison; Mettez-moi de la sorte à l'épreuve, Dit l'Éternel des armées." }
    ]
  }},

  // --- NOUVEAU TESTAMENT (27 livres) ---
  {
    id: 'MAT',
    name: 'Matthieu',
    testament: 'Nouveau',
    category: 'Évangiles',
    chaptersCount: 28,
    chapters: {
      5: [
        { verse: 3, text: "Heureux les pauvres en esprit, car le royaume des cieux est à eux!" },
        { verse: 14, text: "Vous êtes la lumière du monde. Une ville située sur une montagne ne peut être cachée;" },
        { verse: 16, text: "Que votre lumière luise ainsi devant les hommes, afin qu'ils voient vos bonnes œuvres, et qu'ils glorifient votre Père qui est dans les cieux." }
      ],
      6: [
        { verse: 33, text: "Cherchez premièrement le royaume et la justice de Dieu; et toutes ces choses vous seront données par-dessus." }
      ],
      28: [
        { verse: 18, text: "Jésus, s'étant approché, leur parla ainsi: Tout pouvoir m'a été donné dans le ciel et sur la terre." },
        { verse: 19, text: "Allez, faites de toutes les nations des disciples, les baptisant au nom du Père, du Fils et du Saint-Esprit," },
        { verse: 20, text: "et enseignez-leur à observer tout ce que je vous ai prescrit. Et voici, je suis avec vous tous les jours, jusqu'à la fin du monde." }
      ]
    }
  },
  { id: 'MRK', name: 'Marc', testament: 'Nouveau', category: 'Évangiles', chaptersCount: 16, chapters: {
    16: [
      { verse: 15, text: "Puis il leur dit: Allez par tout le monde, et prêchez la bonne nouvelle à toute la création." },
      { verse: 17, text: "Voici les miracles qui accompagneront ceux qui auront cru: En mon nom, ils chasseront les démons; ils parleront de nouvelles langues;" },
      { verse: 18, text: "ils saisiront des serpents; s'ils boivent quelque breuvage mortel, il ne leur fera point de mal; ils imposeront les mains aux malades, et les malades seront guéris." }
    ]
  }},
  { id: 'LUK', name: 'Luc', testament: 'Nouveau', category: 'Évangiles', chaptersCount: 24, chapters: {
    10: [
      { verse: 2, text: "Il leur disait: La moisson est grande, mais il y a peu d'ouvriers. Priez donc le maître de la moisson d'envoyer des ouvriers dans sa moisson." }
    ],
    18: [
      { verse: 1, text: "Jésus leur adressa une parabole, pour montrer qu'il faut toujours prier, et ne point se relâcher." }
    ]
  }},
  {
    id: 'JHN',
    name: 'Jean',
    testament: 'Nouveau',
    category: 'Évangiles',
    chaptersCount: 21,
    chapters: {
      1: [
        { verse: 1, text: "Au commencement était la Parole, et la Parole était avec Dieu, et la Parole était Dieu." },
        { verse: 2, text: "Elle était au commencement avec Dieu." },
        { verse: 3, text: "Toutes choses ont été faites par elle, et rien de ce qui a été fait n'a été fait sans elle." },
        { verse: 4, text: "En elle était la vie, et la vie était la lumière des hommes." },
        { verse: 14, text: "Et la parole a été faite chair, et elle a habité parmi nous, pleine de grâce et de vérité; et nous avons contemplé sa gloire, une gloire comme la gloire du Fils unique venu du Père." }
      ],
      3: [
        { verse: 16, text: "Car Dieu a tant aimé le monde qu'il a donné son Fils unique, afin que quiconque croit en lui ne périsse point, mais qu'il ait la vie éternelle." },
        { verse: 17, text: "Dieu, en effet, n'a pas envoyé son Fils dans le monde pour qu'il juge le monde, mais pour que le monde soit sauvé par lui." }
      ],
      14: [
        { verse: 6, text: "Jésus lui dit: Je suis le chemin, la vérité, et la vie. Nul ne vient au Père que par moi." },
        { verse: 27, text: "Je vous laisse la paix, je vous donne ma paix. Je ne vous donne pas comme le monde donne. Que votre cœur ne se trouble point, et ne s'effraie point." }
      ]
    }
  },
  {
    id: 'ACT',
    name: 'Actes',
    testament: 'Nouveau',
    category: 'Histoire',
    chaptersCount: 28,
    chapters: {
      1: [
        { verse: 8, text: "Mais vous recevrez une puissance, le Saint-Esprit survenant sur vous, et vous serez mes témoins à Jérusalem, dans toute la Judée, dans la Samarie, et jusqu'aux extrémités de la terre." }
      ],
      2: [
        { verse: 42, text: "Ils persévéraient dans l'enseignement des apôtres, dans la communion fraternelle, dans la fraction du pain, et dans les prières." },
        { verse: 47, text: "louant Dieu, et trouvant grâce auprès de tout le peuple. Et le Seigneur ajoutait chaque jour à l'Église ceux qui étaient sauvés." }
      ]
    }
  },
  {
    id: 'ROM',
    name: 'Romains',
    testament: 'Nouveau',
    category: 'Épîtres de Paul',
    chaptersCount: 16,
    chapters: {
      8: [
        { verse: 1, text: "Il n'y a donc maintenant aucune condamnation pour ceux qui sont en Jésus-Christ." },
        { verse: 28, text: "Nous savons, du reste, que toutes choses concourent au bien de ceux qui aiment Dieu, de ceux qui sont appelés selon son dessein." },
        { verse: 31, text: "Que dirons-nous donc à l'égard de ces choses? Si Dieu est pour nous, qui sera contre nous?" }
      ],
      10: [
        { verse: 14, text: "Comment donc invoqueront-ils celui en qui ils n'ont pas cru? Et comment croiront-ils en celui dont ils n'ont pas entendu parler? Et comment en entendront-ils parler, s'il n'y a personne qui prêche?" },
        { verse: 15, text: "Et comment y aura-t-il des prédicateurs, s'ils ne sont pas envoyés? selon qu'il est écrit: Qu'ils sont beaux Les pieds de ceux qui annoncent la paix, De ceux qui annoncent de bonnes nouvelles!" },
        { verse: 17, text: "Ainsi la foi vient de ce qu'on entend, et ce qu'on entend vient de la parole de Christ." }
      ],
      12: [
        { verse: 2, text: "Ne vous conformez pas au siècle présent, mais soyez transformés par le renouvellement de l'intelligence, afin que vous discerniez quelle est la volonté de Dieu, ce qui est bon, agréable et parfait." }
      ]
    }
  },
  { id: '1CO', name: '1 Corinthiens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 16, chapters: {
    13: [
      { verse: 4, text: "La charité est patiente, elle est pleine de bonté; la charité n'est point envieuse; la charité ne se vante point, elle ne s'enfle point d'orgueil." },
      { verse: 13, text: "Maintenant donc ces trois choses demeurent: la foi, l'espérance, la charité; mais la plus grande de ces choses, c'est la charité." }
    ]
  }},
  { id: '2CO', name: '2 Corinthiens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 13, chapters: {
    5: [
      { verse: 17, text: "Si quelqu'un est en Christ, il est une nouvelle créature. Les choses anciennes sont passées; voici, toutes choses sont devenues nouvelles." },
      { verse: 20, text: "Nous faisons donc les fonctions d'ambassadeurs pour Christ, comme si Dieu exhortait par nous; nous vous supplions au nom de Christ: Soyez réconciliés avec Dieu!" }
    ]
  }},
  { id: 'GAL', name: 'Galates', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 6, chapters: {
    2: [
      { verse: 20, text: "J'ai été crucifié avec Christ; et si je vis, ce n'est plus moi qui vis, c'est Christ qui vit en moi; si je vis maintenant dans la chair, je vis dans la foi au Fils de Dieu, qui m'a aimé et qui s'est livré lui-même pour moi." }
    ],
    5: [
      { verse: 22, text: "Mais le fruit de l'Esprit, c'est l'amour, la joie, la paix, la patience, la bonté, la bénignité, la fidélité, la douceur, la tempérance." }
    ]
  }},
  { id: 'EPH', name: 'Éphésiens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 6, chapters: {
    2: [
      { verse: 8, text: "Car c'est par la grâce que vous êtes sauvés, par le moyen de la foi. Et cela ne vient pas de vous, c'est le don de Dieu." }
    ],
    6: [
      { verse: 10, text: "Au reste, fortifiez-vous dans le Seigneur, et par sa force toute-puissante." },
      { verse: 11, text: "Revêtez-vous de toutes les armes de Dieu, afin de pouvoir tenir ferme contre les ruses du diable." }
    ]
  }},
  { id: 'PHP', name: 'Philippiens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 4, chapters: {
    4: [
      { verse: 6, text: "Ne vous inquiétez de rien; mais en toute chose faites connaître vos besoins à Dieu par des prières et des supplications, avec des actions de grâces." },
      { verse: 13, text: "Je puis tout par celui qui me fortifie." }
    ]
  }},
  { id: 'COL', name: 'Colossiens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 4, chapters: {
    3: [
      { verse: 23, text: "Tout ce que vous faites, faites-le de bon cœur, comme pour le Seigneur et non pour des hommes." }
    ]
  }},
  { id: '1TH', name: '1 Thessaloniciens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 5, chapters: {
    5: [
      { verse: 16, text: "Soyez toujours joyeux." },
      { verse: 17, text: "Priez sans cesse." },
      { verse: 18, text: "Rendez grâces en toutes choses, car c'est à votre égard la volonté de Dieu en Jésus-Christ." }
    ]
  }},
  { id: '2TH', name: '2 Thessaloniciens', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 3, chapters: {} },
  { id: '1TI', name: '1 Timothée', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 6, chapters: {
    4: [
      { verse: 12, text: "Que personne ne méprise ta jeunesse; mais sois un modèle pour les fidèles, en parole, en conduite, en charité, en foi, en pureté." }
    ]
  }},
  {
    id: '2TI',
    name: '2 Timothée',
    testament: 'Nouveau',
    category: 'Épîtres de Paul',
    chaptersCount: 4,
    chapters: {
      2: [
        { verse: 2, text: "Et ce que tu as entendu de moi en présence de beaucoup de témoins, confie-le à des hommes fidèles, qui soient capables de l'enseigner aussi à d'autres." },
        { verse: 15, text: "Efforce-toi de te présenter devant Dieu comme un homme éprouvé, un ouvrier qui n'a point à rougir, qui dispense droitement la parole de la vérité." }
      ],
      3: [
        { verse: 16, text: "Toute Écriture est inspirée de Dieu, et utile pour enseigner, pour convaincre, pour corriger, pour instruire dans la justice," },
        { verse: 17, text: "afin que l'homme de Dieu soit accompli et propre à toute bonne œuvre." }
      ],
      4: [
        { verse: 2, text: "prêche la parole, insiste en toute occasion, favorable ou non, reprends, menace, exhorte, avec toute douceur et en instruisant." }
      ]
    }
  },
  { id: 'TIT', name: 'Tite', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 3, chapters: {} },
  { id: 'PHM', name: 'Philémon', testament: 'Nouveau', category: 'Épîtres de Paul', chaptersCount: 1, chapters: {} },
  { id: 'HEB', name: 'Hébreux', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 13, chapters: {
    11: [
      { verse: 1, text: "Or la foi est une ferme assurance des choses qu'on espère, une démonstration de celles qu'on ne voit pas." },
      { verse: 6, text: "Or sans la foi il est impossible de lui être agréable; car il faut que celui qui s'approche de Dieu croie que Dieu existe, et qu'il est le rémunérateur de ceux qui le cherchent." }
    ],
    12: [
      { verse: 2, text: "ayant les regards fixés sur Jésus, le chef et le consommateur de la foi, qui, en vue de la joie qui lui était réservée, a souffert la croix, méprisé l'ignominie, et s'est assis à la droite du trône de Dieu." }
    ]
  }},
  { id: 'JAS', name: 'Jacques', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 5, chapters: {
    1: [
      { verse: 22, text: "Mettez en pratique la parole, et ne vous contentez pas de l'écouter, en vous trompant vous-mêmes par de faux raisonnements." }
    ]
  }},
  { id: '1PE', name: '1 Pierre', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 5, chapters: {
    2: [
      { verse: 9, text: "Vous, au contraire, vous êtes une race élue, un sacerdoce royal, une nation sainte, un peuple acquis, afin que vous annonciez les vertus de celui qui vous a appelés des ténèbres à son admirable lumière." }
    ]
  }},
  { id: '2PE', name: '2 Pierre', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 3, chapters: {} },
  { id: '1JN', name: '1 Jean', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 5, chapters: {
    4: [
      { verse: 8, text: "Celui qui n'aime pas n'a pas connu Dieu, car Dieu est amour." },
      { verse: 19, text: "Pour nous, nous l'aimons, parce qu'il nous a aimés le premier." }
    ]
  }},
  { id: '2JN', name: '2 Jean', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 1, chapters: {} },
  { id: '3JN', name: '3 Jean', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 1, chapters: {} },
  { id: 'JUD', name: 'Jude', testament: 'Nouveau', category: 'Épîtres Générales', chaptersCount: 1, chapters: {} },
  { id: 'REV', name: 'Apocalypse', testament: 'Nouveau', category: 'Révélation', chaptersCount: 22, chapters: {
    1: [
      { verse: 8, text: "Je suis l'alpha et l'oméga, dit le Seigneur Dieu, celui qui est, qui était, et qui vient, le Tout-Puissant." }
    ],
    22: [
      { verse: 13, text: "Je suis l'alpha et l'oméga, le premier et le dernier, le commencement et la fin." },
      { verse: 20, text: "Celui qui atteste ces choses dit: Oui, je viens bientôt. Amen! Viens, Seigneur Jésus!" }
    ]
  }}
];

function getChapterVerses(book, chapterNum) {
  return (book.chapters && book.chapters[chapterNum]) || [];
}

/* Plan de lecture chronologique : 2 chapitres de l'Ancien Testament + 1 chapitre
   du Nouveau Testament par jour, en commençant par Genèse 1 et Matthieu 1. */
function buildTestamentChapterList(testament) {
  const list = [];
  FRENCH_BIBLE_BOOKS.filter(b => b.testament === testament).forEach(b => {
    for (let c = 1; c <= b.chaptersCount; c++) list.push(`${b.name} ${c}`);
  });
  return list;
}
const OT_CHAPTER_SEQUENCE = buildTestamentChapterList("Ancien");
const NT_CHAPTER_SEQUENCE = buildTestamentChapterList("Nouveau");
const READING_PLAN_EPOCH = "2025-01-06"; // premier lundi de référence : Genèse 1-2 / Matthieu 1

function suggestedReadingForDate(dateStr) {
  if (!dateStr || OT_CHAPTER_SEQUENCE.length === 0 || NT_CHAPTER_SEQUENCE.length === 0) {
    return { at1: "", at2: "", nt: "" };
  }
  const epoch = new Date(READING_PLAN_EPOCH + "T00:00:00");
  const target = new Date(dateStr + "T00:00:00");
  const dayIndex = Math.max(0, Math.round((target - epoch) / 86400000));
  const at1 = OT_CHAPTER_SEQUENCE[(dayIndex * 2) % OT_CHAPTER_SEQUENCE.length];
  const at2 = OT_CHAPTER_SEQUENCE[(dayIndex * 2 + 1) % OT_CHAPTER_SEQUENCE.length];
  const nt = NT_CHAPTER_SEQUENCE[dayIndex % NT_CHAPTER_SEQUENCE.length];
  return { at1, at2, nt };
}


/* ------------------------------------------------------------------ */
/*  Utilitaires                                                       */
/* ------------------------------------------------------------------ */

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function daysUntil(dateStr) {
  if (!dateStr) return null;
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const d = new Date(dateStr + "T00:00:00");
  return Math.round((d - today) / 86400000);
}

function formatDateLong(dateStr) {
  if (!dateStr) return "";
  const d = new Date(dateStr + "T00:00:00");
  return d.toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long", year: "numeric" });
}

function whatsappLink(phone, message) {
  let digits = (phone || "").replace(/[^\d+]/g, "");
  digits = digits.replace(/^\+/, "");
  if (digits.startsWith("0")) digits = "226" + digits.slice(1);
  if (!digits.startsWith("226") && digits.length <= 8) digits = "226" + digits;
  return `https://wa.me/${digits}?text=${encodeURIComponent(message)}`;
}

function mapsLink(lat, lng) {
  return `https://www.google.com/maps?q=${lat},${lng}`;
}

function reportToText(r, { pays } = {}) {
  const lignes = [];
  lignes.push(pays ? "📋 RAPPORT — COORDINATION NATIONALE" : `📋 RAPPORT — ${r.assemblee || "Assemblée"}`);
  lignes.push(`Semaine du ${formatDateLong(r.semaine)}`);
  if (r.pasteur) lignes.push(`Déposé par : ${r.pasteur}`);
  if (r.predicateurNoms && r.predicateurNoms.length > 0) lignes.push(`Ont prêché : ${r.predicateurNoms.join(", ")}`);
  lignes.push("");
  REPORT_FIELDS.forEach(f => {
    const val = r[f.key] || 0;
    lignes.push(`${f.label} : ${f.key === "depensesTotal" ? val.toLocaleString("fr-FR") + " FCFA" : val}`);
  });
  lignes.push("");
  lignes.push("Mission Parole de Vie Burkina");
  return lignes.join("\n");
}

function shareWhatsappLink(text) {
  return `https://wa.me/?text=${encodeURIComponent(text)}`;
}

function recapToText(totals, { titre, periodeLabel, nbRapports }) {
  const lignes = [`📊 ${titre}`, periodeLabel, `${nbRapports} rapport(s) pris en compte`, ""];
  REPORT_FIELDS.forEach(f => {
    const val = totals[f.key] || 0;
    lignes.push(`${f.label} : ${f.key === "depensesTotal" ? val.toLocaleString("fr-FR") + " FCFA" : val}`);
  });
  lignes.push("", "Mission Parole de Vie Burkina");
  return lignes.join("\n");
}

function ShareReportButton({ report, pays }) {
  return (
    <a
      href={shareWhatsappLink(reportToText(report, { pays }))}
      target="_blank" rel="noopener noreferrer"
      onClick={e => e.stopPropagation()}
      style={{
        display: "flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
        fontSize: 11.5, fontWeight: 700, padding: "6px 10px", borderRadius: 8, alignSelf: "flex-start"
      }}
    >
      <Send size={12} /> Partager par WhatsApp
    </a>
  );
}

function flattenAssemblees(regions) {
  return regions.flatMap(r => r.assemblees.map(a => a.nom));
}

function mondayOf(dateStr) {
  if (!dateStr) return dateStr;
  const d = new Date(dateStr + "T00:00:00");
  const day = d.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  d.setDate(d.getDate() + diff);
  return d.toISOString().slice(0, 10);
}

function sundayOf(mondayStr) {
  const d = new Date(mondayStr + "T00:00:00");
  d.setDate(d.getDate() + 6);
  return d.toISOString().slice(0, 10);
}

function compressImage(file, maxWidth = 700, quality = 0.55) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new window.Image();
      img.onload = () => {
        const scale = Math.min(1, maxWidth / img.width);
        const canvas = document.createElement("canvas");
        canvas.width = Math.round(img.width * scale);
        canvas.height = Math.round(img.height * scale);
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
        resolve(canvas.toDataURL("image/jpeg", quality));
      };
      img.onerror = reject;
      img.src = e.target.result;
    };
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

/* ------------------------------------------------------------------ */
/*  Logo / sceau                                                      */
/* ------------------------------------------------------------------ */

const LOGO_URI = "data:image/jpeg;base64,/9j/4AAQSkZJRgABAQAAAQABAAD/2wCEAAkGBwgHBgkIBwgKCgkLDRYPDQwMDRsUFRAWIB0iIiAdHx8kKDQsJCYxJx8fLT0tMTU3Ojo6Iys/RD84QzQ5OjcBCgoKDQwNGg8PGjclHyU3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3Nzc3N//AABEIAJQA1gMBIgACEQEDEQH/xAAcAAABBQEBAQAAAAAAAAAAAAACAAEDBAUGBwj/xAA/EAACAQMCBAMHAwIDBQkAAAABAgMABBESIQUTMVEiQWEGMlJxgZGhFCNCBzMVYrFTcpLR8BckQ0RjgsHC8f/EABoBAQADAQEBAAAAAAAAAAAAAAABAgMEBQb/xAAiEQEBAAMAAQQDAQEAAAAAAAAAAQIDERIEEyFBFDFRMiL/2gAMAwEAAhEDEQA/APbeTH8NQl2R8Kdqf9Q3wii5QcaiTQPEiuuphk0Mv7WOXtnrSMhhOgDI9aSjn9dsdqBoiZWIfcYo2RY0LKNxQsOQNQ3+dMJDL4CMA0AiRywBOxqfkx/DQmEL4snbeg/UN8IoB5jgkA7CpURXUMwyTTCAHfJ3pjIYvABkCgaQ8tsJsCKeP93OvenVed4jtjbak37PTfPegTqIkygwe9AsjM6gnYmnDmbwkY89qIxBPECTjegPlINwu4qDmuPOj55O2BTmAdzQOI1dQzDfvQSMY3whwKRlKHQADjaiCCYaycfKgaICXJcZNPIBEuUGCTTMeQcDfO+9IHn+E7Y32oGR2eQK+4qUxIoyF3FAyCIcwHJHlTc8ttgb0EYlfvU/KQnJG9D+nGPeNCZyM+EbUDSOyOVU4FHEokXU4yaQiEg1kkE0zNyTpG/nvQKYcvGjbNKkv7+zbY7UqBv0570QmVcoQdqPnJ8VQvGxbUu4NARTm+MGkP2Ov8qdGWJdLHBppf3saN8daByRONI2xQiMxEMd8UowYjlhgUbyK4Kqck+VA3OBBGOtD+nPehWJ1OorsPWpudH8VAPPAOkjpTGMyHVnrQtG5Oy5BqRHVBpZsEdRQMrckaW3JOaYnnkAbYppF5p1JuOhp0/b2fbNAlTknU3Sn5okBUDBO1U7/i/DbZdNxfW8bfC8gB+1VU47wzZxdagPNYnI+4FTyo7GryCN81m3l+8N00wdlt4GjjdApOot12AzkAqfvUie0XCJQwS/gLgf2y2GP0O9VAwQR/qBjkq15cA/E2Qi/wCv/CKmT+q2/wAa6pzcSKwKt4gfQ0avyhoPUVm8G5lsWs5pS+iGOUAndC2oFfl4fzWjIpkOpNxUWfK0+Tkc8gjyplHJ8RpgwgVmlIQAZyfIDrUFrdi/h1LG8bgjVG/UAjI/BFQlY5glzGBjPnTckr4s9KUasnicYA61IZUIwDk9qAeevah5BYZzjNDynznT+amEqAbtj0oB5oj8HamK846h06ULxs7FgMg+tHGwiXS5we1AkHJzq86VNIOdjQ2cUqCHDeYP2q2hGgfKjqlL75+dAc4Jk8PYUVv4dWrajt/7YqO6/j9aA58Mu29RRjDjantvfPyqab+23yoCYjSap6T2NOvvKfKrtAIIwN6rSDLtsevlQN1by361y3tP7Tul5/gXCJMXKpqvLobi3U9FHd23+Q37VbHG5XkRbydbF/x2Ozka0s4jdXvVk1aUiB85G8vkAT6VlzG6vDqv7tpf/ShzHGPoDk/U/QdBj2s8dtCsUQ8I77knzJPmfU1N+sz7pAFbzVxz3b1p2sVvaDFrHHEP8iAH8VOblid5CfrWIb0gYzSS5aTVpOMCreFR5tyJzfXKxupkigHOmAGc491QPUjP/t9asJ4mkkuto4n590w/lJ/GMd9Ixn1wO9P7ILmzuJz77zEZ9FGBV3iKJHNC2kyb5itkXAeT4iew/HWscr/1xrj+us6WRLW5guLhGE7ap7p1A/ajI0gMSegwP+Emt63deWNwQdwR5isXiEUyWctlb6bjiN5gysWwqr0JPXCgbDb/AOa5bh3H/wDAZzFdsv8AhokaKTfItiGK61P+zyNxtjrgUmFynwnzmN47jioE4itBvzzpYdk6t+NvrUPC7gvfXpZVEbnVGwPVR4d/qD9Ki1yvmWLKz3P7dqGH9tPNyPz/AMI26U/DTDIZ+Qp5UWmGL1UDrn1OftVf1E9a8p/bYdarqpDDaii/vLVp/dPyqi5iRvuOlVCCSdqH+NXV6D5UAxkKgyaimyz5XcYoJv7rVNbf2/rQDb7Fs7U9K63C4pUEGT5MfvVtACgJAzTcqP4agaRkfSOlAp/DJt0x3o7c51Z3+dPGqyLqcZNNL+1jl+HPWge4zo22+VRxsdffNHExkbDnNG6BFLL1FAZAx0/FUxnufvUiyuWwTU3Kj+EUHN+3/tNH7K+zU1/pD3T/ALVrF8UhG30AyT8q8r4I0lvZ6rlzJdTsZ7iQnd3br9ug9Kg/rJxo8T9s7fhayf8AduGgDAPWRtzn5DAqGC6JwW3AGcGvQ9Nr+OuP1Gf06D9ZjbOKcXjE7GsUXI+VGs3Zh2ro8HL5tdr1vImp7W9eSNwWPh6VgK0jlAoyX6Vp2kTtohhVpZWOyxjJNPCKZbufEei+wk3M4fcpndLg/kA1v3ur9O2m4/TgbtJpBwPPrsPzXIf0658M/ErW5gkidTHJh0I6gj/612kwzEw9O2fxXmbpzZXp6b3XLWOsi8mWPhmfGCXvZclV/wAxJ94+g2+VYPs77LwS3zXj3H6qwhcfpg+CZCAMs2MDGrJA8+vatwJr0m4iv71h0WSMIgP+7sPvmp+GGSPiF0J7fkNKqsiKQRpG2+P5ZP2x2qJlZLxNkt+UvFVzEObMsEG4ldc62Hwr8/v2qPg51y3BaAwHwhYiMaEx4en1+VFdyxPda4rRpriLwh38KR9zqPT6ZNNwvLcPS7aTXNcgSM4GAcjbA+HHSq/S/wBtCXaM+RqBM6xknGaKNi7ANuDUxjRRkLuKqsLAx5faqjsSTuRRc2TPXzqcRqd6BRD9sZAPqahnOHwNtu9JnZWIVsD5UcaiRdTjJ70DW41atVKlN+0Bo2zSoB/UN2FGIg41NQ/p2+IfaiEwXwYJx1oBLmI6BgiiUc/3tsdqYpzTrBxSB5HXfV2oHZRCNS7n1oQ5kOhuh2py3P8ACNsd6Qj5Z1k5x5UBchV8WW29aj57YJIFHzgRjSd6gu4mW0nZW3EbEfapHypxO7PEvaDiV8zludcyOG9NXh/GPtWva3YeM6zhhgZ+f/5WXwSKC6xDOegZtSruP+fWrsluIA6O5xrXGF6jBwa9bX8R5+2zLJpLKcAg7VJzTpBzvms7lciON3d1WUEodPUD61atIpLoKkLM3i94psBgda1nXLl4yd62rBTNBC+o5jctnJzXaexctusN+n6+CyvJWRIZXAJAAzgAn5/euTggEFusStnHU9zQOF0OCeuB7vrU7NXuY+Li1b5ht8/293AGxJyeme9GdxXn/sJ7VxnRwniMx1rtBNIdmHwE9x5d679TmvG268teXK+i07cduPliyrm2NtIDA3ESGyTy5dYX6Pn8VVgmS24hI7yXMWqHBe7/APEPlpHTbfYYroMCgkijkUpIiup6hhkGqyr2PKf6pe2Fta8Fu+GJxZp+JTLyxDaIYRGD1LnJPTyyPlXWf0zvTxD2E4PLK4LJbiNj20kj/QCn4l/Tb2P4ncNcXfBYua3vGKWSLV8wjAGrNtwHhPALaKz4dYILYElIZbpiAfQOSKvcsbORHLGm99axviKXmOP4xDX/AKUor95LhYJLeSLWhdS2NwCB5Hb3h1pJLdiMLBYRoPLMoC/gVUVbi14jG91LFPJdHToRSpjVQTtknIB6nbcj5VRPWt+nTufvQc5h0Gwo+ePhNAISwznrVVhCJZBqORntTMxhOldx13pxKIvARkjtTFecdQOPLegS5n2bbFKko5GSSDmnoC56dzUTxM5LL0NBpf4W+1WUYBQGIB9aAI2WJdDdaZ/3scvy60MwJfIBI7gUUHhzq2z32oEimI5eiZw6lE6mmmIdcAgnsKCMFXBYYHrQMIXXBOMDrvUjSo6lc+8MVIzLpO6/equlvhb7UHzcLX/Db+/tAmkw3UiHvgMQPxipJYUmmieRdSBgGHbr/wA66P8Aqfww8N9sXuFAEHEIhKpHxjAYH8ViWqsScjCsCMscf69a9jVl3GV5m7HmVHfxiWzwTuniXfoe1FwMyW8VykpwFfAJPnjfH4pK0eCpbOeoCmopxM1osUep1DDV/mGdia3+3DZfG4NZpPWo2fKt9P8AWo+ag30qMbZYmiWQaW8CVdy+HEJAIxgVt8K9r+O8MTlw3nMhQHEdwvM0geux/NY5fO+hcelIacMdOB029arlhjl+42w254fMrq/+0vjegKtpZtIxwMK3X5ZrteD3/FobQzcdZHuGiNxJDEgUQJ5L5knqTk+RxXkvDbv/AA3iMN6kaSPE2pVlXIP/AF3r0H2f9rLC94dfvxy8ghu5mZSoBAMenChc7nGT9Se9ef6nT4/4x+Hp+l3+X+8vl103EeWZv2mIgZeZjc6CM6gPPz+xrOuHkdg13NGsb40SNGJLd+x7qceuKocP9peF3UXDLuO9iN06LDNbA/u7jJ8HveEjJ26ZrTt7u3iuWhsmS7s5AWKQMHEJ8x16HPT51x+PPp3d6E8OiTBuOC2cv+e2AB+xAp+GRw/rWmsrZ7eEoUmD7F2BGnbORjxfengt5RM62UlxaWgUYjKj3s/wByVGPLp2FXbeBYECANpDaiXOSSdySe+ajq0iXkSenXvU3NQbHqKLUuPeX71WZSScKcd6osNo2c6l6GiRhENL9aKNlCAFhketRzDU2VBIx5b0DyfvY0HpSpW+RnUCPnT0E9U5R4z86HUe5+9WkA0Ajf50DW+0YzQXP8frQz+GTYmjt99Wr80A22znPapJv7bfKmnYKm2KhhfMiqDnPegZfeWrtRsVxnaqnM/zGp4Oe9vPZ5vaHgrx22Fv7VzNaMfjAOVPoRt9j5V4hHKZN3DiRWKOHPiVh1B9a+mlK6R0zXmH9SvYySe5k45wOLmT/wDnLResoA99R8XceY9evV6fb43xrn36/Kdjz5zkiRejdR2PmKkSTQGJ7d/+vSobYq0euRgsTeRB1Z9B12omxGdGjUvkzfyHcV6Erz8sZ1lz3clw+XOkLjCD071q8KnaZJw/vZDZ+ZqN7ZOSAhK5/kD0NWbKMwQOnMbVtk5PerY96ptuPhxYoj4YwO5zTo7PsGaj1gsx0Z8hgYNauLKVDoLEDzPSq9x3x4V79h51bkaNVYKw1n1A+lafsZ7Kze1V1+ouUaPg8TkO52/UMOqL6dz9Ky27JhO10+n1ZbL8N7+kPAWlaT2julLKwaKx1DfRnxOPQkYHoK9MnH7X1qJkjt44ooQERFCqijAVR0AooSGc5Oa8XPO55dr3cMZjjyGh/vLVpvdPyqKbSIyRse9QI3iGTtnvVFjfxq4u4HypADHlVRj18RH1oCm/utU1v7n1p4hmME4PrUU+Q+Bnp5UBXQyFxSprcatWc5HelQScuP4RVV5mVyqHCige6ceQqKTD+Js59KnivVpHRlzJgmoZrgRY0NpzWdPdtD4B071SluzL7x6VeYdVubZS8DtpdgR60Mt3HGhZCFbyxXNT3pi3U1Qm4qzHSTtWk0qXbx1h4qc/3DiiN/EPMVwkvESP5fmqz8Zfv+a0np2d3u8bjBBwGNEvFIyATjV8687PFW3yx+9Rtxl12z+av+Mr+Q2Pav2Z4bxmd7yycWV+/vSIMpKe7r39RvXBXlnxDhbGPiNm4iB2lTxxn1DDp9cV0R4uzdXx9ahk9oBESFZnPmqitsMc8fhnlnjk5hbyIZVGEkZG5G2mgW9kGoZG+DspO333rTvb2G797h9vnrkrv+MVQaOMsDywMHOM1tLWV8RLxAqu49GZT7v0NWreae7bRw6Ca5lP+zX/AFPRfqRQWs0NuQTYW8hHQsCf9dq2rfjyqgj5ZhX4QPD+KXLL6VmGv7avs/7Gwl1uPaOZJfNbOJsqP99v5fIbfOu+HE4oVSKDRHEihURcAKB5AV5qvHHAADDA9d6McYZjktXLnpyzvcq6MduOM5I9Lj4mjjxsD2on4kiLlGAOa81XjLL0NSrxl32zVPxmn5D0aLifMcKzbGpxdwgZB6V5ynFWADBtx61ah4w7EAnb51S+nWm93Q4kxHv4+tWllhOCVBz51xEF6Dvn81eh4o+cA+lUupebXTtc6WKq+AOlTwMsq6mwxz1rAgn5oDZ69quLcmM6V6etZ3HjSZfbUncRAcvYnrimqtHIZxhsDHamqnFuje1b4hVaVinhxnHmK0mlj7/g1We3ZmLKMg1Mv9RZ/GRPA0viHSs+eExdd89q6LlLGul+vaqs9pzvcGcda1xyZ3FytxEZdh1FZ1xaOh1HGBXYGx5ZJdcVVmskcFV3PyrbHYxy1uKmhY+RqpJZuK7SThTea1DJw9D5VrNsZ3VXEvA4OADUEluwGTXZycJY5OmqknC98MvStJtjO6q4x0dvLw9qDksf4n7V17cHZiSq7VH/AISV99dqv7sU9uuT5TDqppuW3aurPCtWwFCODsDkrtU+7Ee3XL8pu1IxN8NdT/hi044M5OdNPdh7dcusLjoKsxK2PMHzFdEOFgYyN/lRDhDM2pRtUe5E+1WCtu7b1Mlu6nfNdHFwzA8QqccND7KPxVLti811z0cTMQuDg1bhtXG/at2LhTKQSuwq3HYqRgDc1ndsaTWx4FIxsa0be0fqOh71ei4Y46rV+G3RcddvKsctkazWq22YwFwTjtWhFE0pDdPLBolsy7akXP4q5BFyfDJsaxuTaY00SNCO+aepynMA5PUddqVZrH0irQACL8qVKoWVrpQZc+gpoVGGp6VPoiO6RdI2quY1Djz+dKlUwFLGuOlUWgj7fmlSq0qtiR4IwqjHWqU1rFknFKlV5apYUdvHp6VFdW0QUHHnSpVbtV5OIo4IzIRpFFLBGEPgFPSqe1HIrcqP4atpDHpHhFKlS2nIje2iDe76VZgtouSu1KlUW1PDyQRhlAFS28ManIUUqVVt+EyLDRIYjtQxRJqG1KlVercX0RcdKjMahSaVKqrLluBy12oZlBf6U9Kqz9rfSSzAGqlSpVCX/9k=";

function LogoBadge({ size = 44 }) {
  return (
    <div style={{
      width: size, height: size, borderRadius: "50%", background: "#fff",
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0, boxShadow: "0 2px 8px rgba(0,0,0,.18)", overflow: "hidden"
    }}>
      <img src={LOGO_URI} alt="Logo Mission Parole de Vie" style={{ width: "76%", height: "76%", objectFit: "contain" }} />
    </div>
  );
}

function Seal({ size = 44 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 100 100" fill="none" xmlns="http://www.w3.org/2000/svg">
      <circle cx="50" cy="50" r="48" fill="var(--primary)" stroke="var(--accent)" strokeWidth="2.5" />
      <circle cx="50" cy="50" r="40" fill="none" stroke="var(--accent)" strokeWidth="1" strokeDasharray="2 3" />
      <path d="M35 62 L35 40 Q35 34 41 34 L59 34 Q65 34 65 40 L65 62" stroke="var(--accent)" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
      <line x1="35" y1="62" x2="65" y2="62" stroke="var(--accent)" strokeWidth="2.5" strokeLinecap="round" />
      <line x1="41" y1="42" x2="59" y2="42" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="41" y1="48" x2="59" y2="48" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
      <line x1="41" y1="54" x2="59" y2="54" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" />
      <path d="M50 18 C46 24 44 28 50 33 C56 28 54 24 50 18 Z" fill="var(--accent)" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  Badge de jours restants                                           */
/* ------------------------------------------------------------------ */

function DaysBadge({ days }) {
  if (days === null) return null;
  let tone = "var(--primary)";
  let label = `Dans ${days} j`;
  if (days < 0) { tone = "var(--ink-soft)"; label = "Passé"; }
  else if (days === 0) { tone = "var(--danger)"; label = "Aujourd'hui"; }
  else if (days <= 3) { tone = "var(--danger)"; label = `Dans ${days} j`; }
  else if (days <= 7) { tone = "var(--accent-dark)"; label = `Dans ${days} j`; }
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4,
      padding: "3px 9px", borderRadius: 999, fontSize: 11.5, fontWeight: 700,
      letterSpacing: ".02em", color: "#fff", background: tone, whiteSpace: "nowrap"
    }}>
      {label}
    </span>
  );
}

/* ------------------------------------------------------------------ */
/*  App principale                                                    */
/* ------------------------------------------------------------------ */

export default function App() {
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("accueil");
  const [regions, setRegions] = useState(REGIONS_DEFAULT);
  const [pastors, setPastors] = useState(PASTORS_DEFAULT);
  const [pastorsPhotos, setPastorsPhotos] = useState({});
  const [seminars, setSeminars] = useState([]);
  const [leadership, setLeadership] = useState(LEADERSHIP_DEFAULT);
  const [weeklyPrograms, setWeeklyPrograms] = useState([]);
  const [seminarReports, setSeminarReports] = useState([]);
  const [coordSeminars, setCoordSeminars] = useState([]);
  const [deptHeads, setDeptHeads] = useState([]);
  const [actionPlans, setActionPlans] = useState([]);
  const [plansAnnuels, setPlansAnnuels] = useState([]);
  const [bibleReports, setBibleReports] = useState([]);
  const [missionaries, setMissionaries] = useState([]);
  const [financeReports, setFinanceReports] = useState([]);
  const [activityReports, setActivityReports] = useState([]);
  const [expenseReports, setExpenseReports] = useState([]);
  const [deptPlans, setDeptPlans] = useState([]);
  const [deptBilans, setDeptBilans] = useState([]);
  const [deptCodes, setDeptCodes] = useState({});
  const [annonces, setAnnonces] = useState([]);
  const [coordUnlocked, setCoordUnlocked] = useState(false);
  const [coordNatUnlocked, setCoordNatUnlocked] = useState(false);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    try {
      setCoordUnlocked(sessionStorage.getItem("mpv-coord-unlocked") === "true");
      setCoordNatUnlocked(sessionStorage.getItem("mpv-coordnat-unlocked") === "true");
    } catch (e) {}
  }, []);

  function unlockCoord() {
    setCoordUnlocked(true);
    try { sessionStorage.setItem("mpv-coord-unlocked", "true"); } catch (e) {}
  }
  function lockCoord() {
    setCoordUnlocked(false);
    try { sessionStorage.removeItem("mpv-coord-unlocked"); } catch (e) {}
  }
  function unlockCoordNat() {
    setCoordNatUnlocked(true);
    try { sessionStorage.setItem("mpv-coordnat-unlocked", "true"); } catch (e) {}
  }
  function lockCoordNat() {
    setCoordNatUnlocked(false);
    try { sessionStorage.removeItem("mpv-coordnat-unlocked"); } catch (e) {}
  }

  useEffect(() => {
    (async () => {
      const [r, p, s, l, wp, sr, cs, dh, ap, br, mi, pa, ph, fr, ar, er, dpl, dbi, dco, ann] = await Promise.all([
        loadKey("regions-assemblies", REGIONS_DEFAULT),
        loadKey("pastors-directory", PASTORS_DEFAULT),
        loadKey("seminars-list", []),
        loadKey("leadership-info", LEADERSHIP_DEFAULT),
        loadKey("weekly-programs", []),
        loadKey("seminar-reports", []),
        loadKey("coord-seminars", []),
        loadKey("dept-heads", []),
        loadKey("action-plans", []),
        loadKey("bible-reading-reports", []),
        loadKey("missionaries-africa", []),
        loadKey("plans-annuels", []),
        loadKey("pastors-photos", {}),
        loadKey("finance-reports", []),
        loadKey("activity-reports", []),
        loadKey("expense-reports", []),
        loadKey("dept-plans", []),
        loadKey("dept-bilans", []),
        loadKey("dept-codes", {}),
        loadKey("annonces", []),
      ]);
      const pWithPhotos = p.map(x => ({ ...x, photo: (ph && ph[x.id]) || x.photo || null }));
      setRegions(r); setPastors(pWithPhotos); setPastorsPhotos(ph || {}); setSeminars(s); setLeadership(l);
      setWeeklyPrograms(wp); setSeminarReports(sr);
      setCoordSeminars(cs); setDeptHeads(dh); setActionPlans(ap);
      setBibleReports(br); setMissionaries(mi); setPlansAnnuels(pa);
      setFinanceReports(fr); setActivityReports(ar); setExpenseReports(er);
      setDeptPlans(dpl); setDeptBilans(dbi); setDeptCodes(dco || {}); setAnnonces(ann || []);
      setLoading(false);
    })();
  }, []);

  function showToast(msg) {
    setToast(msg);
    setTimeout(() => setToast(null), 2200);
  }

  async function persistPastors(next) {
    setPastors(next);
    // Le stockage sépare le texte (léger) des photos (plus lourdes), pour qu'une
    // fiche sans photo ne soit jamais bloquée par la taille des photos des autres.
    const nextPhotos = { ...pastorsPhotos };
    next.forEach(x => { if (x.photo) nextPhotos[x.id] = x.photo; else delete nextPhotos[x.id]; });
    const stripped = next.map(({ photo, ...rest }) => rest);
    const [okText, okPhotos] = await Promise.all([
      saveKey("pastors-directory", stripped),
      saveKey("pastors-photos", nextPhotos),
    ]);
    setPastorsPhotos(nextPhotos);
    if (!okText || !okPhotos) {
      showToast("⚠ Échec de l'enregistrement — réessayez (vérifiez la connexion)");
    }
  }
  async function persistGeneric(key, next, setter) {
    setter(next);
    const ok = await saveKey(key, next);
    if (!ok) showToast("⚠ Échec de l'enregistrement — réessayez (vérifiez la connexion)");
  }
  const persistSeminars = (next) => persistGeneric("seminars-list", next, setSeminars);
  const persistLeadership = (next) => persistGeneric("leadership-info", next, setLeadership);
  const persistRegions = (next) => persistGeneric("regions-assemblies", next, setRegions);
  const persistWeeklyPrograms = (next) => persistGeneric("weekly-programs", next, setWeeklyPrograms);
  const persistSeminarReports = (next) => persistGeneric("seminar-reports", next, setSeminarReports);
  const persistCoordSeminars = (next) => persistGeneric("coord-seminars", next, setCoordSeminars);
  const persistDeptHeads = (next) => persistGeneric("dept-heads", next, setDeptHeads);
  const persistActionPlans = (next) => persistGeneric("action-plans", next, setActionPlans);
  const persistPlansAnnuels = (next) => persistGeneric("plans-annuels", next, setPlansAnnuels);
  const persistBibleReports = (next) => persistGeneric("bible-reading-reports", next, setBibleReports);
  const persistMissionaries = (next) => persistGeneric("missionaries-africa", next, setMissionaries);

  // Dépôts faits en même temps par plusieurs assemblées : on repart toujours
  // de la version la plus récente du serveur pour ne rien écraser.
  async function upsertShared(key, setter, entry, remove) {
    const next = await updateKey(key, [], (cur) => {
      const list = Array.isArray(cur) ? cur : [];
      if (remove) return list.filter(x => x.id !== entry.id);
      return list.some(x => x.id === entry.id) ? list.map(x => x.id === entry.id ? entry : x) : [...list, entry];
    });
    if (next) { setter(next); return true; }
    showToast("⚠ Échec de l'enregistrement — réessayez (vérifiez la connexion)");
    return false;
  }
  const saveFinance = (entry) => upsertShared("finance-reports", setFinanceReports, entry, false);
  const deleteFinance = (entry) => upsertShared("finance-reports", setFinanceReports, entry, true);
  const saveActivity = (entry) => upsertShared("activity-reports", setActivityReports, entry, false);
  const deleteActivity = (entry) => upsertShared("activity-reports", setActivityReports, entry, true);
  const saveExpense = (entry) => upsertShared("expense-reports", setExpenseReports, entry, false);
  const deleteExpense = (entry) => upsertShared("expense-reports", setExpenseReports, entry, true);
  const saveDeptPlan = (entry) => upsertShared("dept-plans", setDeptPlans, entry, false);
  const deleteDeptPlan = (entry) => upsertShared("dept-plans", setDeptPlans, entry, true);
  const saveDeptBilan = (entry) => upsertShared("dept-bilans", setDeptBilans, entry, false);
  const deleteDeptBilan = (entry) => upsertShared("dept-bilans", setDeptBilans, entry, true);
  const saveAnnonce = (entry) => upsertShared("annonces", setAnnonces, entry, false);
  const deleteAnnonce = (entry) => upsertShared("annonces", setAnnonces, entry, true);
  async function saveDeptCode(dept, code) {
    const next = await updateKey("dept-codes", {}, (cur) => ({ ...(cur || {}), [dept]: code }));
    if (next) { setDeptCodes(next); return true; }
    showToast("⚠ Échec de l'enregistrement — réessayez (vérifiez la connexion)");
    return false;
  }

  const upcomingCount = useMemo(
    () => seminars.filter(s => { const d = daysUntil(s.date); return d !== null && d >= 0 && d <= 7; }).length,
    [seminars]
  );

  if (loading) {
    return (
      <Shell>
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", height: "100%", gap: 14 }}>
          <LogoBadge size={64} />
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, color: "var(--primary)" }}>Chargement de l'application…</div>
        </div>
      </Shell>
    );
  }

  return (
    <Shell>
      <Header onMenu={() => setTab("aide")} active={tab === "aide"} />
      <div style={{ flex: 1, overflowY: "auto", padding: "16px 16px 90px" }}>
        {tab === "aide" && <MenuTab setTab={setTab} showToast={showToast} />}
        {tab === "accueil" && (
          <Accueil seminars={seminars} coordSeminars={coordSeminars} pastors={pastors} regions={regions} setTab={setTab} annonces={annonces} />
        )}
        {tab === "seminaires" && (
          <SeminairesTab
            seminars={seminars} setSeminars={persistSeminars}
            coordSeminars={coordSeminars} setCoordSeminars={persistCoordSeminars}
            pastors={pastors} regions={regions} leadership={leadership}
            coordUnlocked={coordUnlocked} onUnlockCoord={unlockCoord} onLockCoord={lockCoord}
            showToast={showToast}
          />
        )}
        {tab === "programme" && (
          <ProgrammeTab
            seminars={seminars} setSeminars={persistSeminars}
            coordSeminars={coordSeminars} setCoordSeminars={persistCoordSeminars}
            pastors={pastors} regions={regions} leadership={leadership}
            coordUnlocked={coordUnlocked} onUnlockCoord={unlockCoord} onLockCoord={lockCoord}
            weeklyPrograms={weeklyPrograms} setWeeklyPrograms={persistWeeklyPrograms}
            showToast={showToast}
          />
        )}
        {tab === "rapport" && (
          <RapportTab
            regions={regions} pastors={pastors} seminars={seminars} coordSeminars={coordSeminars}
            deptHeads={deptHeads} leadership={leadership}
            unlockedRespDept={coordUnlocked} onUnlockRespDept={unlockCoord} onLockRespDept={lockCoord}
            seminarReports={seminarReports} setSeminarReports={persistSeminarReports}
            activityReports={activityReports} saveActivity={saveActivity} deleteActivity={deleteActivity}
            financeReports={financeReports}
            showToast={showToast}
          />
        )}
        {tab === "finances" && (
          <FinancesTab
            regions={regions} leadership={leadership}
            financeReports={financeReports} saveFinance={saveFinance} deleteFinance={deleteFinance}
            expenseReports={expenseReports} saveExpense={saveExpense} deleteExpense={deleteExpense}
            seminars={seminars} coordSeminars={coordSeminars} seminarReports={seminarReports}
            unlocked={coordUnlocked} onUnlock={unlockCoord} onLock={lockCoord}
            showToast={showToast}
          />
        )}
        {tab === "repertoire" && (
          <Repertoire
            pastors={pastors} setPastors={persistPastors}
            regions={regions} setRegions={persistRegions}
            missionaries={missionaries} setMissionaries={persistMissionaries}
            showToast={showToast}
          />
        )}
        {tab === "messagerie" && (
          <Messagerie
            seminars={seminars} coordSeminars={coordSeminars} pastors={pastors} deptHeads={deptHeads} missionaries={missionaries} regions={regions}
            annonces={annonces} saveAnnonce={saveAnnonce} deleteAnnonce={deleteAnnonce} showToast={showToast}
          />
        )}
        {tab === "coordination" && (
          <Coordination
            coordSeminars={coordSeminars} setCoordSeminars={persistCoordSeminars}
            seminars={seminars} setSeminars={persistSeminars}
            deptHeads={deptHeads} setDeptHeads={persistDeptHeads}
            actionPlans={actionPlans} setActionPlans={persistActionPlans}
            plansAnnuels={plansAnnuels} setPlansAnnuels={persistPlansAnnuels}
            deptPlans={deptPlans} saveDeptPlan={saveDeptPlan} deleteDeptPlan={deleteDeptPlan}
            deptBilans={deptBilans} saveDeptBilan={saveDeptBilan} deleteDeptBilan={deleteDeptBilan}
            deptCodes={deptCodes} saveDeptCode={saveDeptCode}
            leadership={leadership} pastors={pastors}
            unlocked={coordUnlocked} onUnlock={unlockCoord} onLock={lockCoord}
            natUnlocked={coordNatUnlocked} onUnlockNat={unlockCoordNat} onLockNat={lockCoordNat}
            showToast={showToast}
          />
        )}
        {tab === "direction" && (
          <Direction leadership={leadership} setLeadership={persistLeadership} showToast={showToast} unlocked={coordUnlocked} onUnlock={unlockCoord} onLock={lockCoord} />
        )}
        {tab === "bible" && (
          <BibleTab
            pastors={pastors} regions={regions}
            bibleReports={bibleReports} setBibleReports={persistBibleReports}
            showToast={showToast}
          />
        )}
      </div>
      <BottomNav tab={tab} setTab={setTab} badge={upcomingCount} />
      {toast && (
        <div style={{
          position: "absolute", bottom: 78, left: "50%", transform: "translateX(-50%)",
          background: "var(--ink)", color: "#fff", padding: "9px 16px", borderRadius: 10,
          fontSize: 13.5, boxShadow: "0 8px 20px rgba(0,0,0,.25)", zIndex: 50, whiteSpace: "nowrap"
        }}>
          {toast}
        </div>
      )}
    </Shell>
  );
}

/* ------------------------------------------------------------------ */
/*  Coquille + styles globaux                                         */
/* ------------------------------------------------------------------ */

function Shell({ children }) {
  return (
    <div style={{ position: "relative", maxWidth: 480, margin: "0 auto", height: "100vh", display: "flex", flexDirection: "column", background: "var(--bg)", fontFamily: "var(--font-body)", color: "var(--ink)" }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Fraunces:opsz,wght@9..144,500;9..144,600;9..144,700&family=Inter:wght@400;500;600;700&display=swap');
        :root {
          --bg: #EDEEE6;
          --surface: #FFFFFF;
          --ink: #23252B;
          --ink-soft: #6A6D74;
          --primary: #1E2A4A;
          --primary-light: #2F4270;
          --accent: #C89B3C;
          --accent-dark: #9C7A26;
          --accent-soft: #F3E7C7;
          --danger: #8A2E2E;
          --border: #DEDFD5;
          --font-display: 'Fraunces', Georgia, serif;
          --font-body: 'Inter', system-ui, -apple-system, sans-serif;
        }
        * { box-sizing: border-box; }
        button { font-family: inherit; cursor: pointer; border: none; background: none; }
        input, select, textarea { font-family: inherit; }
        ::-webkit-scrollbar { width: 0px; height: 0px; }
      `}</style>
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  MENU : PARTAGER L'APP + GUIDE D'UTILISATION                        */
/* ------------------------------------------------------------------ */

const APP_URL = "https://mpv-app.vercel.app";

const SHARE_MESSAGE = [
  "🙏 *Application Mission Parole de Vie Burkina*",
  "Département Mission et Formation",
  "",
  "Séminaires, programmes, rapports, finances et plans d'action de toutes les assemblées, au même endroit.",
  "",
  `👉 Ouvrez ce lien : ${APP_URL}`,
  "",
  "Pour l'installer sur votre téléphone :",
  "• Android (Chrome) : menu ⋮ puis « Installer l'application » ou « Ajouter à l'écran d'accueil »",
  "• iPhone (Safari) : bouton Partager puis « Sur l'écran d'accueil »",
].join("\n");

const GUIDE = [
  {
    tab: "accueil", icon: Home, titre: "Accueil",
    resume: "Le tableau de bord de l'application.",
    points: [
      "Le verset du jour, les chiffres clés et les rappels des programmes des 7 prochains jours.",
      "Les boutons ronds en haut ouvrent directement Séminaires, Programme, Bible, Rapport et Finances.",
    ],
  },
  {
    tab: "seminaires", icon: CalendarDays, titre: "Séminaires",
    resume: "Programmer les séminaires des assemblées et de la coordination.",
    points: [
      "« Assemblées » : choisissez l'assemblée puis « + » pour programmer un séminaire (thème, date, heure, lieu, prédicateurs, budget).",
      "Affectez si possible 2 ou 3 prédicateurs à chaque séminaire.",
      "« Coordination nationale » : les séminaires nationaux, modifiables avec le code du chef du département.",
      "Le budget d'un séminaire est compté tout seul comme dépense prévue dans la caisse.",
    ],
  },
  {
    tab: "programme", icon: ClipboardList, titre: "Programme",
    resume: "Les autres programmes : formations, prières, communions, retraites, conventions, QG.",
    points: [
      "Vue par mois ou liste complète, pour les assemblées et pour la coordination.",
      "« Notes libres » pour noter ce qui n'entre dans aucune case.",
    ],
  },
  {
    tab: "rapport", icon: FileText, titre: "Rapport",
    resume: "Déposer les rapports chaque semaine.",
    points: [
      "« Séminaires » : le rapport d'un séminaire (participants, invités, sauvés, témoignages, dépenses, photos, lien vidéo). Les dépenses déclarées passent toutes seules en dépenses effectuées dans la caisse.",
      "« Activités semaine » : le rapport hebdomadaire complet de l'assemblée (culte, mission, écoles de base, prière, QG, formation, famille, difficultés). La partie finances est reprise du rapport du financier.",
      "« Coordination » : les rapports des programmes nationaux.",
      "Chaque rapport se partage par WhatsApp d'un seul bouton.",
    ],
  },
  {
    tab: "finances", icon: Wallet, titre: "Finances",
    resume: "Recettes, caisse et dépenses de chaque assemblée et de la coordination.",
    points: [
      "« Recettes » : le financier choisit son assemblée, puis « Nouveau rapport financier ». Il saisit les offrandes, dîmes, besoin présent (BP) et dons volontaires. La répartition et la part Convention se calculent toutes seules.",
      "« Caisse & dépenses » : le solde en caisse, les dépenses prévues et effectuées, et le reste à ne pas dépasser. La caisse passe en rouge si le solde devient négatif.",
      "« National » : réservé au chef du département. Totaux de la semaine, assemblées qui n'ont pas déposé, caisses en rouge.",
    ],
  },
  {
    tab: "bible", icon: BookOpen, titre: "Bible",
    resume: "Lire la Bible et rendre compte de sa lecture.",
    points: [
      "« Lecteur » : la lecture du jour et l'accès aux livres.",
      "« Rapport de lecture » : chaque pasteur indique chaque semaine ce qu'il a lu.",
    ],
  },
  {
    tab: "repertoire", icon: Users, titre: "Répertoire",
    resume: "Les contacts de la mission.",
    points: [
      "Les pasteurs, prédicateurs et aspirants avec leur téléphone.",
      "Les régions et leurs assemblées, avec le pasteur titulaire et son contact.",
      "Les missionnaires.",
    ],
  },
  {
    tab: "coordination", icon: Building2, titre: "Coordination",
    resume: "Les plans d'action et le pilotage national.",
    points: [
      "« Plans départements » : chaque département a son espace réservé, ouvert par son propre code. Le chef y remplit le plan de l'année, du trimestre et du mois, puis fait le bilan. Il peut changer son code et le remettre à ses collaborateurs.",
      "« Vue nationale » (code du chef du département) : le tableau de tous les départements et la création des codes de chaque département.",
      "« Responsables » : les chefs de département et leurs contacts.",
      "« Validation » : le coordonnateur national approuve ou rejette les séminaires (avec son code). Un séminaire rejeté ne compte pas dans la caisse.",
      "« Plan national » : le plan annuel de la coordination.",
    ],
  },
  {
    tab: "messagerie", icon: MessageCircle, titre: "Messages",
    resume: "Réunions, annonces et visioconférences, envoyées par WhatsApp.",
    points: [
      "« Réunions & annonces » : « Nouvelle réunion ou annonce », remplissez titre, date, heure et ordre du jour, puis choisissez qui prévenir (tout le monde, un ou plusieurs départements, une fonction, une assemblée, ou personne par personne).",
      "Pour une réunion à distance, choisissez « Visioconférence » : un lien de réunion est créé tout seul et ajouté au message. Le jour venu, chacun touche « Rejoindre la visio ».",
      "Envoi : touchez « Envoyer à … » ; WhatsApp s'ouvre avec le message personnalisé, vous appuyez sur Envoyer, revenez dans l'app et passez à la personne suivante. L'app retient qui a déjà été prévenu.",
      "Le jour de la réunion, « Faire le compte rendu » : cochez les présences, ajoutez les captures d'écran de la visio, utilisez la dictée pour écrire les propos, notez les décisions et les actions, puis partagez le compte rendu par WhatsApp.",
      "« Par séminaire » : envoie la date, l'heure et le thème aux prédicateurs affectés.",
      "« Par catégorie » : écrire à tous les pasteurs, prédicateurs ou aspirants d'un coup.",
    ],
  },
  {
    tab: "direction", icon: Shield, titre: "Direction",
    resume: "Les responsables de la mission et les codes d'accès.",
    points: [
      "Le président Afrique, le responsable du département Afrique, le coordonnateur et le responsable Mission et Formation du pays.",
      "C'est ici qu'on crée le code du chef du département et le code du coordonnateur national.",
    ],
  },
];

function ShareAppCard({ showToast }) {
  const [qr, setQr] = useState("");
  const [showQr, setShowQr] = useState(false);
  const canShare = typeof navigator !== "undefined" && typeof navigator.share === "function";

  useEffect(() => {
    let alive = true;
    QRCode.toDataURL(APP_URL, { width: 480, margin: 1, color: { dark: "#1E2A4A", light: "#FFFFFF" } })
      .then(url => { if (alive) setQr(url); })
      .catch(() => {});
    return () => { alive = false; };
  }, []);

  async function copier() {
    try {
      await navigator.clipboard.writeText(APP_URL);
      showToast("Lien copié");
    } catch (e) {
      showToast("Copie impossible : notez le lien affiché");
    }
  }
  async function partager() {
    try { await navigator.share({ title: "Mission Parole de Vie Burkina", text: SHARE_MESSAGE, url: APP_URL }); } catch (e) {}
  }

  const btn = { display: "flex", alignItems: "center", justifyContent: "center", gap: 6, borderRadius: 10, padding: "10px 0", fontSize: 13, fontWeight: 700, textDecoration: "none" };
  return (
    <div style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", borderRadius: 16, padding: 16, color: "#fff", marginBottom: 18 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 6 }}>
        <Share2 size={18} color="var(--accent)" />
        <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700 }}>Partager l'application</div>
      </div>
      <div style={{ fontSize: 12.5, opacity: .85, lineHeight: 1.45, marginBottom: 12 }}>
        Envoyez le lien aux pasteurs, prédicateurs, financiers et chefs de département. Le message explique aussi comment installer l'app.
      </div>
      <div style={{ background: "rgba(255,255,255,.12)", borderRadius: 10, padding: "9px 12px", fontSize: 14, fontWeight: 700, letterSpacing: ".02em", marginBottom: 12, userSelect: "all", wordBreak: "break-all" }}>
        {APP_URL.replace("https://", "")}
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        <a href={shareWhatsappLink(SHARE_MESSAGE)} target="_blank" rel="noopener noreferrer" style={{ ...btn, background: "#25D366", color: "#fff", gridColumn: "1 / -1" }}>
          <Send size={15} /> Envoyer par WhatsApp
        </a>
        {canShare && (
          <button onClick={partager} style={{ ...btn, background: "#fff", color: "var(--primary)", gridColumn: "1 / -1" }}>
            <Share2 size={15} /> Partager autrement (SMS, Facebook…)
          </button>
        )}
        <button onClick={copier} style={{ ...btn, background: "rgba(255,255,255,.15)", color: "#fff" }}>
          <Copy size={15} /> Copier le lien
        </button>
        <button onClick={() => setShowQr(!showQr)} style={{ ...btn, background: "rgba(255,255,255,.15)", color: "#fff" }}>
          <QrCode size={15} /> {showQr ? "Masquer le QR" : "Code QR"}
        </button>
      </div>
      {showQr && (
        <div style={{ background: "#fff", borderRadius: 12, padding: 14, marginTop: 12, textAlign: "center" }}>
          {qr ? <img src={qr} alt={`Code QR vers ${APP_URL}`} style={{ width: "100%", maxWidth: 240, display: "block", margin: "0 auto" }} /> : <div style={{ color: "var(--ink-soft)", fontSize: 12 }}>Préparation du code…</div>}
          <div style={{ fontSize: 12, color: "var(--ink)", marginTop: 8, lineHeight: 1.4 }}>
            À faire scanner avec l'appareil photo du téléphone, par exemple lors d'une réunion ou d'un séminaire.
          </div>
        </div>
      )}
    </div>
  );
}

function MenuTab({ setTab, showToast }) {
  const [ouvert, setOuvert] = useState(null);
  const section = (t) => <div style={{ fontFamily: "var(--font-display)", fontSize: 17, fontWeight: 700, color: "var(--primary)", margin: "4px 0 10px" }}>{t}</div>;
  const box = { background: "#fff", border: "1px solid var(--border)", borderRadius: 13, padding: "12px 14px", marginBottom: 18 };
  const li = { fontSize: 13, lineHeight: 1.5, color: "var(--ink)", margin: "0 0 6px" };

  return (
    <div>
      <SectionTitle sub="Partager l'application et apprendre à l'utiliser">Menu</SectionTitle>

      <ShareAppCard showToast={showToast} />

      {section("Installer l'app sur le téléphone")}
      <div style={box}>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}><Smartphone size={15} color="var(--primary)" /> Android</div>
        <ol style={{ paddingLeft: 20, margin: "0 0 12px" }}>
          <li style={li}>Ouvrez le lien de l'application dans <b>Chrome</b>.</li>
          <li style={li}>Touchez le menu <b>⋮</b> en haut à droite.</li>
          <li style={li}>Choisissez <b>« Installer l'application »</b> ou <b>« Ajouter à l'écran d'accueil »</b>.</li>
        </ol>
        <div style={{ display: "flex", alignItems: "center", gap: 7, fontSize: 13.5, fontWeight: 700, marginBottom: 6 }}><Smartphone size={15} color="var(--primary)" /> iPhone</div>
        <ol style={{ paddingLeft: 20, margin: 0 }}>
          <li style={li}>Ouvrez le lien dans <b>Safari</b>.</li>
          <li style={li}>Touchez le bouton <b>Partager</b> (le carré avec une flèche vers le haut).</li>
          <li style={li}>Choisissez <b>« Sur l'écran d'accueil »</b>.</li>
        </ol>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.45 }}>
          L'icône de la mission apparaît alors sur l'écran du téléphone, comme une vraie application. Elle se met à jour toute seule.
        </div>
      </div>

      {section("Guide d'utilisation")}
      <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 18 }}>
        {GUIDE.map(g => {
          const Icon = g.icon;
          const open = ouvert === g.tab;
          return (
            <div key={g.tab} style={{ background: "#fff", border: `1px solid ${open ? "var(--primary)" : "var(--border)"}`, borderRadius: 12, overflow: "hidden" }}>
              <button onClick={() => setOuvert(open ? null : g.tab)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 11, padding: "12px 13px", textAlign: "left" }}>
                <div style={{ width: 34, height: 34, borderRadius: 9, background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0 }}>
                  <Icon size={17} color="var(--accent-dark)" />
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{g.titre}</div>
                  <div style={{ fontSize: 12, color: "var(--ink-soft)" }}>{g.resume}</div>
                </div>
                <ChevronRight size={16} color="var(--ink-soft)" style={{ transform: open ? "rotate(90deg)" : "none", transition: "transform .2s" }} />
              </button>
              {open && (
                <div style={{ padding: "0 14px 13px 58px" }}>
                  <ul style={{ paddingLeft: 16, margin: "0 0 10px" }}>
                    {g.points.map((p, i) => <li key={i} style={li}>{p}</li>)}
                  </ul>
                  <button onClick={() => setTab(g.tab)} style={{
                    display: "inline-flex", alignItems: "center", gap: 5, background: "var(--primary)", color: "#fff",
                    fontSize: 12.5, fontWeight: 700, padding: "7px 12px", borderRadius: 9
                  }}>
                    Ouvrir {g.titre} <ChevronRight size={14} />
                  </button>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {section("Codes d'accès")}
      <div style={box}>
        <p style={li}><b>Code du chef du département</b> : ajouter les séminaires nationaux, voir la caisse de la coordination et le récapitulatif national des finances, modifier le plan national.</p>
        <p style={li}><b>Code du coordonnateur national</b> : approuver ou rejeter les séminaires dans « Coordination → Validation ».</p>
        <p style={li}><b>Code de chaque département</b> : ouvrir l'espace de son département dans « Coord. → Plans départements ». Il est créé par le chef du département national (« Vue nationale → Codes d'accès »), puis chaque chef peut le changer.</p>
        <p style={{ ...li, margin: 0, color: "var(--ink-soft)", fontSize: 12.5 }}>Les codes du chef du département et du coordonnateur se créent dans l'onglet Direction. Ne remettez chaque code qu'aux personnes concernées.</p>
      </div>

      {section("Bon à savoir")}
      <div style={box}>
        <ul style={{ paddingLeft: 18, margin: 0 }}>
          <li style={li}>Il faut une connexion internet pour enregistrer. Si le message « Échec de l'enregistrement » apparaît, vérifiez la connexion et recommencez.</li>
          <li style={li}>Tout ce qui est enregistré est visible par tous les utilisateurs de l'application, sauf les espaces protégés par un code.</li>
          <li style={li}>Un seul rapport par assemblée et par semaine : en déposer un nouveau pour la même semaine remplace l'ancien, après confirmation.</li>
          <li style={{ ...li, margin: 0 }}>Presque chaque écran a un bouton vert WhatsApp pour partager un rapport, un plan ou un bilan.</li>
        </ul>
      </div>

      <div style={{ textAlign: "center", fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>
        Mission Parole de Vie Burkina · Département Mission et Formation
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  En-tête                                                            */
/* ------------------------------------------------------------------ */

function Header({ onMenu, active }) {
  return (
    <div style={{
      background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
      padding: "18px 18px 16px", display: "flex", alignItems: "center", gap: 12,
      boxShadow: "0 4px 14px rgba(30,42,74,.25)", flexShrink: 0
    }}>
      <LogoBadge size={46} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontFamily: "var(--font-display)", color: "#fff", fontSize: 17, fontWeight: 700, lineHeight: 1.15 }}>
          Mission Parole de Vie
        </div>
        <div style={{ color: "var(--accent)", fontSize: 10.5, fontWeight: 600, letterSpacing: ".08em", textTransform: "uppercase", marginTop: 2 }}>
          Burkina Faso · Mission &amp; Formation
        </div>
      </div>
      <button onClick={onMenu} aria-label="Menu : partager l'app et guide d'utilisation" style={{
        display: "flex", flexDirection: "column", alignItems: "center", gap: 2, flexShrink: 0,
        background: active ? "var(--accent)" : "rgba(255,255,255,.12)", color: "#fff", borderRadius: 11, padding: "7px 10px"
      }}>
        <Menu size={19} />
        <span style={{ fontSize: 9.5, fontWeight: 700, letterSpacing: ".04em" }}>MENU</span>
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Navigation basse                                                   */
/* ------------------------------------------------------------------ */

function BottomNav({ tab, setTab, badge }) {
  const items = [
    { id: "accueil", label: "Accueil", icon: Home },
    { id: "seminaires", label: "Sémin.", icon: CalendarDays },
    { id: "programme", label: "Progr.", icon: ClipboardList },
    { id: "rapport", label: "Rapport", icon: FileText },
    { id: "finances", label: "Finances", icon: Wallet },
    { id: "bible", label: "Bible", icon: BookOpen },
    { id: "repertoire", label: "Répert.", icon: Users },
    { id: "coordination", label: "Coord.", icon: Building2 },
    { id: "messagerie", label: "Messages", icon: MessageCircle },
    { id: "direction", label: "Direction", icon: Shield },
  ];
  return (
    <div style={{
      position: "absolute", bottom: 0, left: 0, right: 0, background: "var(--surface)",
      borderTop: "1px solid var(--border)", display: "flex", padding: "8px 4px 10px",
      boxShadow: "0 -4px 16px rgba(0,0,0,.05)", overflowX: "auto", WebkitOverflowScrolling: "touch"
    }}>
      {items.map(it => {
        const Icon = it.icon;
        const active = tab === it.id;
        return (
          <button key={it.id} onClick={() => setTab(it.id)} style={{
            flex: "0 0 auto", minWidth: 62, display: "flex", flexDirection: "column", alignItems: "center", gap: 3,
            padding: "6px 4px", position: "relative"
          }}>
            <div style={{ position: "relative" }}>
              <Icon size={20} color={active ? "var(--primary)" : "var(--ink-soft)"} strokeWidth={active ? 2.4 : 1.9} />
              {it.id === "accueil" && badge > 0 && (
                <span style={{
                  position: "absolute", top: -5, right: -7, background: "var(--danger)", color: "#fff",
                  fontSize: 9, fontWeight: 700, borderRadius: 999, minWidth: 14, height: 14,
                  display: "flex", alignItems: "center", justifyContent: "center", padding: "0 3px"
                }}>{badge}</span>
              )}
            </div>
            <span style={{ fontSize: 10.5, fontWeight: active ? 700 : 500, color: active ? "var(--primary)" : "var(--ink-soft)", whiteSpace: "nowrap" }}>
              {it.label}
            </span>
          </button>
        );
      })}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  Petits composants réutilisables                                    */
/* ------------------------------------------------------------------ */

function SectionTitle({ children, sub }) {
  return (
    <div style={{ marginBottom: 14 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 21, fontWeight: 700, color: "var(--primary)" }}>{children}</div>
      {sub && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginTop: 2 }}>{sub}</div>}
    </div>
  );
}

function EmptyState({ icon: Icon, text }) {
  return (
    <div style={{
      display: "flex", flexDirection: "column", alignItems: "center", gap: 8, padding: "38px 20px",
      color: "var(--ink-soft)", textAlign: "center"
    }}>
      <Icon size={30} strokeWidth={1.4} />
      <div style={{ fontSize: 13 }}>{text}</div>
    </div>
  );
}

function Field({ label, children }) {
  return (
    <div style={{ marginBottom: 13 }}>
      <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)", marginBottom: 5 }}>{label}</div>
      {children}
    </div>
  );
}

const inputStyle = {
  width: "100%", padding: "10px 12px", borderRadius: 9, border: "1px solid var(--border)",
  fontSize: 14.5, background: "#fff", color: "var(--ink)", outline: "none"
};

function ModalShell({ title, onClose, children }) {
  return (
    <div style={{
      position: "absolute", inset: 0, background: "rgba(20,22,28,.45)", zIndex: 60,
      display: "flex", alignItems: "flex-end"
    }} onClick={onClose}>
      <div onClick={e => e.stopPropagation()} style={{
        background: "#fff", width: "100%", maxHeight: "88%", overflowY: "auto",
        borderRadius: "18px 18px 0 0", padding: "18px 18px 26px"
      }}>
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>{title}</div>
          <button onClick={onClose} style={{ padding: 4 }}><X size={20} color="var(--ink-soft)" /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

function PrimaryButton({ children, onClick, icon: Icon, full }) {
  return (
    <button onClick={onClick} style={{
      display: "flex", alignItems: "center", justifyContent: "center", gap: 7,
      background: "var(--primary)", color: "#fff", padding: "11px 18px", borderRadius: 10,
      fontSize: 14, fontWeight: 600, width: full ? "100%" : "auto"
    }}>
      {Icon && <Icon size={16} />} {children}
    </button>
  );
}

/* Sélecteur d'assemblée groupé par région */
function AssembleeSelect({ regions, value, onChange, style }) {
  return (
    <select style={style || inputStyle} value={value} onChange={e => onChange(e.target.value)}>
      <option value="">— Sélectionner —</option>
      {regions.map(r => r.assemblees.length > 0 && (
        <optgroup key={r.id} label={r.nom}>
          {r.assemblees.map(a => <option key={a.id} value={a.nom}>{a.nom}</option>)}
        </optgroup>
      ))}
    </select>
  );
}

/* ------------------------------------------------------------------ */
/*  ACCUEIL                                                            */
/* ------------------------------------------------------------------ */

function Accueil({ seminars, coordSeminars, pastors, regions, setTab, annonces }) {
  const tous = [
    ...seminars.map(s => ({ ...s, _niveau: "Assemblée" })),
    ...(coordSeminars || []).map(s => ({ ...s, _niveau: "Coordination nationale" })),
  ];
  const sorted = [...tous].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const reminders = sorted.filter(s => { const d = daysUntil(s.date); return d !== null && d >= 0 && d <= 7; });
  const upcoming = sorted.filter(s => { const d = daysUntil(s.date); return d !== null && d > 7; });
  const totalAssemblees = flattenAssemblees(regions).length;

  const heureActuelle = new Date().getHours();
  const salutation = heureActuelle < 5 ? "Bonne nuit" : heureActuelle < 12 ? "Bonjour" : heureActuelle < 18 ? "Bon après-midi" : "Bonsoir";
  const dateAujourdhui = new Date().toLocaleDateString("fr-FR", { weekday: "long", day: "numeric", month: "long" });

  const raccourcis = [
    { id: "seminaires", label: "Séminaires", icon: CalendarDays },
    { id: "programme", label: "Programme", icon: ClipboardList },
    { id: "bible", label: "Bible", icon: BookOpen },
    { id: "rapport", label: "Rapport", icon: FileText },
    { id: "finances", label: "Finances", icon: Wallet },
    { id: "messagerie", label: "Réunions", icon: Megaphone },
    { id: "aide", label: "Partager & aide", icon: Share2 },
  ];

  return (
    <div style={{ animation: "fadeInUp .5s ease" }}>
      <style>{`
        @keyframes fadeInUp { from { opacity: 0; transform: translateY(8px); } to { opacity: 1; transform: translateY(0); } }
      `}</style>

      <div style={{ marginBottom: 4 }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 20, fontWeight: 700, color: "var(--primary)" }}>
          {salutation} 👋
        </div>
        <div style={{ fontSize: 12.5, color: "var(--ink-soft)", textTransform: "capitalize", marginTop: 1 }}>{dateAujourdhui}</div>
        <div style={{ fontSize: 12, color: "var(--accent-dark)", fontStyle: "italic", marginTop: 6, lineHeight: 1.4 }}>
          Travaillez pour votre salut avec crainte et tremblement — la grâce est trompeuse.
        </div>
      </div>

      <div style={{ display: "flex", gap: 6, marginTop: 14, marginBottom: 18, overflowX: "auto", paddingBottom: 2 }}>
        {raccourcis.map(r => {
          const Icon = r.icon;
          return (
            <button key={r.id} onClick={() => setTab(r.id)} style={{
              display: "flex", alignItems: "center", gap: 5, flex: "0 0 auto", background: "#fff", border: "1px solid var(--border)",
              borderRadius: 999, padding: "7px 13px", fontSize: 12, fontWeight: 700, color: "var(--primary)"
            }}>
              <Icon size={13} /> {r.label}
            </button>
          );
        })}
      </div>

      <VerseOfTheDay />

      <ProchainesReunions annonces={annonces} setTab={setTab} />

      <SectionTitle sub={`${pastors.length} pasteurs/prédicateurs · ${tous.length} programmes · ${totalAssemblees} assemblées`}>
        Tableau de bord
      </SectionTitle>

      <div style={{ display: "flex", gap: 10, marginBottom: 20 }}>
        <StatCard label="À venir (7 j)" value={reminders.length} tone="var(--danger)" />
        <StatCard label="Programmés" value={tous.length} tone="var(--primary)" />
        <StatCard label="Assemblées" value={totalAssemblees} tone="var(--accent-dark)" />
      </div>

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Bell size={15} color="var(--danger)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Rappels — 7 prochains jours</div>
      </div>
      {reminders.length === 0 ? (
        <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 22, background: "#fff", borderRadius: 12, padding: "16px", border: "1px solid var(--border)" }}>
          Rien de prévu dans les 7 prochains jours. 🎉
        </div>
      ) : (
        <div style={{ marginBottom: 22 }}>
          <RemindersCarousel reminders={reminders} pastors={pastors} />
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <CalendarDays size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Prochains programmes</div>
      </div>
      {upcoming.length === 0 ? (
        <EmptyState icon={CalendarDays} text="Aucun autre programme enregistré pour le moment." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {upcoming.slice(0, 6).map(s => <SeminarCard key={s.id} s={s} pastors={pastors} />)}
        </div>
      )}

      <div style={{ marginTop: 22, textAlign: "center" }}>
        <button onClick={() => setTab("seminaires")} style={{ fontSize: 13, fontWeight: 600, color: "var(--primary)", display: "inline-flex", alignItems: "center", gap: 4 }}>
          Voir tous les séminaires <ChevronRight size={15} />
        </button>
      </div>
    </div>
  );
}

/* Carrousel animé des rappels (défilement lent, auto + manuel) */
function RemindersCarousel({ reminders, pastors }) {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    if (reminders.length <= 1) return;
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % reminders.length);
        setVisible(true);
      }, 400);
    }, 5000);
    return () => clearInterval(timer);
  }, [reminders.length]);

  useEffect(() => { if (index >= reminders.length) setIndex(0); }, [reminders.length]);

  function goTo(delta) {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + delta + reminders.length) % reminders.length);
      setVisible(true);
    }, 250);
  }

  const current = reminders[Math.min(index, reminders.length - 1)];

  return (
    <div>
      <div style={{ transition: "opacity .4s ease, transform .4s ease", opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)" }}>
        <SeminarCard s={current} pastors={pastors} />
      </div>
      {reminders.length > 1 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 14, marginTop: 10 }}>
          <button onClick={() => goTo(-1)} style={{ color: "var(--ink-soft)" }}><ChevronLeft size={16} /></button>
          <div style={{ display: "flex", gap: 5 }}>
            {reminders.map((_, i) => (
              <div key={i} style={{
                width: i === index ? 16 : 6, height: 6, borderRadius: 999, transition: "width .3s ease",
                background: i === index ? "var(--danger)" : "var(--border)"
              }} />
            ))}
          </div>
          <button onClick={() => goTo(1)} style={{ color: "var(--ink-soft)" }}><ChevronRight size={16} /></button>
        </div>
      )}
    </div>
  );
}

/* Verset biblique animé du tableau de bord */
function VerseOfTheDay() {
  const [index, setIndex] = useState(() => Math.floor(Math.random() * VERSES.length));
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const timer = setInterval(() => {
      setVisible(false);
      setTimeout(() => {
        setIndex(i => (i + 1) % VERSES.length);
        setVisible(true);
      }, 400);
    }, 9000);
    return () => clearInterval(timer);
  }, []);

  function goTo(delta) {
    setVisible(false);
    setTimeout(() => {
      setIndex(i => (i + delta + VERSES.length) % VERSES.length);
      setVisible(true);
    }, 250);
  }

  const verse = VERSES[index];

  return (
    <div style={{
      background: "linear-gradient(135deg, var(--primary), var(--primary-light))",
      borderRadius: 16, padding: "18px 18px 14px", marginBottom: 18, color: "#fff",
      boxShadow: "0 6px 18px rgba(30,42,74,.22)", position: "relative", overflow: "hidden"
    }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, opacity: 0.85 }}>
        <BookOpen size={14} />
        <span style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".08em" }}>Verset du jour</span>
      </div>
      <div style={{
        minHeight: 74, transition: "opacity .4s ease, transform .4s ease",
        opacity: visible ? 1 : 0, transform: visible ? "translateY(0)" : "translateY(6px)"
      }}>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 15, lineHeight: 1.5, fontStyle: "italic" }}>
          « {verse.texte} »
        </div>
        <div style={{ fontSize: 12, color: "var(--accent)", fontWeight: 700, marginTop: 8 }}>— {verse.ref}</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginTop: 12 }}>
        <div style={{ display: "flex", gap: 6 }}>
          <button onClick={() => goTo(-1)} style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: 5 }}>
            <ChevronLeft size={14} color="#fff" />
          </button>
          <button onClick={() => goTo(1)} style={{ background: "rgba(255,255,255,.15)", borderRadius: 8, padding: 5 }}>
            <ChevronRight size={14} color="#fff" />
          </button>
        </div>
        <a href="https://fr.wikisource.org/wiki/Bible_Segond_1910" target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 600, color: "#fff",
          background: "rgba(255,255,255,.15)", padding: "6px 10px", borderRadius: 8
        }}>
          Lire la Bible complète <ExternalLink size={11} />
        </a>
      </div>
    </div>
  );
}

function StatCard({ label, value, tone }) {
  return (
    <div style={{ flex: 1, background: "#fff", borderRadius: 12, padding: "12px 10px", border: "1px solid var(--border)", textAlign: "center" }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 22, fontWeight: 700, color: tone }}>{value}</div>
      <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 2, fontWeight: 600 }}>{label}</div>
    </div>
  );
}

function TypeBadge({ type, groupe }) {
  const tone = TYPE_TONES[type] || "var(--primary)";
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700,
      color: "#fff", background: tone, padding: "2px 8px", borderRadius: 999
    }}>
      {type || "Séminaire"}{type === "Retraite" && groupe ? ` · ${groupe}` : ""}
    </span>
  );
}

function PinField({ value, onChange, placeholder, onKeyDown }) {
  const [visible, setVisible] = useState(false);
  return (
    <div style={{ position: "relative" }}>
      <input
        type={visible ? "text" : "password"}
        style={{ ...inputStyle, paddingRight: 40 }}
        value={value}
        placeholder={placeholder}
        onChange={e => onChange(e.target.value)}
        onKeyDown={onKeyDown}
      />
      <button
        type="button"
        onClick={() => setVisible(v => !v)}
        style={{ position: "absolute", right: 10, top: "50%", transform: "translateY(-50%)", color: "var(--ink-soft)" }}
      >
        {visible ? <EyeOff size={16} /> : <Eye size={16} />}
      </button>
    </div>
  );
}

function ValidationBadge({ statut }) {
  const info = VALIDATION_STATUTS[statut] || VALIDATION_STATUTS.attente;
  const Icon = info.icon;
  return (
    <span style={{
      display: "inline-flex", alignItems: "center", gap: 4, fontSize: 10.5, fontWeight: 700,
      color: "#fff", background: info.tone, padding: "2px 8px", borderRadius: 999
    }}>
      <Icon size={11} /> {info.label}
    </span>
  );
}

function GpsCapture({ position, onChange }) {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  function capture() {
    if (!navigator.geolocation) { setError("La géolocalisation n'est pas disponible sur cet appareil."); return; }
    setLoading(true);
    setError("");
    navigator.geolocation.getCurrentPosition(
      pos => { onChange({ lat: pos.coords.latitude, lng: pos.coords.longitude }); setLoading(false); },
      () => { setError("Impossible d'obtenir la position (autorisation refusée ou signal absent)."); setLoading(false); },
      { enableHighAccuracy: true, timeout: 10000 }
    );
  }

  return (
    <div>
      {position ? (
        <div style={{ display: "flex", alignItems: "center", gap: 8, flexWrap: "wrap" }}>
          <a href={mapsLink(position.lat, position.lng)} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--primary)", fontWeight: 600,
            background: "var(--accent-soft)", padding: "7px 11px", borderRadius: 8
          }}>
            <MapPin size={13} /> Voir sur la carte
          </a>
          <a href={`https://wa.me/?text=${encodeURIComponent("Localisation du séminaire : " + mapsLink(position.lat, position.lng))}`} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "#fff", fontWeight: 600,
            background: "#25D366", padding: "7px 11px", borderRadius: 8
          }}>
            <Share2 size={13} /> Partager
          </a>
          <button onClick={() => onChange(null)} style={{ fontSize: 11.5, color: "var(--danger)" }}>Retirer</button>
        </div>
      ) : (
        <button onClick={capture} disabled={loading} style={{
          display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--primary)",
          border: "1.5px dashed var(--border)", borderRadius: 9, padding: "9px 12px", width: "100%", justifyContent: "center"
        }}>
          <Navigation size={14} /> {loading ? "Localisation en cours…" : "Utiliser ma position GPS actuelle"}
        </button>
      )}
      {error && <div style={{ fontSize: 11, color: "var(--danger)", marginTop: 5 }}>{error}</div>}
    </div>
  );
}

function BudgetFieldsEditor({ budget, onChange }) {
  const values = budget || {};
  const total = budgetTotal(values);
  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
        {BUDGET_FIELDS.map(f => (
          <div key={f.key}>
            <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>{f.label}</div>
            <input
              type="number" inputMode="numeric" style={{ ...inputStyle, fontSize: 13 }}
              value={values[f.key] || ""}
              onChange={e => onChange({ ...values, [f.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
              placeholder="0"
            />
          </div>
        ))}
      </div>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 10, padding: "9px 12px", background: "var(--accent-soft)", borderRadius: 9 }}>
        <span style={{ fontSize: 12.5, fontWeight: 600, color: "var(--accent-dark)" }}>Total prévisionnel</span>
        <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--accent-dark)" }}>{total.toLocaleString("fr-FR")} FCFA</span>
      </div>
    </div>
  );
}

function PriereFields({ dirigeantPriere, setDirigeantPriere, dirigeantChants, setDirigeantChants, sujetsPriereImage, setSujetsPriereImage }) {
  const [uploading, setUploading] = useState(false);

  async function handleFileChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file, 900, 0.6);
      setSujetsPriereImage(dataUrl);
    } catch (err) { console.error("Erreur téléchargement", err); }
    setUploading(false);
    e.target.value = "";
  }

  return (
    <>
      <Field label="Dirigeant de la prière"><input style={inputStyle} value={dirigeantPriere} onChange={e => setDirigeantPriere(e.target.value)} placeholder="Nom du dirigeant" /></Field>
      <Field label="Dirigeant des chants"><input style={inputStyle} value={dirigeantChants} onChange={e => setDirigeantChants(e.target.value)} placeholder="Nom du dirigeant des chants" /></Field>
      <Field label="Sujets de prière (si déjà envoyés par le bureau Afrique)">
        {sujetsPriereImage ? (
          <div>
            <img src={sujetsPriereImage} alt="Sujets de prière" style={{ width: "100%", borderRadius: 10, border: "1px solid var(--border)", marginBottom: 8 }} />
            <button onClick={() => setSujetsPriereImage(null)} style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Retirer le document</button>
          </div>
        ) : (
          <label style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 12.5, fontWeight: 600,
            color: "var(--primary)", border: "1.5px dashed var(--border)", borderRadius: 9, padding: "12px", cursor: "pointer"
          }}>
            <ImageIcon size={16} /> {uploading ? "Chargement…" : "Télécharger le document / la photo"}
            <input type="file" accept="image/*" onChange={handleFileChange} style={{ display: "none" }} disabled={uploading} />
          </label>
        )}
      </Field>
    </>
  );
}

function CommunionFields({ mc, setMc, predicateurJour, setPredicateurJour, choraleGroupeMusical, setChoraleGroupeMusical, priereOuverture, setPriereOuverture, themePredicationJour, setThemePredicationJour, temoignagesCommunion, setTemoignagesCommunion, diversCommunion, setDiversCommunion }) {
  return (
    <>
      <Field label="MC (Maître de cérémonie)"><input style={inputStyle} value={mc} onChange={e => setMc(e.target.value)} placeholder="Nom du MC" /></Field>
      <Field label="Prédicateur du jour"><input style={inputStyle} value={predicateurJour} onChange={e => setPredicateurJour(e.target.value)} placeholder="Nom du prédicateur du jour" /></Field>
      <Field label="Thème de la prédication du jour"><input style={inputStyle} value={themePredicationJour} onChange={e => setThemePredicationJour(e.target.value)} placeholder="Ex : La grâce et la vérité" /></Field>
      <Field label="Chorale ou groupe musical"><input style={inputStyle} value={choraleGroupeMusical} onChange={e => setChoraleGroupeMusical(e.target.value)} placeholder="Ex : Chorale de PISSY" /></Field>
      <Field label="Prière d'ouverture (dirigée par)"><input style={inputStyle} value={priereOuverture} onChange={e => setPriereOuverture(e.target.value)} placeholder="Nom du responsable" /></Field>
      <Field label="Témoignages"><textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={temoignagesCommunion} onChange={e => setTemoignagesCommunion(e.target.value)} placeholder="Noms ou détails des témoignages prévus" /></Field>
      <Field label="Divers"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={diversCommunion} onChange={e => setDiversCommunion(e.target.value)} placeholder="Autres informations utiles" /></Field>
    </>
  );
}

function PastorMultiSelect({ pastors, selected, onChange }) {
  const [search, setSearch] = useState("");
  const filteredPastors = pastors.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  function toggle(id) {
    onChange(selected.includes(id) ? selected.filter(x => x !== id) : [...selected, id]);
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 7 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--ink-soft)" }} />
        <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un pasteur…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ maxHeight: 170, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 9 }}>
        {filteredPastors.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: "var(--ink-soft)" }}>Aucun résultat.</div>}
        {filteredPastors.map(p => {
          const checked = selected.includes(p.id);
          return (
            <div key={p.id} onClick={() => toggle(p.id)} style={{
              display: "flex", alignItems: "center", gap: 9, padding: "9px 11px",
              borderBottom: "1px solid var(--border)", background: checked ? "var(--accent-soft)" : "#fff"
            }}>
              <div style={{
                width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? "var(--accent-dark)" : "var(--border)"}`,
                background: checked ? "var(--accent-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
              }}>
                {checked && <Check size={12} color="#fff" />}
              </div>
              <div style={{ fontSize: 13.5 }}>
                <div style={{ fontWeight: 600 }}>{p.nom}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.fonction}{p.assemblee ? ` · ${p.assemblee}` : ""}</div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function SeminarCard({ s, pastors, onClick }) {
  const d = daysUntil(s.date);
  const names = (s.predicateurs || []).map(id => pastors.find(p => p.id === id)?.nom).filter(Boolean);
  return (
    <div onClick={onClick} style={{
      background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
      borderLeft: "4px solid var(--accent)", cursor: onClick ? "pointer" : "default"
    }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
        <div>
          <div style={{ marginBottom: 5 }}><TypeBadge type={s.type} groupe={s.groupe} /></div>
          <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--primary)", lineHeight: 1.3 }}>{s.theme || "(Thème non défini)"}</div>
        </div>
        <DaysBadge days={d} />
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 7, fontSize: 12, color: "var(--ink-soft)" }}>
        <span style={{ display: "flex", alignItems: "center", gap: 4 }}>
          <CalendarDays size={12.5} />
          {s.date
            ? (s.dateFin && s.dateFin !== s.date ? `Du ${formatDateLong(s.date)} au ${formatDateLong(s.dateFin)}` : formatDateLong(s.date))
            : "Date non définie"}
        </span>
        {s.heure && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12.5} /> {s.heure}</span>}
        {s.assemblee && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12.5} /> {s.assemblee}</span>}
      </div>
      {s.lieu && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
          <Navigation size={11.5} /> {s.lieu}
          {s.positionGps && (
            <a href={mapsLink(s.positionGps.lat, s.positionGps.lng)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "var(--primary)", fontWeight: 600, marginLeft: 4 }}>
              (carte)
            </a>
          )}
        </div>
      )}
      {s.personneRessourceNom && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          Personne ressource : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.personneRessourceNom}</span>{s.personneRessourceContact ? ` · ${s.personneRessourceContact}` : ""}
        </div>
      )}
      {s.type === "QG National" && s.choraleAssemblees && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          Chorale(s) : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.choraleAssemblees}</span>
        </div>
      )}
      {s.type === "QG National" && s.inviteHonneur && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          Invité d'honneur : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.inviteHonneur}</span>
        </div>
      )}
      {s.type === "QG National" && s.programmeSemaine && (
        <div style={{ marginTop: 8, background: "var(--accent-soft)", borderRadius: 9, padding: "9px 11px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 4 }}>
            Programme de la semaine
          </div>
          <div style={{ fontSize: 12, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{s.programmeSemaine}</div>
        </div>
      )}
      {s.type === "Retraite" && s.programmeRetraite && (
        <div style={{ marginTop: 8, background: "var(--accent-soft)", borderRadius: 9, padding: "9px 11px" }}>
          <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 4 }}>
            Programme du jour
          </div>
          <div style={{ fontSize: 12, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{s.programmeRetraite}</div>
        </div>
      )}
      {s.type === "Formation" && s.nombreJours && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          Durée : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.nombreJours} jour{Number(s.nombreJours) > 1 ? "s" : ""}</span>
        </div>
      )}
      {s.type === "Formation" && s.formateurs && s.formateurs.length > 0 && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          Formateurs : <span style={{ color: "var(--ink)", fontWeight: 600 }}>
            {s.formateurs.map(id => pastors.find(p => p.id === id)?.nom).filter(Boolean).join(", ")}
          </span>
        </div>
      )}
      {s.type === "Prière" && (s.dirigeantPriere || s.dirigeantChants) && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
          {s.dirigeantPriere && <>Dirigeant de la prière : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.dirigeantPriere}</span></>}
          {s.dirigeantPriere && s.dirigeantChants && " · "}
          {s.dirigeantChants && <>Dirigeant des chants : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.dirigeantChants}</span></>}
        </div>
      )}
      {s.type === "Prière" && s.sujetsPriereImage && (
        <a href={s.sujetsPriereImage} download="sujets-de-priere.jpg" onClick={e => e.stopPropagation()} style={{
          display: "inline-flex", alignItems: "center", gap: 5, marginTop: 6, fontSize: 11.5, color: "var(--primary)", fontWeight: 600
        }}>
          <ImageIcon size={12} /> Sujets de prière (bureau Afrique) — télécharger
        </a>
      )}
      {s.type === "Communion" && (s.mc || s.predicateurJour || s.themePredicationJour || s.choraleGroupeMusical) && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-soft)", display: "flex", flexDirection: "column", gap: 2 }}>
          {s.mc && <span>MC : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.mc}</span></span>}
          {s.predicateurJour && <span>Prédicateur du jour : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.predicateurJour}</span></span>}
          {s.themePredicationJour && <span>Thème du jour : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.themePredicationJour}</span></span>}
          {s.choraleGroupeMusical && <span>Chorale/Groupe musical : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.choraleGroupeMusical}</span></span>}
          {s.priereOuverture && <span>Prière d'ouverture : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.priereOuverture}</span></span>}
        </div>
      )}
      {s.type === "Communion" && s.temoignagesCommunion && (
        <div style={{ marginTop: 6, fontSize: 11.5, color: "var(--ink-soft)" }}>Témoignages : <span style={{ color: "var(--ink)" }}>{s.temoignagesCommunion}</span></div>
      )}
      {s.type === "Communion" && s.diversCommunion && (
        <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>Divers : <span style={{ color: "var(--ink)" }}>{s.diversCommunion}</span></div>
      )}
      {names.length > 0 && (
        <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink)" }}>
          <span style={{ color: "var(--ink-soft)" }}>Prédicateurs : </span>{names.join(", ")}
        </div>
      )}
      {names.length === 0 && (
        <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--danger)", fontWeight: 600 }}>⚠ Aucun prédicateur affecté</div>
      )}
      <div style={{ marginTop: 9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
        <ValidationBadge statut={s.validationStatut} />
        {s.budget && budgetTotal(s.budget) > 0 && (
          <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: 3 }}>
            <Wallet size={12} /> {budgetTotal(s.budget).toLocaleString("fr-FR")} FCFA
          </span>
        )}
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  SÉMINAIRES                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  SÉMINAIRES : assemblée à côté de la coordination                   */
/* ------------------------------------------------------------------ */

function SeminairesTab({ seminars, setSeminars, coordSeminars, setCoordSeminars, pastors, regions, leadership, coordUnlocked, onUnlockCoord, onLockCoord, showToast }) {
  const [niveau, setNiveau] = useState("assemblee"); // "assemblee" | "coordination"
  const [vue, setVue] = useState("liste"); // "liste" | "programme" (assemblée seulement)
  const [editing, setEditing] = useState(null);
  const [filterAssemblee, setFilterAssemblee] = useState("");

  const seminairesAssemblee = seminars.filter(s => (s.type || "Séminaire") === "Séminaire");
  const seminairesCoord = coordSeminars.filter(s => (s.type || "Séminaire") === "Séminaire");

  function handleSaveAssemblee(s) {
    const exists = seminars.some(x => x.id === s.id);
    setSeminars(exists ? seminars.map(x => x.id === s.id ? s : x) : [...seminars, s]);
    setEditing(null);
    showToast(exists ? "Séminaire mis à jour" : "Séminaire ajouté");
  }
  function handleDeleteAssemblee(id) {
    setSeminars(seminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Séminaire supprimé");
  }
  function handleSaveCoord(s) {
    const exists = coordSeminars.some(x => x.id === s.id);
    setCoordSeminars(exists ? coordSeminars.map(x => x.id === s.id ? s : x) : [...coordSeminars, s]);
    setEditing(null);
    showToast(exists ? "Séminaire national mis à jour" : "Séminaire national ajouté");
  }
  function handleDeleteCoord(id) {
    setCoordSeminars(coordSeminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Séminaire national supprimé");
  }

  const listeAssemblee = seminairesAssemblee
    .filter(s => !filterAssemblee || s.assemblee === filterAssemblee)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      <SectionTitle sub="Séminaires des assemblées et de la coordination nationale, classés par date">Séminaires</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setNiveau("assemblee")} style={segButtonStyle(niveau === "assemblee")}>Assemblées</button>
        <button onClick={() => setNiveau("coordination")} style={segButtonStyle(niveau === "coordination")}>Coordination nationale</button>
      </div>

      {niveau === "assemblee" ? (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
            <button onClick={() => setVue("liste")} style={segButtonStyle(vue === "liste")}>Liste complète</button>
            <button onClick={() => setVue("programme")} style={segButtonStyle(vue === "programme")}>Par assemblée (mois/année)</button>
          </div>

          {vue === "liste" ? (
            <>
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <AssembleeSelect regions={regions} value={filterAssemblee} onChange={setFilterAssemblee} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
                <button onClick={() => setEditing({ assemblee: filterAssemblee, type: "Séminaire" })} style={{
                  background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
                }}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              {listeAssemblee.length === 0 ? (
                <EmptyState icon={CalendarDays} text="Aucun séminaire d'assemblée pour l'instant." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {listeAssemblee.map(s => <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => setEditing(s)} />)}
                </div>
              )}
            </>
          ) : (
            <ProgrammeParAssemblee seminars={seminairesAssemblee} pastors={pastors} regions={regions} setEditing={(v) => setEditing({ type: "Séminaire", ...v })} />
          )}

          {editing && niveau === "assemblee" && (
            <SeminarForm seminar={editing} pastors={pastors} regions={regions} onSave={handleSaveAssemblee} onDelete={handleDeleteAssemblee} onClose={() => setEditing(null)} />
          )}
        </>
      ) : (
        <>
          <CoordLockPanel leadership={leadership} unlocked={coordUnlocked} onUnlock={onUnlockCoord} onLock={onLockCoord} />

          {coordUnlocked && (
            <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
              <button onClick={() => setEditing({ type: "Séminaire" })} style={{
                background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 14px",
                display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
              }}>
                <Plus size={15} /> Ajouter un séminaire national
              </button>
            </div>
          )}

          {seminairesCoord.length === 0 ? (
            <EmptyState icon={Building2} text="Aucun séminaire national pour l'instant." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {[...seminairesCoord].sort((a, b) => (a.date || "").localeCompare(b.date || "")).map(s => (
                <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => coordUnlocked && setEditing(s)} />
              ))}
            </div>
          )}

          {editing && niveau === "coordination" && coordUnlocked && (
            <CoordSeminarForm seminar={editing} pastors={pastors} onSave={handleSaveCoord} onDelete={handleDeleteCoord} onClose={() => setEditing(null)} />
          )}
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  PROGRAMME : formation, prière, communion, retraite, convention,    */
/*  QG national — assemblée à côté de la coordination + notes libres   */
/* ------------------------------------------------------------------ */

const AUTRES_TYPES = TYPES_PROGRAMME.filter(t => t !== "Séminaire");
const AUTRES_TYPES_ASSEMBLEE = TYPES_PROGRAMME_ASSEMBLEE.filter(t => t !== "Séminaire");

/* --- Vue unique par mois : chaque type de programme, ses propres dates et lieux --- */

function ProgrammeMensuelUnique({ seminars, setSeminars, pastors, regions }) {
  const [assemblee, setAssemblee] = useState("");
  const now = new Date();
  const [mois, setMois] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [editing, setEditing] = useState(null);

  const entriesDuMois = seminars.filter(s =>
    s.assemblee === assemblee && (s.date || "").slice(0, 7) === mois
  );

  function handleSave(s) {
    const exists = seminars.some(x => x.id === s.id);
    setSeminars(exists ? seminars.map(x => x.id === s.id ? s : x) : [...seminars, s]);
    setEditing(null);
  }
  function handleDelete(id) {
    setSeminars(seminars.filter(x => x.id !== id));
    setEditing(null);
  }

  return (
    <div>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>

      {assemblee && (
        <>
          <input type="month" style={{ ...inputStyle, marginBottom: 14 }} value={mois} onChange={e => setMois(e.target.value)} />

          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            {TYPES_PROGRAMME_ASSEMBLEE.map(type => {
              const entries = entriesDuMois
                .filter(s => (s.type || "Séminaire") === type)
                .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
              return (
                <div key={type}>
                  <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                    <TypeBadge type={type} />
                    <button onClick={() => setEditing({ assemblee, type, date: `${mois}-01` })} style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "var(--primary)"
                    }}>
                      <Plus size={13} /> Ajouter
                    </button>
                  </div>
                  {entries.length === 0 ? (
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", background: "#fff", border: "1px dashed var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                      Rien de programmé ce mois-ci.
                    </div>
                  ) : (
                    <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                      {entries.map(s => (
                        <div key={s.id} onClick={() => setEditing(s)} style={{
                          background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", cursor: "pointer"
                        }}>
                          <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{s.theme || "(Sans thème)"}</div>
                          <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 3, fontSize: 11.5, color: "var(--ink-soft)" }}>
                            <span style={{ display: "flex", alignItems: "center", gap: 3 }}><CalendarDays size={11} /> {s.date ? formatDateLong(s.date) : "Date à définir"}</span>
                            {s.heure && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {s.heure}</span>}
                            {s.lieu && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {s.lieu}</span>}
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </>
      )}

      {editing && (
        <SeminarForm seminar={editing} pastors={pastors} regions={regions} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ProgrammeMensuelUniqueCoord({ coordSeminars, setCoordSeminars, pastors, unlocked }) {
  const now = new Date();
  const [mois, setMois] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [editing, setEditing] = useState(null);

  const entriesDuMois = coordSeminars.filter(s => (s.date || "").slice(0, 7) === mois);

  function handleSave(s) {
    const exists = coordSeminars.some(x => x.id === s.id);
    setCoordSeminars(exists ? coordSeminars.map(x => x.id === s.id ? s : x) : [...coordSeminars, s]);
    setEditing(null);
  }
  function handleDelete(id) {
    setCoordSeminars(coordSeminars.filter(x => x.id !== id));
    setEditing(null);
  }

  return (
    <div>
      <input type="month" style={{ ...inputStyle, marginBottom: 14 }} value={mois} onChange={e => setMois(e.target.value)} />

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {TYPES_PROGRAMME.map(type => {
          const entries = entriesDuMois
            .filter(s => (s.type || "Séminaire") === type)
            .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
          return (
            <div key={type}>
              <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
                <TypeBadge type={type} />
                {unlocked && (
                  <button onClick={() => setEditing({ type, date: `${mois}-01` })} style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, color: "var(--primary)"
                  }}>
                    <Plus size={13} /> Ajouter
                  </button>
                )}
              </div>
              {entries.length === 0 ? (
                <div style={{ fontSize: 12, color: "var(--ink-soft)", background: "#fff", border: "1px dashed var(--border)", borderRadius: 10, padding: "10px 12px" }}>
                  Rien de programmé ce mois-ci.
                </div>
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
                  {entries.map(s => (
                    <div key={s.id} onClick={() => unlocked && setEditing(s)} style={{
                      background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 12px", cursor: unlocked ? "pointer" : "default"
                    }}>
                      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>{s.theme || "(Sans thème)"}</div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: "3px 10px", marginTop: 3, fontSize: 11.5, color: "var(--ink-soft)" }}>
                        <span style={{ display: "flex", alignItems: "center", gap: 3 }}><CalendarDays size={11} /> {s.date ? formatDateLong(s.date) : "Date à définir"}</span>
                        {s.heure && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><Clock size={11} /> {s.heure}</span>}
                        {s.lieu && <span style={{ display: "flex", alignItems: "center", gap: 3 }}><MapPin size={11} /> {s.lieu}</span>}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {editing && unlocked && (
        <CoordSeminarForm seminar={editing} pastors={pastors} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ProgrammeTab({ seminars, setSeminars, coordSeminars, setCoordSeminars, pastors, regions, leadership, coordUnlocked, onUnlockCoord, onLockCoord, weeklyPrograms, setWeeklyPrograms, showToast }) {
  const [niveau, setNiveau] = useState("assemblee"); // "assemblee" | "coordination" | "notes"
  const [vueAssemblee, setVueAssemblee] = useState("mensuel"); // "liste" | "mensuel"
  const [vueCoord, setVueCoord] = useState("mensuel"); // "liste" | "mensuel"
  const [filterType, setFilterType] = useState("");
  const [filterAssemblee, setFilterAssemblee] = useState("");
  const [editing, setEditing] = useState(null);

  const programmesAssemblee = seminars.filter(s => AUTRES_TYPES.includes(s.type));
  const programmesCoord = coordSeminars.filter(s => AUTRES_TYPES.includes(s.type));

  function handleSaveAssemblee(s) {
    const exists = seminars.some(x => x.id === s.id);
    setSeminars(exists ? seminars.map(x => x.id === s.id ? s : x) : [...seminars, s]);
    setEditing(null);
    showToast(exists ? "Programme mis à jour" : "Programme ajouté");
  }
  function handleDeleteAssemblee(id) {
    setSeminars(seminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Programme supprimé");
  }
  function handleSaveCoord(s) {
    const exists = coordSeminars.some(x => x.id === s.id);
    setCoordSeminars(exists ? coordSeminars.map(x => x.id === s.id ? s : x) : [...coordSeminars, s]);
    setEditing(null);
    showToast(exists ? "Programme national mis à jour" : "Programme national ajouté");
  }
  function handleDeleteCoord(id) {
    setCoordSeminars(coordSeminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Programme national supprimé");
  }

  function TypeChips() {
    const options = niveau === "coordination" ? AUTRES_TYPES : AUTRES_TYPES_ASSEMBLEE;
    return (
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
        <button onClick={() => setFilterType("")} style={{
          padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
          background: !filterType ? "var(--primary)" : "#fff", color: !filterType ? "#fff" : "var(--ink-soft)",
          border: "1px solid var(--border)"
        }}>Tous</button>
        {options.map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
            background: filterType === t ? TYPE_TONES[t] : "#fff", color: filterType === t ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--border)"
          }}>{t}</button>
        ))}
      </div>
    );
  }

  const listeAssemblee = programmesAssemblee
    .filter(s => !filterType || s.type === filterType)
    .filter(s => !filterAssemblee || s.assemblee === filterAssemblee)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const listeCoord = programmesCoord
    .filter(s => !filterType || s.type === filterType)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      <SectionTitle sub="Formations, prières, communions, retraites, conventions et QG — assemblées et coordination">Programme</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)", flexWrap: "wrap" }}>
        <button onClick={() => setNiveau("assemblee")} style={segButtonStyle(niveau === "assemblee")}>Assemblées</button>
        <button onClick={() => setNiveau("coordination")} style={segButtonStyle(niveau === "coordination")}>Coordination</button>
        <button onClick={() => setNiveau("notes")} style={segButtonStyle(niveau === "notes")}>Notes libres</button>
      </div>

      {niveau === "assemblee" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
            <button onClick={() => setVueAssemblee("mensuel")} style={segButtonStyle(vueAssemblee === "mensuel")}>Vue unique par mois</button>
            <button onClick={() => setVueAssemblee("liste")} style={segButtonStyle(vueAssemblee === "liste")}>Liste complète</button>
          </div>

          {vueAssemblee === "mensuel" ? (
            <ProgrammeMensuelUnique seminars={seminars} setSeminars={setSeminars} pastors={pastors} regions={regions} />
          ) : (
            <>
              <TypeChips />
              <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
                <AssembleeSelect regions={regions} value={filterAssemblee} onChange={setFilterAssemblee} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
                <button onClick={() => setEditing({ assemblee: filterAssemblee, type: filterType || "Formation" })} style={{
                  background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
                  display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
                }}>
                  <Plus size={16} /> Ajouter
                </button>
              </div>
              {listeAssemblee.length === 0 ? (
                <EmptyState icon={ClipboardList} text="Aucun programme d'assemblée pour l'instant." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {listeAssemblee.map(s => <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => setEditing(s)} />)}
                </div>
              )}
            </>
          )}
          {editing && niveau === "assemblee" && (
            <SeminarForm seminar={editing} pastors={pastors} regions={regions} onSave={handleSaveAssemblee} onDelete={handleDeleteAssemblee} onClose={() => setEditing(null)} />
          )}
        </>
      )}

      {niveau === "coordination" && (
        <>
          <CoordLockPanel leadership={leadership} unlocked={coordUnlocked} onUnlock={onUnlockCoord} onLock={onLockCoord} />

          <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
            <button onClick={() => setVueCoord("mensuel")} style={segButtonStyle(vueCoord === "mensuel")}>Vue unique par mois</button>
            <button onClick={() => setVueCoord("liste")} style={segButtonStyle(vueCoord === "liste")}>Liste complète</button>
          </div>

          {vueCoord === "mensuel" ? (
            <ProgrammeMensuelUniqueCoord coordSeminars={coordSeminars} setCoordSeminars={setCoordSeminars} pastors={pastors} unlocked={coordUnlocked} />
          ) : (
            <>
              <TypeChips />
              {coordUnlocked && (
                <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
                  <button onClick={() => setEditing({ type: filterType || "Formation" })} style={{
                    background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 14px",
                    display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
                  }}>
                    <Plus size={15} /> Ajouter un programme national
                  </button>
                </div>
              )}
              {listeCoord.length === 0 ? (
                <EmptyState icon={Building2} text="Aucun programme national pour l'instant." />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {listeCoord.map(s => <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => coordUnlocked && setEditing(s)} />)}
                </div>
              )}
            </>
          )}
          {editing && niveau === "coordination" && coordUnlocked && (
            <CoordSeminarForm seminar={editing} pastors={pastors} onSave={handleSaveCoord} onDelete={handleDeleteCoord} onClose={() => setEditing(null)} />
          )}
        </>
      )}


      {niveau === "notes" && (
        <ProgrammeSemaine regions={regions} weeklyPrograms={weeklyPrograms} setWeeklyPrograms={setWeeklyPrograms} showToast={showToast} />
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RAPPORT (unifié)                                                    */
/* ------------------------------------------------------------------ */

function RapportTab({ regions, pastors, seminars, coordSeminars, deptHeads, leadership, unlockedRespDept, onUnlockRespDept, onLockRespDept, seminarReports, setSeminarReports, activityReports, saveActivity, deleteActivity, financeReports, showToast }) {
  const [subTab, setSubTab] = useState("assemblee");
  return (
    <div>
      <SectionTitle sub="Rapports des séminaires et programmes, par assemblée ou pour la coordination nationale">Rapport</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setSubTab("assemblee")} style={segButtonStyle(subTab === "assemblee")}>Séminaires</button>
        <button onClick={() => setSubTab("activites")} style={segButtonStyle(subTab === "activites")}>Activités semaine</button>
        <button onClick={() => setSubTab("coordination")} style={segButtonStyle(subTab === "coordination")}>Coordination</button>
      </div>

      {subTab === "activites" ? (
        <RapportActivites
          regions={regions} activityReports={activityReports} financeReports={financeReports}
          saveActivity={saveActivity} deleteActivity={deleteActivity} showToast={showToast}
        />
      ) : subTab === "assemblee" ? (
        <RapportHebdo regions={regions} pastors={pastors} seminars={seminars} seminarReports={seminarReports} setSeminarReports={setSeminarReports} showToast={showToast} />
      ) : (
        <RapportCoordination
          coordSeminars={coordSeminars} pastors={pastors} deptHeads={deptHeads} leadership={leadership}
          unlocked={unlockedRespDept} onUnlock={onUnlockRespDept} onLock={onLockRespDept}
          seminarReports={seminarReports} setSeminarReports={setSeminarReports} showToast={showToast}
        />
      )}
    </div>
  );
}

function Seminaires({ seminars, setSeminars, pastors, regions, coordSeminars, setCoordSeminars, leadership, coordUnlocked, onUnlockCoord, onLockCoord, showToast }) {
  const [editing, setEditing] = useState(null);
  const [filterAssemblee, setFilterAssemblee] = useState("");
  const [filterType, setFilterType] = useState("");
  const [mode, setMode] = useState("liste"); // "liste" | "programme" | "coordination"

  function handleSave(s) {
    const exists = seminars.some(x => x.id === s.id);
    const next = exists ? seminars.map(x => x.id === s.id ? s : x) : [...seminars, s];
    setSeminars(next);
    setEditing(null);
    showToast(exists ? "Programme mis à jour" : "Programme ajouté");
  }
  function handleDelete(id) {
    setSeminars(seminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Programme supprimé");
  }

  const sorted = [...seminars]
    .filter(s => !filterAssemblee || s.assemblee === filterAssemblee)
    .filter(s => !filterType || (s.type || "Séminaire") === filterType)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  return (
    <div>
      <SectionTitle sub="Formations, prières, communions et retraites, classés par date">Séminaires</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setMode("liste")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
          background: mode === "liste" ? "var(--primary)" : "transparent",
          color: mode === "liste" ? "#fff" : "var(--ink-soft)"
        }}>Liste complète</button>
        <button onClick={() => setMode("programme")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
          background: mode === "programme" ? "var(--primary)" : "transparent",
          color: mode === "programme" ? "#fff" : "var(--ink-soft)"
        }}>Par assemblée</button>
        <button onClick={() => setMode("coordination")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
          background: mode === "coordination" ? "var(--primary)" : "transparent",
          color: mode === "coordination" ? "#fff" : "var(--ink-soft)"
        }}>Coordination nat.</button>
      </div>

      {mode === "liste" && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto", paddingBottom: 2 }}>
            <button onClick={() => setFilterType("")} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
              background: !filterType ? "var(--primary)" : "#fff", color: !filterType ? "#fff" : "var(--ink-soft)",
              border: "1px solid var(--border)"
            }}>Tous les types</button>
            {TYPES_PROGRAMME.map(t => (
              <button key={t} onClick={() => setFilterType(t)} style={{
                padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
                background: filterType === t ? TYPE_TONES[t] : "#fff", color: filterType === t ? "#fff" : "var(--ink-soft)",
                border: "1px solid var(--border)"
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <AssembleeSelect regions={regions} value={filterAssemblee} onChange={setFilterAssemblee} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
            <button onClick={() => setEditing({ assemblee: filterAssemblee, type: filterType || "Séminaire" })} style={{
              background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
              display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
            }}>
              <Plus size={16} /> Ajouter
            </button>
          </div>

          {sorted.length === 0 ? (
            <EmptyState icon={CalendarDays} text="Aucun programme pour l'instant. Ajoutez le premier." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {sorted.map(s => <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => setEditing(s)} />)}
            </div>
          )}
        </>
      )}

      {mode === "programme" && (
        <ProgrammeParAssemblee seminars={seminars} pastors={pastors} regions={regions} setEditing={setEditing} />
      )}

      {mode === "coordination" && (
        <div>
          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4 }}>
            Séminaires programmés par la coordination nationale (visibles ici et dans l'onglet Coordination).
          </div>
          <CoordLockPanel leadership={leadership} unlocked={coordUnlocked} onUnlock={onUnlockCoord} onLock={onLockCoord} />
          <CoordSeminaires coordSeminars={coordSeminars} setCoordSeminars={setCoordSeminars} pastors={pastors} unlocked={coordUnlocked} showToast={showToast} />
        </div>
      )}

      {editing && (
        <SeminarForm
          seminar={editing} pastors={pastors} regions={regions}
          onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)}
        />
      )}
    </div>
  );
}

function ProgrammeParAssemblee({ seminars, pastors, regions, setEditing }) {
  const [assemblee, setAssemblee] = useState("");
  const [periode, setPeriode] = useState("mois"); // "mois" | "annee"
  const now = new Date();
  const [mois, setMois] = useState(`${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`);
  const [annee, setAnnee] = useState(String(now.getFullYear()));

  const filtered = seminars
    .filter(s => s.assemblee === assemblee)
    .filter(s => periode === "mois" ? (s.date || "").slice(0, 7) === mois : (s.date || "").slice(0, 4) === annee)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  const moisLabel = mois ? new Date(mois + "-01T00:00:00").toLocaleDateString("fr-FR", { month: "long", year: "numeric" }) : "";

  return (
    <div>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>

      {assemblee && (
        <>
          <div style={{ display: "flex", gap: 6, marginBottom: 12, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
            <button onClick={() => setPeriode("mois")} style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              background: periode === "mois" ? "var(--accent-dark)" : "transparent",
              color: periode === "mois" ? "#fff" : "var(--ink-soft)"
            }}>Programme du mois</button>
            <button onClick={() => setPeriode("annee")} style={{
              flex: 1, padding: "7px 0", borderRadius: 8, fontSize: 12.5, fontWeight: 700,
              background: periode === "annee" ? "var(--accent-dark)" : "transparent",
              color: periode === "annee" ? "#fff" : "var(--ink-soft)"
            }}>Programme de l'année</button>
          </div>

          <div style={{ display: "flex", gap: 10, marginBottom: 14 }}>
            {periode === "mois" ? (
              <input type="month" style={inputStyle} value={mois} onChange={e => setMois(e.target.value)} />
            ) : (
              <input type="number" style={inputStyle} value={annee} onChange={e => setAnnee(e.target.value)} placeholder="Année" />
            )}
          </div>

          <div style={{
            display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff",
            border: "1px solid var(--border)", borderRadius: 12, padding: "12px 14px", marginBottom: 14
          }}>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary)" }}>{assemblee}</div>
              <div style={{ fontSize: 11.5, color: "var(--ink-soft)", textTransform: "capitalize" }}>
                {periode === "mois" ? moisLabel : `Année ${annee}`} · {filtered.length} séminaire{filtered.length > 1 ? "s" : ""}
              </div>
            </div>
            <button onClick={() => setEditing({ assemblee, date: periode === "mois" ? `${mois}-01` : `${annee}-01-01` })} style={{
              background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600
            }}>
              <Plus size={14} /> Ajouter au programme
            </button>
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={CalendarDays} text={`Aucun séminaire dans le programme ${periode === "mois" ? "de ce mois" : "de cette année"} pour ${assemblee}.`} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {filtered.map(s => <SeminarCard key={s.id} s={s} pastors={pastors} onClick={() => setEditing(s)} />)}
            </div>
          )}
        </>
      )}
    </div>
  );
}

function SeminarForm({ seminar, pastors, regions, onSave, onDelete, onClose }) {
  const isNew = !seminar.id;
  const [type, setType] = useState(seminar.type || "Séminaire");
  const [groupe, setGroupe] = useState(seminar.groupe || "");
  const [theme, setTheme] = useState(seminar.theme || "");
  const [date, setDate] = useState(seminar.date || "");
  const [dateFin, setDateFin] = useState(seminar.dateFin || "");
  const [heure, setHeure] = useState(seminar.heure || "");
  const [assemblee, setAssemblee] = useState(seminar.assemblee || "");
  const [lieu, setLieu] = useState(seminar.lieu || "");
  const [positionGps, setPositionGps] = useState(seminar.positionGps || null);
  const [personneRessourceNom, setPersonneRessourceNom] = useState(seminar.personneRessourceNom || "");
  const [personneRessourceContact, setPersonneRessourceContact] = useState(seminar.personneRessourceContact || "");
  const [budget, setBudget] = useState(seminar.budget || {});
  const [predicateurs, setPredicateurs] = useState(seminar.predicateurs || []);
  const [formateurs, setFormateurs] = useState(seminar.formateurs || []);
  const [nombreJours, setNombreJours] = useState(seminar.nombreJours || "");
  const [dirigeantPriere, setDirigeantPriere] = useState(seminar.dirigeantPriere || "");
  const [dirigeantChants, setDirigeantChants] = useState(seminar.dirigeantChants || "");
  const [sujetsPriereImage, setSujetsPriereImage] = useState(seminar.sujetsPriereImage || null);
  const [mc, setMc] = useState(seminar.mc || "");
  const [predicateurJour, setPredicateurJour] = useState(seminar.predicateurJour || "");
  const [choraleGroupeMusical, setChoraleGroupeMusical] = useState(seminar.choraleGroupeMusical || "");
  const [priereOuverture, setPriereOuverture] = useState(seminar.priereOuverture || "");
  const [themePredicationJour, setThemePredicationJour] = useState(seminar.themePredicationJour || "");
  const [temoignagesCommunion, setTemoignagesCommunion] = useState(seminar.temoignagesCommunion || "");
  const [diversCommunion, setDiversCommunion] = useState(seminar.diversCommunion || "");
  const [programmeRetraite, setProgrammeRetraite] = useState(seminar.programmeRetraite || "");
  const [notes, setNotes] = useState(seminar.notes || "");
  const [search, setSearch] = useState("");

  function togglePred(id) {
    setPredicateurs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }

  const filteredPastors = pastors.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  function handleSubmit() {
    if (!theme.trim() || !date) { alert("Merci de renseigner au moins le thème/sujet et la date de début."); return; }
    onSave({
      id: seminar.id || uid(), type, groupe: type === "Retraite" ? groupe : "",
      theme: theme.trim(), date, dateFin: dateFin || "", heure, assemblee, predicateurs, notes,
      programmeRetraite: type === "Retraite" ? programmeRetraite.trim() : "",
      formateurs: type === "Formation" ? formateurs : [],
      nombreJours: type === "Formation" ? nombreJours : "",
      dirigeantPriere: type === "Prière" ? dirigeantPriere.trim() : "",
      dirigeantChants: type === "Prière" ? dirigeantChants.trim() : "",
      sujetsPriereImage: type === "Prière" ? sujetsPriereImage : null,
      mc: type === "Communion" ? mc.trim() : "",
      predicateurJour: type === "Communion" ? predicateurJour.trim() : "",
      choraleGroupeMusical: type === "Communion" ? choraleGroupeMusical.trim() : "",
      priereOuverture: type === "Communion" ? priereOuverture.trim() : "",
      themePredicationJour: type === "Communion" ? themePredicationJour.trim() : "",
      temoignagesCommunion: type === "Communion" ? temoignagesCommunion.trim() : "",
      diversCommunion: type === "Communion" ? diversCommunion.trim() : "",
      lieu: lieu.trim(), positionGps,
      personneRessourceNom: personneRessourceNom.trim(), personneRessourceContact: personneRessourceContact.trim(),
      budget, validationStatut: seminar.validationStatut || "attente", validationCommentaire: seminar.validationCommentaire || "",
    });
  }

  return (
    <ModalShell title={isNew ? "Nouveau programme" : "Modifier le programme"} onClose={onClose}>
      <Field label="Type de programme">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TYPES_PROGRAMME_ASSEMBLEE.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: type === t ? TYPE_TONES[t] : "#fff", color: type === t ? "#fff" : "var(--ink-soft)",
              border: "1px solid var(--border)"
            }}>{t}</button>
          ))}
        </div>
      </Field>
      {type === "Retraite" && (
        <>
          <Field label="Groupe d'action concerné">
            <select style={inputStyle} value={groupe} onChange={e => setGroupe(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {GROUPES_ACTION.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Programme du jour, par heure (la retraite dure souvent 3 à 7 jours)">
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: "vertical", fontSize: 13.5 }}
              value={programmeRetraite} onChange={e => setProgrammeRetraite(e.target.value)}
              placeholder={"Ex :\nJour 1\n06h00 : Réveil et prière\n08h00 : Petit-déjeuner\n09h00 : Enseignement\n...\n\nJour 2\n..."}
            />
          </Field>
        </>
      )}
      {type === "Formation" && (
        <>
          <Field label="Nombre de jours de la formation">
            <input
              type="number" inputMode="numeric" style={inputStyle} min="1"
              value={nombreJours} onChange={e => setNombreJours(e.target.value)}
              placeholder="Ex : 3"
            />
          </Field>
          <Field label={`Formateurs (${formateurs.length})`}>
            <PastorMultiSelect pastors={pastors} selected={formateurs} onChange={setFormateurs} />
          </Field>
        </>
      )}
      {type === "Prière" && (
        <PriereFields
          dirigeantPriere={dirigeantPriere} setDirigeantPriere={setDirigeantPriere}
          dirigeantChants={dirigeantChants} setDirigeantChants={setDirigeantChants}
          sujetsPriereImage={sujetsPriereImage} setSujetsPriereImage={setSujetsPriereImage}
        />
      )}
      {type === "Communion" && (
        <CommunionFields
          mc={mc} setMc={setMc}
          predicateurJour={predicateurJour} setPredicateurJour={setPredicateurJour}
          choraleGroupeMusical={choraleGroupeMusical} setChoraleGroupeMusical={setChoraleGroupeMusical}
          priereOuverture={priereOuverture} setPriereOuverture={setPriereOuverture}
          themePredicationJour={themePredicationJour} setThemePredicationJour={setThemePredicationJour}
          temoignagesCommunion={temoignagesCommunion} setTemoignagesCommunion={setTemoignagesCommunion}
          diversCommunion={diversCommunion} setDiversCommunion={setDiversCommunion}
        />
      )}
      <Field label={type === "Prière" ? "Sujet de prière (si non envoyé par le bureau Afrique)" : "Thème / Sujet"}>
        <input
          style={inputStyle} value={theme} onChange={e => setTheme(e.target.value)}
          placeholder={type === "Prière" ? "Écrire ici le ou les sujets de prière…" : "Ex : La sanctification pratique"}
        />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Date de début"><input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Date de fin (facultatif)"><input type="date" style={inputStyle} value={dateFin} min={date || undefined} onChange={e => setDateFin(e.target.value)} /></Field></div>
      </div>
      <Field label="Heure"><input type="time" style={inputStyle} value={heure} onChange={e => setHeure(e.target.value)} /></Field>
      <Field label="Assemblée organisatrice">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>
      <Field label="Lieu exact"><input style={inputStyle} value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Ex : Chapelle centrale, secteur 15" /></Field>
      <Field label="Position GPS (facultatif)">
        <GpsCapture position={positionGps} onChange={setPositionGps} />
      </Field>

      <Field label="Personne ressource sur place">
        <div style={{ display: "flex", gap: 8 }}>
          <input style={inputStyle} value={personneRessourceNom} onChange={e => setPersonneRessourceNom(e.target.value)} placeholder="Nom" />
          <input style={inputStyle} value={personneRessourceContact} onChange={e => setPersonneRessourceContact(e.target.value)} placeholder="Contact" />
        </div>
      </Field>

      <Field label="Budget prévisionnel (FCFA)">
        <BudgetFieldsEditor budget={budget} onChange={setBudget} />
      </Field>

      <Field label={`Prédicateurs affectés (${predicateurs.length}) — 2 à 3 recommandés`}>
        <div style={{ position: "relative", marginBottom: 7 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--ink-soft)" }} />
          <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un pasteur…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ maxHeight: 170, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 9 }}>
          {filteredPastors.length === 0 && <div style={{ padding: 12, fontSize: 12.5, color: "var(--ink-soft)" }}>Aucun résultat.</div>}
          {filteredPastors.map(p => {
            const checked = predicateurs.includes(p.id);
            return (
              <div key={p.id} onClick={() => togglePred(p.id)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 11px",
                borderBottom: "1px solid var(--border)", background: checked ? "var(--accent-soft)" : "#fff"
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? "var(--accent-dark)" : "var(--border)"}`,
                  background: checked ? "var(--accent-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {checked && <Check size={12} color="#fff" />}
                </div>
                <div style={{ fontSize: 13.5 }}>
                  <div style={{ fontWeight: 600 }}>{p.nom}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.fonction}{p.assemblee ? ` · ${p.assemblee}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Field>

      <Field label="Notes (facultatif)"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} /></Field>

      <div style={{ display: "flex", gap: 10, marginTop: 6 }}>
        <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      </div>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce séminaire ?")) onDelete(seminar.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce séminaire
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  RÉPERTOIRE (Pasteurs & prédicateurs / Régions & assemblées)        */
/* ------------------------------------------------------------------ */

function Repertoire({ pastors, setPastors, regions, setRegions, missionaries, setMissionaries, showToast }) {
  const [subTab, setSubTab] = useState("pasteurs");

  return (
    <div>
      <SectionTitle sub="Pasteurs, prédicateurs, régions, assemblées et missionnaires">Répertoire</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)", flexWrap: "wrap" }}>
        <button onClick={() => setSubTab("pasteurs")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: subTab === "pasteurs" ? "var(--primary)" : "transparent",
          color: subTab === "pasteurs" ? "#fff" : "var(--ink-soft)"
        }}>Pasteurs</button>
        <button onClick={() => setSubTab("regions")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: subTab === "regions" ? "var(--primary)" : "transparent",
          color: subTab === "regions" ? "#fff" : "var(--ink-soft)"
        }}>Régions &amp; assemblées</button>
        <button onClick={() => setSubTab("missionnaires")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: subTab === "missionnaires" ? "var(--primary)" : "transparent",
          color: subTab === "missionnaires" ? "#fff" : "var(--ink-soft)"
        }}>Missionnaires Afrique</button>
      </div>

      {subTab === "pasteurs" && (
        <PasteursList pastors={pastors} setPastors={setPastors} regions={regions} showToast={showToast} />
      )}
      {subTab === "regions" && (
        <RegionsView regions={regions} setRegions={setRegions} showToast={showToast} />
      )}
      {subTab === "missionnaires" && (
        <MissionnairesAfrique missionaries={missionaries} setMissionaries={setMissionaries} showToast={showToast} />
      )}
    </div>
  );
}

function PasteursList({ pastors, setPastors, regions, showToast }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");
  const [filterAssemblee, setFilterAssemblee] = useState("");
  const [filterFonction, setFilterFonction] = useState("");

  const filtered = pastors.filter(p =>
    p.nom.toLowerCase().includes(search.toLowerCase()) &&
    (!filterAssemblee || p.assemblee === filterAssemblee) &&
    (!filterFonction || p.fonction === filterFonction)
  );

  function handleSave(p) {
    const exists = pastors.some(x => x.id === p.id);
    const next = exists ? pastors.map(x => x.id === p.id ? p : x) : [...pastors, p];
    setPastors(next);
    setEditing(null);
    showToast(exists ? "Fiche mise à jour" : "Pasteur ajouté au répertoire");
  }
  function handleDelete(id) {
    setPastors(pastors.filter(x => x.id !== id));
    setEditing(null);
    showToast("Fiche supprimée");
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 8 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 12.5, color: "var(--ink-soft)" }} />
        <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un nom…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 8, overflowX: "auto", paddingBottom: 2 }}>
        <button onClick={() => setFilterFonction("")} style={{
          padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
          background: !filterFonction ? "var(--primary)" : "#fff", color: !filterFonction ? "#fff" : "var(--ink-soft)",
          border: "1px solid var(--border)"
        }}>Toutes ({pastors.length})</button>
        {FONCTIONS.map(f => {
          const count = pastors.filter(p => p.fonction === f).length;
          return (
            <button key={f} onClick={() => setFilterFonction(f)} style={{
              padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
              background: filterFonction === f ? "var(--primary)" : "#fff", color: filterFonction === f ? "#fff" : "var(--ink-soft)",
              border: "1px solid var(--border)"
            }}>{f} ({count})</button>
          );
        })}
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <AssembleeSelect regions={regions} value={filterAssemblee} onChange={setFilterAssemblee} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
        <button onClick={() => setEditing({})} style={{
          background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
          display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
        }}>
          <Plus size={16} /> Ajouter
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Users} text="Aucun pasteur ne correspond à la recherche." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(p => (
            <div key={p.id} onClick={() => setEditing(p)} style={{
              background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "11px 13px",
              display: "flex", alignItems: "center", gap: 11, cursor: "pointer"
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-dark)",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0,
                overflow: "hidden"
              }}>
                {p.photo ? (
                  <img src={p.photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                ) : (
                  p.nom.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{p.nom}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                  {p.fonction}{p.assemblee ? ` · ${p.assemblee}` : " · Assemblée non précisée"}
                </div>
              </div>
              {p.telephone ? (
                <a href={`tel:${p.telephone}`} onClick={e => e.stopPropagation()} style={{
                  display: "flex", alignItems: "center", gap: 4, color: "var(--primary)", fontSize: 12.5, fontWeight: 600
                }}>
                  <Phone size={13} />
                </a>
              ) : (
                <span style={{ fontSize: 10.5, color: "var(--danger)" }}>N° manquant</span>
              )}
              <button
                onClick={e => { e.stopPropagation(); if (confirm(`Supprimer ${p.nom} du répertoire ?`)) handleDelete(p.id); }}
                style={{ padding: 5, display: "flex", flexShrink: 0 }}
              >
                <Trash2 size={14} color="var(--danger)" />
              </button>
            </div>
          ))}
        </div>
      )}

      {editing && (
        <PastorForm pastor={editing} regions={regions} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function PastorForm({ pastor, regions, onSave, onDelete, onClose }) {
  const isNew = !pastor.id;
  const [nom, setNom] = useState(pastor.nom || "");
  const [telephone, setTelephone] = useState(pastor.telephone || "");
  const [assemblee, setAssemblee] = useState(pastor.assemblee || "");
  const [fonction, setFonction] = useState(pastor.fonction || "Pasteur");
  const [departementCoord, setDepartementCoord] = useState(pastor.departementCoord || "");
  const [photo, setPhoto] = useState(pastor.photo || null);
  const [uploading, setUploading] = useState(false);

  async function handlePhotoChange(e) {
    const file = e.target.files && e.target.files[0];
    if (!file) return;
    setUploading(true);
    try {
      const dataUrl = await compressImage(file, 360, 0.55);
      setPhoto(dataUrl);
    } catch (err) { console.error("Erreur photo", err); }
    setUploading(false);
    e.target.value = "";
  }

  function handleSubmit() {
    if (!nom.trim()) { alert("Merci de renseigner le nom."); return; }
    if (!photo) { alert("Merci d'ajouter une photo (prise directement ou depuis la galerie) — elle est obligatoire pour chaque enregistrement."); return; }
    onSave({ id: pastor.id || uid(), nom: nom.trim(), telephone: telephone.trim(), assemblee, fonction, departementCoord, photo });
  }

  return (
    <ModalShell title={isNew ? "Nouvelle fiche" : "Modifier la fiche"} onClose={onClose}>
      <Field label="Photo (obligatoire)">
        <div style={{ display: "flex", alignItems: "center", gap: 14 }}>
          <div style={{
            width: 72, height: 72, borderRadius: "50%", overflow: "hidden", flexShrink: 0,
            background: "var(--accent-soft)", display: "flex", alignItems: "center", justifyContent: "center",
            border: "1px solid var(--border)"
          }}>
            {photo ? (
              <img src={photo} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
            ) : (
              <Camera size={26} color="var(--accent-dark)" />
            )}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
            <label style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "#fff",
              background: "var(--primary)", padding: "8px 12px", borderRadius: 8, cursor: "pointer"
            }}>
              <Camera size={14} /> {uploading ? "Chargement…" : "Prendre une photo"}
              <input type="file" accept="image/*" capture="user" onChange={handlePhotoChange} style={{ display: "none" }} disabled={uploading} />
            </label>
            <label style={{
              display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 600, color: "var(--primary)",
              background: "var(--accent-soft)", padding: "8px 12px", borderRadius: 8, cursor: "pointer"
            }}>
              <ImageIcon size={14} /> Choisir dans la galerie
              <input type="file" accept="image/*" onChange={handlePhotoChange} style={{ display: "none" }} disabled={uploading} />
            </label>
          </div>
        </div>
      </Field>
      <Field label="Nom complet"><input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Pierre Ekon" /></Field>
      <Field label="Numéro de téléphone"><input style={inputStyle} value={telephone} onChange={e => setTelephone(e.target.value)} placeholder="Ex : 70 00 00 00" /></Field>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>
      <Field label="Fonction">
        <select style={inputStyle} value={fonction} onChange={e => setFonction(e.target.value)}>
          {FONCTIONS.map(f => <option key={f} value={f}>{f}</option>)}
        </select>
      </Field>
      <Field label="Département de la coordination (facultatif)">
        <select style={inputStyle} value={departementCoord} onChange={e => setDepartementCoord(e.target.value)}>
          <option value="">— Aucun —</option>
          {DEPARTEMENTS_COORD.map(d => <option key={d} value={d}>{d}</option>)}
        </select>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 5 }}>Permet d'inviter tout un département à une réunion d'un seul geste.</div>
      </Field>
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette fiche ?")) onDelete(pastor.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer cette fiche
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  MISSIONNAIRES EN AFRIQUE                                           */
/* ------------------------------------------------------------------ */

const MISSIONARY_STATUTS = ["Actif", "En préparation", "En congé"];

function MissionnairesAfrique({ missionaries, setMissionaries, showToast }) {
  const [editing, setEditing] = useState(null);
  const [search, setSearch] = useState("");

  const filtered = missionaries.filter(m => m.nom.toLowerCase().includes(search.toLowerCase()));

  function handleSave(m) {
    const exists = missionaries.some(x => x.id === m.id);
    const next = exists ? missionaries.map(x => x.id === m.id ? m : x) : [...missionaries, m];
    setMissionaries(next);
    setEditing(null);
    showToast(exists ? "Fiche mise à jour" : "Missionnaire ajouté");
  }
  function handleDelete(id) {
    setMissionaries(missionaries.filter(x => x.id !== id));
    setEditing(null);
    showToast("Fiche supprimée");
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 8 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 12.5, color: "var(--ink-soft)" }} />
        <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un missionnaire…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 14 }}>
        <button onClick={() => setEditing({})} style={{
          background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 14px",
          display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
        }}>
          <Plus size={15} /> Ajouter un missionnaire
        </button>
      </div>

      {filtered.length === 0 ? (
        <EmptyState icon={Globe} text="Aucun missionnaire enregistré pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {filtered.map(m => (
            <div key={m.id} onClick={() => setEditing(m)} style={{
              background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "12px 13px", cursor: "pointer"
            }}>
              <div style={{ display: "flex", alignItems: "center", gap: 11 }}>
                <div style={{
                  width: 38, height: 38, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-dark)",
                  display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0
                }}>
                  {m.nom.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 14, fontWeight: 700 }}>{m.nom}</div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "flex", alignItems: "center", gap: 4 }}>
                    <Globe size={11} /> {[m.ville, m.pays].filter(Boolean).join(", ") || "Localisation non précisée"}
                  </div>
                </div>
                <span style={{
                  fontSize: 10, fontWeight: 700, padding: "3px 8px", borderRadius: 999, whiteSpace: "nowrap",
                  color: m.statut === "Actif" ? "var(--primary)" : m.statut === "En congé" ? "var(--danger)" : "var(--accent-dark)",
                  background: m.statut === "Actif" ? "var(--accent-soft)" : m.statut === "En congé" ? "#F5E4E4" : "var(--accent-soft)"
                }}>{m.statut || "Actif"}</span>
              </div>
              {m.description && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 8, lineHeight: 1.4 }}>{m.description}</div>}
              {m.contact && (
                <a href={`tel:${m.contact}`} onClick={e => e.stopPropagation()} style={{ display: "inline-flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", fontWeight: 600, marginTop: 6 }}>
                  <Phone size={12} /> {m.contact}
                </a>
              )}
            </div>
          ))}
        </div>
      )}

      {editing && (
        <MissionaryForm missionary={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function MissionaryForm({ missionary, onSave, onDelete, onClose }) {
  const isNew = !missionary.id;
  const [nom, setNom] = useState(missionary.nom || "");
  const [pays, setPays] = useState(missionary.pays || "");
  const [ville, setVille] = useState(missionary.ville || "");
  const [contact, setContact] = useState(missionary.contact || "");
  const [statut, setStatut] = useState(missionary.statut || "Actif");
  const [description, setDescription] = useState(missionary.description || "");

  function handleSubmit() {
    if (!nom.trim()) { alert("Merci de renseigner le nom."); return; }
    onSave({ id: missionary.id || uid(), nom: nom.trim(), pays: pays.trim(), ville: ville.trim(), contact: contact.trim(), statut, description: description.trim() });
  }

  return (
    <ModalShell title={isNew ? "Nouveau missionnaire" : "Modifier la fiche"} onClose={onClose}>
      <Field label="Nom complet"><input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : David Compaoré" /></Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Pays"><input style={inputStyle} value={pays} onChange={e => setPays(e.target.value)} placeholder="Ex : Côte d'Ivoire" /></Field></div>
        <div style={{ flex: 1 }}><Field label="Ville"><input style={inputStyle} value={ville} onChange={e => setVille(e.target.value)} placeholder="Ex : Abidjan" /></Field></div>
      </div>
      <Field label="Contact (téléphone)"><input style={inputStyle} value={contact} onChange={e => setContact(e.target.value)} placeholder="Ex : 70 00 00 00" /></Field>
      <Field label="Statut">
        <select style={inputStyle} value={statut} onChange={e => setStatut(e.target.value)}>
          {MISSIONARY_STATUTS.map(s => <option key={s} value={s}>{s}</option>)}
        </select>
      </Field>
      <Field label="Description de la mission">
        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={description} onChange={e => setDescription(e.target.value)} placeholder="Ex : Implantation d'assemblées, formation de disciples…" />
      </Field>
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette fiche ?")) onDelete(missionary.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer cette fiche
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  RÉGIONS & ASSEMBLÉES                                               */
/* ------------------------------------------------------------------ */

function RegionsView({ regions, setRegions, showToast }) {
  const [editingAssembly, setEditingAssembly] = useState(null); // { regionId, assembly }
  const [addingRegion, setAddingRegion] = useState(false);
  const [newRegionName, setNewRegionName] = useState("");

  function saveAssembly(regionId, assembly) {
    const isNew = !assembly.id;
    const next = regions.map(r => {
      if (r.id !== regionId) return r;
      const exists = r.assemblees.some(a => a.id === assembly.id);
      const assemblees = exists ? r.assemblees.map(a => a.id === assembly.id ? assembly : a) : [...r.assemblees, { ...assembly, id: assembly.id || uid() }];
      return { ...r, assemblees };
    });
    setRegions(next);
    setEditingAssembly(null);
    showToast(isNew ? "Assemblée ajoutée" : "Assemblée mise à jour");
  }
  function deleteAssembly(regionId, assemblyId) {
    setRegions(regions.map(r => r.id === regionId ? { ...r, assemblees: r.assemblees.filter(a => a.id !== assemblyId) } : r));
    setEditingAssembly(null);
    showToast("Assemblée supprimée");
  }
  function addRegion() {
    if (!newRegionName.trim()) return;
    setRegions([...regions, { id: uid(), nom: newRegionName.trim(), assemblees: [] }]);
    setNewRegionName("");
    setAddingRegion(false);
    showToast("Région ajoutée");
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 16, lineHeight: 1.5 }}>
        Les 13 régions du Burkina Faso sont listées ci-dessous. Ajoutez, pour chaque région, les assemblées ouvertes ainsi que le nom et le contact du pasteur titulaire.
      </div>

      {regions.map(r => (
        <div key={r.id} style={{ marginBottom: 18 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 8 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
              <MapPin size={14} color="var(--accent-dark)" />
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{r.nom}</div>
              <span style={{ fontSize: 11, color: "var(--ink-soft)" }}>({r.assemblees.length})</span>
            </div>
            <button onClick={() => setEditingAssembly({ regionId: r.id, assembly: {} })} style={{
              display: "flex", alignItems: "center", gap: 4, fontSize: 12, color: "var(--primary)", fontWeight: 600
            }}>
              <Plus size={14} /> Assemblée
            </button>
          </div>

          {r.assemblees.length === 0 ? (
            <div style={{ fontSize: 12, color: "var(--ink-soft)", background: "#fff", border: "1px dashed var(--border)", borderRadius: 10, padding: "10px 12px" }}>
              Aucune assemblée renseignée pour cette région.
            </div>
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {r.assemblees.map(a => (
                <div key={a.id} onClick={() => setEditingAssembly({ regionId: r.id, assembly: a })} style={{
                  background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "10px 12px",
                  display: "flex", alignItems: "center", gap: 10, cursor: "pointer"
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{a.nom}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                      {a.pasteurTitulaire ? `Pasteur titulaire : ${a.pasteurTitulaire}` : "Pasteur titulaire non renseigné"}
                    </div>
                    {a.horaireHebdo && a.horaireHebdo.length > 0 && (
                      <div style={{ fontSize: 10.5, color: "var(--accent-dark)", fontWeight: 600, marginTop: 2, display: "flex", alignItems: "center", gap: 3 }}>
                        <Clock size={10} /> {a.horaireHebdo.length} créneau{a.horaireHebdo.length > 1 ? "x" : ""} hebdomadaire{a.horaireHebdo.length > 1 ? "s" : ""}
                      </div>
                    )}
                  </div>
                  {a.contact ? (
                    <a href={`tel:${a.contact}`} onClick={e => e.stopPropagation()} style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12 }}>
                      <Phone size={13} />
                    </a>
                  ) : (
                    <span style={{ fontSize: 10, color: "var(--danger)" }}>N° manquant</span>
                  )}
                  <button
                    onClick={e => { e.stopPropagation(); if (confirm(`Supprimer l'assemblée ${a.nom} ?`)) deleteAssembly(r.id, a.id); }}
                    style={{ padding: 5, display: "flex", flexShrink: 0 }}
                  >
                    <Trash2 size={14} color="var(--danger)" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      ))}

      {addingRegion ? (
        <div style={{ display: "flex", gap: 8, marginTop: 6 }}>
          <input style={inputStyle} placeholder="Nom de la région" value={newRegionName} onChange={e => setNewRegionName(e.target.value)} />
          <button onClick={addRegion} style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px", fontSize: 13, fontWeight: 600 }}>OK</button>
        </div>
      ) : (
        <button onClick={() => setAddingRegion(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--ink-soft)", fontWeight: 600, marginTop: 4 }}>
          <Plus size={13} /> Ajouter une région
        </button>
      )}

      {editingAssembly && (
        <AssemblyForm
          assembly={editingAssembly.assembly}
          onSave={a => saveAssembly(editingAssembly.regionId, a)}
          onDelete={id => deleteAssembly(editingAssembly.regionId, id)}
          onClose={() => setEditingAssembly(null)}
        />
      )}
    </div>
  );
}

const JOURS_SEMAINE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function AssemblyForm({ assembly, onSave, onDelete, onClose }) {
  const isNew = !assembly.id;
  const [nom, setNom] = useState(assembly.nom || "");
  const [pasteurTitulaire, setPasteurTitulaire] = useState(assembly.pasteurTitulaire || "");
  const [contact, setContact] = useState(assembly.contact || "");
  const [horaire, setHoraire] = useState(assembly.horaireHebdo || []);

  function addCreneau() {
    setHoraire([...horaire, { id: uid(), jour: "Dimanche", heure: "", titre: "", description: "" }]);
  }
  function updateCreneau(id, field, value) {
    setHoraire(horaire.map(c => c.id === id ? { ...c, [field]: value } : c));
  }
  function removeCreneau(id) {
    setHoraire(horaire.filter(c => c.id !== id));
  }

  function handleSubmit() {
    if (!nom.trim()) { alert("Merci de renseigner le nom de l'assemblée."); return; }
    onSave({ id: assembly.id || uid(), nom: nom.trim(), pasteurTitulaire: pasteurTitulaire.trim(), contact: contact.trim(), horaireHebdo: horaire });
  }

  return (
    <ModalShell title={isNew ? "Nouvelle assemblée" : "Modifier l'assemblée"} onClose={onClose}>
      <Field label="Nom de l'assemblée"><input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : PISSY" /></Field>
      <Field label="Pasteur titulaire"><input style={inputStyle} value={pasteurTitulaire} onChange={e => setPasteurTitulaire(e.target.value)} placeholder="Nom du pasteur titulaire" /></Field>
      <Field label="Contact du pasteur titulaire"><input style={inputStyle} value={contact} onChange={e => setContact(e.target.value)} placeholder="Ex : 70 00 00 00" /></Field>

      <Field label="Horaire hebdomadaire habituel">
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {horaire.map(c => (
            <div key={c.id} style={{ background: "var(--bg)", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
              <div style={{ display: "flex", gap: 8, marginBottom: 7 }}>
                <select style={{ ...inputStyle, fontSize: 12.5, flex: 1 }} value={c.jour} onChange={e => updateCreneau(c.id, "jour", e.target.value)}>
                  {JOURS_SEMAINE.map(j => <option key={j} value={j}>{j}</option>)}
                </select>
                <input style={{ ...inputStyle, fontSize: 12.5, flex: 1 }} value={c.heure} onChange={e => updateCreneau(c.id, "heure", e.target.value)} placeholder="Ex : 18h30 - 20h" />
                <button onClick={() => removeCreneau(c.id)} style={{ padding: "0 8px", color: "var(--danger)" }}><Trash2 size={14} /></button>
              </div>
              <input style={{ ...inputStyle, fontSize: 12.5, marginBottom: 6 }} value={c.titre} onChange={e => updateCreneau(c.id, "titre", e.target.value)} placeholder="Ex : Culte d'enseignement & Prière" />
              <input style={{ ...inputStyle, fontSize: 12.5 }} value={c.description} onChange={e => updateCreneau(c.id, "description", e.target.value)} placeholder="Description (facultatif)" />
            </div>
          ))}
          <button onClick={addCreneau} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 5, fontSize: 12.5, fontWeight: 600,
            color: "var(--primary)", border: "1.5px dashed var(--border)", borderRadius: 9, padding: "9px 0"
          }}>
            <Plus size={14} /> Ajouter un créneau
          </button>
        </div>
      </Field>

      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette assemblée ?")) onDelete(assembly.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer cette assemblée
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  MESSAGERIE                                                         */
/* ------------------------------------------------------------------ */

/* ------------------------------------------------------------------ */
/*  RÉUNIONS & ANNONCES (WhatsApp + visioconférence)                    */
/* ------------------------------------------------------------------ */

const ANNONCE_TYPES = ["Réunion", "Annonce", "Programme"];
const ANNONCE_MODES = [
  { value: "presentiel", label: "Sur place" },
  { value: "visio", label: "Visioconférence" },
  { value: "mixte", label: "Les deux" },
];

function telDigits(t) { return (t || "").replace(/\D/g, ""); }

function matchDept(text, dept) {
  const norm = (x) => (x || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toLowerCase();
  const key = norm(dept).split(" ")[0];
  return !!text && norm(text).includes(key);
}

// Tous les contacts de l'app, sans doublon de numéro.
function buildContacts(pastors, deptHeads, missionaries) {
  const out = [];
  const seen = {};
  const add = (c) => {
    const d = telDigits(c.tel).slice(-8);
    if (d && seen[d]) {
      const prev = seen[d];
      if (c.departement && !prev.departements.includes(c.departement)) prev.departements.push(c.departement);
      if (c.chef) prev.chef = true;
      if (!prev.assemblee && c.assemblee) prev.assemblee = c.assemblee;
      return;
    }
    const item = { ...c, departements: c.departement ? [c.departement] : [] };
    delete item.departement;
    out.push(item);
    if (d) seen[d] = item;
  };
  (deptHeads || []).forEach(h => add({
    key: "d-" + h.id, nom: h.nom, tel: h.contact, groupe: "Chef de département", chef: true,
    departement: DEPARTEMENTS_COORD.find(d => matchDept(h.departement, d)) || "",
  }));
  (pastors || []).forEach(p => add({
    key: "p-" + p.id, nom: p.nom, tel: p.telephone, groupe: p.fonction || "Pasteur",
    assemblee: p.assemblee || "", departement: p.departementCoord || "",
  }));
  (missionaries || []).forEach(m => add({ key: "m-" + m.id, nom: m.nom, tel: m.contact, groupe: "Missionnaire", assemblee: m.pays || "" }));
  return out;
}

function newVisioLink(titre) {
  const slug = (titre || "reunion").normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^A-Za-z0-9]+/g, "").slice(0, 24) || "Reunion";
  const rnd = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `https://meet.jit.si/MPV-${slug}-${rnd}`;
}

function annonceDateTexte(a) {
  if (!a.date) return "";
  return `${formatDateLong(a.date)}${a.heure ? ` à ${a.heure.replace(":", "h")}` : ""}`;
}

function annonceMessage(a, nom) {
  const L = [];
  const icone = a.type === "Réunion" ? "📢" : a.type === "Programme" ? "🗓️" : "📣";
  L.push(`${icone} *${(a.type || "Annonce").toUpperCase()}* — Mission Parole de Vie Burkina`, "");
  L.push(nom ? `Bonjour ${nom},` : "Bonjour à tous,", "");
  L.push(`*${a.titre}*`);
  if (a.date) L.push(`📅 ${annonceDateTexte(a)}`);
  if (a.duree) L.push(`⏱️ Durée prévue : ${a.duree}`);
  if (a.type === "Réunion" && a.mode !== "visio" && a.lieu) L.push(`📍 Lieu : ${a.lieu}`);
  if (a.type !== "Réunion" && a.lieu) L.push(`📍 Lieu : ${a.lieu}`);
  if (a.type === "Réunion" && a.mode !== "presentiel" && a.lienVisio) {
    L.push("", `💻 *Visioconférence* : ${a.lienVisio}`, "À l'heure de la réunion, touchez le lien pour rejoindre (sur téléphone, l'application Jitsi Meet peut être proposée).");
  }
  if (a.contenu) L.push("", a.type === "Réunion" ? "*Ordre du jour :*" : "", a.contenu);
  L.push("");
  if (a.organisateur) L.push(`Organisé par : ${a.organisateur}`);
  if (a.type === "Réunion") L.push("Merci de confirmer votre présence en répondant à ce message.");
  L.push("", "Département Mission et Formation");
  return L.filter((x, i, arr) => !(x === "" && arr[i - 1] === "")).join("\n");
}

function RecipientPicker({ contacts, regions, selected, onChange, invites, onInvites }) {
  const [q, setQ] = useState("");
  const [ajout, setAjout] = useState({ nom: "", tel: "" });
  const sel = new Set(selected);
  const toggle = (k) => { const n = new Set(sel); n.has(k) ? n.delete(k) : n.add(k); onChange([...n]); };
  const addGroup = (list) => { const n = new Set(sel); const allIn = list.every(c => n.has(c.key)); list.forEach(c => allIn ? n.delete(c.key) : n.add(c.key)); onChange([...n]); };

  const groupes = [...new Set(contacts.map(c => c.groupe))].filter(Boolean);
  const assemblees = flattenAssemblees(regions).filter(a => contacts.some(c => c.assemblee === a));
  const filtered = contacts.filter(c => !q || `${c.nom} ${c.groupe} ${c.assemblee} ${c.departements.join(" ")}`.toLowerCase().includes(q.toLowerCase()));

  const chip = (label, list, key) => {
    const allIn = list.length > 0 && list.every(c => sel.has(c.key));
    return (
      <button key={key || label} onClick={() => list.length && addGroup(list)} disabled={!list.length} style={{
        padding: "5px 10px", borderRadius: 99, fontSize: 11.5, fontWeight: 700, opacity: list.length ? 1 : .45,
        border: `1.5px solid ${allIn ? "var(--primary)" : "var(--border)"}`,
        background: allIn ? "var(--primary)" : "#fff", color: allIn ? "#fff" : "var(--ink-soft)"
      }}>{label} ({list.length})</button>
    );
  };

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 6 }}>Sélection rapide (toucher à nouveau pour retirer)</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {chip("Tout le monde", contacts, "all")}
        {chip("Chefs de département", contacts.filter(c => c.chef), "chefs")}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", marginBottom: 5 }}>Départements</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {DEPARTEMENTS_COORD.map(d => chip(d, contacts.filter(c => c.departements.includes(d)), "dep-" + d))}
      </div>
      <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", marginBottom: 5 }}>Fonctions</div>
      <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginBottom: 8 }}>
        {groupes.map(g => chip(g, contacts.filter(c => c.groupe === g), "g-" + g))}
      </div>
      {assemblees.length > 0 && (
        <select style={{ ...inputStyle, fontSize: 13, marginBottom: 10 }} value="" onChange={e => e.target.value && addGroup(contacts.filter(c => c.assemblee === e.target.value))}>
          <option value="">+ Ajouter toute une assemblée…</option>
          {assemblees.map(a => <option key={a} value={a}>{a} ({contacts.filter(c => c.assemblee === a).length})</option>)}
        </select>
      )}

      <div style={{ position: "relative", marginBottom: 8 }}>
        <Search size={15} color="var(--ink-soft)" style={{ position: "absolute", left: 11, top: "50%", transform: "translateY(-50%)" }} />
        <input style={{ ...inputStyle, paddingLeft: 34, fontSize: 13.5 }} value={q} onChange={e => setQ(e.target.value)} placeholder="Chercher un nom, une assemblée…" />
      </div>
      <div style={{ maxHeight: 260, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 11, background: "#fff" }}>
        {filtered.length === 0 ? (
          <div style={{ padding: 14, fontSize: 12.5, color: "var(--ink-soft)" }}>Aucun contact. Ajoutez des personnes dans le Répertoire ou ci-dessous.</div>
        ) : filtered.map(c => {
          const on = sel.has(c.key);
          return (
            <button key={c.key} onClick={() => toggle(c.key)} style={{ width: "100%", display: "flex", alignItems: "center", gap: 10, padding: "9px 11px", borderBottom: "1px solid var(--border)", textAlign: "left", background: on ? "#EEF1F8" : "#fff" }}>
              {on ? <CheckSquare size={18} color="var(--primary)" /> : <Square size={18} color="var(--ink-soft)" />}
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{c.nom}</div>
                <div style={{ fontSize: 11, color: "var(--ink-soft)", whiteSpace: "nowrap", overflow: "hidden", textOverflow: "ellipsis" }}>
                  {[c.groupe, c.assemblee, ...c.departements].filter(Boolean).join(" · ")}
                </div>
              </div>
              {!telDigits(c.tel) && <span style={{ fontSize: 10.5, color: "var(--danger)", fontWeight: 700 }}>Sans n°</span>}
            </button>
          );
        })}
      </div>

      <div style={{ marginTop: 10 }}>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 5 }}>Inviter une autre personne (hors répertoire)</div>
        <div style={{ display: "flex", gap: 6 }}>
          <input style={{ ...inputStyle, flex: 1.3, fontSize: 13 }} value={ajout.nom} onChange={e => setAjout({ ...ajout, nom: e.target.value })} placeholder="Nom" />
          <input style={{ ...inputStyle, flex: 1, fontSize: 13 }} inputMode="tel" value={ajout.tel} onChange={e => setAjout({ ...ajout, tel: e.target.value })} placeholder="Téléphone" />
          <button onClick={() => {
            if (!ajout.nom.trim() || !telDigits(ajout.tel)) return;
            onInvites([...(invites || []), { key: "x-" + uid(), nom: ajout.nom.trim(), tel: ajout.tel.trim(), groupe: "Invité", departements: [] }]);
            setAjout({ nom: "", tel: "" });
          }} aria-label="Ajouter" style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 12px" }}><UserPlus size={16} /></button>
        </div>
        {(invites || []).length > 0 && (
          <div style={{ display: "flex", gap: 6, flexWrap: "wrap", marginTop: 8 }}>
            {invites.map(i => (
              <span key={i.key} style={{ display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12, background: "var(--accent-soft)", color: "var(--accent-dark)", borderRadius: 99, padding: "4px 6px 4px 10px", fontWeight: 600 }}>
                {i.nom}
                <button onClick={() => onInvites(invites.filter(x => x.key !== i.key))} aria-label={`Retirer ${i.nom}`} style={{ display: "flex" }}><X size={13} color="var(--accent-dark)" /></button>
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function AnnonceForm({ entry, contacts, regions, seminars, coordSeminars, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [a, setA] = useState(() => ({
    type: entry.type || "Réunion", titre: entry.titre || "", date: entry.date || "", heure: entry.heure || "",
    duree: entry.duree || "", lieu: entry.lieu || "", mode: entry.mode || "visio",
    lienVisio: entry.lienVisio || "", contenu: entry.contenu || "", organisateur: entry.organisateur || "",
  }));
  const [destinataires, setDestinataires] = useState(() => (entry.destinataires || []).filter(d => !d.key.startsWith("x-")).map(d => d.key));
  const [invites, setInvites] = useState(() => (entry.destinataires || []).filter(d => d.key.startsWith("x-")));
  const [error, setError] = useState("");
  const set = (k, v) => { setA(p => ({ ...p, [k]: v })); setError(""); };
  const avecVisio = a.type === "Réunion" && a.mode !== "presentiel";

  useEffect(() => {
    if (avecVisio && !a.lienVisio) setA(p => ({ ...p, lienVisio: newVisioLink(p.titre) }));
  }, [avecVisio]);

  const programmes = [...(seminars || []), ...(coordSeminars || [])]
    .filter(s => { const d = daysUntil(s.date); return d === null || d >= -1; })
    .sort((x, y) => (x.date || "").localeCompare(y.date || ""));

  function reprendre(id) {
    const s = programmes.find(x => x.id === id);
    if (!s) return;
    setA(p => ({ ...p, titre: `${s.type || "Séminaire"} — ${s.theme || "sans thème"}${s.assemblee ? ` (${s.assemblee})` : ""}`, date: s.date || p.date, lieu: s.lieu || s.assemblee || p.lieu }));
  }

  function submit() {
    if (!a.titre.trim()) { setError("Indiquez le titre."); return; }
    if (!a.date) { setError("Indiquez la date."); return; }
    const list = [...contacts.filter(c => destinataires.includes(c.key)), ...invites]
      .map(c => ({ key: c.key, nom: c.nom, tel: c.tel || "", groupe: c.groupe || "" }));
    if (!list.length) { setError("Choisissez au moins une personne à prévenir."); return; }
    onSave({
      ...entry, id: entry.id || uid(), ...a, titre: a.titre.trim(), lieu: a.lieu.trim(), contenu: a.contenu.trim(),
      organisateur: a.organisateur.trim(), lienVisio: avecVisio ? a.lienVisio.trim() : "",
      destinataires: list, envois: entry.envois || {},
      creeLe: entry.creeLe || new Date().toISOString(), modifieLe: new Date().toISOString(),
    });
  }

  const nbSel = destinataires.length + invites.length;
  return (
    <ModalShell title={isNew ? "Nouvelle réunion ou annonce" : "Modifier"} onClose={onClose}>
      <Field label="Type"><ChipPicker options={ANNONCE_TYPES} value={a.type} onChange={v => set("type", v)} small /></Field>

      {a.type === "Programme" && programmes.length > 0 && (
        <Field label="Reprendre un programme déjà enregistré (facultatif)">
          <select style={inputStyle} value="" onChange={e => reprendre(e.target.value)}>
            <option value="">— Choisir un séminaire ou programme —</option>
            {programmes.map(s => <option key={s.id} value={s.id}>{s.date ? formatDateLong(s.date) + " · " : ""}{s.type || "Séminaire"} — {s.theme || "sans thème"}{s.assemblee ? ` (${s.assemblee})` : ""}</option>)}
          </select>
        </Field>
      )}

      <Field label="Titre"><input style={inputStyle} value={a.titre} onChange={e => set("titre", e.target.value)} placeholder={a.type === "Réunion" ? "Ex. Réunion des chefs de département" : "Ex. Convention nationale 2027"} /></Field>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1.4 }}><Field label="Date"><input type="date" style={inputStyle} value={a.date} onChange={e => set("date", e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Heure"><input type="time" style={inputStyle} value={a.heure} onChange={e => set("heure", e.target.value)} /></Field></div>
      </div>

      {a.type === "Réunion" && (
        <>
          <Field label="Comment se tient la réunion ?"><ChipPicker options={ANNONCE_MODES} value={a.mode} onChange={v => set("mode", v)} small /></Field>
          <Field label="Durée prévue (facultatif)"><input style={inputStyle} value={a.duree} onChange={e => set("duree", e.target.value)} placeholder="Ex. 1 h 30" /></Field>
        </>
      )}
      {(a.type !== "Réunion" || a.mode !== "visio") && (
        <Field label="Lieu"><input style={inputStyle} value={a.lieu} onChange={e => set("lieu", e.target.value)} placeholder="Ex. Temple de Pissy, Ouagadougou" /></Field>
      )}

      {avecVisio && (
        <div style={{ background: "#EEF1F8", borderRadius: 11, padding: "11px 12px", marginBottom: 13 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12.5, fontWeight: 700, color: "var(--primary)", marginBottom: 7 }}>
            <Video size={14} /> Lien de la visioconférence
          </div>
          <input style={{ ...inputStyle, fontSize: 13 }} value={a.lienVisio} onChange={e => set("lienVisio", e.target.value)} />
          <div style={{ display: "flex", gap: 8, marginTop: 7, alignItems: "center", flexWrap: "wrap" }}>
            <button onClick={() => set("lienVisio", newVisioLink(a.titre))} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
              <RefreshCw size={13} /> Nouveau lien
            </button>
            <span style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.4 }}>
              Salle Jitsi Meet gratuite créée pour cette réunion. Vous pouvez aussi coller un lien Google Meet ou Zoom.
            </span>
          </div>
        </div>
      )}

      <Field label={a.type === "Réunion" ? "Ordre du jour" : "Message"}>
        <textarea style={{ ...inputStyle, minHeight: 90, resize: "vertical" }} value={a.contenu} onChange={e => set("contenu", e.target.value)} placeholder={a.type === "Réunion" ? "1. Prière d'ouverture\n2. Bilan du trimestre\n3. Divers" : "Les détails à communiquer"} />
      </Field>
      <Field label="Organisé par"><input style={inputStyle} value={a.organisateur} onChange={e => set("organisateur", e.target.value)} placeholder="Ex. Chef du département Mission et Formation" /></Field>

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 13, marginTop: 4, marginBottom: 12 }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", marginBottom: 8 }}>
          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>Qui prévenir ?</div>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: nbSel ? "#1F7A5C" : "var(--ink-soft)" }}>{nbSel} personne{nbSel > 1 ? "s" : ""}</div>
        </div>
        <RecipientPicker contacts={contacts} regions={regions} selected={destinataires} onChange={setDestinataires} invites={invites} onInvites={setInvites} />
      </div>

      {error && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton full icon={Check} onClick={submit}>{isNew ? "Enregistrer et passer à l'envoi" : "Enregistrer"}</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette réunion ou annonce ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}><Trash2 size={14} /> Supprimer</button>
      )}
    </ModalShell>
  );
}

function AnnonceEnvoi({ annonce, onMarkSent, onEdit, onClose, showToast }) {
  const envois = annonce.envois || {};
  const avecTel = annonce.destinataires.filter(d => telDigits(d.tel));
  const sansTel = annonce.destinataires.filter(d => !telDigits(d.tel));
  const restants = avecTel.filter(d => !envois[d.key]);
  const suivant = restants[0];
  const faits = avecTel.length - restants.length;
  const pct = avecTel.length ? Math.round(faits / avecTel.length * 100) : 0;
  const visio = annonce.type === "Réunion" && annonce.mode !== "presentiel" && annonce.lienVisio;

  async function copier(txt) {
    try { await navigator.clipboard.writeText(txt); showToast("Message copié"); } catch (e) { showToast("Copie impossible"); }
  }

  return (
    <ModalShell title="Prévenir par WhatsApp" onClose={onClose}>
      <div style={{ background: "#F4F5EE", borderRadius: 11, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{annonce.titre}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{annonceDateTexte(annonce)}{visio ? " · Visioconférence" : ""}</div>
      </div>

      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, fontWeight: 700, marginBottom: 5 }}>
        <span>{faits} / {avecTel.length} prévenus</span>
        <span style={{ color: pct === 100 ? "#1F7A5C" : "var(--ink-soft)" }}>{pct === 100 ? "Tout le monde est prévenu" : `${restants.length} restant${restants.length > 1 ? "s" : ""}`}</span>
      </div>
      <div style={{ height: 8, background: "var(--border)", borderRadius: 99, overflow: "hidden", marginBottom: 14 }}>
        <div style={{ width: `${pct}%`, height: "100%", background: "#25D366", transition: "width .3s" }} />
      </div>

      {suivant ? (
        <a href={whatsappLink(suivant.tel, annonceMessage(annonce, suivant.nom))} target="_blank" rel="noopener noreferrer"
          onClick={() => onMarkSent(suivant.key)} style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 8, background: "#25D366", color: "#fff",
            borderRadius: 12, padding: "14px 10px", fontSize: 15, fontWeight: 800, textDecoration: "none", marginBottom: 6, textAlign: "center"
          }}>
          <Send size={18} /> Envoyer à {suivant.nom}
        </a>
      ) : avecTel.length > 0 && (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#E3F1EA", color: "#1F7A5C", borderRadius: 12, padding: "12px", fontWeight: 700, marginBottom: 6 }}>
          <CheckCircle2 size={17} /> Toutes les personnes ont été prévenues
        </div>
      )}
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", textAlign: "center", marginBottom: 14, lineHeight: 1.45 }}>
        Le message personnalisé s'ouvre dans WhatsApp : appuyez sur Envoyer, puis revenez dans l'app pour la personne suivante.
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 16 }}>
        <a href={shareWhatsappLink(annonceMessage(annonce, ""))} target="_blank" rel="noopener noreferrer" style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, border: "1.5px solid #25D366", color: "#1A9E4B",
          borderRadius: 10, padding: "9px 4px", fontSize: 12, fontWeight: 700, textDecoration: "none", textAlign: "center"
        }}><Users size={14} /> Dans un groupe WhatsApp</a>
        <button onClick={() => copier(annonceMessage(annonce, ""))} style={{
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, border: "1.5px solid var(--border)", color: "var(--ink)",
          borderRadius: 10, padding: "9px 4px", fontSize: 12, fontWeight: 700
        }}><Copy size={14} /> Copier le message</button>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 7 }}>Destinataires</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 12 }}>
        {avecTel.map(d => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 9, border: "1px solid var(--border)", borderRadius: 10, padding: "8px 10px", background: envois[d.key] ? "#F3FAF6" : "#fff" }}>
            {envois[d.key] ? <CheckCircle2 size={16} color="#1F7A5C" /> : <Clock size={16} color="var(--ink-soft)" />}
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: 13, fontWeight: 700 }}>{d.nom}</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{d.groupe}{envois[d.key] ? ` · prévenu le ${new Date(envois[d.key]).toLocaleDateString("fr-FR", { day: "numeric", month: "short" })}` : ""}</div>
            </div>
            <a href={whatsappLink(d.tel, annonceMessage(annonce, d.nom))} target="_blank" rel="noopener noreferrer" onClick={() => onMarkSent(d.key)}
              aria-label={`Envoyer à ${d.nom}`} style={{ background: envois[d.key] ? "#fff" : "#25D366", color: envois[d.key] ? "#1A9E4B" : "#fff", border: "1.5px solid #25D366", borderRadius: 8, padding: "6px 9px", display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, fontWeight: 700, textDecoration: "none" }}>
              <Send size={12} /> {envois[d.key] ? "Renvoyer" : "Envoyer"}
            </a>
          </div>
        ))}
        {sansTel.map(d => (
          <div key={d.key} style={{ display: "flex", alignItems: "center", gap: 9, border: "1px dashed var(--border)", borderRadius: 10, padding: "8px 10px" }}>
            <AlertTriangle size={16} color="var(--danger)" />
            <div style={{ flex: 1, fontSize: 13 }}><b>{d.nom}</b> <span style={{ fontSize: 11.5, color: "var(--danger)" }}>· pas de numéro dans le répertoire</span></div>
          </div>
        ))}
      </div>

      <button onClick={onEdit} style={{ width: "100%", color: "var(--primary)", fontSize: 13, fontWeight: 700, padding: 8 }}>Modifier la réunion ou les destinataires</button>
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  COMPTE RENDU DE RÉUNION                                            */
/* ------------------------------------------------------------------ */

const CR_MAX_CAPTURES = 4;
const PRESENCE_ETATS = [
  { value: "present", label: "Présent", tone: "#1F7A5C", bg: "#E3F1EA" },
  { value: "excuse", label: "Excusé", tone: "var(--accent-dark)", bg: "var(--accent-soft)" },
  { value: "absent", label: "Absent", tone: "var(--danger)", bg: "#F5E4E4" },
];

function heureCourte(d = new Date()) {
  return d.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
}

// Dictée vocale du navigateur : transforme ce que le micro entend en texte.
function useDictee(onFinal) {
  const SR = typeof window !== "undefined" ? (window.SpeechRecognition || window.webkitSpeechRecognition) : null;
  const recRef = useRef(null);
  const wantRef = useRef(false);
  const cbRef = useRef(onFinal);
  cbRef.current = onFinal;
  const [actif, setActif] = useState(false);
  const [provisoire, setProvisoire] = useState("");
  const [erreur, setErreur] = useState("");

  function start() {
    if (!SR) return;
    setErreur("");
    const rec = new SR();
    rec.lang = "fr-FR";
    rec.continuous = true;
    rec.interimResults = true;
    rec.onresult = (e) => {
      let interim = "";
      for (let i = e.resultIndex; i < e.results.length; i++) {
        const t = e.results[i][0].transcript.trim();
        if (e.results[i].isFinal) { if (t) cbRef.current(t); } else interim += t + " ";
      }
      setProvisoire(interim.trim());
    };
    rec.onerror = (e) => {
      if (e.error === "not-allowed" || e.error === "service-not-allowed") {
        wantRef.current = false;
        setErreur("Le micro est refusé. Autorisez le micro pour ce site dans les réglages du navigateur.");
      } else if (e.error === "network") {
        setErreur("La dictée a besoin d'internet.");
      }
    };
    rec.onend = () => {
      setProvisoire("");
      if (wantRef.current) { try { rec.start(); return; } catch (err) {} }
      setActif(false);
    };
    recRef.current = rec;
    wantRef.current = true;
    try { rec.start(); setActif(true); } catch (err) { setErreur("Impossible de démarrer la dictée."); }
  }
  function stop() {
    wantRef.current = false;
    try { recRef.current && recRef.current.stop(); } catch (err) {}
    setActif(false);
  }
  useEffect(() => () => { wantRef.current = false; try { recRef.current && recRef.current.stop(); } catch (e) {} }, []);
  return { supporte: !!SR, actif, provisoire, erreur, start, stop };
}

function compteRenduToText(a, cr) {
  const pres = (cr.presences || []);
  const presents = pres.filter(p => p.etat === "present").map(p => p.nom);
  const excuses = pres.filter(p => p.etat === "excuse").map(p => p.nom);
  const absents = pres.filter(p => p.etat === "absent").map(p => p.nom);
  const L = [
    "📝 *COMPTE RENDU DE RÉUNION*", "Mission Parole de Vie Burkina", "",
    `*${a.titre}*`, `📅 ${annonceDateTexte(a)}${a.type === "Réunion" && a.mode !== "presentiel" ? " · visioconférence" : a.lieu ? ` · ${a.lieu}` : ""}`,
  ];
  if (cr.president) L.push(`Présidée par : ${cr.president}`);
  if (cr.heureDebut || cr.heureFin) L.push(`Horaire : ${cr.heureDebut || "?"} – ${cr.heureFin || "?"}`);
  L.push("", `*Présents (${presents.length})* : ${presents.join(", ") || "—"}`);
  if (excuses.length) L.push(`*Excusés (${excuses.length})* : ${excuses.join(", ")}`);
  if (absents.length) L.push(`*Absents (${absents.length})* : ${absents.join(", ")}`);
  if (cr.points) L.push("", "*Points abordés*", cr.points);
  if (cr.decisions) L.push("", "*Décisions*", cr.decisions);
  const actions = (cr.actions || []).filter(x => (x.quoi || "").trim());
  if (actions.length) {
    L.push("", "*Actions à mener*");
    actions.forEach((x, i) => L.push(`${i + 1}. ${x.quoi}${x.qui ? ` — ${x.qui}` : ""}${x.quand ? ` (pour le ${formatDateLong(x.quand)})` : ""}`));
  }
  if (cr.prochaine) L.push("", `*Prochaine réunion* : ${cr.prochaine}`);
  if ((cr.captures || []).length) L.push("", `📷 ${cr.captures.length} capture(s) d'écran disponibles dans l'application.`);
  if (cr.redacteur) L.push("", `Rédigé par : ${cr.redacteur}`);
  return L.join("\n");
}

function CompteRenduForm({ annonce, onSaved, onClose, showToast }) {
  const [cr, setCr] = useState(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [vue, setVue] = useState("presences");
  const [orateur, setOrateur] = useState("");
  const [zoom, setZoom] = useState(null);
  const key = `cr-${annonce.id}`;

  useEffect(() => {
    let alive = true;
    loadKey(key, null).then(v => {
      if (!alive) return;
      const invites = (annonce.destinataires || []).map(d => ({ key: d.key, nom: d.nom, etat: "absent" }));
      const base = v || {
        heureDebut: annonce.heure || "", heureFin: "", president: annonce.organisateur || "", redacteur: "",
        points: annonce.contenu || "", decisions: "", prochaine: "", transcription: "", actions: [], captures: [], presences: [],
      };
      const known = new Set((base.presences || []).map(p => p.key));
      setCr({ ...base, presences: [...(base.presences || []), ...invites.filter(i => !known.has(i.key))] });
    });
    return () => { alive = false; };
  }, [key]);

  const dictee = useDictee(t => {
    setCr(prev => {
      const ligne = `[${heureCourte()}]${orateurRef.current ? ` ${orateurRef.current} :` : ""} ${t}`;
      return { ...prev, transcription: prev.transcription ? `${prev.transcription}\n${ligne}` : ligne };
    });
  });
  const orateurRef = useRef("");
  orateurRef.current = orateur;

  if (!cr) {
    return (
      <ModalShell title="Compte rendu" onClose={onClose}>
        <div style={{ padding: 20, textAlign: "center", color: "var(--ink-soft)", fontSize: 13 }}>Chargement…</div>
      </ModalShell>
    );
  }

  const set = (k, v) => setCr(p => ({ ...p, [k]: v }));
  const presents = cr.presences.filter(p => p.etat === "present");

  async function ajouterCaptures(e) {
    const files = Array.from(e.target.files || []);
    e.target.value = "";
    const place = CR_MAX_CAPTURES - cr.captures.length;
    if (place <= 0) { showToast(`Maximum ${CR_MAX_CAPTURES} captures`); return; }
    setUploading(true);
    const ajout = [];
    for (const f of files.slice(0, place)) {
      try { ajout.push({ id: uid(), dataUrl: await compressImage(f, 900, 0.55), legende: "" }); } catch (err) {}
    }
    setCr(p => ({ ...p, captures: [...p.captures, ...ajout] }));
    setUploading(false);
  }

  async function enregistrer() {
    const body = { ...cr, modifieLe: new Date().toISOString() };
    const taille = JSON.stringify(body).length;
    if (taille > 950000) { showToast("Trop lourd : retirez une capture ou raccourcissez la transcription"); return; }
    if (dictee.actif) dictee.stop();
    setSaving(true);
    const ok = await saveKey(key, body);
    setSaving(false);
    if (!ok) { showToast("⚠ Échec de l'enregistrement — vérifiez la connexion"); return; }
    await onSaved({ redige: true, nbPresents: presents.length, modifieLe: body.modifieLe });
    showToast("Compte rendu enregistré");
  }

  const texte = compteRenduToText(annonce, cr);
  const onglets = [["presences", `Présents ${presents.length}`], ["captures", `Photos ${cr.captures.length}`], ["propos", "Propos"], ["decisions", "Décisions"]];

  return (
    <ModalShell title="Compte rendu de la réunion" onClose={onClose}>
      <div style={{ background: "#F4F5EE", borderRadius: 11, padding: "10px 12px", marginBottom: 12 }}>
        <div style={{ fontSize: 14, fontWeight: 700 }}>{annonce.titre}</div>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{annonceDateTexte(annonce)}</div>
      </div>

      <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)", overflowX: "auto" }}>
        {onglets.map(([k, l]) => (
          <button key={k} onClick={() => setVue(k)} style={{ ...segButtonStyle(vue === k), flex: "1 0 auto", padding: "8px 9px" }}>{l}</button>
        ))}
      </div>

      {vue === "presences" && (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}><Field label="Début"><input type="time" style={inputStyle} value={cr.heureDebut} onChange={e => set("heureDebut", e.target.value)} /></Field></div>
            <div style={{ flex: 1 }}><Field label="Fin"><input type="time" style={inputStyle} value={cr.heureFin} onChange={e => set("heureFin", e.target.value)} /></Field></div>
          </div>
          <Field label="Présidée par"><input style={inputStyle} value={cr.president} onChange={e => set("president", e.target.value)} /></Field>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 7 }}>
            <div style={{ fontSize: 12, fontWeight: 600, color: "var(--ink-soft)" }}>Touchez chaque personne pour changer son état</div>
            <button onClick={() => set("presences", cr.presences.map(p => ({ ...p, etat: "present" })))} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)" }}>Tous présents</button>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 6, marginBottom: 10 }}>
            {cr.presences.map(p => {
              const st = PRESENCE_ETATS.find(x => x.value === p.etat) || PRESENCE_ETATS[2];
              const suivant = PRESENCE_ETATS[(PRESENCE_ETATS.indexOf(st) + 1) % PRESENCE_ETATS.length].value;
              return (
                <button key={p.key} onClick={() => set("presences", cr.presences.map(x => x.key === p.key ? { ...x, etat: suivant } : x))} style={{
                  display: "flex", alignItems: "center", justifyContent: "space-between", gap: 8, border: "1px solid var(--border)", borderRadius: 10, padding: "9px 11px", background: "#fff", textAlign: "left"
                }}>
                  <span style={{ fontSize: 13, fontWeight: 600 }}>{p.nom}</span>
                  <span style={{ fontSize: 11.5, fontWeight: 700, color: st.tone, background: st.bg, borderRadius: 99, padding: "3px 10px" }}>{st.label}</span>
                </button>
              );
            })}
          </div>
          <AddPresence onAdd={nom => set("presences", [...cr.presences, { key: "y-" + uid(), nom, etat: "present" }])} />
        </>
      )}

      {vue === "captures" && (
        <>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 12 }}>
            Pendant la visio, faites une <b>capture d'écran</b> avec votre téléphone quand les participants sont visibles (en général : boutons <b>Marche + Volume bas</b> en même temps). Ajoutez-la ensuite ici. Maximum {CR_MAX_CAPTURES} captures.
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 10 }}>
            {cr.captures.map(c => (
              <div key={c.id} style={{ border: "1px solid var(--border)", borderRadius: 10, overflow: "hidden", background: "#fff" }}>
                <img src={c.dataUrl} alt="Capture de la réunion" onClick={() => setZoom(c.dataUrl)} style={{ width: "100%", aspectRatio: "4 / 3", objectFit: "cover", display: "block", cursor: "zoom-in" }} />
                <div style={{ display: "flex", gap: 4, padding: 5 }}>
                  <input style={{ ...inputStyle, fontSize: 11.5, padding: "5px 7px" }} value={c.legende} placeholder="Légende"
                    onChange={e => set("captures", cr.captures.map(x => x.id === c.id ? { ...x, legende: e.target.value } : x))} />
                  <button onClick={() => set("captures", cr.captures.filter(x => x.id !== c.id))} aria-label="Retirer la capture" style={{ padding: 4 }}><Trash2 size={14} color="var(--danger)" /></button>
                </div>
              </div>
            ))}
            {cr.captures.length < CR_MAX_CAPTURES && (
              <label style={{ border: "1.5px dashed var(--border)", borderRadius: 10, aspectRatio: "4 / 3", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 5, cursor: "pointer", color: "var(--primary)", fontSize: 12, fontWeight: 700, background: "#fff" }}>
                <ImagePlus size={22} /> {uploading ? "Chargement…" : "Ajouter"}
                <input type="file" accept="image/*" multiple onChange={ajouterCaptures} style={{ display: "none" }} disabled={uploading} />
              </label>
            )}
          </div>
        </>
      )}

      {vue === "propos" && (
        <>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", lineHeight: 1.5, marginBottom: 10 }}>
            La <b>dictée</b> écrit ce que le micro entend. Utilisez un <b>deuxième téléphone</b> posé près du haut-parleur de celui qui suit la visio, ou dictez vous-même un résumé après la réunion.
          </div>
          {dictee.supporte ? (
            <>
              <Field label="Qui parle ? (facultatif, ajouté devant chaque phrase)">
                <select style={inputStyle} value={orateur} onChange={e => setOrateur(e.target.value)}>
                  <option value="">— Ne pas préciser —</option>
                  {presents.map(p => <option key={p.key} value={p.nom}>{p.nom}</option>)}
                </select>
              </Field>
              <button onClick={dictee.actif ? dictee.stop : dictee.start} style={{
                width: "100%", display: "flex", alignItems: "center", justifyContent: "center", gap: 8, borderRadius: 12, padding: "13px 10px",
                fontSize: 14.5, fontWeight: 800, color: "#fff", background: dictee.actif ? "var(--danger)" : "var(--primary)", marginBottom: 8
              }}>
                {dictee.actif ? <><MicOff size={18} /> Arrêter la dictée</> : <><Mic size={18} /> Démarrer la dictée</>}
              </button>
              {dictee.actif && (
                <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 700, marginBottom: 8, display: "flex", alignItems: "center", gap: 6 }}>
                  <span style={{ width: 8, height: 8, borderRadius: "50%", background: "var(--danger)", display: "inline-block" }} />
                  Écoute en cours… {dictee.provisoire && <span style={{ fontWeight: 400, color: "var(--ink-soft)", fontStyle: "italic" }}>« {dictee.provisoire} »</span>}
                </div>
              )}
              {dictee.erreur && <div style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600, marginBottom: 8 }}>{dictee.erreur}</div>}
            </>
          ) : (
            <div style={{ fontSize: 12.5, background: "var(--accent-soft)", color: "var(--accent-dark)", borderRadius: 10, padding: "9px 11px", marginBottom: 10, lineHeight: 1.45 }}>
              La dictée n'est pas disponible dans ce navigateur. Utilisez <b>Chrome</b>, ou le <b>micro du clavier</b> de votre téléphone dans la zone de texte ci-dessous.
            </div>
          )}
          <Field label="Propos de la réunion (modifiable)">
            <textarea style={{ ...inputStyle, minHeight: 220, resize: "vertical", fontSize: 13.5, lineHeight: 1.5 }} value={cr.transcription}
              onChange={e => set("transcription", e.target.value)} placeholder="Les propos dictés apparaissent ici, avec l'heure. Vous pouvez aussi écrire ou coller un texte." />
          </Field>
        </>
      )}

      {vue === "decisions" && (
        <>
          <Field label="Points abordés">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={cr.points} onChange={e => set("points", e.target.value)} />
          </Field>
          <Field label="Décisions prises">
            <textarea style={{ ...inputStyle, minHeight: 80, resize: "vertical" }} value={cr.decisions} onChange={e => set("decisions", e.target.value)} placeholder="Une décision par ligne" />
          </Field>
          <Field label="Actions à mener">
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {cr.actions.map((x, i) => (
                <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 10, padding: 8, background: "#FAFAF6" }}>
                  <input style={{ ...inputStyle, marginBottom: 6, fontSize: 13 }} value={x.quoi} placeholder="Quoi ?" onChange={e => set("actions", cr.actions.map((y, j) => j === i ? { ...y, quoi: e.target.value } : y))} />
                  <div style={{ display: "flex", gap: 6 }}>
                    <input style={{ ...inputStyle, flex: 1.3, fontSize: 13 }} value={x.qui} placeholder="Qui ?" onChange={e => set("actions", cr.actions.map((y, j) => j === i ? { ...y, qui: e.target.value } : y))} />
                    <input type="date" style={{ ...inputStyle, flex: 1, fontSize: 13 }} value={x.quand} onChange={e => set("actions", cr.actions.map((y, j) => j === i ? { ...y, quand: e.target.value } : y))} />
                    <button onClick={() => set("actions", cr.actions.filter((_, j) => j !== i))} aria-label="Retirer l'action" style={{ padding: 4 }}><Trash2 size={15} color="var(--danger)" /></button>
                  </div>
                </div>
              ))}
              <button onClick={() => set("actions", [...cr.actions, { quoi: "", qui: "", quand: "" }])} style={{ alignSelf: "flex-start", border: "1.5px dashed var(--border)", borderRadius: 9, padding: "7px 12px", fontSize: 12.5, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 5 }}>
                <Plus size={13} /> Ajouter une action
              </button>
            </div>
          </Field>
          <Field label="Prochaine réunion"><input style={inputStyle} value={cr.prochaine} onChange={e => set("prochaine", e.target.value)} placeholder="Ex. mardi 3 novembre à 19h" /></Field>
          <Field label="Rédigé par"><input style={inputStyle} value={cr.redacteur} onChange={e => set("redacteur", e.target.value)} /></Field>
        </>
      )}

      <div style={{ borderTop: "1px solid var(--border)", paddingTop: 12, marginTop: 6 }}>
        <PrimaryButton full icon={Check} onClick={saving ? undefined : enregistrer}>{saving ? "Enregistrement…" : "Enregistrer le compte rendu"}</PrimaryButton>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginTop: 8 }}>
          <a href={shareWhatsappLink(texte)} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#25D366", color: "#fff", borderRadius: 10, padding: "9px 4px", fontSize: 12, fontWeight: 700, textDecoration: "none" }}>
            <Send size={13} /> Partager (WhatsApp)
          </a>
          <button onClick={async () => { try { await navigator.clipboard.writeText(texte + (cr.transcription ? `\n\n*Propos de la réunion*\n${cr.transcription}` : "")); showToast("Compte rendu copié"); } catch (e) { showToast("Copie impossible"); } }} style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: 5, border: "1.5px solid var(--border)", borderRadius: 10, padding: "9px 4px", fontSize: 12, fontWeight: 700 }}>
            <Copy size={13} /> Copier avec les propos
          </button>
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 7, lineHeight: 1.4 }}>
          Le partage WhatsApp envoie le résumé (présences, décisions, actions). Les captures restent visibles dans l'application.
        </div>
      </div>

      {zoom && (
        <div onClick={() => setZoom(null)} style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,.85)", zIndex: 90, display: "flex", alignItems: "center", justifyContent: "center", padding: 16 }}>
          <img src={zoom} alt="Capture agrandie" style={{ maxWidth: "100%", maxHeight: "100%", borderRadius: 8 }} />
        </div>
      )}
    </ModalShell>
  );
}

function AddPresence({ onAdd }) {
  const [nom, setNom] = useState("");
  return (
    <div style={{ display: "flex", gap: 6, marginBottom: 6 }}>
      <input style={{ ...inputStyle, fontSize: 13 }} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ajouter une personne présente non invitée" />
      <button onClick={() => { if (nom.trim()) { onAdd(nom.trim()); setNom(""); } }} aria-label="Ajouter" style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 12px" }}><UserPlus size={16} /></button>
    </div>
  );
}

function ReunionsAnnonces({ annonces, saveAnnonce, deleteAnnonce, pastors, deptHeads, missionaries, regions, seminars, coordSeminars, showToast }) {
  const [editing, setEditing] = useState(null);
  const [envoiId, setEnvoiId] = useState(null);
  const [crId, setCrId] = useState(null);
  const [vue, setVue] = useState("avenir");
  const contacts = useMemo(() => buildContacts(pastors, deptHeads, missionaries), [pastors, deptHeads, missionaries]);
  const envoi = annonces.find(a => a.id === envoiId);
  const crAnnonce = annonces.find(a => a.id === crId);

  const today = new Date().toISOString().slice(0, 10);
  const liste = [...annonces]
    .filter(a => vue === "avenir" ? (a.date || "") >= today : (a.date || "") < today)
    .sort((x, y) => vue === "avenir" ? `${x.date}${x.heure}`.localeCompare(`${y.date}${y.heure}`) : `${y.date}${y.heure}`.localeCompare(`${x.date}${x.heure}`));

  async function handleSave(a) {
    const ok = await saveAnnonce(a);
    if (ok) { setEditing(null); setEnvoiId(a.id); showToast("Enregistré : vous pouvez prévenir les personnes"); }
  }
  async function markSent(key) {
    const a = annonces.find(x => x.id === envoiId);
    if (!a) return;
    await saveAnnonce({ ...a, envois: { ...(a.envois || {}), [key]: new Date().toISOString() } });
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.45 }}>
        Annoncez une réunion, un programme ou une information, choisissez qui prévenir, puis envoyez à chacun par WhatsApp. Pour une réunion à distance, un lien de visioconférence est créé tout seul.
      </div>
      <div style={{ marginBottom: 14 }}>
        <PrimaryButton full icon={Megaphone} onClick={() => setEditing({})}>Nouvelle réunion ou annonce</PrimaryButton>
      </div>

      <div style={{ display: "flex", gap: 6, marginBottom: 12 }}>
        {[["avenir", "À venir"], ["passees", "Passées"]].map(([k, l]) => (
          <button key={k} onClick={() => setVue(k)} style={{
            padding: "5px 12px", borderRadius: 99, fontSize: 12, fontWeight: 700, border: "1px solid var(--border)",
            background: vue === k ? "var(--ink)" : "#fff", color: vue === k ? "#fff" : "var(--ink-soft)"
          }}>{l}</button>
        ))}
      </div>

      {liste.length === 0 ? (
        <EmptyState icon={Megaphone} text={vue === "avenir" ? "Aucune réunion ni annonce à venir." : "Aucune réunion passée."} />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {liste.map(a => {
            const avecTel = (a.destinataires || []).filter(d => telDigits(d.tel));
            const faits = avecTel.filter(d => (a.envois || {})[d.key]).length;
            const visio = a.type === "Réunion" && a.mode !== "presentiel" && a.lienVisio;
            const jours = daysUntil(a.date);
            return (
              <div key={a.id} style={{ background: "#fff", border: "1px solid var(--border)", borderLeft: `4px solid ${a.type === "Réunion" ? "var(--primary)" : a.type === "Programme" ? "#1F7A5C" : "var(--accent)"}`, borderRadius: 12, padding: "11px 12px" }}>
                <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                  <div style={{ minWidth: 0 }}>
                    <div style={{ fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".05em", color: "var(--accent-dark)" }}>
                      {a.type}{visio ? " · Visio" : ""}{jours === 0 ? " · Aujourd'hui" : jours === 1 ? " · Demain" : ""}
                    </div>
                    <div style={{ fontSize: 14, fontWeight: 700, marginTop: 1 }}>{a.titre}</div>
                    <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 2 }}>{annonceDateTexte(a)}{a.lieu && a.mode !== "visio" ? ` · ${a.lieu}` : ""}</div>
                  </div>
                  <button onClick={() => setEditing(a)} style={{ fontSize: 11.5, color: "var(--primary)", fontWeight: 700, whiteSpace: "nowrap" }}>Modifier</button>
                </div>
                <div style={{ fontSize: 11.5, marginTop: 6, color: faits === avecTel.length && avecTel.length ? "#1F7A5C" : "var(--ink-soft)", fontWeight: 600 }}>
                  {faits} / {avecTel.length} personne{avecTel.length > 1 ? "s" : ""} prévenue{faits > 1 ? "s" : ""}
                </div>
                <div style={{ display: "flex", gap: 7, marginTop: 9, flexWrap: "wrap" }}>
                  <button onClick={() => setEnvoiId(a.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 11px", borderRadius: 8 }}>
                    <Send size={13} /> Prévenir par WhatsApp
                  </button>
                  {visio && vue === "avenir" && (
                    <a href={a.lienVisio} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 5, background: "var(--primary)", color: "#fff", fontSize: 12, fontWeight: 700, padding: "7px 11px", borderRadius: 8, textDecoration: "none" }}>
                      <Video size={13} /> Rejoindre la visio
                    </a>
                  )}
                  {a.type === "Réunion" && (jours === null || jours <= 0) && (
                    <button onClick={() => setCrId(a.id)} style={{ display: "flex", alignItems: "center", gap: 5, background: a.compteRendu ? "#E3F1EA" : "#fff", color: a.compteRendu ? "#1F7A5C" : "var(--primary)", border: `1.5px solid ${a.compteRendu ? "#1F7A5C" : "var(--primary)"}`, fontSize: 12, fontWeight: 700, padding: "6px 10px", borderRadius: 8 }}>
                      <ClipboardCheck size={13} /> {a.compteRendu ? `Compte rendu · ${a.compteRendu.nbPresents} présents` : "Faire le compte rendu"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <AnnonceForm
          entry={editing} contacts={contacts} regions={regions} seminars={seminars} coordSeminars={coordSeminars}
          onSave={handleSave} onClose={() => setEditing(null)}
          onDelete={async a => { const ok = await deleteAnnonce(a); if (ok) { setEditing(null); showToast("Supprimé"); } }}
        />
      )}
      {crAnnonce && (
        <CompteRenduForm
          annonce={crAnnonce} onClose={() => setCrId(null)} showToast={showToast}
          onSaved={async info => { await saveAnnonce({ ...crAnnonce, compteRendu: info }); }}
        />
      )}
      {envoi && !editing && (
        <AnnonceEnvoi annonce={envoi} onMarkSent={markSent} onEdit={() => setEditing(envoi)} onClose={() => setEnvoiId(null)} showToast={showToast} />
      )}
    </div>
  );
}

function ProchainesReunions({ annonces, setTab }) {
  const today = new Date().toISOString().slice(0, 10);
  const next = [...(annonces || [])].filter(a => (a.date || "") >= today)
    .sort((x, y) => `${x.date}${x.heure}`.localeCompare(`${y.date}${y.heure}`)).slice(0, 3);
  if (!next.length) return null;
  return (
    <div style={{ marginBottom: 20 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Megaphone size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Réunions et annonces</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {next.map(a => {
          const visio = a.type === "Réunion" && a.mode !== "presentiel" && a.lienVisio;
          return (
            <div key={a.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "10px 12px", display: "flex", alignItems: "center", gap: 10 }}>
              <div style={{ flex: 1, minWidth: 0 }} onClick={() => setTab("messagerie")}>
                <div style={{ fontSize: 13, fontWeight: 700 }}>{a.titre}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{a.type} · {annonceDateTexte(a)}</div>
              </div>
              {visio && (
                <a href={a.lienVisio} target="_blank" rel="noopener noreferrer" style={{ display: "flex", alignItems: "center", gap: 4, background: "var(--primary)", color: "#fff", fontSize: 11.5, fontWeight: 700, padding: "6px 9px", borderRadius: 8, textDecoration: "none" }}>
                  <Video size={12} /> Rejoindre
                </a>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}

function Messagerie({ seminars, coordSeminars, pastors, deptHeads, missionaries, regions, annonces, saveAnnonce, deleteAnnonce, showToast }) {
  const [mode, setMode] = useState("reunions");
  return (
    <div>
      <SectionTitle sub="Réunions, annonces et messages WhatsApp, avec visioconférence">Messagerie</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setMode("reunions")} style={segButtonStyle(mode === "reunions")}>Réunions & annonces</button>
        <button onClick={() => setMode("seminaire")} style={segButtonStyle(mode === "seminaire")}>Par séminaire</button>
        <button onClick={() => setMode("groupe")} style={segButtonStyle(mode === "groupe")}>Par catégorie</button>
      </div>

      {mode === "reunions" ? (
        <ReunionsAnnonces
          annonces={annonces} saveAnnonce={saveAnnonce} deleteAnnonce={deleteAnnonce}
          pastors={pastors} deptHeads={deptHeads} missionaries={missionaries} regions={regions}
          seminars={seminars} coordSeminars={coordSeminars} showToast={showToast}
        />
      ) : mode === "seminaire" ? (
        <MessagerieParSeminaire seminars={seminars} pastors={pastors} />
      ) : (
        <MessagerieParGroupe pastors={pastors} />
      )}
    </div>
  );
}

function MessagerieParSeminaire({ seminars, pastors }) {
  const sorted = [...seminars].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const [seminarId, setSeminarId] = useState(sorted[0]?.id || "");
  const seminar = seminars.find(s => s.id === seminarId);
  const [extra, setExtra] = useState([]);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  useEffect(() => {
    if (seminar) {
      setMessage(
        `Bonjour,\n\nVous êtes affecté(e) au séminaire "${seminar.theme}" prévu le ${formatDateLong(seminar.date)}${seminar.heure ? " à " + seminar.heure : ""} à l'assemblée de ${seminar.assemblee || "—"}.\n\nMerci de confirmer votre disponibilité.\n\nDépartement Mission et Formation — Mission Parole de Vie Burkina`
      );
      setExtra([]);
    } else {
      setMessage("");
    }
  }, [seminarId]);

  const recipientIds = new Set([...(seminar?.predicateurs || []), ...extra]);
  const recipients = pastors.filter(p => recipientIds.has(p.id));
  const others = pastors.filter(p => !recipientIds.has(p.id));

  function toggleExtra(id) {
    setExtra(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function copyMessage(id) {
    navigator.clipboard?.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <Field label="Séminaire concerné">
        <select style={inputStyle} value={seminarId} onChange={e => setSeminarId(e.target.value)}>
          <option value="">— Choisir un séminaire —</option>
          {sorted.map(s => (
            <option key={s.id} value={s.id}>{s.theme} — {s.date ? formatDateLong(s.date) : "date à définir"}</option>
          ))}
        </select>
      </Field>

      {!seminar ? (
        <EmptyState icon={MessageCircle} text="Sélectionnez un séminaire pour préparer les messages." />
      ) : (
        <>
          <Field label="Message (modifiable)">
            <textarea style={{ ...inputStyle, minHeight: 130, resize: "vertical", fontSize: 13.5 }} value={message} onChange={e => setMessage(e.target.value)} />
          </Field>

          <Field label={`Destinataires (${recipients.length})`}>
            {recipients.length === 0 && <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 8 }}>Aucun destinataire. Ajoutez-en ci-dessous.</div>}
            <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
              {recipients.map(p => (
                <div key={p.id} style={{
                  display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid var(--border)",
                  borderRadius: 11, padding: "10px 12px"
                }}>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.nom}</div>
                    <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.telephone || "N° manquant"}</div>
                  </div>
                  <button onClick={() => copyMessage(p.id)} style={{
                    display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--ink-soft)",
                    padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)"
                  }}>
                    {copiedId === p.id ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                  </button>
                  {p.telephone ? (
                    <a href={whatsappLink(p.telephone, message)} target="_blank" rel="noopener noreferrer" style={{
                      display: "flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                      fontSize: 12, fontWeight: 700, padding: "8px 11px", borderRadius: 8
                    }}>
                      <Send size={13} /> WhatsApp
                    </a>
                  ) : (
                    <span style={{ fontSize: 10.5, color: "var(--danger)" }}>—</span>
                  )}
                </div>
              ))}
            </div>
          </Field>

          <Field label="Ajouter un autre destinataire">
            <div style={{ maxHeight: 150, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 9 }}>
              {others.map(p => (
                <div key={p.id} onClick={() => toggleExtra(p.id)} style={{
                  display: "flex", alignItems: "center", gap: 9, padding: "8px 11px", borderBottom: "1px solid var(--border)"
                }}>
                  <Plus size={14} color="var(--primary)" />
                  <div style={{ fontSize: 13 }}>{p.nom} <span style={{ color: "var(--ink-soft)" }}>· {p.fonction}</span></div>
                </div>
              ))}
              {others.length === 0 && <div style={{ padding: 10, fontSize: 12, color: "var(--ink-soft)" }}>Tout le monde est déjà destinataire.</div>}
            </div>
          </Field>

          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>
            L'envoi se fait via WhatsApp (lien pré-rempli) — l'application ne peut pas envoyer de SMS automatiques sans une passerelle dédiée. Utilisez "copier" pour coller le message dans un SMS classique.
          </div>
        </>
      )}
    </div>
  );
}

/* --- Diffusion par catégorie (Pasteur, Coordonnateur, Missionnaire Afrique, …) --- */

function MessagerieParGroupe({ pastors }) {
  const [fonction, setFonction] = useState("");
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const groupe = pastors.filter(p => p.fonction === fonction);

  function copyMessage(id) {
    navigator.clipboard?.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 14, lineHeight: 1.4 }}>
        Choisissez une catégorie pour envoyer une information uniquement à ce groupe, sans mélanger avec les autres.
      </div>
      <Field label="Catégorie destinataire">
        <select style={inputStyle} value={fonction} onChange={e => setFonction(e.target.value)}>
          <option value="">— Choisir une catégorie —</option>
          {FONCTIONS.map(f => {
            const count = pastors.filter(p => p.fonction === f).length;
            return <option key={f} value={f}>{f} ({count})</option>;
          })}
        </select>
      </Field>

      {!fonction ? (
        <EmptyState icon={Users} text="Sélectionnez une catégorie pour préparer une diffusion." />
      ) : (
        <>
          <Field label="Message (modifiable)">
            <textarea
              style={{ ...inputStyle, minHeight: 130, resize: "vertical", fontSize: 13.5 }}
              value={message} onChange={e => setMessage(e.target.value)}
              placeholder={`Bonjour,\n\nInformation destinée aux ${fonction.toLowerCase()}s…\n\nDépartement Mission et Formation — Mission Parole de Vie Burkina`}
            />
          </Field>

          <Field label={`Destinataires du groupe « ${fonction} » (${groupe.length})`}>
            {groupe.length === 0 ? (
              <div style={{ fontSize: 12.5, color: "var(--ink-soft)" }}>Aucun contact enregistré dans cette catégorie pour l'instant.</div>
            ) : (
              <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                {groupe.map(p => (
                  <div key={p.id} style={{
                    display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid var(--border)",
                    borderRadius: 11, padding: "10px 12px"
                  }}>
                    <div style={{ flex: 1, minWidth: 0 }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700 }}>{p.nom}</div>
                      <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.telephone || "N° manquant"}{p.assemblee ? ` · ${p.assemblee}` : ""}</div>
                    </div>
                    <button onClick={() => copyMessage(p.id)} style={{
                      display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--ink-soft)",
                      padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)"
                    }}>
                      {copiedId === p.id ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                    </button>
                    {p.telephone ? (
                      <a href={whatsappLink(p.telephone, message)} target="_blank" rel="noopener noreferrer" style={{
                        display: "flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                        fontSize: 12, fontWeight: 700, padding: "8px 11px", borderRadius: 8
                      }}>
                        <Send size={13} /> WhatsApp
                      </a>
                    ) : (
                      <span style={{ fontSize: 10.5, color: "var(--danger)" }}>—</span>
                    )}
                  </div>
                ))}
              </div>
            )}
          </Field>

          <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 4, lineHeight: 1.5 }}>
            Chaque envoi ouvre WhatsApp avec le message déjà écrit — il ne reste qu'à confirmer, contact par contact.
          </div>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  DIRECTION                                                          */
/* ------------------------------------------------------------------ */

function Direction({ leadership, setLeadership, showToast, unlocked, onUnlock, onLock }) {
  const [form, setForm] = useState(leadership);
  useEffect(() => setForm(leadership), [leadership]);

  const changed = JSON.stringify(form) !== JSON.stringify(leadership);

  function save() {
    setLeadership(form);
    showToast("Informations mises à jour");
  }

  const rows = [
    { key: "presidentAfrique", label: "Président Afrique" },
    { key: "responsableDeptAfrique", label: "Responsable Département Afrique" },
    { key: "coordonnateur", label: "Coordonnateur" },
    { key: "responsableMissionFormationPays", label: "Responsable Mission et Formation (Burkina Faso)" },
  ];

  return (
    <div>
      <SectionTitle sub="Responsables de la mission, du pays au continent">Direction</SectionTitle>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        {rows.map((r, i) => (
          <div key={r.key} style={{ marginBottom: i < rows.length - 1 ? 14 : 0 }}>
            <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 5 }}>{r.label}</div>
            <input
              style={inputStyle}
              value={form[r.key] || ""}
              placeholder="Nom et prénom"
              onChange={e => setForm({ ...form, [r.key]: e.target.value })}
            />
          </div>
        ))}
      </div>

      {leadership.pinChefDepartement && !unlocked ? (
        <CoordLockPanel
          leadership={leadership} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock}
          description="Les codes d'accès sont masqués. Entrez le code du chef du département pour les voir ou les changer. Les codes des départements se gèrent dans Coord. → Plans départements → Vue nationale."
        />
      ) : (
        <>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <Lock size={13} color="var(--accent-dark)" />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".04em" }}>
            Code du chef du département
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 8, lineHeight: 1.4 }}>
          Ce code protège l'onglet "Coordination" : lui seul permet d'affecter des prédicateurs aux séminaires nationaux, de gérer les responsables et d'envoyer des messages. Communiquez-le uniquement au chef du département.
        </div>
        <PinField
          value={form.pinChefDepartement || ""}
          placeholder="Ex : 4 chiffres ou un mot de passe simple"
          onChange={v => setForm({ ...form, pinChefDepartement: v })}
        />
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "16px", marginBottom: 16 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 5 }}>
          <ShieldCheck size={13} color="var(--accent-dark)" />
          <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".04em" }}>
            Code du coordonnateur national
          </div>
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 8, lineHeight: 1.4 }}>
          Ce code protège la validation des séminaires (approuver ou rejeter) dans l'onglet "Coordination". Communiquez-le uniquement au coordonnateur national.
        </div>
        <PinField
          value={form.pinCoordonnateurNational || ""}
          placeholder="Ex : 4 chiffres ou un mot de passe simple"
          onChange={v => setForm({ ...form, pinCoordonnateurNational: v })}
        />
      </div>
        </>
      )}

      {changed && <PrimaryButton onClick={save} icon={Check} full>Enregistrer les modifications</PrimaryButton>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  ESPACE SEMAINE : programme hebdomadaire + rapport de séminaire     */
/* ------------------------------------------------------------------ */

function SemaineTab({ regions, pastors, seminars, coordSeminars, weeklyPrograms, setWeeklyPrograms, seminarReports, setSeminarReports, showToast }) {
  const [subTab, setSubTab] = useState("programme");

  return (
    <div>
      <SectionTitle sub="Programme hebdomadaire des assemblées et rapports de séminaire des pasteurs">Semaine</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setSubTab("programme")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: subTab === "programme" ? "var(--primary)" : "transparent",
          color: subTab === "programme" ? "#fff" : "var(--ink-soft)"
        }}>Programme d'assemblée</button>
        <button onClick={() => setSubTab("rapport")} style={{
          flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 12, fontWeight: 700,
          background: subTab === "rapport" ? "var(--primary)" : "transparent",
          color: subTab === "rapport" ? "#fff" : "var(--ink-soft)"
        }}>Rapport</button>
      </div>

      {subTab === "programme" ? (
        <ProgrammeSemaine regions={regions} seminars={seminars} pastors={pastors} weeklyPrograms={weeklyPrograms} setWeeklyPrograms={setWeeklyPrograms} showToast={showToast} />
      ) : (
        <RapportHebdo regions={regions} pastors={pastors} seminars={seminars} coordSeminars={coordSeminars} seminarReports={seminarReports} setSeminarReports={setSeminarReports} showToast={showToast} />
      )}
    </div>
  );
}

/* --- Programme de la semaine ------------------------------------- */

function ProgrammeSemaine({ regions, weeklyPrograms, setWeeklyPrograms, showToast }) {
  const [assemblee, setAssemblee] = useState("");
  const [editing, setEditing] = useState(null);

  const entries = weeklyPrograms
    .filter(w => w.assemblee === assemblee)
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));

  function handleSave(entry) {
    const exists = weeklyPrograms.some(x => x.id === entry.id);
    const next = exists ? weeklyPrograms.map(x => x.id === entry.id ? entry : x) : [...weeklyPrograms, entry];
    setWeeklyPrograms(next);
    setEditing(null);
    showToast(exists ? "Note mise à jour" : "Note ajoutée");
  }
  function handleDelete(id) {
    setWeeklyPrograms(weeklyPrograms.filter(x => x.id !== id));
    setEditing(null);
    showToast("Note supprimée");
  }

  return (
    <div>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>

      {assemblee && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => setEditing({ assemblee, semaine: mondayOf(new Date().toISOString().slice(0, 10)) })} style={{
              background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600
            }}>
              <Plus size={14} /> Nouvelle note
            </button>
          </div>

          {entries.length === 0 ? (
            <EmptyState icon={FileText} text={`Aucune note hebdomadaire enregistrée pour ${assemblee}.`} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {entries.map(w => (
                <div key={w.id} onClick={() => setEditing(w)} style={{
                  background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                  borderLeft: "4px solid var(--primary)", cursor: "pointer"
                }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", marginBottom: 6, textTransform: "capitalize" }}>
                    Semaine du {formatDateLong(w.semaine)} au {formatDateLong(sundayOf(w.semaine))}
                  </div>
                  <div style={{ fontSize: 13, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>
                    {w.contenu || <span style={{ color: "var(--ink-soft)" }}>(Programme vide)</span>}
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {editing && (
        <WeeklyProgramForm entry={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function WeeklyProgramForm({ entry, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [semaine, setSemaine] = useState(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)));
  const [contenu, setContenu] = useState(entry.contenu || "");

  function handleSubmit() {
    onSave({ id: entry.id || uid(), assemblee: entry.assemblee, semaine: mondayOf(semaine), contenu });
  }

  return (
    <ModalShell title={isNew ? "Nouveau programme de la semaine" : "Modifier le programme"} onClose={onClose}>
      <Field label="Semaine (choisissez un jour de la semaine)">
        <input type="date" style={inputStyle} value={semaine} onChange={e => setSemaine(e.target.value)} />
      </Field>
      <Field label="Programme de la semaine">
        <textarea
          style={{ ...inputStyle, minHeight: 160, resize: "vertical", fontSize: 13.5 }}
          value={contenu} onChange={e => setContenu(e.target.value)}
          placeholder={"Ex :\nLundi : Prière et intercession\nMercredi : Étude biblique\nVendredi : Veillée\nDimanche : Culte et école du dimanche"}
        />
      </Field>
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce programme ?")) onDelete(entry.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce programme
        </button>
      )}
    </ModalShell>
  );
}

/* --- Rapport hebdomadaire de séminaire ---------------------------- */

function emptyReportValues() {
  const v = {};
  REPORT_FIELDS.forEach(f => { v[f.key] = 0; });
  return v;
}

function RapportHebdo({ regions, pastors, seminars, seminarReports, setSeminarReports, showToast }) {
  const [assemblee, setAssemblee] = useState("");
  const [editing, setEditing] = useState(null);
  const [recapAssemblee, setRecapAssemblee] = useState("__pays__");
  const [recapDebut, setRecapDebut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [recapFin, setRecapFin] = useState(() => new Date().toISOString().slice(0, 10));

  const entries = seminarReports
    .filter(r => r.assemblee === assemblee)
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));

  function handleSave(entry) {
    const exists = seminarReports.some(x => x.id === entry.id);
    const next = exists ? seminarReports.map(x => x.id === entry.id ? entry : x) : [...seminarReports, entry];
    setSeminarReports(next);
    setEditing(null);
    showToast(exists ? "Rapport mis à jour" : "Rapport déposé");
  }
  function handleDelete(id) {
    setSeminarReports(seminarReports.filter(x => x.id !== id));
    setEditing(null);
    showToast("Rapport supprimé");
  }

  const recapReports = seminarReports.filter(r =>
    (r.niveau || "assemblee") !== "coordination" &&
    (recapAssemblee === "__pays__" || r.assemblee === recapAssemblee) &&
    (r.semaine || "") >= recapDebut && (r.semaine || "") <= recapFin
  );
  const recapTotals = emptyReportValues();
  recapReports.forEach(r => REPORT_FIELDS.forEach(f => { recapTotals[f.key] += Number(r[f.key]) || 0; }));
  const recapAssembleesCount = new Set(recapReports.map(r => r.assemblee)).size;

  return (
    <div>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} />
      </Field>

      {assemblee && (
        <>
          <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
            <button onClick={() => setEditing({ assemblee, semaine: mondayOf(new Date().toISOString().slice(0, 10)), ...emptyReportValues() })} style={{
              background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 12px",
              display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600
            }}>
              <Plus size={14} /> Déposer un rapport
            </button>
          </div>

          {entries.length === 0 ? (
            <EmptyState icon={FileText} text={`Aucun rapport hebdomadaire déposé pour ${assemblee}.`} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
              {entries.map(r => (
                <div key={r.id} onClick={() => setEditing(r)} style={{
                  background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                  borderLeft: "4px solid var(--accent)", cursor: "pointer"
                }}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", textTransform: "capitalize" }}>
                      Semaine du {formatDateLong(r.semaine)}
                    </div>
                    {r.pasteur && <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{r.pasteur}</div>}
                  </div>
                  {r.predicateurNoms && r.predicateurNoms.length > 0 && (
                    <div style={{ fontSize: 11.5, color: "var(--ink)", marginBottom: 8 }}>
                      <span style={{ color: "var(--ink-soft)" }}>Ont prêché : </span>{r.predicateurNoms.join(", ")}
                    </div>
                  )}
                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px" }}>
                    {REPORT_FIELDS.map(f => (
                      <div key={f.key} style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "flex", justifyContent: "space-between" }}>
                        <span>{f.label}</span><span style={{ fontWeight: 700, color: "var(--ink)" }}>{r[f.key] || 0}</span>
                      </div>
                    ))}
                  </div>
                  {((r.photos && r.photos.length > 0) || r.videoLien) && (
                    <div style={{ display: "flex", alignItems: "center", gap: 12, marginTop: 9, paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                      {r.photos && r.photos.length > 0 && (
                        <div style={{ display: "flex", gap: 5 }}>
                          {r.photos.slice(0, 3).map(ph => (
                            <img key={ph.id} src={ph.dataUrl} alt="" style={{ width: 30, height: 30, borderRadius: 6, objectFit: "cover", border: "1px solid var(--border)" }} />
                          ))}
                          {r.photos.length > 3 && (
                            <div style={{ width: 30, height: 30, borderRadius: 6, background: "var(--accent-soft)", color: "var(--accent-dark)", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 10.5, fontWeight: 700 }}>
                              +{r.photos.length - 3}
                            </div>
                          )}
                        </div>
                      )}
                      {r.videoLien && (
                        <a href={r.videoLien} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                          display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--primary)", fontWeight: 600
                        }}>
                          <Video size={13} /> Vidéo
                        </a>
                      )}
                    </div>
                  )}
                  <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                    <ShareReportButton report={r} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10, marginTop: assemblee ? 0 : 8 }}>
        <BarChart3 size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Récapitulatif de la période</div>
      </div>

      <div style={{ marginBottom: 8 }}>
        <select style={{ ...inputStyle, fontSize: 13 }} value={recapAssemblee} onChange={e => setRecapAssemblee(e.target.value)}>
          <option value="__pays__">Tout le pays</option>
          {regions.map(r => r.assemblees.length > 0 && (
            <optgroup key={r.id} label={r.nom}>
              {r.assemblees.map(a => <option key={a.id} value={a.nom}>{a.nom}</option>)}
            </optgroup>
          ))}
        </select>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Du</div>
          <input type="date" style={inputStyle} value={recapDebut} onChange={e => setRecapDebut(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Au</div>
          <input type="date" style={inputStyle} value={recapFin} onChange={e => setRecapFin(e.target.value)} />
        </div>
      </div>

      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "14px 16px" }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
          {recapReports.length} rapport{recapReports.length > 1 ? "s" : ""} pris en compte
          {recapAssemblee === "__pays__" ? ` · ${recapAssembleesCount} assemblée${recapAssembleesCount > 1 ? "s" : ""}` : ""}
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {REPORT_FIELDS.map(f => (
            <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--ink)" }}>{f.label}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
                {f.key === "depensesTotal" ? recapTotals[f.key].toLocaleString("fr-FR") : recapTotals[f.key]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <a
            href={shareWhatsappLink(recapToText(recapTotals, {
              titre: `Récapitulatif — ${recapAssemblee === "__pays__" ? "Tout le pays" : recapAssemblee}`,
              periodeLabel: `Du ${formatDateLong(recapDebut)} au ${formatDateLong(recapFin)}`,
              nbRapports: recapReports.length,
            }))}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "#fff",
              fontSize: 12.5, fontWeight: 700, padding: "9px 0", borderRadius: 9
            }}
          >
            <Send size={13} /> Partager ce récapitulatif par WhatsApp
          </a>
        </div>
      </div>

      {editing && (
        <ReportForm entry={editing} pastors={pastors} seminars={seminars} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ReportForm({ entry, pastors, seminars, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [pasteur, setPasteur] = useState(entry.pasteur || "");
  const [seminarId, setSeminarId] = useState(entry.seminarId || "");
  const [semaine, setSemaine] = useState(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)));
  const [values, setValues] = useState(() => {
    const v = {};
    REPORT_FIELDS.forEach(f => { v[f.key] = entry[f.key] ?? 0; });
    return v;
  });
  const [photos, setPhotos] = useState(entry.photos || []);
  const [videoLien, setVideoLien] = useState(entry.videoLien || "");
  const [uploading, setUploading] = useState(false);

  const assembleePastors = pastors.filter(p => p.assemblee === entry.assemblee);
  const assembleeSeminaires = (seminars || [])
    .filter(s => s.assemblee === entry.assemblee)
    .sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const selectedSeminaire = assembleeSeminaires.find(s => s.id === seminarId);
  const predicateurNoms = selectedSeminaire
    ? (selectedSeminaire.predicateurs || []).map(id => pastors.find(p => p.id === id)?.nom).filter(Boolean)
    : [];
  const MAX_PHOTOS = 4;

  async function handlePhotoChange(e) {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    const room = MAX_PHOTOS - photos.length;
    if (room <= 0) { alert(`Maximum ${MAX_PHOTOS} photos par rapport (pour garder l'application rapide pour tous).`); e.target.value = ""; return; }
    setUploading(true);
    const toProcess = files.slice(0, room);
    for (const file of toProcess) {
      try {
        const dataUrl = await compressImage(file);
        setPhotos(prev => [...prev, { id: uid(), dataUrl }]);
      } catch (err) { console.error("Erreur photo", err); }
    }
    setUploading(false);
    e.target.value = "";
  }
  function removePhoto(id) {
    setPhotos(prev => prev.filter(p => p.id !== id));
  }

  function handleSubmit() {
    onSave({
      id: entry.id || uid(), niveau: "assemblee", assemblee: entry.assemblee, pasteur: pasteur.trim(), semaine: mondayOf(semaine),
      seminarId: seminarId || null, predicateurNoms,
      ...values, photos, videoLien: videoLien.trim(),
    });
  }

  return (
    <ModalShell title={isNew ? "Déposer un rapport" : "Modifier le rapport"} onClose={onClose}>
      <Field label="Programme concerné (facultatif)">
        <select style={inputStyle} value={seminarId} onChange={e => setSeminarId(e.target.value)}>
          <option value="">— Aucun programme précis / non listé —</option>
          {assembleeSeminaires.map(s => (
            <option key={s.id} value={s.id}>{s.type || "Séminaire"} — {s.theme || "(Sans thème)"} — {s.date ? formatDateLong(s.date) : "date à définir"}</option>
          ))}
        </select>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 5, lineHeight: 1.4 }}>
          En choisissant un programme déjà planifié, les prédicateurs affectés sont repris automatiquement ci-dessous.
        </div>
      </Field>

      {seminarId && (
        <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "10px 12px", marginBottom: 13 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 4 }}>
            Ont prêché durant ce programme
          </div>
          {predicateurNoms.length > 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{predicateurNoms.join(", ")}</div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Aucun prédicateur n'était affecté à ce programme.</div>
          )}
        </div>
      )}

      <Field label="Rapport déposé par">
        {assembleePastors.length > 0 ? (
          <select style={inputStyle} value={pasteur} onChange={e => setPasteur(e.target.value)}>
            <option value="">— Sélectionner ou saisir ci-dessous —</option>
            {assembleePastors.map(p => <option key={p.id} value={p.nom}>{p.nom}</option>)}
          </select>
        ) : null}
        <input style={{ ...inputStyle, marginTop: assembleePastors.length > 0 ? 8 : 0 }} value={pasteur} onChange={e => setPasteur(e.target.value)} placeholder="Nom du pasteur" />
      </Field>
      <Field label="Semaine (choisissez un jour de la semaine)">
        <input type="date" style={inputStyle} value={semaine} onChange={e => setSemaine(e.target.value)} />
      </Field>

      {REPORT_FIELDS.map(f => (
        <Field key={f.key} label={f.label}>
          <input
            type="number" inputMode="numeric" style={inputStyle}
            value={values[f.key]}
            onChange={e => setValues({ ...values, [f.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
          />
        </Field>
      ))}

      <Field label={`Photos du séminaire (${photos.length}/${MAX_PHOTOS})`}>
        <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginBottom: 8 }}>
          {photos.map(ph => (
            <div key={ph.id} style={{ position: "relative", width: 62, height: 62 }}>
              <img src={ph.dataUrl} alt="" style={{ width: "100%", height: "100%", objectFit: "cover", borderRadius: 8, border: "1px solid var(--border)" }} />
              <button onClick={() => removePhoto(ph.id)} style={{
                position: "absolute", top: -6, right: -6, background: "var(--danger)", borderRadius: "50%",
                width: 18, height: 18, display: "flex", alignItems: "center", justifyContent: "center"
              }}>
                <X size={11} color="#fff" />
              </button>
            </div>
          ))}
          {photos.length < MAX_PHOTOS && (
            <label style={{
              width: 62, height: 62, borderRadius: 8, border: "1.5px dashed var(--border)",
              display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", color: "var(--ink-soft)"
            }}>
              {uploading ? <span style={{ fontSize: 9 }}>…</span> : <ImageIcon size={20} />}
              <input type="file" accept="image/*" multiple onChange={handlePhotoChange} style={{ display: "none" }} disabled={uploading} />
            </label>
          )}
        </div>
        <div style={{ fontSize: 10.5, color: "var(--ink-soft)", lineHeight: 1.4 }}>
          Les photos sont automatiquement compressées. Maximum {MAX_PHOTOS} par rapport — l'espace de stockage de l'application est partagé entre toutes les assemblées.
        </div>
      </Field>

      <Field label="Lien vidéo (facultatif)">
        <input style={inputStyle} value={videoLien} onChange={e => setVideoLien(e.target.value)} placeholder="Coller un lien YouTube, Google Drive ou WhatsApp…" />
        <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginTop: 5, lineHeight: 1.4 }}>
          Les vidéos sont trop volumineuses pour être stockées directement dans l'application : mettez la vidéo sur YouTube (en non répertorié), Google Drive ou WhatsApp, puis collez le lien de partage ici.
        </div>
      </Field>

      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer le rapport</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce rapport ?")) onDelete(entry.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce rapport
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  FINANCES DES ASSEMBLÉES                                            */
/* ------------------------------------------------------------------ */

// Clés de répartition : Assemblée / District / Coordination / Afrique (en %).
const FIN_SOURCES = [
  { key: "offrandes", label: "Offrandes", parts: [70, 10, 10, 10] },
  { key: "dimes", label: "Dîmes", parts: [20, 25, 35, 20] },
  { key: "bp", label: "Besoin présent (BP)", parts: [20, 25, 35, 20] },
];
// Dons volontaires : 100 % à l'Assemblée.
// Convention : prélevée sur le total général de chaque niveau.
const CONVENTION_PARTS = { assemblee: 10, district: 10, coordination: 20, afrique: 0 };
const FIN_DESTS = [
  { key: "assemblee", label: "Assemblée" },
  { key: "district", label: "District" },
  { key: "coordination", label: "Coordination" },
  { key: "afrique", label: "Afrique" },
];

function fcfa(n) {
  return Math.round(Number(n) || 0).toLocaleString("fr-FR").replace(/[  ]/g, " ") + " F";
}

function computeFinance(r) {
  const res = {
    sources: {}, dv: 0, dvItems: [],
    totaux: { assemblee: 0, district: 0, coordination: 0, afrique: 0, total: 0 },
    convention: { assemblee: 0, district: 0, coordination: 0, afrique: 0, total: 0 },
    apresConvention: { assemblee: 0, district: 0, coordination: 0, afrique: 0, total: 0 },
  };
  FIN_SOURCES.forEach(src => {
    const montant = Number(r[src.key]) || 0;
    const repartition = {};
    FIN_DESTS.forEach((d, i) => {
      repartition[d.key] = Math.round(montant * src.parts[i] / 100);
      res.totaux[d.key] += repartition[d.key];
    });
    res.sources[src.key] = { montant, repartition };
  });
  res.dvItems = (r.dons || []).filter(d => (d.libelle || "").trim() || Number(d.montant) > 0);
  res.dv = res.dvItems.reduce((s, d) => s + (Number(d.montant) || 0), 0);
  res.totaux.assemblee += res.dv; // les dons volontaires vont à 100 % à l'Assemblée
  res.totaux.total = res.totaux.assemblee + res.totaux.district + res.totaux.coordination + res.totaux.afrique;
  FIN_DESTS.forEach(d => {
    res.convention[d.key] = Math.round(res.totaux[d.key] * CONVENTION_PARTS[d.key] / 100);
    res.apresConvention[d.key] = res.totaux[d.key] - res.convention[d.key];
    res.convention.total += res.convention[d.key];
    res.apresConvention.total += res.apresConvention[d.key];
  });
  return res;
}

function weekLabel(monday) {
  if (!monday) return "";
  const a = new Date(monday + "T00:00:00");
  const b = new Date(sundayOf(monday) + "T00:00:00");
  const mois = (d) => d.toLocaleDateString("fr-FR", { month: "long" });
  if (a.getFullYear() !== b.getFullYear()) return `Du ${a.getDate()} ${mois(a)} ${a.getFullYear()} au ${b.getDate()} ${mois(b)} ${b.getFullYear()}`;
  if (a.getMonth() !== b.getMonth()) return `Du ${a.getDate()} ${mois(a)} au ${b.getDate()} ${mois(b)} ${b.getFullYear()}`;
  return `Du ${a.getDate()} au ${b.getDate()} ${mois(b)} ${b.getFullYear()}`;
}

function reportKey(assemblee, semaine) {
  const slug = (assemblee || "").normalize("NFD").replace(/[̀-ͯ]/g, "").toUpperCase().replace(/[^A-Z0-9]+/g, "-");
  return `${slug}_${semaine}`;
}

function financeLines(r) {
  const F = computeFinance(r);
  const L = [];
  FIN_SOURCES.forEach(src => {
    L.push(`🟢 ${src.label.toUpperCase()} : ${fcfa(F.sources[src.key].montant)}`);
    FIN_DESTS.forEach((d, i) => L.push(`${src.parts[i]}% ${d.label} : ${fcfa(F.sources[src.key].repartition[d.key])}`));
    L.push("");
  });
  L.push(`🟢 DONS VOLONTAIRES : ${fcfa(F.dv)} (100% Assemblée)`);
  F.dvItems.forEach((d, i) => L.push(`${i + 1}- ${d.libelle || "Don"} : ${fcfa(d.montant)}`));
  L.push("");
  FIN_DESTS.forEach(d => L.push(`🟢 TOTAL ${d.label} : ${fcfa(F.totaux[d.key])}`));
  L.push(`🟢 TOTAL GÉNÉRAL : ${fcfa(F.totaux.total)}`, "");
  L.push(`🟡 CONVENTION : ${fcfa(F.convention.total)}`);
  FIN_DESTS.forEach(d => L.push(`${CONVENTION_PARTS[d.key]}% ${d.label} : ${fcfa(F.convention[d.key])}`));
  L.push("");
  FIN_DESTS.forEach(d => L.push(`Reste ${d.label} après Convention : ${fcfa(F.apresConvention[d.key])}`));
  return L;
}

function financeToText(r) {
  const L = ["🟢 *Rapport financier hebdomadaire* 🟢", ""];
  if (r.district) L.push(`District de : ${r.district}`);
  L.push(`*Assemblée de : ${r.assemblee}*`, `Date : ${weekLabel(r.semaine)}`);
  if (r.financier) L.push(`Financier : ${r.financier}${r.telephone ? " (" + r.telephone + ")" : ""}`);
  L.push("", ...financeLines(r));
  if (r.observations) L.push("", "*Observations*", r.observations);
  L.push("", "Mission Parole de Vie Burkina");
  return L.join("\n");
}

function numInput(v) {
  return v === "" || v === null || v === undefined ? "" : v;
}

function FinanceSplitTable({ report }) {
  const F = computeFinance(report);
  const cell = { padding: "6px 5px", borderBottom: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
  return (
    <div style={{ overflowX: "auto", background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "4px 8px" }}>
      <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
        <thead>
          <tr style={{ color: "var(--ink-soft)", fontSize: 10.5, textTransform: "uppercase" }}>
            <th style={{ ...cell, textAlign: "left" }}>Source</th>
            {FIN_DESTS.map(d => <th key={d.key} style={cell}>{d.label === "Coordination" ? "Coord." : d.label}</th>)}
          </tr>
        </thead>
        <tbody>
          {FIN_SOURCES.map(src => (
            <tr key={src.key}>
              <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>
                {src.label}
                <div style={{ fontWeight: 400, color: "var(--ink-soft)", fontSize: 10.5 }}>{fcfa(F.sources[src.key].montant)}</div>
              </td>
              {FIN_DESTS.map((d, i) => (
                <td key={d.key} style={cell}>
                  {fcfa(F.sources[src.key].repartition[d.key])}
                  <div style={{ color: "var(--ink-soft)", fontSize: 10 }}>{src.parts[i]}%</div>
                </td>
              ))}
            </tr>
          ))}
          <tr>
            <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>
              Dons vol.
              <div style={{ fontWeight: 400, color: "var(--ink-soft)", fontSize: 10.5 }}>{fcfa(F.dv)}</div>
            </td>
            <td style={cell}>{fcfa(F.dv)}<div style={{ color: "var(--ink-soft)", fontSize: 10 }}>100%</div></td>
            {["district", "coordination", "afrique"].map(k => (
              <td key={k} style={cell}>{fcfa(0)}<div style={{ color: "var(--ink-soft)", fontSize: 10 }}>0%</div></td>
            ))}
          </tr>
          <tr style={{ fontWeight: 700, color: "var(--primary)", background: "#F4F5EE" }}>
            <td style={{ ...cell, textAlign: "left" }}>Total G<div style={{ fontSize: 10.5 }}>{fcfa(F.totaux.total)}</div></td>
            {FIN_DESTS.map(d => <td key={d.key} style={cell}>{fcfa(F.totaux[d.key])}</td>)}
          </tr>
          <tr style={{ color: "var(--accent-dark)" }}>
            <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>Convention<div style={{ fontWeight: 400, fontSize: 10.5 }}>{fcfa(F.convention.total)}</div></td>
            {FIN_DESTS.map(d => (
              <td key={d.key} style={cell}>{fcfa(F.convention[d.key])}<div style={{ fontSize: 10 }}>{CONVENTION_PARTS[d.key]}% du total</div></td>
            ))}
          </tr>
          <tr style={{ fontWeight: 700, color: "#1F7A5C" }}>
            <td style={{ ...cell, textAlign: "left", borderBottom: "none" }}>Reste<div style={{ fontWeight: 400, fontSize: 10.5 }}>après Convention</div></td>
            {FIN_DESTS.map(d => <td key={d.key} style={{ ...cell, borderBottom: "none" }}>{fcfa(F.apresConvention[d.key])}</td>)}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

function FinancesTab({ regions, leadership, financeReports, saveFinance, deleteFinance, expenseReports, saveExpense, deleteExpense, seminars, coordSeminars, seminarReports, unlocked, onUnlock, onLock, showToast }) {
  const allExpenses = useMemo(
    () => [...(expenseReports || []), ...seminarExpenses(seminars, coordSeminars, seminarReports)],
    [expenseReports, seminars, coordSeminars, seminarReports]
  );
  const [subTab, setSubTab] = useState("deposer");
  const [assemblee, setAssemblee] = useState(() => { try { return localStorage.getItem("mpv-fin-assemblee") || ""; } catch (e) { return ""; } });
  const [editing, setEditing] = useState(null);

  function chooseAssemblee(v) {
    setAssemblee(v);
    try { localStorage.setItem("mpv-fin-assemblee", v); } catch (e) {}
  }

  const entries = financeReports
    .filter(r => r.assemblee === assemblee)
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));
  const last = entries[0];

  async function handleSave(entry, replaced) {
    const ok = await saveFinance(entry);
    if (ok) { setEditing(null); showToast(replaced ? "Rapport financier mis à jour" : "Rapport financier déposé"); }
  }
  async function handleDelete(entry) {
    const ok = await deleteFinance(entry);
    if (ok) { setEditing(null); showToast("Rapport financier supprimé"); }
  }

  return (
    <div>
      <SectionTitle sub="Chaque financier d'assemblée dépose ici le rapport financier de la semaine">Finances</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setSubTab("deposer")} style={segButtonStyle(subTab === "deposer")}>Recettes</button>
        <button onClick={() => setSubTab("caisse")} style={segButtonStyle(subTab === "caisse")}>Caisse & dépenses</button>
        <button onClick={() => setSubTab("recap")} style={segButtonStyle(subTab === "recap")}>National</button>
      </div>

      {subTab === "caisse" ? (
        <CaisseTab
          regions={regions} leadership={leadership} assemblee={assemblee} chooseAssemblee={chooseAssemblee}
          financeReports={financeReports} allExpenses={allExpenses}
          saveExpense={saveExpense} deleteExpense={deleteExpense}
          unlocked={unlocked} onUnlock={onUnlock} onLock={onLock} showToast={showToast}
        />
      ) : subTab === "deposer" ? (
        <>
          <Field label="Mon assemblée">
            <AssembleeSelect regions={regions} value={assemblee} onChange={chooseAssemblee} />
          </Field>

          {assemblee && (
            <>
              <PrimaryButton full icon={Plus} onClick={() => setEditing({
                assemblee, semaine: mondayOf(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)),
                district: last?.district || "", financier: last?.financier || "", telephone: last?.telephone || "",
                offrandes: "", dimes: "", bp: "", dons: [], observations: "",
              })}>Nouveau rapport financier</PrimaryButton>

              <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: "18px 0 10px" }}>Rapports déposés par {assemblee}</div>
              {entries.length === 0 ? (
                <EmptyState icon={Wallet} text={`Aucun rapport financier déposé pour ${assemblee}.`} />
              ) : (
                <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
                  {entries.map(r => {
                    const F = computeFinance(r);
                    return (
                      <div key={r.id} onClick={() => setEditing(r)} style={{
                        background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                        borderLeft: "4px solid #1F7A5C", cursor: "pointer"
                      }}>
                        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "baseline", gap: 8 }}>
                          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)" }}>{weekLabel(r.semaine)}</div>
                          <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "#1F7A5C" }}>{fcfa(F.totaux.total)}</div>
                        </div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>
                          {r.financier ? `Déposé par ${r.financier}` : "Financier non renseigné"}
                        </div>
                        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "4px 10px", marginTop: 8 }}>
                          {FIN_DESTS.map(d => (
                            <div key={d.key} style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "flex", justifyContent: "space-between" }}>
                              <span>{d.label}</span><span style={{ fontWeight: 700, color: "var(--ink)" }}>{fcfa(F.totaux[d.key])}</span>
                            </div>
                          ))}
                        </div>
                        <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                          <a href={shareWhatsappLink(financeToText(r))} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                            display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                            fontSize: 11.5, fontWeight: 700, padding: "6px 10px", borderRadius: 8
                          }}>
                            <Send size={12} /> Partager par WhatsApp
                          </a>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </>
          )}
        </>
      ) : (
        <FinanceRecap regions={regions} leadership={leadership} financeReports={financeReports} allExpenses={allExpenses} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock} />
      )}

      {editing && (
        <FinanceForm entry={editing} financeReports={financeReports} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function FinanceForm({ entry, financeReports, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [f, setF] = useState(() => ({
    district: entry.district || "", financier: entry.financier || "", telephone: entry.telephone || "",
    semaine: entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)),
    offrandes: numInput(entry.offrandes), dimes: numInput(entry.dimes), bp: numInput(entry.bp),
    dons: (entry.dons || []).map(d => ({ ...d })), observations: entry.observations || "",
  }));
  const [saving, setSaving] = useState(false);
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [error, setError] = useState("");

  const semaine = mondayOf(f.semaine);
  const id = reportKey(entry.assemblee, semaine);
  const existing = financeReports.find(r => r.id === id && r.id !== entry.id);
  const preview = { ...f, assemblee: entry.assemblee, semaine };
  const F = computeFinance(preview);

  function set(k, v) { setF(prev => ({ ...prev, [k]: v })); setConfirmReplace(false); setError(""); }
  function setDon(i, k, v) { setF(prev => ({ ...prev, dons: prev.dons.map((d, j) => j === i ? { ...d, [k]: v } : d) })); }

  async function handleSubmit() {
    if (!f.semaine) { setError("Choisissez la semaine du rapport."); return; }
    if (F.totaux.total <= 0) { setError("Saisissez au moins un montant reçu."); return; }
    if (existing && !confirmReplace) { setConfirmReplace(true); return; }
    setSaving(true);
    const toNum = (v) => Number(v) || 0;
    if (entry.id && entry.id !== id) await onDelete(entry);
    await onSave({
      id, assemblee: entry.assemblee, semaine,
      district: f.district.trim(), financier: f.financier.trim(), telephone: f.telephone.trim(),
      offrandes: toNum(f.offrandes), dimes: toNum(f.dimes), bp: toNum(f.bp),
      dons: F.dvItems.map(d => ({ libelle: (d.libelle || "").trim(), montant: toNum(d.montant) })),
      observations: f.observations.trim(), totaux: F.totaux,
      deposeLe: new Date().toISOString(),
    }, !!existing || !isNew);
    setSaving(false);
  }

  const moneyInput = (k, label) => (
    <Field label={label}>
      <input type="number" inputMode="numeric" min="0" style={inputStyle} value={f[k]} placeholder="0" onChange={e => set(k, e.target.value)} />
    </Field>
  );

  return (
    <ModalShell title={isNew ? `Rapport financier — ${entry.assemblee}` : `Modifier — ${entry.assemblee}`} onClose={onClose}>
      <Field label="Semaine (choisissez un jour de la semaine)">
        <input type="date" style={inputStyle} value={f.semaine} onChange={e => set("semaine", e.target.value)} />
        {f.semaine && <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 5 }}>{weekLabel(semaine)}</div>}
      </Field>
      <Field label="District de">
        <input style={inputStyle} value={f.district} onChange={e => set("district", e.target.value)} placeholder="Ex. Hauts-Bassins" />
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1.3 }}>
          <Field label="Nom du financier">
            <input style={inputStyle} value={f.financier} onChange={e => set("financier", e.target.value)} placeholder="Prénom et nom" />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Téléphone">
            <input style={inputStyle} inputMode="tel" value={f.telephone} onChange={e => set("telephone", e.target.value)} placeholder="70 00 00 00" />
          </Field>
        </div>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, color: "var(--primary)", margin: "4px 0 10px" }}>Montants reçus (FCFA)</div>
      {moneyInput("offrandes", "Offrandes")}
      {moneyInput("dimes", "Dîmes")}
      {moneyInput("bp", "BP")}

      <Field label="Dons volontaires (DV) — ils restent à 100 % à l'Assemblée">
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {f.dons.map((d, i) => (
            <div key={i} style={{ display: "flex", gap: 6, alignItems: "center" }}>
              <input style={{ ...inputStyle, flex: 1.5 }} value={d.libelle || ""} onChange={e => setDon(i, "libelle", e.target.value)} placeholder="Ex. Convention 2027" />
              <input style={{ ...inputStyle, flex: 1 }} type="number" inputMode="numeric" min="0" value={numInput(d.montant)} onChange={e => setDon(i, "montant", e.target.value)} placeholder="Montant" />
              <button onClick={() => setF(prev => ({ ...prev, dons: prev.dons.filter((_, j) => j !== i) }))} style={{ padding: 6 }} aria-label="Retirer ce don">
                <Trash2 size={16} color="var(--danger)" />
              </button>
            </div>
          ))}
          <button onClick={() => setF(prev => ({ ...prev, dons: [...prev.dons, { libelle: "", montant: "" }] }))} style={{
            alignSelf: "flex-start", border: "1.5px dashed var(--border)", borderRadius: 9, padding: "7px 12px",
            fontSize: 12.5, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 5
          }}>
            <Plus size={13} /> Ajouter un don volontaire
          </button>
        </div>
      </Field>

      <Field label="Répartition calculée automatiquement">
        <FinanceSplitTable report={preview} />
      </Field>

      <Field label="Observations (facultatif)">
        <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={f.observations} onChange={e => set("observations", e.target.value)} />
      </Field>

      {error && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 10 }}>{error}</div>}
      {confirmReplace && (
        <div style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", fontSize: 12.5, fontWeight: 600, borderRadius: 9, padding: "9px 11px", marginBottom: 10, lineHeight: 1.4 }}>
          Un rapport de {entry.assemblee} existe déjà pour cette semaine ({fcfa(existing?.totaux?.total)}). Appuyez encore pour le remplacer.
        </div>
      )}

      <PrimaryButton onClick={saving ? undefined : handleSubmit} icon={Check} full>
        {saving ? "Enregistrement…" : confirmReplace ? "Remplacer le rapport existant" : isNew ? "Déposer le rapport" : "Enregistrer les modifications"}
      </PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce rapport financier ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce rapport
        </button>
      )}
    </ModalShell>
  );
}

function FinanceRecap({ regions, leadership, financeReports, allExpenses, unlocked, onUnlock, onLock }) {
  const semaines = [...new Set(financeReports.map(r => r.semaine))].sort().reverse();
  const [semaine, setSemaine] = useState(semaines[0] || "");
  const [ouvert, setOuvert] = useState(null);
  const current = semaine && semaines.includes(semaine) ? semaine : (semaines[0] || "");

  const lock = (
    <CoordLockPanel
      leadership={leadership} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock}
      description="Le récapitulatif des finances de toutes les assemblées est réservé au chef du département. Chaque financier dépose et consulte les rapports de son assemblée dans « Déposer un rapport »."
    />
  );
  if (!unlocked) return lock;

  const list = financeReports.filter(r => r.semaine === current).sort((a, b) => (a.assemblee || "").localeCompare(b.assemblee || ""));
  const T = { assemblee: 0, district: 0, coordination: 0, afrique: 0, total: 0 };
  const C = { assemblee: 0, district: 0, coordination: 0, afrique: 0, total: 0 };
  list.forEach(r => {
    const F = computeFinance(r);
    Object.keys(T).forEach(k => { T[k] += F.totaux[k]; C[k] += F.convention[k]; });
  });
  const toutes = flattenAssemblees(regions);
  const deposees = new Set(list.map(r => r.assemblee));
  const manquantes = toutes.filter(a => !deposees.has(a));

  const recapText = [
    "📊 *Récapitulatif financier national*",
    weekLabel(current),
    `${list.length} rapport(s) sur ${toutes.length} assemblées`,
    "",
    ...list.map(r => `• ${r.assemblee} : ${fcfa(computeFinance(r).totaux.total)}`),
    "",
    ...FIN_DESTS.map(d => `🟢 TOTAL ${d.label} : ${fcfa(T[d.key])}`),
    `🟢 TOTAL GÉNÉRAL : ${fcfa(T.total)}`,
    "",
    `🟡 CONVENTION : ${fcfa(C.total)}`,
    ...FIN_DESTS.map(d => `${d.label} (${CONVENTION_PARTS[d.key]}%) : ${fcfa(C[d.key])}`),
    ...(manquantes.length ? ["", `Rapports manquants : ${manquantes.join(", ")}`] : []),
    "", "Mission Parole de Vie Burkina",
  ].join("\n");

  return (
    <div>
      {lock}
      {semaines.length === 0 ? (
        <EmptyState icon={Wallet} text="Aucun rapport financier n'a encore été déposé." />
      ) : (
        <>
          <Field label="Semaine">
            <select style={inputStyle} value={current} onChange={e => setSemaine(e.target.value)}>
              {semaines.map(s => <option key={s} value={s}>{weekLabel(s)}</option>)}
            </select>
          </Field>

          <div style={{ background: "var(--primary)", color: "#fff", borderRadius: 14, padding: "14px 16px", marginBottom: 10 }}>
            <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", opacity: .8, fontWeight: 700 }}>Total reçu cette semaine</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginTop: 2 }}>{fcfa(T.total)}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>{list.length} rapport{list.length > 1 ? "s" : ""} sur {toutes.length} assemblées · Convention : {fcfa(C.total)}</div>
          </div>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 12 }}>
            {FIN_DESTS.map(d => (
              <div key={d.key} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "9px 11px" }}>
                <div style={{ fontSize: 10.5, textTransform: "uppercase", color: "var(--ink-soft)", fontWeight: 700 }}>{d.label}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{fcfa(T[d.key])}</div>
                <div style={{ fontSize: 11, color: "var(--accent-dark)", marginTop: 2 }}>Convention : {fcfa(C[d.key])}</div>
              </div>
            ))}
          </div>

          {manquantes.length > 0 ? (
            <div style={{ background: "#fff", border: "1px solid var(--border)", borderLeft: "4px solid var(--danger)", borderRadius: 11, padding: "10px 12px", marginBottom: 12, fontSize: 12.5, lineHeight: 1.45 }}>
              <div style={{ fontWeight: 700, color: "var(--danger)", marginBottom: 3 }}>{manquantes.length} assemblée{manquantes.length > 1 ? "s" : ""} sans rapport</div>
              {manquantes.join(", ")}
            </div>
          ) : (
            <div style={{ fontSize: 12.5, color: "#1F7A5C", fontWeight: 700, marginBottom: 12 }}>Toutes les assemblées ont déposé leur rapport.</div>
          )}

          <CaissesOverview regions={regions} financeReports={financeReports} allExpenses={allExpenses} />

          <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 14 }}>
            {list.map(r => {
              const F = computeFinance(r);
              const open = ouvert === r.id;
              return (
                <div key={r.id} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 11 }}>
                  <button onClick={() => setOuvert(open ? null : r.id)} style={{ width: "100%", display: "flex", justifyContent: "space-between", alignItems: "center", padding: "10px 12px", textAlign: "left" }}>
                    <div>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--primary)" }}>{r.assemblee}</div>
                      <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{r.financier || "Financier non renseigné"}{r.telephone ? ` · ${r.telephone}` : ""}</div>
                    </div>
                    <div style={{ fontWeight: 700, color: "#1F7A5C", fontVariantNumeric: "tabular-nums" }}>{fcfa(F.totaux.total)}</div>
                  </button>
                  {open && (
                    <div style={{ padding: "0 12px 12px" }}>
                      <FinanceSplitTable report={r} />
                      {F.dvItems.length > 0 && (
                        <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink)" }}>
                          {F.dvItems.map((d, i) => <div key={i}>{d.libelle || "Don"} : {fcfa(d.montant)}</div>)}
                        </div>
                      )}
                      {r.observations && <div style={{ fontSize: 12, marginTop: 8, color: "var(--ink-soft)" }}>{r.observations}</div>}
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          <a href={shareWhatsappLink(recapText)} target="_blank" rel="noopener noreferrer" style={{
            display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "#fff",
            fontSize: 12.5, fontWeight: 700, padding: "10px 0", borderRadius: 9
          }}>
            <Send size={13} /> Partager ce récapitulatif par WhatsApp
          </a>
        </>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CAISSE & DÉPENSES                                                  */
/* ------------------------------------------------------------------ */

const EXPENSE_CATS = [
  "Séminaire", "Transport", "Hébergement", "Restauration", "Sonorisation & salle",
  "Lieu de culte / loyer", "Travaux & entretien", "Social / aide", "Fonctionnement", "Divers",
];
const EXPENSE_STATUTS = {
  previsionnel: { label: "Prévue", tone: "var(--accent-dark)", bg: "var(--accent-soft)" },
  reel: { label: "Effectuée", tone: "var(--danger)", bg: "#F5E4E4" },
};

// Dépenses envoyées automatiquement par les séminaires et programmes :
// - le budget d'un séminaire compte comme dépense prévue ;
// - dès qu'un rapport de séminaire déclare des dépenses, elles deviennent réelles.
function seminarExpenses(seminars, coordSeminars, seminarReports) {
  const out = [];
  const reelParSeminaire = {};
  (seminarReports || []).forEach(r => {
    const m = Number(r.depensesTotal) || 0;
    if (m <= 0) return;
    if (r.seminarId) {
      reelParSeminaire[r.seminarId] = (reelParSeminaire[r.seminarId] || 0) + m;
    } else {
      const coord = (r.niveau || "assemblee") === "coordination";
      out.push({
        id: `auto-rap-${r.id}`, auto: true, statut: "reel", niveau: coord ? "coordination" : "assemblee",
        assemblee: coord ? "" : r.assemblee, date: r.semaine, categorie: "Séminaire", montant: m,
        libelle: `Dépenses déclarées — rapport de la semaine du ${formatDateLong(r.semaine)}`,
      });
    }
  });
  const fromSeminar = (s, niveau) => {
    if ((s.validationStatut || "attente") === "rejete") return;
    const prevu = budgetTotal(s.budget);
    const reel = reelParSeminaire[s.id] || 0;
    if (reel <= 0 && prevu <= 0) return;
    out.push({
      id: `auto-sem-${s.id}`, auto: true, niveau, assemblee: niveau === "coordination" ? "" : s.assemblee,
      date: s.date || "", categorie: "Séminaire",
      statut: reel > 0 ? "reel" : "previsionnel", montant: reel > 0 ? reel : prevu, budgetPrevu: prevu,
      libelle: `${s.type || "Séminaire"} — ${s.theme || "sans thème"}`,
    });
  };
  (seminars || []).forEach(s => fromSeminar(s, "assemblee"));
  (coordSeminars || []).forEach(s => fromSeminar(s, "coordination"));
  return out;
}

function computeCaisse(niveau, assemblee, financeReports, allExpenses) {
  const recettesList = (financeReports || [])
    .filter(r => niveau === "coordination" || r.assemblee === assemblee)
    .map(r => ({ id: `rec-${r.id}`, semaine: r.semaine, assemblee: r.assemblee, montant: computeFinance(r).apresConvention[niveau === "coordination" ? "coordination" : "assemblee"] }));
  const depenses = (allExpenses || []).filter(e => e.niveau === niveau && (niveau === "coordination" || e.assemblee === assemblee));
  const recettes = recettesList.reduce((s, r) => s + r.montant, 0);
  const reel = depenses.filter(e => e.statut === "reel").reduce((s, e) => s + (Number(e.montant) || 0), 0);
  const prevu = depenses.filter(e => e.statut !== "reel").reduce((s, e) => s + (Number(e.montant) || 0), 0);
  const solde = recettes - reel;
  return { recettes, reel, prevu, solde, disponible: solde - prevu, recettesList, depenses };
}

function caisseToText(titre, c) {
  return [
    `💰 *Caisse — ${titre}*`,
    `Au ${formatDateLong(new Date().toISOString().slice(0, 10))}`,
    "",
    `Recettes (reste après Convention) : ${fcfa(c.recettes)}`,
    `Dépenses effectuées : ${fcfa(c.reel)}`,
    `${c.solde < 0 ? "🔴" : "🟢"} Solde en caisse : ${fcfa(c.solde)}`,
    `Dépenses prévues : ${fcfa(c.prevu)}`,
    `${c.disponible < 0 ? "🔴 DÉPASSEMENT" : "🟢 Disponible"} : ${fcfa(c.disponible)}`,
    "", "Mission Parole de Vie Burkina",
  ].join("\n");
}

function CaisseCard({ titre, c }) {
  const rouge = c.solde < 0;
  const depasse = c.disponible < 0;
  const engage = c.reel + c.prevu;
  const pct = c.recettes > 0 ? Math.min(100, Math.round(engage / c.recettes * 100)) : (engage > 0 ? 100 : 0);
  const row = (label, val, color) => (
    <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12.5, padding: "5px 0", borderBottom: "1px solid var(--border)" }}>
      <span style={{ color: "var(--ink-soft)" }}>{label}</span>
      <span style={{ fontWeight: 700, color: color || "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{val}</span>
    </div>
  );
  return (
    <div style={{ background: "#fff", border: `1.5px solid ${rouge || depasse ? "var(--danger)" : "var(--border)"}`, borderRadius: 14, overflow: "hidden", marginBottom: 14 }}>
      <div style={{ background: rouge ? "var(--danger)" : "var(--primary)", color: "#fff", padding: "13px 15px" }}>
        <div style={{ fontSize: 11, textTransform: "uppercase", letterSpacing: ".06em", opacity: .85, fontWeight: 700 }}>
          {rouge ? "Caisse en rouge" : "Solde en caisse"} · {titre}
        </div>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 26, fontWeight: 700, marginTop: 2, fontVariantNumeric: "tabular-nums" }}>{fcfa(c.solde)}</div>
      </div>
      <div style={{ padding: "10px 15px 13px" }}>
        {row("Recettes (reste après Convention)", fcfa(c.recettes), "#1F7A5C")}
        {row("Dépenses effectuées", "− " + fcfa(c.reel), "var(--danger)")}
        {row("Dépenses prévues (réservées)", "− " + fcfa(c.prevu), "var(--accent-dark)")}
        <div style={{
          display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: 9, padding: "9px 11px", borderRadius: 10,
          background: depasse ? "#F5E4E4" : "#E3F1EA", color: depasse ? "var(--danger)" : "#1F7A5C"
        }}>
          <span style={{ fontSize: 12.5, fontWeight: 700, display: "flex", alignItems: "center", gap: 5 }}>
            {depasse ? <AlertTriangle size={14} /> : <CheckCircle2 size={14} />}
            {depasse ? "Dépassement du budget" : "Reste disponible à ne pas dépasser"}
          </span>
          <span style={{ fontSize: 15, fontWeight: 800, fontVariantNumeric: "tabular-nums" }}>{fcfa(c.disponible)}</span>
        </div>
        <div style={{ marginTop: 10 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 11, color: "var(--ink-soft)", marginBottom: 4 }}>
            <span>Part des recettes engagée</span><span>{c.recettes > 0 ? `${Math.round(engage / c.recettes * 100)} %` : "—"}</span>
          </div>
          <div style={{ height: 7, background: "var(--border)", borderRadius: 99, overflow: "hidden" }}>
            <div style={{ width: `${pct}%`, height: "100%", background: depasse ? "var(--danger)" : pct > 85 ? "var(--accent)" : "#1F7A5C" }} />
          </div>
        </div>
      </div>
    </div>
  );
}

function CaisseTab({ regions, leadership, assemblee, chooseAssemblee, financeReports, allExpenses, saveExpense, deleteExpense, unlocked, onUnlock, onLock, showToast }) {
  const [niveau, setNiveau] = useState("assemblee");
  const [editing, setEditing] = useState(null);
  const [filtre, setFiltre] = useState("tout");

  const coord = niveau === "coordination";
  const titre = coord ? "Coordination nationale" : assemblee;
  const ready = coord ? unlocked : !!assemblee;
  const c = ready ? computeCaisse(niveau, assemblee, financeReports, allExpenses) : null;

  async function handleSave(entry) {
    const ok = await saveExpense(entry);
    if (ok) { setEditing(null); showToast(entry.statut === "reel" ? "Dépense enregistrée" : "Dépense prévue enregistrée"); }
  }
  async function handleDelete(entry) {
    const ok = await deleteExpense(entry);
    if (ok) { setEditing(null); showToast("Dépense supprimée"); }
  }

  const mouvements = c ? [
    ...c.recettesList.map(r => ({ ...r, type: "recette", date: r.semaine })),
    ...c.depenses.map(e => ({ ...e, type: "depense" })),
  ].filter(m => filtre === "tout" || (filtre === "recettes" ? m.type === "recette" : filtre === "prevues" ? (m.type === "depense" && m.statut !== "reel") : (m.type === "depense" && m.statut === "reel")))
    .sort((a, b) => (b.date || "").localeCompare(a.date || "")) : [];

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["assemblee", "Caisse assemblée"], ["coordination", "Caisse coordination"]].map(([k, l]) => (
          <button key={k} onClick={() => setNiveau(k)} style={{
            flex: 1, padding: "8px 0", borderRadius: 9, fontSize: 12, fontWeight: 700,
            border: `1.5px solid ${niveau === k ? "var(--primary)" : "var(--border)"}`,
            background: niveau === k ? "var(--primary)" : "#fff", color: niveau === k ? "#fff" : "var(--ink-soft)"
          }}>{l}</button>
        ))}
      </div>

      {coord ? (
        <CoordLockPanel
          leadership={leadership} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock}
          description="La caisse de la coordination nationale est réservée au chef du département : elle reçoit la part Coordination (après Convention) de toutes les assemblées."
        />
      ) : (
        <Field label="Mon assemblée">
          <AssembleeSelect regions={regions} value={assemblee} onChange={chooseAssemblee} />
        </Field>
      )}

      {c && (
        <>
          <CaisseCard titre={titre} c={c} />

          <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
            <div style={{ flex: 1 }}>
              <PrimaryButton full icon={Plus} onClick={() => setEditing({
                niveau, assemblee: coord ? "" : assemblee, statut: "reel",
                date: new Date().toISOString().slice(0, 10), categorie: "Divers", libelle: "", montant: "", beneficiaire: "", observations: "",
              })}>Ajouter une dépense</PrimaryButton>
            </div>
            <a href={shareWhatsappLink(caisseToText(titre, c))} target="_blank" rel="noopener noreferrer" aria-label="Partager la caisse par WhatsApp" style={{
              background: "#25D366", color: "#fff", borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center"
            }}>
              <Send size={16} />
            </a>
          </div>

          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", marginBottom: 8 }}>Mouvements de caisse</div>
          <div style={{ display: "flex", gap: 6, marginBottom: 10, overflowX: "auto" }}>
            {[["tout", "Tout"], ["recettes", "Recettes"], ["reelles", "Effectuées"], ["prevues", "Prévues"]].map(([k, l]) => (
              <button key={k} onClick={() => setFiltre(k)} style={{
                flex: "0 0 auto", padding: "5px 11px", borderRadius: 99, fontSize: 11.5, fontWeight: 700,
                border: "1px solid var(--border)", background: filtre === k ? "var(--ink)" : "#fff", color: filtre === k ? "#fff" : "var(--ink-soft)"
              }}>{l}</button>
            ))}
          </div>

          {mouvements.length === 0 ? (
            <EmptyState icon={Wallet} text="Aucun mouvement pour le moment." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
              {mouvements.map(m => {
                if (m.type === "recette") {
                  return (
                    <div key={m.id} style={{ background: "#fff", border: "1px solid var(--border)", borderLeft: "4px solid #1F7A5C", borderRadius: 11, padding: "9px 12px", display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div>
                        <div style={{ fontSize: 12.5, fontWeight: 700 }}>Recette de la semaine{coord ? ` — ${m.assemblee}` : ""}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{weekLabel(m.semaine)}</div>
                      </div>
                      <div style={{ fontWeight: 700, color: "#1F7A5C", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>+ {fcfa(m.montant)}</div>
                    </div>
                  );
                }
                const st = EXPENSE_STATUTS[m.statut === "reel" ? "reel" : "previsionnel"];
                return (
                  <div key={m.id} onClick={() => !m.auto && setEditing(m)} style={{
                    background: "#fff", border: "1px solid var(--border)", borderLeft: `4px solid ${st.tone}`, borderRadius: 11,
                    padding: "9px 12px", cursor: m.auto ? "default" : "pointer"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 10 }}>
                      <div style={{ minWidth: 0 }}>
                        <div style={{ fontSize: 12.5, fontWeight: 700 }}>{m.libelle || m.categorie}</div>
                        <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>
                          {m.date ? formatDateLong(m.date) : "Date à définir"} · {m.categorie}{m.beneficiaire ? ` · ${m.beneficiaire}` : ""}
                        </div>
                      </div>
                      <div style={{ fontWeight: 700, color: st.tone, whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" }}>− {fcfa(m.montant)}</div>
                    </div>
                    <div style={{ display: "flex", gap: 6, marginTop: 6, flexWrap: "wrap" }}>
                      <span style={{ fontSize: 10.5, fontWeight: 700, color: st.tone, background: st.bg, borderRadius: 99, padding: "2px 8px" }}>{st.label}</span>
                      {m.auto && (
                        <span style={{ fontSize: 10.5, fontWeight: 700, color: "var(--primary)", background: "#E6E9F2", borderRadius: 99, padding: "2px 8px" }}>
                          Automatique · depuis {m.id.startsWith("auto-sem") ? "le séminaire" : "le rapport"}
                        </span>
                      )}
                      {m.auto && m.statut === "reel" && m.budgetPrevu > 0 && (
                        <span style={{ fontSize: 10.5, color: m.montant > m.budgetPrevu ? "var(--danger)" : "var(--ink-soft)", fontWeight: 600 }}>
                          Budget prévu : {fcfa(m.budgetPrevu)}{m.montant > m.budgetPrevu ? " — dépassé" : ""}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 12, lineHeight: 1.45 }}>
            Les dépenses des séminaires arrivent toutes seules : le budget du séminaire est compté comme dépense prévue, puis remplacé par les dépenses réelles dès que le rapport du séminaire est déposé.
          </div>
        </>
      )}

      {editing && c && (
        <ExpenseForm entry={editing} caisse={c} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function ExpenseForm({ entry, caisse, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [e, setE] = useState({
    statut: entry.statut || "reel", date: entry.date || "", categorie: entry.categorie || "Divers",
    libelle: entry.libelle || "", montant: numInput(entry.montant), beneficiaire: entry.beneficiaire || "", observations: entry.observations || "",
  });
  const [confirmDepassement, setConfirmDepassement] = useState(false);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const set = (k, v) => { setE(prev => ({ ...prev, [k]: v })); setConfirmDepassement(false); setError(""); };

  // Disponible sans compter cette dépense (si on la modifie).
  const ancien = isNew ? 0 : (Number(entry.montant) || 0);
  const disponibleAvant = caisse.disponible + ancien;
  const montant = Number(e.montant) || 0;
  const apres = disponibleAvant - montant;
  const depasse = montant > 0 && apres < 0;

  async function handleSubmit() {
    if (!e.libelle.trim()) { setError("Indiquez l'objet de la dépense."); return; }
    if (montant <= 0) { setError("Indiquez le montant de la dépense."); return; }
    if (depasse && !confirmDepassement) { setConfirmDepassement(true); return; }
    setSaving(true);
    await onSave({
      id: entry.id || uid(), niveau: entry.niveau, assemblee: entry.assemblee || "",
      statut: e.statut, date: e.date, categorie: e.categorie, libelle: e.libelle.trim(), montant,
      beneficiaire: e.beneficiaire.trim(), observations: e.observations.trim(),
      creeLe: entry.creeLe || new Date().toISOString(), modifieLe: new Date().toISOString(),
    });
    setSaving(false);
  }

  return (
    <ModalShell title={isNew ? "Nouvelle dépense" : "Modifier la dépense"} onClose={onClose}>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
        {entry.niveau === "coordination" ? "Caisse de la coordination nationale" : `Caisse de ${entry.assemblee}`}
      </div>

      <Field label="Type de dépense">
        <div style={{ display: "flex", gap: 6 }}>
          {[["previsionnel", "Prévue (à réserver)"], ["reel", "Effectuée (payée)"]].map(([k, l]) => (
            <button key={k} onClick={() => set("statut", k)} style={{
              flex: 1, padding: "9px 0", borderRadius: 9, fontSize: 12.5, fontWeight: 700,
              border: `1.5px solid ${e.statut === k ? EXPENSE_STATUTS[k].tone : "var(--border)"}`,
              background: e.statut === k ? EXPENSE_STATUTS[k].bg : "#fff", color: e.statut === k ? EXPENSE_STATUTS[k].tone : "var(--ink-soft)"
            }}>{l}</button>
          ))}
        </div>
      </Field>
      <Field label="Objet de la dépense">
        <input style={inputStyle} value={e.libelle} onChange={ev => set("libelle", ev.target.value)} placeholder="Ex. Acompte pour le lieu de culte" />
      </Field>
      <Field label="Catégorie">
        <select style={inputStyle} value={e.categorie} onChange={ev => set("categorie", ev.target.value)}>
          {EXPENSE_CATS.map(cat => <option key={cat}>{cat}</option>)}
        </select>
      </Field>
      <div style={{ display: "flex", gap: 8 }}>
        <div style={{ flex: 1 }}>
          <Field label="Montant (FCFA)">
            <input type="number" inputMode="numeric" min="0" style={inputStyle} value={e.montant} onChange={ev => set("montant", ev.target.value)} placeholder="0" />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label={e.statut === "reel" ? "Date du paiement" : "Date prévue"}>
            <input type="date" style={inputStyle} value={e.date} onChange={ev => set("date", ev.target.value)} />
          </Field>
        </div>
      </div>
      <Field label="Payé à / bénéficiaire (facultatif)">
        <input style={inputStyle} value={e.beneficiaire} onChange={ev => set("beneficiaire", ev.target.value)} />
      </Field>
      <Field label="Observations (facultatif)">
        <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={e.observations} onChange={ev => set("observations", ev.target.value)} />
      </Field>

      <div style={{
        borderRadius: 10, padding: "9px 11px", marginBottom: 12, fontSize: 12.5, lineHeight: 1.45,
        background: depasse ? "#F5E4E4" : "#F4F5EE", color: depasse ? "var(--danger)" : "var(--ink)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Disponible avant cette dépense</span><b>{fcfa(disponibleAvant)}</b></div>
        <div style={{ display: "flex", justifyContent: "space-between" }}><span>Disponible après</span><b>{fcfa(apres)}</b></div>
        {depasse && <div style={{ fontWeight: 700, marginTop: 5 }}>Cette dépense dépasse le reste disponible de {fcfa(-apres)}. La caisse passera en rouge.</div>}
      </div>

      {error && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 10 }}>{error}</div>}
      {confirmDepassement && (
        <div style={{ background: "var(--danger)", color: "#fff", fontSize: 12.5, fontWeight: 600, borderRadius: 9, padding: "9px 11px", marginBottom: 10 }}>
          Confirmez-vous ce dépassement ? Appuyez encore pour l'enregistrer quand même.
        </div>
      )}
      <PrimaryButton onClick={saving ? undefined : handleSubmit} icon={Check} full>
        {saving ? "Enregistrement…" : confirmDepassement ? "Enregistrer malgré le dépassement" : isNew ? "Enregistrer la dépense" : "Enregistrer les modifications"}
      </PrimaryButton>
      {!isNew && entry.statut !== "reel" && e.statut !== "reel" && (
        <button onClick={() => set("statut", "reel")} style={{
          width: "100%", marginTop: 10, color: "var(--primary)", fontSize: 13, fontWeight: 700, padding: 8,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5
        }}>
          <CheckCircle2 size={14} /> Marquer comme effectuée
        </button>
      )}
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette dépense ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 6, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer cette dépense
        </button>
      )}
    </ModalShell>
  );
}

function CaissesOverview({ regions, financeReports, allExpenses }) {
  const coord = computeCaisse("coordination", "", financeReports, allExpenses);
  const rows = flattenAssemblees(regions)
    .map(a => ({ nom: a, c: computeCaisse("assemblee", a, financeReports, allExpenses) }))
    .filter(x => x.c.recettes || x.c.reel || x.c.prevu)
    .sort((a, b) => a.c.disponible - b.c.disponible);
  const enRouge = rows.filter(x => x.c.solde < 0 || x.c.disponible < 0);

  return (
    <div style={{ marginBottom: 16 }}>
      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: "4px 0 10px" }}>Caisses (depuis le début)</div>
      <CaisseCard titre="Coordination nationale" c={coord} />
      {enRouge.length > 0 && (
        <div style={{ background: "#F5E4E4", color: "var(--danger)", borderRadius: 10, padding: "9px 11px", fontSize: 12.5, fontWeight: 700, marginBottom: 10 }}>
          {enRouge.length} caisse{enRouge.length > 1 ? "s" : ""} en rouge ou en dépassement : {enRouge.map(x => x.nom).join(", ")}
        </div>
      )}
      {rows.length > 0 && (
        <div style={{ overflowX: "auto", background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "4px 8px" }}>
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5, fontVariantNumeric: "tabular-nums" }}>
            <thead>
              <tr style={{ color: "var(--ink-soft)", fontSize: 10.5, textTransform: "uppercase" }}>
                {["Assemblée", "Solde", "Prévu", "Disponible"].map((h, i) => (
                  <th key={h} style={{ padding: "6px 5px", textAlign: i ? "right" : "left", borderBottom: "1px solid var(--border)" }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map(({ nom, c }) => (
                <tr key={nom} style={{ background: c.solde < 0 ? "#F5E4E4" : "transparent" }}>
                  <td style={{ padding: "6px 5px", fontWeight: 700, borderBottom: "1px solid var(--border)" }}>{nom}</td>
                  <td style={{ padding: "6px 5px", textAlign: "right", borderBottom: "1px solid var(--border)", color: c.solde < 0 ? "var(--danger)" : "var(--ink)", fontWeight: c.solde < 0 ? 700 : 400 }}>{fcfa(c.solde)}</td>
                  <td style={{ padding: "6px 5px", textAlign: "right", borderBottom: "1px solid var(--border)", color: "var(--accent-dark)" }}>{fcfa(c.prevu)}</td>
                  <td style={{ padding: "6px 5px", textAlign: "right", borderBottom: "1px solid var(--border)", fontWeight: 700, color: c.disponible < 0 ? "var(--danger)" : "#1F7A5C" }}>{fcfa(c.disponible)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  RAPPORT HEBDOMADAIRE D'ACTIVITÉS (modèle complet par assemblée)     */
/* ------------------------------------------------------------------ */

const PRESENCE_CATS = [
  { key: "hommes", label: "Hommes" },
  { key: "femmes", label: "Femmes" },
  { key: "jeunes", label: "Jeunes" },
  { key: "plusJeunes", label: "Plus jeunes" },
];

function emptyPresence() { return { hommes: "", femmes: "", jeunes: "", plusJeunes: "" }; }
function presenceTotal(p) { return PRESENCE_CATS.reduce((s, c) => s + (Number((p || {})[c.key]) || 0), 0); }
function presenceFilled(p) { return PRESENCE_CATS.some(c => String((p || {})[c.key] ?? "").trim() !== ""); }
function presenceLines(p) {
  const L = [`Assistance : ${presenceTotal(p)}`];
  PRESENCE_CATS.forEach(c => { if (String((p || {})[c.key] ?? "").trim() !== "") L.push(`${c.label} : ${p[c.key]}`); });
  return L;
}

function emptyActivity() { return { titre: "", date: "", theme: "", objectif: "", details: "", assistance: "" }; }

function activityToText(r, finance) {
  const L = [];
  const blank = (v) => v || "";
  const actLines = (a, i) => {
    const out = [`*Activité ${i + 1}* : ${[a.titre, a.date ? formatDateLong(a.date) : ""].filter(Boolean).join(" — ")}`];
    if (a.theme) out.push(`*Thème* : ${a.theme}`);
    if (a.objectif) out.push(`*Objectif* : ${a.objectif}`);
    if (a.details) out.push(a.details);
    if (String(a.assistance ?? "").trim() !== "") out.push(`*Assistance* : ${a.assistance}`);
    return out;
  };
  const bullets = (t) => (t || "").split("\n").map(x => x.trim()).filter(Boolean).map(x => x.startsWith("-") ? x : `- ${x}`);

  L.push("🔴 *Rapport hebdomadaire d'activités* 🔴", "");
  L.push(`District de : ${blank(r.district)}`, "");
  L.push(`*Assemblée de : ${r.assemblee}*`, "");
  L.push(`Date : ${weekLabel(r.semaine)}`, "");
  L.push(`Orateur : ${blank(r.orateur)}`, "");
  L.push(`Thème : ${blank(r.theme)}`, "");
  L.push(`Problème détecté : ${blank(r.probleme)}`, "");
  L.push(`Objectif visé : ${blank(r.objectif)}`, "");
  L.push(...presenceLines(r.culte));

  L.push("", "", "*🎯 Activités hebdomadaires*", "", "*A) Mission*");
  (r.mission || []).forEach((a, i) => L.push("", ...actLines(a, i)));
  if (presenceFilled(r.ecoleMardi)) L.push("", "*École de base du mardi*", ...presenceLines(r.ecoleMardi));
  if (presenceFilled(r.ecoleDimanche)) L.push("", `*École de base du dimanche${r.ecoleDimancheDate ? " " + formatDateLong(r.ecoleDimancheDate) : ""}*`, ...presenceLines(r.ecoleDimanche));
  if (presenceFilled(r.priere)) L.push("", "*Prière du jeudi*", ...presenceLines(r.priere));
  const qg = r.qg || {};
  if (presenceFilled(qg.presence) || qg.theme || qg.orateur) {
    L.push("", `*QG${qg.date ? " du " + formatDateLong(qg.date) : ""}*`);
    if (qg.theme) L.push(`Thème : ${qg.theme}`);
    if (qg.orateur) L.push(`Orateur : ${qg.orateur}`);
    if (presenceFilled(qg.presence)) L.push("", ...presenceLines(qg.presence));
  }
  if ((r.formation || []).length) {
    L.push("", "*B) Formation*");
    r.formation.forEach((a, i) => L.push("", ...actLines(a, i)));
  }
  L.push("", "*C) Finances*", "");
  if (finance) L.push(...financeLines(finance));
  else L.push("Rapport financier pas encore déposé par le financier de l'assemblée.");
  L.push("", "*D) Famille*");
  (r.famille || []).forEach((a, i) => L.push("", ...actLines(a, i)));
  L.push("", "*🎯 Observations*", ...bullets(r.observations));
  L.push("", "*🎯 Difficultés*", ...bullets(r.difficultes));
  L.push("", "*🎯 Perspectives*", ...bullets(r.perspectives));
  return L.join("\n");
}

function RapportActivites({ regions, activityReports, financeReports, saveActivity, deleteActivity, showToast }) {
  const [assemblee, setAssemblee] = useState(() => { try { return localStorage.getItem("mpv-act-assemblee") || ""; } catch (e) { return ""; } });
  const [editing, setEditing] = useState(null);

  function chooseAssemblee(v) {
    setAssemblee(v);
    try { localStorage.setItem("mpv-act-assemblee", v); } catch (e) {}
  }
  const entries = activityReports
    .filter(r => r.assemblee === assemblee)
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));
  const findFinance = (r) => financeReports.find(f => f.id === reportKey(r.assemblee, r.semaine));

  async function handleSave(entry, replaced) {
    const ok = await saveActivity(entry);
    if (ok) { setEditing(null); showToast(replaced ? "Rapport mis à jour" : "Rapport d'activités déposé"); }
  }
  async function handleDelete(entry) {
    const ok = await deleteActivity(entry);
    if (ok) { setEditing(null); showToast("Rapport supprimé"); }
  }

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.45 }}>
        Le rapport complet de la semaine : culte, mission, formation, famille, difficultés. La partie finances est reprise automatiquement du rapport déposé par le financier.
      </div>
      <Field label="Assemblée">
        <AssembleeSelect regions={regions} value={assemblee} onChange={chooseAssemblee} />
      </Field>

      {assemblee && (
        <>
          <PrimaryButton full icon={Plus} onClick={() => {
            const last = entries[0];
            setEditing({ assemblee, semaine: mondayOf(new Date(Date.now() - 7 * 86400000).toISOString().slice(0, 10)), district: last?.district || "" });
          }}>Nouveau rapport d'activités</PrimaryButton>

          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)", margin: "18px 0 10px" }}>Rapports de {assemblee}</div>
          {entries.length === 0 ? (
            <EmptyState icon={ClipboardList} text={`Aucun rapport d'activités déposé pour ${assemblee}.`} />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {entries.map(r => {
                const fin = findFinance(r);
                return (
                  <div key={r.id} onClick={() => setEditing(r)} style={{
                    background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                    borderLeft: "4px solid var(--accent)", cursor: "pointer"
                  }}>
                    <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)" }}>{weekLabel(r.semaine)}</div>
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>
                      {r.orateur ? `Orateur : ${r.orateur}` : "Orateur non renseigné"}{r.theme ? ` · ${r.theme}` : ""}
                    </div>
                    <div style={{ display: "flex", gap: 14, marginTop: 8, fontSize: 12 }}>
                      <span>Culte : <b>{presenceTotal(r.culte)}</b></span>
                      <span>Activités : <b>{(r.mission || []).length + (r.formation || []).length + (r.famille || []).length}</b></span>
                      <span style={{ color: fin ? "#1F7A5C" : "var(--danger)", fontWeight: 600 }}>{fin ? "Finances ✓" : "Finances manquantes"}</span>
                    </div>
                    <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                      <a href={shareWhatsappLink(activityToText(r, fin))} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{
                        display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                        fontSize: 11.5, fontWeight: 700, padding: "6px 10px", borderRadius: 8
                      }}>
                        <Send size={12} /> Partager par WhatsApp
                      </a>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </>
      )}

      {editing && (
        <ActivityForm entry={editing} activityReports={activityReports} financeReports={financeReports} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function PresenceInputs({ value, onChange }) {
  const v = value || emptyPresence();
  return (
    <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 6 }}>
      {PRESENCE_CATS.map(c => (
        <div key={c.key}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>{c.label}</div>
          <input type="number" inputMode="numeric" min="0" style={inputStyle} value={v[c.key] ?? ""} placeholder="0"
            onChange={e => onChange({ ...v, [c.key]: e.target.value })} />
        </div>
      ))}
      <div style={{ gridColumn: "1 / -1", fontSize: 12.5, fontWeight: 700, color: "var(--primary)", background: "var(--accent-soft)", borderRadius: 8, padding: "7px 10px" }}>
        Assistance totale : {presenceTotal(v)}
      </div>
    </div>
  );
}

function ActivityListEditor({ items, onChange, addLabel }) {
  const setItem = (i, k, val) => onChange(items.map((a, j) => j === i ? { ...a, [k]: val } : a));
  return (
    <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 10 }}>
      {items.map((a, i) => (
        <div key={i} style={{ border: "1px solid var(--border)", borderRadius: 11, padding: 10, background: "#FAFAF6" }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <div style={{ fontSize: 12.5, fontWeight: 700 }}>Activité {i + 1}</div>
            <button onClick={() => onChange(items.filter((_, j) => j !== i))} style={{ fontSize: 12, color: "var(--danger)", fontWeight: 600 }}>Retirer</button>
          </div>
          <input style={{ ...inputStyle, marginBottom: 7 }} value={a.titre} onChange={e => setItem(i, "titre", e.target.value)} placeholder="Intitulé (ex. Évangélisation, dédicace, match…)" />
          <input type="date" style={{ ...inputStyle, marginBottom: 7 }} value={a.date} onChange={e => setItem(i, "date", e.target.value)} />
          <input style={{ ...inputStyle, marginBottom: 7 }} value={a.theme} onChange={e => setItem(i, "theme", e.target.value)} placeholder="Thème" />
          <input style={{ ...inputStyle, marginBottom: 7 }} value={a.objectif} onChange={e => setItem(i, "objectif", e.target.value)} placeholder="Objectif" />
          <input style={{ ...inputStyle, marginBottom: 7 }} value={a.details} onChange={e => setItem(i, "details", e.target.value)} placeholder="Détails / résultat (ex. score 0-0)" />
          <input type="number" inputMode="numeric" min="0" style={inputStyle} value={a.assistance} onChange={e => setItem(i, "assistance", e.target.value)} placeholder="Assistance" />
        </div>
      ))}
      <button onClick={() => onChange([...items, emptyActivity()])} style={{
        alignSelf: "flex-start", border: "1.5px dashed var(--border)", borderRadius: 9, padding: "7px 12px",
        fontSize: 12.5, fontWeight: 600, color: "var(--primary)", display: "flex", alignItems: "center", gap: 5
      }}>
        <Plus size={13} /> {addLabel}
      </button>
    </div>
  );
}

function FormSection({ title, children }) {
  return (
    <div style={{ borderTop: "1px solid var(--border)", paddingTop: 14, marginTop: 6, marginBottom: 6 }}>
      <div style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--primary)", marginBottom: 10 }}>{title}</div>
      {children}
    </div>
  );
}

function ActivityForm({ entry, activityReports, financeReports, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [r, setR] = useState(() => ({
    semaine: entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)),
    district: entry.district || "", orateur: entry.orateur || "", theme: entry.theme || "",
    probleme: entry.probleme || "", objectif: entry.objectif || "",
    culte: entry.culte || emptyPresence(),
    mission: entry.mission || [], formation: entry.formation || [], famille: entry.famille || [],
    ecoleMardi: entry.ecoleMardi || emptyPresence(),
    ecoleDimanche: entry.ecoleDimanche || emptyPresence(), ecoleDimancheDate: entry.ecoleDimancheDate || "",
    priere: entry.priere || emptyPresence(),
    qg: entry.qg || { date: "", theme: "", orateur: "", presence: emptyPresence() },
    observations: entry.observations || "", difficultes: entry.difficultes || "", perspectives: entry.perspectives || "",
  }));
  const [confirmReplace, setConfirmReplace] = useState(false);
  const [saving, setSaving] = useState(false);

  const semaine = mondayOf(r.semaine);
  const id = reportKey(entry.assemblee, semaine);
  const existing = activityReports.find(x => x.id === id && x.id !== entry.id);
  const finance = financeReports.find(f => f.id === id);

  const set = (k, v) => { setR(prev => ({ ...prev, [k]: v })); setConfirmReplace(false); };
  const input = (k, label, placeholder) => (
    <Field label={label}><input style={inputStyle} value={r[k]} onChange={e => set(k, e.target.value)} placeholder={placeholder} /></Field>
  );
  const textarea = (k, label) => (
    <Field label={label}>
      <textarea style={{ ...inputStyle, minHeight: 70, resize: "vertical" }} value={r[k]} onChange={e => set(k, e.target.value)} placeholder="Un point par ligne" />
    </Field>
  );

  async function handleSubmit() {
    if (existing && !confirmReplace) { setConfirmReplace(true); return; }
    setSaving(true);
    if (entry.id && entry.id !== id) await onDelete(entry);
    await onSave({ ...r, id, assemblee: entry.assemblee, semaine, deposeLe: new Date().toISOString() }, !!existing || !isNew);
    setSaving(false);
  }

  return (
    <ModalShell title={isNew ? `Rapport d'activités — ${entry.assemblee}` : `Modifier — ${entry.assemblee}`} onClose={onClose}>
      <Field label="Semaine (choisissez un jour de la semaine)">
        <input type="date" style={inputStyle} value={r.semaine} onChange={e => set("semaine", e.target.value)} />
        {r.semaine && <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 5 }}>{weekLabel(semaine)}</div>}
      </Field>
      {input("district", "District de", "Ex. Hauts-Bassins")}
      {input("orateur", "Orateur", "Pasteur …")}
      {input("theme", "Thème")}
      {input("probleme", "Problème détecté")}
      {input("objectif", "Objectif visé")}
      <Field label="Assistance au culte">
        <PresenceInputs value={r.culte} onChange={v => set("culte", v)} />
      </Field>

      <FormSection title="A) Mission">
        <ActivityListEditor items={r.mission} onChange={v => set("mission", v)} addLabel="Ajouter une activité de mission" />
        <Field label="École de base du mardi"><PresenceInputs value={r.ecoleMardi} onChange={v => set("ecoleMardi", v)} /></Field>
        <Field label="École de base du dimanche">
          <input type="date" style={{ ...inputStyle, marginBottom: 8 }} value={r.ecoleDimancheDate} onChange={e => set("ecoleDimancheDate", e.target.value)} />
          <PresenceInputs value={r.ecoleDimanche} onChange={v => set("ecoleDimanche", v)} />
        </Field>
        <Field label="Prière du jeudi"><PresenceInputs value={r.priere} onChange={v => set("priere", v)} /></Field>
        <Field label="QG">
          <input type="date" style={{ ...inputStyle, marginBottom: 7 }} value={r.qg.date} onChange={e => set("qg", { ...r.qg, date: e.target.value })} />
          <input style={{ ...inputStyle, marginBottom: 7 }} value={r.qg.theme} onChange={e => set("qg", { ...r.qg, theme: e.target.value })} placeholder="Thème" />
          <input style={{ ...inputStyle, marginBottom: 8 }} value={r.qg.orateur} onChange={e => set("qg", { ...r.qg, orateur: e.target.value })} placeholder="Orateur" />
          <PresenceInputs value={r.qg.presence} onChange={v => set("qg", { ...r.qg, presence: v })} />
        </Field>
      </FormSection>

      <FormSection title="B) Formation">
        <ActivityListEditor items={r.formation} onChange={v => set("formation", v)} addLabel="Ajouter une activité de formation" />
      </FormSection>

      <FormSection title="C) Finances">
        {finance ? (
          <>
            <div style={{ fontSize: 12, color: "#1F7A5C", fontWeight: 700, marginBottom: 8 }}>
              Reprise du rapport déposé par {finance.financier || "le financier"}
            </div>
            <FinanceSplitTable report={finance} />
          </>
        ) : (
          <div style={{ fontSize: 12.5, color: "var(--danger)", lineHeight: 1.45 }}>
            Le financier de l'assemblée n'a pas encore déposé le rapport financier de cette semaine (onglet Finances). Il sera ajouté automatiquement dès qu'il sera déposé.
          </div>
        )}
      </FormSection>

      <FormSection title="D) Famille">
        <ActivityListEditor items={r.famille} onChange={v => set("famille", v)} addLabel="Ajouter une activité famille" />
      </FormSection>

      <FormSection title="Bilan">
        {textarea("observations", "Observations")}
        {textarea("difficultes", "Difficultés")}
        {textarea("perspectives", "Perspectives")}
      </FormSection>

      {confirmReplace && (
        <div style={{ background: "var(--accent-soft)", color: "var(--accent-dark)", fontSize: 12.5, fontWeight: 600, borderRadius: 9, padding: "9px 11px", marginBottom: 10 }}>
          Un rapport de {entry.assemblee} existe déjà pour cette semaine. Appuyez encore pour le remplacer.
        </div>
      )}
      <PrimaryButton onClick={saving ? undefined : handleSubmit} icon={Check} full>
        {saving ? "Enregistrement…" : confirmReplace ? "Remplacer le rapport existant" : isNew ? "Déposer le rapport" : "Enregistrer les modifications"}
      </PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce rapport ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce rapport
        </button>
      )}
    </ModalShell>
  );
}

/* --- Rapport coordination (national) --------------------------------- */

function RapportCoordination({ coordSeminars, pastors, deptHeads, leadership, unlocked, onUnlock, onLock, seminarReports, setSeminarReports, showToast }) {
  const [editing, setEditing] = useState(null);
  const [recapDebut, setRecapDebut] = useState(() => {
    const d = new Date();
    d.setDate(d.getDate() - 6);
    return d.toISOString().slice(0, 10);
  });
  const [recapFin, setRecapFin] = useState(() => new Date().toISOString().slice(0, 10));

  const entries = seminarReports
    .filter(r => (r.niveau || "assemblee") === "coordination")
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));

  function handleSave(entry) {
    const exists = seminarReports.some(x => x.id === entry.id);
    const next = exists ? seminarReports.map(x => x.id === entry.id ? entry : x) : [...seminarReports, entry];
    setSeminarReports(next);
    setEditing(null);
    showToast(exists ? "Rapport mis à jour" : "Rapport déposé");
  }
  function handleDelete(id) {
    setSeminarReports(seminarReports.filter(x => x.id !== id));
    setEditing(null);
    showToast("Rapport supprimé");
  }

  const recapReports = entries.filter(r => (r.semaine || "") >= recapDebut && (r.semaine || "") <= recapFin);
  const recapTotals = emptyReportValues();
  recapReports.forEach(r => REPORT_FIELDS.forEach(f => { recapTotals[f.key] += Number(r[f.key]) || 0; }));

  return (
    <div>
      <CoordLockPanel
        leadership={leadership} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock}
        description="Tout le monde peut consulter les rapports et le récapitulatif. Seul le chef du département (même code que pour la programmation des séminaires) peut déposer, modifier ou supprimer un rapport de la coordination nationale."
      />

      {unlocked && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setEditing({ semaine: mondayOf(new Date().toISOString().slice(0, 10)), ...emptyReportValues() })} style={{
            background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 12px",
            display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600
          }}>
            <Plus size={14} /> Déposer un rapport
          </button>
        </div>
      )}

      {entries.length === 0 ? (
        <EmptyState icon={FileText} text="Aucun rapport de la coordination nationale pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9, marginBottom: 24 }}>
          {entries.map(r => (
            <div key={r.id} onClick={() => unlocked && setEditing(r)} style={{
              background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
              borderLeft: "4px solid var(--primary)", cursor: unlocked ? "pointer" : "default"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", textTransform: "capitalize" }}>
                  Semaine du {formatDateLong(r.semaine)}
                </div>
                {r.pasteur && <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{r.pasteur}</div>}
              </div>
              {r.predicateurNoms && r.predicateurNoms.length > 0 && (
                <div style={{ fontSize: 11.5, color: "var(--ink)", marginBottom: 8 }}>
                  <span style={{ color: "var(--ink-soft)" }}>Ont prêché : </span>{r.predicateurNoms.join(", ")}
                </div>
              )}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "5px 10px" }}>
                {REPORT_FIELDS.map(f => (
                  <div key={f.key} style={{ fontSize: 11.5, color: "var(--ink-soft)", display: "flex", justifyContent: "space-between" }}>
                    <span>{f.label}</span><span style={{ fontWeight: 700, color: "var(--ink)" }}>{r[f.key] || 0}</span>
                  </div>
                ))}
              </div>
              <div style={{ marginTop: 10, paddingTop: 9, borderTop: "1px solid var(--border)" }}>
                <ShareReportButton report={r} pays />
              </div>
            </div>
          ))}
        </div>
      )}

      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <BarChart3 size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Récapitulatif de tous les séminaires organisés au national — période sélectionnée</div>
      </div>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 12 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Du</div>
          <input type="date" style={inputStyle} value={recapDebut} onChange={e => setRecapDebut(e.target.value)} />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Au</div>
          <input type="date" style={inputStyle} value={recapFin} onChange={e => setRecapFin(e.target.value)} />
        </div>
      </div>
      <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: "14px 16px" }}>
        <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 10 }}>
          {recapReports.length} rapport{recapReports.length > 1 ? "s" : ""} pris en compte
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {REPORT_FIELDS.map(f => (
            <div key={f.key} style={{ display: "flex", justifyContent: "space-between", alignItems: "center", paddingBottom: 8, borderBottom: "1px solid var(--border)" }}>
              <span style={{ fontSize: 13, color: "var(--ink)" }}>{f.label}</span>
              <span style={{ fontFamily: "var(--font-display)", fontSize: 16, fontWeight: 700, color: "var(--primary)" }}>
                {f.key === "depensesTotal" ? recapTotals[f.key].toLocaleString("fr-FR") : recapTotals[f.key]}
              </span>
            </div>
          ))}
        </div>
        <div style={{ marginTop: 12, paddingTop: 10, borderTop: "1px solid var(--border)" }}>
          <a
            href={shareWhatsappLink(recapToText(recapTotals, {
              titre: "Récapitulatif — Coordination nationale",
              periodeLabel: `Du ${formatDateLong(recapDebut)} au ${formatDateLong(recapFin)}`,
              nbRapports: recapReports.length,
            }))}
            target="_blank" rel="noopener noreferrer"
            style={{
              display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "#fff",
              fontSize: 12.5, fontWeight: 700, padding: "9px 0", borderRadius: 9
            }}
          >
            <Send size={13} /> Partager ce récapitulatif par WhatsApp
          </a>
        </div>
      </div>

      {editing && (
        <CoordReportForm entry={editing} coordSeminars={coordSeminars} pastors={pastors} deptHeads={deptHeads} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function CoordReportForm({ entry, coordSeminars, pastors, deptHeads, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [pasteur, setPasteur] = useState(entry.pasteur || "");
  const [seminarId, setSeminarId] = useState(entry.seminarId || "");
  const [semaine, setSemaine] = useState(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)));
  const [values, setValues] = useState(() => {
    const v = {};
    REPORT_FIELDS.forEach(f => { v[f.key] = entry[f.key] ?? 0; });
    return v;
  });

  const programmes = [...(coordSeminars || [])].sort((a, b) => (b.date || "").localeCompare(a.date || ""));
  const selectedSeminaire = programmes.find(s => s.id === seminarId);
  const predicateurNoms = selectedSeminaire
    ? (selectedSeminaire.predicateurs || []).map(id => (pastors || []).find(p => p.id === id)?.nom).filter(Boolean)
    : [];

  function handleSubmit() {
    onSave({
      id: entry.id || uid(), niveau: "coordination", assemblee: "", pasteur: pasteur.trim(), semaine: mondayOf(semaine),
      seminarId: seminarId || null, predicateurNoms,
      ...values,
    });
  }

  return (
    <ModalShell title={isNew ? "Rapport hebdomadaire — coordination nationale" : "Modifier le rapport"} onClose={onClose}>
      <Field label="Programme national concerné (facultatif)">
        <select style={inputStyle} value={seminarId} onChange={e => setSeminarId(e.target.value)}>
          <option value="">— Aucun programme précis / non listé —</option>
          {programmes.map(s => (
            <option key={s.id} value={s.id}>{s.type || "Séminaire"} — {s.theme || "(Sans thème)"} — {s.date ? formatDateLong(s.date) : "date à définir"}</option>
          ))}
        </select>
      </Field>

      {seminarId && (
        <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "10px 12px", marginBottom: 13 }}>
          <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 4 }}>
            Ont prêché durant ce programme
          </div>
          {predicateurNoms.length > 0 ? (
            <div style={{ fontSize: 13, color: "var(--ink)", fontWeight: 600 }}>{predicateurNoms.join(", ")}</div>
          ) : (
            <div style={{ fontSize: 12, color: "var(--danger)" }}>Aucun prédicateur n'était affecté à ce programme.</div>
          )}
        </div>
      )}

      <Field label="Rapport déposé par">
        {deptHeads && deptHeads.length > 0 ? (
          <select style={inputStyle} value={pasteur} onChange={e => setPasteur(e.target.value)}>
            <option value="">— Sélectionner ou saisir ci-dessous —</option>
            {deptHeads.map(d => <option key={d.id} value={d.nom}>{d.nom}</option>)}
          </select>
        ) : null}
        <input style={{ ...inputStyle, marginTop: deptHeads && deptHeads.length > 0 ? 8 : 0 }} value={pasteur} onChange={e => setPasteur(e.target.value)} placeholder="Nom du responsable" />
      </Field>

      <Field label="Période (semaine du rapport hebdomadaire)">
        <input type="date" style={inputStyle} value={semaine} onChange={e => setSemaine(e.target.value)} />
      </Field>

      {REPORT_FIELDS.map(f => (
        <Field key={f.key} label={f.label}>
          <input
            type="number" inputMode="numeric" style={inputStyle}
            value={values[f.key]}
            onChange={e => setValues({ ...values, [f.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
          />
        </Field>
      ))}

      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer le rapport</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce rapport ?")) onDelete(entry.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce rapport
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  COORDINATION NATIONALE                                             */
/* ------------------------------------------------------------------ */

function segButtonStyle(active) {
  return {
    flex: 1, padding: "8px 0", borderRadius: 8, fontSize: 11.5, fontWeight: 700,
    background: active ? "var(--primary)" : "transparent",
    color: active ? "#fff" : "var(--ink-soft)"
  };
}

const PLAN_STATUTS = [
  { value: "respecte", label: "Appliqué strictement", tone: "var(--primary)", icon: CheckCircle2 },
  { value: "partiel", label: "Partiellement appliqué", tone: "var(--accent-dark)", icon: AlertTriangle },
  { value: "signale", label: "Non appliqué — à signaler", tone: "var(--danger)", icon: AlertTriangle },
];
const PLAN_PERIODES = ["Hebdomadaire", "Mensuel", "Annuel"];

const MOIS_ANNEE = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];

const SITUATION_EGLISE_FIELDS = [
  { key: "declaresSauves", label: "Déclarés sauvés" },
  { key: "localitesTouchees", label: "Localités touchées" },
  { key: "membres", label: "Membres" },
  { key: "assemblees", label: "Assemblées" },
  { key: "cellulesImplantees", label: "Cellules implantées" },
  { key: "pasteurs", label: "Pasteurs" },
  { key: "coordinateurs", label: "Coordinateurs" },
  { key: "formateurs", label: "Formateurs" },
  { key: "predicateurs", label: "Prédicateurs" },
  { key: "elevesPredicateurs", label: "Élèves prédicateurs" },
];

const AXE1_FIELDS = [
  { key: "grandSeminaire", label: "Grand séminaire" },
  { key: "formationClassique", label: "Formation classique" },
  { key: "objectifInvites", label: "Objectif en invités" },
  { key: "formationLeaders", label: "Formation des leaders" },
  { key: "miniConvention", label: "Mini convention nationale" },
  { key: "objectifCellules", label: "Objectif cellules à implanter" },
  { key: "missionNationale", label: "Mission nationale intérieure" },
  { key: "budget", label: "Budget prévisionnel (FCFA)" },
];

const AXE4_FIELDS = [
  { key: "grandSeminaire", label: "Grand séminaire" },
  { key: "formationClassique", label: "Formation classique" },
  { key: "formationLeaders", label: "Formation des leaders" },
  { key: "conventionPredicateurs", label: "Convention nationale des prédicateurs" },
  { key: "conventionMission", label: "Convention Mission Nationale intérieure" },
  { key: "besoinsMissionnaires", label: "Besoins missionnaires Afrique" },
];

const PROJET_AXE_FIELDS = [
  { key: "localite", label: "Localité", type: "text" },
  { key: "periode", label: "Période", type: "text" },
  { key: "participants", label: "Participants moyen à former", type: "number" },
  { key: "publicCible", label: "Public cible", type: "text" },
  { key: "objectifs", label: "Objectifs", type: "textarea" },
  { key: "budget", label: "Budget prévisionnel (FCFA)", type: "number" },
  { key: "formateurs", label: "Formateurs prévus", type: "number" },
];

function emptyMoisRow(fields) {
  const v = {};
  fields.forEach(f => { v[f.key] = 0; });
  return v;
}
function sumMoisRows(rows, fields) {
  const totals = emptyMoisRow(fields);
  (rows || []).forEach(r => fields.forEach(f => { totals[f.key] += Number((r || {})[f.key]) || 0; }));
  return totals;
}

function CoordLockPanel({ leadership, unlocked, onUnlock, onLock, pinField = "pinChefDepartement", roleLabel = "chef du département", description }) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const pinValue = leadership[pinField];

  function tryUnlock() {
    if (!pinValue || pinInput !== pinValue) {
      setPinError(true);
      return;
    }
    onUnlock();
    setPinInput("");
    setPinError(false);
  }

  if (unlocked) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--accent-soft)", borderRadius: 10, padding: "8px 12px", marginBottom: 14 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-dark)", fontWeight: 700 }}>
          <Unlock size={13} /> Mode {roleLabel} actif
        </div>
        <button onClick={onLock} style={{ fontSize: 11.5, color: "var(--accent-dark)", fontWeight: 600 }}>Verrouiller</button>
      </div>
    );
  }

  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
        <Lock size={16} color="var(--accent-dark)" />
        <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>Espace réservé au {roleLabel}</div>
      </div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.4 }}>
        {description || `Tout le monde peut consulter. Seul le ${roleLabel} peut ajouter des séminaires nationaux, affecter des prédicateurs, gérer les responsables et envoyer des messages.`}
      </div>
      {!pinValue ? (
        <div style={{ fontSize: 12.5, color: "var(--danger)" }}>
          Aucun code n'a encore été configuré. Rendez-vous dans l'onglet Direction pour en créer un.
        </div>
      ) : (
        <>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <PinField value={pinInput} placeholder={`Code du ${roleLabel}`} onChange={v => { setPinInput(v); setPinError(false); }} onKeyDown={e => e.key === "Enter" && tryUnlock()} />
            </div>
            <button onClick={tryUnlock} style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 16px" }}>
              <Unlock size={15} />
            </button>
          </div>
          {pinError && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 6 }}>Code incorrect.</div>}
        </>
      )}
    </div>
  );
}

function Coordination({ coordSeminars, setCoordSeminars, seminars, setSeminars, deptHeads, setDeptHeads, actionPlans, setActionPlans, plansAnnuels, setPlansAnnuels, deptPlans, saveDeptPlan, deleteDeptPlan, deptBilans, saveDeptBilan, deleteDeptBilan, deptCodes, saveDeptCode, leadership, pastors, unlocked, onUnlock, onLock, natUnlocked, onUnlockNat, onLockNat, showToast }) {
  const [subTab, setSubTab] = useState("plansdept");

  return (
    <div>
      <SectionTitle sub="Responsables, validation et plans d'action de la coordination nationale">Coordination Nationale</SectionTitle>

      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4 }}>
        Pour programmer un séminaire ou un autre programme national, direction les onglets « Séminaires » ou « Programme » → section Coordination.
      </div>

      {subTab !== "plansdept" && <CoordLockPanel leadership={leadership} unlocked={unlocked} onUnlock={onUnlock} onLock={onLock} />}

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)", flexWrap: "wrap" }}>
        <button onClick={() => setSubTab("plansdept")} style={segButtonStyle(subTab === "plansdept")}>Plans départements</button>
        <button onClick={() => setSubTab("responsables")} style={segButtonStyle(subTab === "responsables")}>Responsables</button>
        <button onClick={() => setSubTab("validation")} style={segButtonStyle(subTab === "validation")}>Validation</button>
        <button onClick={() => setSubTab("plans")} style={segButtonStyle(subTab === "plans")}>Plan national</button>
      </div>

      {subTab === "plansdept" && (
        <PlansDepartements
          deptPlans={deptPlans} saveDeptPlan={saveDeptPlan} deleteDeptPlan={deleteDeptPlan}
          deptBilans={deptBilans} saveDeptBilan={saveDeptBilan} deleteDeptBilan={deleteDeptBilan}
          deptCodes={deptCodes} saveDeptCode={saveDeptCode} deptHeads={deptHeads}
          leadership={leadership} adminUnlocked={unlocked} onAdminUnlock={onUnlock} onAdminLock={onLock}
          showToast={showToast}
        />
      )}

      {subTab === "responsables" && (
        <DeptHeads deptHeads={deptHeads} setDeptHeads={setDeptHeads} coordSeminars={coordSeminars} unlocked={unlocked} showToast={showToast} />
      )}
      {subTab === "validation" && (
        <ValidationView
          seminars={seminars} setSeminars={setSeminars}
          coordSeminars={coordSeminars} setCoordSeminars={setCoordSeminars}
          leadership={leadership} unlocked={natUnlocked} onUnlock={onUnlockNat} onLock={onLockNat}
          showToast={showToast}
        />
      )}
      {subTab === "plans" && (
        <ActionPlans actionPlans={actionPlans} setActionPlans={setActionPlans} plansAnnuels={plansAnnuels} setPlansAnnuels={setPlansAnnuels} unlocked={unlocked} showToast={showToast} />
      )}
    </div>
  );
}

/* --- Validation des séminaires par le coordonnateur national -------- */

function ValidationView({ seminars, setSeminars, coordSeminars, setCoordSeminars, leadership, unlocked, onUnlock, onLock, showToast }) {
  const [pinInput, setPinInput] = useState("");
  const [pinError, setPinError] = useState(false);
  const [filter, setFilter] = useState("attente");
  const [commentDraft, setCommentDraft] = useState({});

  function tryUnlock() {
    if (!leadership.pinCoordonnateurNational || pinInput !== leadership.pinCoordonnateurNational) {
      setPinError(true);
      return;
    }
    onUnlock();
    setPinInput("");
    setPinError(false);
  }

  const merged = [
    ...seminars.map(s => ({ ...s, _source: "assemblee", _label: s.assemblee || "Assemblée" })),
    ...coordSeminars.map(s => ({ ...s, _source: "coordination", _label: "Coordination nationale" })),
  ].filter(s => (s.validationStatut || "attente") === filter || filter === "tous")
   .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  function applyDecision(item, statut) {
    const commentaire = commentDraft[item.id] ?? item.validationCommentaire ?? "";
    const updated = { ...item, validationStatut: statut, validationCommentaire: commentaire };
    delete updated._source; delete updated._label;
    if (item._source === "assemblee") {
      setSeminars(seminars.map(s => s.id === item.id ? updated : s));
    } else {
      setCoordSeminars(coordSeminars.map(s => s.id === item.id ? updated : s));
    }
    showToast(statut === "approuve" ? "Séminaire approuvé" : "Séminaire rejeté");
  }

  const counts = {
    attente: seminars.filter(s => (s.validationStatut || "attente") === "attente").length + coordSeminars.filter(s => (s.validationStatut || "attente") === "attente").length,
  };

  return (
    <div>
      {!unlocked ? (
        <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: 16, marginBottom: 16 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 8 }}>
            <ShieldCheck size={16} color="var(--accent-dark)" />
            <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>Espace réservé au coordonnateur national</div>
          </div>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.4 }}>
            {counts.attente > 0 ? `${counts.attente} séminaire${counts.attente > 1 ? "s" : ""} en attente de validation. ` : ""}
            Seul le coordonnateur national peut approuver ou rejeter un séminaire.
          </div>
          {!leadership.pinCoordonnateurNational ? (
            <div style={{ fontSize: 12.5, color: "var(--danger)" }}>Aucun code n'a encore été configuré. Rendez-vous dans l'onglet Direction.</div>
          ) : (
            <>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <PinField value={pinInput} placeholder="Code du coordonnateur national" onChange={v => { setPinInput(v); setPinError(false); }} onKeyDown={e => e.key === "Enter" && tryUnlock()} />
                </div>
                <button onClick={tryUnlock} style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 16px" }}>
                  <Unlock size={15} />
                </button>
              </div>
              {pinError && <div style={{ fontSize: 11.5, color: "var(--danger)", marginTop: 6 }}>Code incorrect.</div>}
            </>
          )}
        </div>
      ) : (
        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", background: "var(--accent-soft)", borderRadius: 10, padding: "8px 12px", marginBottom: 14 }}>
          <div style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "var(--accent-dark)", fontWeight: 700 }}>
            <Unlock size={13} /> Mode coordonnateur national actif
          </div>
          <button onClick={onLock} style={{ fontSize: 11.5, color: "var(--accent-dark)", fontWeight: 600 }}>Verrouiller</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 6, marginBottom: 14, overflowX: "auto" }}>
        {[{ v: "attente", l: "En attente" }, { v: "approuve", l: "Approuvés" }, { v: "rejete", l: "Rejetés" }, { v: "tous", l: "Tous" }].map(f => (
          <button key={f.v} onClick={() => setFilter(f.v)} style={{
            padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            background: filter === f.v ? "var(--primary)" : "#fff", color: filter === f.v ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--border)"
          }}>{f.l}</button>
        ))}
      </div>

      {merged.length === 0 ? (
        <EmptyState icon={Filter} text="Aucun séminaire dans cette catégorie." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
          {merged.map(item => (
            <div key={item.id} style={{ background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 700, color: "var(--primary)" }}>{item.theme || "(Thème non défini)"}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 2 }}>{item._label} · {item.date ? formatDateLong(item.date) : "Date non définie"}</div>
                </div>
                <ValidationBadge statut={item.validationStatut} />
              </div>
              {item.lieu && <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 6 }}>📍 {item.lieu}</div>}
              {item.budget && budgetTotal(item.budget) > 0 && (
                <div style={{ fontSize: 11.5, color: "var(--accent-dark)", marginTop: 4, fontWeight: 600 }}>
                  Budget : {budgetTotal(item.budget).toLocaleString("fr-FR")} FCFA
                </div>
              )}
              {unlocked && (item.validationStatut || "attente") === "attente" && (
                <>
                  <textarea
                    style={{ ...inputStyle, marginTop: 9, minHeight: 50, fontSize: 12.5, resize: "vertical" }}
                    placeholder="Commentaire (facultatif)"
                    value={commentDraft[item.id] ?? ""}
                    onChange={e => setCommentDraft({ ...commentDraft, [item.id]: e.target.value })}
                  />
                  <div style={{ display: "flex", gap: 8, marginTop: 8 }}>
                    <button onClick={() => applyDecision(item, "approuve")} style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700
                    }}>
                      <CheckCircle2 size={14} /> Approuver
                    </button>
                    <button onClick={() => applyDecision(item, "rejete")} style={{
                      flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5,
                      background: "#fff", color: "var(--danger)", border: "1.5px solid var(--danger)", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 700
                    }}>
                      <XCircle size={14} /> Rejeter
                    </button>
                  </div>
                </>
              )}
              {item.validationCommentaire && (item.validationStatut || "attente") !== "attente" && (
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 8, fontStyle: "italic" }}>« {item.validationCommentaire} »</div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

/* --- Séminaires organisés par la coordination nationale ------------ */

function CoordSeminaires({ coordSeminars, setCoordSeminars, pastors, unlocked, showToast }) {
  const [editing, setEditing] = useState(null);
  const [filterType, setFilterType] = useState("");
  const sorted = [...coordSeminars]
    .filter(s => !filterType || (s.type || "Séminaire") === filterType)
    .sort((a, b) => (a.date || "").localeCompare(b.date || ""));

  function handleSave(s) {
    const exists = coordSeminars.some(x => x.id === s.id);
    const next = exists ? coordSeminars.map(x => x.id === s.id ? s : x) : [...coordSeminars, s];
    setCoordSeminars(next);
    setEditing(null);
    showToast(exists ? "Programme national mis à jour" : "Programme national ajouté");
  }
  function handleDelete(id) {
    setCoordSeminars(coordSeminars.filter(x => x.id !== id));
    setEditing(null);
    showToast("Programme national supprimé");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 12, overflowX: "auto", paddingBottom: 2 }}>
        <button onClick={() => setFilterType("")} style={{
          padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
          background: !filterType ? "var(--primary)" : "#fff", color: !filterType ? "#fff" : "var(--ink-soft)",
          border: "1px solid var(--border)"
        }}>Tous les types</button>
        {TYPES_PROGRAMME.map(t => (
          <button key={t} onClick={() => setFilterType(t)} style={{
            padding: "6px 12px", borderRadius: 999, fontSize: 11.5, fontWeight: 700, whiteSpace: "nowrap",
            background: filterType === t ? TYPE_TONES[t] : "#fff", color: filterType === t ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--border)"
          }}>{t}</button>
        ))}
      </div>

      {unlocked && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setEditing({ type: filterType || "Séminaire" })} style={{
            background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
          }}>
            <Plus size={15} /> Ajouter un programme national
          </button>
        </div>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={Building2} text="Aucun programme national pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {sorted.map(s => {
            const d = daysUntil(s.date);
            const names = (s.predicateurs || []).map(id => pastors.find(p => p.id === id)?.nom).filter(Boolean);
            return (
              <div key={s.id} onClick={() => unlocked && setEditing(s)} style={{
                background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                borderLeft: "4px solid var(--primary)", cursor: unlocked ? "pointer" : "default"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", gap: 8 }}>
                  <div>
                    <div style={{ marginBottom: 5 }}><TypeBadge type={s.type} groupe={s.groupe} /></div>
                    <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--primary)", lineHeight: 1.3 }}>{s.theme || "(Thème non défini)"}</div>
                  </div>
                  <DaysBadge days={d} />
                </div>
                <div style={{ display: "flex", flexWrap: "wrap", gap: "4px 12px", marginTop: 7, fontSize: 12, color: "var(--ink-soft)" }}>
                  <span style={{ display: "flex", alignItems: "center", gap: 4 }}><CalendarDays size={12.5} /> {s.date ? formatDateLong(s.date) : "Date non définie"}</span>
                  {s.heure && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><Clock size={12.5} /> {s.heure}</span>}
                  {s.lieu && <span style={{ display: "flex", alignItems: "center", gap: 4 }}><MapPin size={12.5} /> {s.lieu}</span>}
                  {s.positionGps && (
                    <a href={mapsLink(s.positionGps.lat, s.positionGps.lng)} target="_blank" rel="noopener noreferrer" onClick={e => e.stopPropagation()} style={{ color: "var(--primary)", fontWeight: 600 }}>
                      (carte)
                    </a>
                  )}
                </div>
                {s.personneRessourceNom && (
                  <div style={{ marginTop: 4, fontSize: 11.5, color: "var(--ink-soft)" }}>
                    Personne ressource : <span style={{ color: "var(--ink)", fontWeight: 600 }}>{s.personneRessourceNom}</span>{s.personneRessourceContact ? ` · ${s.personneRessourceContact}` : ""}
                  </div>
                )}
                {names.length > 0 ? (
                  <div style={{ marginTop: 8, fontSize: 12, color: "var(--ink)" }}>
                    <span style={{ color: "var(--ink-soft)" }}>Prédicateurs : </span>{names.join(", ")}
                  </div>
                ) : (
                  <div style={{ marginTop: 8, fontSize: 11.5, color: "var(--danger)", fontWeight: 600 }}>⚠ Aucun prédicateur affecté</div>
                )}
                <div style={{ marginTop: 9, display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                  <ValidationBadge statut={s.validationStatut} />
                  {s.budget && budgetTotal(s.budget) > 0 && (
                    <span style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)", display: "flex", alignItems: "center", gap: 3 }}>
                      <Wallet size={12} /> {budgetTotal(s.budget).toLocaleString("fr-FR")} FCFA
                    </span>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {editing && unlocked && (
        <CoordSeminarForm seminar={editing} pastors={pastors} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function CoordSeminarForm({ seminar, pastors, onSave, onDelete, onClose }) {
  const isNew = !seminar.id;
  const [type, setType] = useState(seminar.type || "Séminaire");
  const [groupe, setGroupe] = useState(seminar.groupe || "");
  const [theme, setTheme] = useState(seminar.theme || "");
  const [date, setDate] = useState(seminar.date || "");
  const [dateFin, setDateFin] = useState(seminar.dateFin || "");
  const [heure, setHeure] = useState(seminar.heure || "");
  const [lieu, setLieu] = useState(seminar.lieu || "");
  const [positionGps, setPositionGps] = useState(seminar.positionGps || null);
  const [personneRessourceNom, setPersonneRessourceNom] = useState(seminar.personneRessourceNom || "");
  const [personneRessourceContact, setPersonneRessourceContact] = useState(seminar.personneRessourceContact || "");
  const [choraleAssemblees, setChoraleAssemblees] = useState(seminar.choraleAssemblees || "");
  const [inviteHonneur, setInviteHonneur] = useState(seminar.inviteHonneur || "");
  const [programmeSemaine, setProgrammeSemaine] = useState(seminar.programmeSemaine || "");
  const [budget, setBudget] = useState(seminar.budget || {});
  const [predicateurs, setPredicateurs] = useState(seminar.predicateurs || []);
  const [formateurs, setFormateurs] = useState(seminar.formateurs || []);
  const [nombreJours, setNombreJours] = useState(seminar.nombreJours || "");
  const [dirigeantPriere, setDirigeantPriere] = useState(seminar.dirigeantPriere || "");
  const [dirigeantChants, setDirigeantChants] = useState(seminar.dirigeantChants || "");
  const [sujetsPriereImage, setSujetsPriereImage] = useState(seminar.sujetsPriereImage || null);
  const [mc, setMc] = useState(seminar.mc || "");
  const [predicateurJour, setPredicateurJour] = useState(seminar.predicateurJour || "");
  const [choraleGroupeMusical, setChoraleGroupeMusical] = useState(seminar.choraleGroupeMusical || "");
  const [priereOuverture, setPriereOuverture] = useState(seminar.priereOuverture || "");
  const [themePredicationJour, setThemePredicationJour] = useState(seminar.themePredicationJour || "");
  const [temoignagesCommunion, setTemoignagesCommunion] = useState(seminar.temoignagesCommunion || "");
  const [diversCommunion, setDiversCommunion] = useState(seminar.diversCommunion || "");
  const [programmeRetraite, setProgrammeRetraite] = useState(seminar.programmeRetraite || "");
  const [notes, setNotes] = useState(seminar.notes || "");
  const [search, setSearch] = useState("");

  function togglePred(id) {
    setPredicateurs(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  const filteredPastors = pastors.filter(p => p.nom.toLowerCase().includes(search.toLowerCase()));

  function handleSubmit() {
    if (!theme.trim() || !date) { alert("Merci de renseigner au moins le thème/sujet et la date de début."); return; }
    onSave({
      id: seminar.id || uid(), type, groupe: type === "Retraite" ? groupe : "",
      theme: theme.trim(), date, dateFin: dateFin || "", heure, lieu: lieu.trim(), predicateurs, notes,
      programmeRetraite: type === "Retraite" ? programmeRetraite.trim() : "",
      formateurs: type === "Formation" ? formateurs : [],
      nombreJours: type === "Formation" ? nombreJours : "",
      dirigeantPriere: type === "Prière" ? dirigeantPriere.trim() : "",
      dirigeantChants: type === "Prière" ? dirigeantChants.trim() : "",
      sujetsPriereImage: type === "Prière" ? sujetsPriereImage : null,
      mc: type === "Communion" ? mc.trim() : "",
      predicateurJour: type === "Communion" ? predicateurJour.trim() : "",
      choraleGroupeMusical: type === "Communion" ? choraleGroupeMusical.trim() : "",
      priereOuverture: type === "Communion" ? priereOuverture.trim() : "",
      themePredicationJour: type === "Communion" ? themePredicationJour.trim() : "",
      temoignagesCommunion: type === "Communion" ? temoignagesCommunion.trim() : "",
      diversCommunion: type === "Communion" ? diversCommunion.trim() : "",
      positionGps, personneRessourceNom: personneRessourceNom.trim(), personneRessourceContact: personneRessourceContact.trim(),
      choraleAssemblees: type === "QG National" ? choraleAssemblees.trim() : "",
      inviteHonneur: type === "QG National" ? inviteHonneur.trim() : "",
      programmeSemaine: type === "QG National" ? programmeSemaine.trim() : "",
      budget, validationStatut: seminar.validationStatut || "attente", validationCommentaire: seminar.validationCommentaire || "",
    });
  }

  return (
    <ModalShell title={isNew ? "Nouveau programme national" : "Modifier le programme national"} onClose={onClose}>
      <Field label="Type de programme">
        <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
          {TYPES_PROGRAMME.map(t => (
            <button key={t} onClick={() => setType(t)} style={{
              padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 700,
              background: type === t ? TYPE_TONES[t] : "#fff", color: type === t ? "#fff" : "var(--ink-soft)",
              border: "1px solid var(--border)"
            }}>{t}</button>
          ))}
        </div>
      </Field>
      {type === "Retraite" && (
        <>
          <Field label="Groupe d'action concerné">
            <select style={inputStyle} value={groupe} onChange={e => setGroupe(e.target.value)}>
              <option value="">— Sélectionner —</option>
              {GROUPES_ACTION.map(g => <option key={g} value={g}>{g}</option>)}
            </select>
          </Field>
          <Field label="Programme du jour, par heure (la retraite dure souvent 3 à 7 jours)">
            <textarea
              style={{ ...inputStyle, minHeight: 140, resize: "vertical", fontSize: 13.5 }}
              value={programmeRetraite} onChange={e => setProgrammeRetraite(e.target.value)}
              placeholder={"Ex :\nJour 1\n06h00 : Réveil et prière\n08h00 : Petit-déjeuner\n09h00 : Enseignement\n...\n\nJour 2\n..."}
            />
          </Field>
        </>
      )}
      {type === "QG National" && (
        <>
          <Field label="Chorale(s) d'assemblée invitée(s)">
            <input style={inputStyle} value={choraleAssemblees} onChange={e => setChoraleAssemblees(e.target.value)} placeholder="Ex : Chorale de PISSY, Chorale de BOBO" />
          </Field>
          <Field label="Invité(s) d'honneur">
            <input style={inputStyle} value={inviteHonneur} onChange={e => setInviteHonneur(e.target.value)} placeholder="Ex : Nom et titre de l'invité d'honneur" />
          </Field>
          <Field label="Programme de la semaine">
            <textarea
              style={{ ...inputStyle, minHeight: 120, resize: "vertical", fontSize: 13.5 }}
              value={programmeSemaine} onChange={e => setProgrammeSemaine(e.target.value)}
              placeholder={"Ex :\nLundi : Ouverture officielle\nMardi : Séminaires par groupe\nMercredi : Soirée de louange\n..."}
            />
          </Field>
        </>
      )}
      {type === "Formation" && (
        <>
          <Field label="Nombre de jours de la formation">
            <input
              type="number" inputMode="numeric" style={inputStyle} min="1"
              value={nombreJours} onChange={e => setNombreJours(e.target.value)}
              placeholder="Ex : 3"
            />
          </Field>
          <Field label={`Formateurs (${formateurs.length})`}>
            <PastorMultiSelect pastors={pastors} selected={formateurs} onChange={setFormateurs} />
          </Field>
        </>
      )}
      {type === "Prière" && (
        <PriereFields
          dirigeantPriere={dirigeantPriere} setDirigeantPriere={setDirigeantPriere}
          dirigeantChants={dirigeantChants} setDirigeantChants={setDirigeantChants}
          sujetsPriereImage={sujetsPriereImage} setSujetsPriereImage={setSujetsPriereImage}
        />
      )}
      {type === "Communion" && (
        <CommunionFields
          mc={mc} setMc={setMc}
          predicateurJour={predicateurJour} setPredicateurJour={setPredicateurJour}
          choraleGroupeMusical={choraleGroupeMusical} setChoraleGroupeMusical={setChoraleGroupeMusical}
          priereOuverture={priereOuverture} setPriereOuverture={setPriereOuverture}
          themePredicationJour={themePredicationJour} setThemePredicationJour={setThemePredicationJour}
          temoignagesCommunion={temoignagesCommunion} setTemoignagesCommunion={setTemoignagesCommunion}
          diversCommunion={diversCommunion} setDiversCommunion={setDiversCommunion}
        />
      )}
      <Field label={type === "Prière" ? "Sujet de prière (si non envoyé par le bureau Afrique)" : "Thème / Sujet"}>
        <input
          style={inputStyle} value={theme} onChange={e => setTheme(e.target.value)}
          placeholder={type === "Prière" ? "Écrire ici le ou les sujets de prière…" : "Ex : Formation des formateurs"}
        />
      </Field>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}><Field label="Date de début"><input type="date" style={inputStyle} value={date} onChange={e => setDate(e.target.value)} /></Field></div>
        <div style={{ flex: 1 }}><Field label="Date de fin (facultatif)"><input type="date" style={inputStyle} value={dateFin} min={date || undefined} onChange={e => setDateFin(e.target.value)} /></Field></div>
      </div>
      <Field label="Heure"><input type="time" style={inputStyle} value={heure} onChange={e => setHeure(e.target.value)} /></Field>
      <Field label="Lieu"><input style={inputStyle} value={lieu} onChange={e => setLieu(e.target.value)} placeholder="Ex : Ouagadougou — Siège national" /></Field>
      <Field label="Position GPS (facultatif)">
        <GpsCapture position={positionGps} onChange={setPositionGps} />
      </Field>

      <Field label="Personne ressource sur place">
        <div style={{ display: "flex", gap: 8 }}>
          <input style={inputStyle} value={personneRessourceNom} onChange={e => setPersonneRessourceNom(e.target.value)} placeholder="Nom" />
          <input style={inputStyle} value={personneRessourceContact} onChange={e => setPersonneRessourceContact(e.target.value)} placeholder="Contact" />
        </div>
      </Field>

      <Field label="Budget prévisionnel (FCFA)">
        <BudgetFieldsEditor budget={budget} onChange={setBudget} />
      </Field>

      <Field label={`Prédicateurs affectés (${predicateurs.length})`}>
        <div style={{ position: "relative", marginBottom: 7 }}>
          <Search size={14} style={{ position: "absolute", left: 10, top: 11, color: "var(--ink-soft)" }} />
          <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un pasteur…" value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ maxHeight: 170, overflowY: "auto", border: "1px solid var(--border)", borderRadius: 9 }}>
          {filteredPastors.map(p => {
            const checked = predicateurs.includes(p.id);
            return (
              <div key={p.id} onClick={() => togglePred(p.id)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "9px 11px",
                borderBottom: "1px solid var(--border)", background: checked ? "var(--accent-soft)" : "#fff"
              }}>
                <div style={{
                  width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${checked ? "var(--accent-dark)" : "var(--border)"}`,
                  background: checked ? "var(--accent-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0
                }}>
                  {checked && <Check size={12} color="#fff" />}
                </div>
                <div style={{ fontSize: 13.5 }}>
                  <div style={{ fontWeight: 600 }}>{p.nom}</div>
                  <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{p.fonction}{p.assemblee ? ` · ${p.assemblee}` : ""}</div>
                </div>
              </div>
            );
          })}
        </div>
      </Field>

      <Field label="Notes (facultatif)"><textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={notes} onChange={e => setNotes(e.target.value)} /></Field>

      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce séminaire national ?")) onDelete(seminar.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce séminaire
        </button>
      )}
    </ModalShell>
  );
}

/* --- Responsables des départements + messagerie --------------------- */

function DeptHeads({ deptHeads, setDeptHeads, coordSeminars, unlocked, showToast }) {
  const [editing, setEditing] = useState(null);
  const sortedSeminars = [...coordSeminars].sort((a, b) => (a.date || "").localeCompare(b.date || ""));
  const [seminarId, setSeminarId] = useState("");
  const [selected, setSelected] = useState([]);
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState(null);

  const seminar = coordSeminars.find(s => s.id === seminarId);

  useEffect(() => {
    if (seminar) {
      setMessage(`Bonjour,\n\nUn séminaire de la coordination nationale "${seminar.theme}" est prévu le ${formatDateLong(seminar.date)}${seminar.heure ? " à " + seminar.heure : ""}${seminar.lieu ? " à " + seminar.lieu : ""}.\n\nMerci de votre présence.\n\nCoordination Nationale — Mission Parole de Vie Burkina`);
    } else {
      setMessage("");
    }
  }, [seminarId]);

  function handleSave(d) {
    const exists = deptHeads.some(x => x.id === d.id);
    const next = exists ? deptHeads.map(x => x.id === d.id ? d : x) : [...deptHeads, d];
    setDeptHeads(next);
    setEditing(null);
    showToast(exists ? "Responsable mis à jour" : "Responsable ajouté");
  }
  function handleDelete(id) {
    setDeptHeads(deptHeads.filter(x => x.id !== id));
    setEditing(null);
    showToast("Responsable supprimé");
  }
  function toggleSelected(id) {
    setSelected(prev => prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]);
  }
  function copyMessage(id) {
    navigator.clipboard?.writeText(message);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 1500);
  }

  return (
    <div>
      {unlocked && (
        <div style={{ display: "flex", justifyContent: "flex-end", marginBottom: 12 }}>
          <button onClick={() => setEditing({})} style={{
            background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "8px 14px",
            display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
          }}>
            <Plus size={15} /> Ajouter un responsable
          </button>
        </div>
      )}

      {deptHeads.length === 0 ? (
        <EmptyState icon={Users} text="Aucun responsable de département enregistré." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8, marginBottom: 22 }}>
          {deptHeads.map(d => (
            <div key={d.id} onClick={() => unlocked && setEditing(d)} style={{
              background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "11px 13px",
              display: "flex", alignItems: "center", gap: 11, cursor: unlocked ? "pointer" : "default"
            }}>
              <div style={{
                width: 38, height: 38, borderRadius: "50%", background: "var(--accent-soft)", color: "var(--accent-dark)",
                display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 700, fontSize: 14, flexShrink: 0
              }}>
                {d.nom.split(" ").map(n => n[0]).slice(0, 2).join("").toUpperCase()}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 14, fontWeight: 700 }}>{d.nom}</div>
                <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>{d.departement || "Département non précisé"}</div>
              </div>
              {d.contact ? (
                <a href={`tel:${d.contact}`} onClick={e => e.stopPropagation()} style={{ color: "var(--primary)", display: "flex", alignItems: "center", gap: 4, fontSize: 12.5 }}>
                  <Phone size={13} />
                </a>
              ) : <span style={{ fontSize: 10.5, color: "var(--danger)" }}>N° manquant</span>}
            </div>
          ))}
        </div>
      )}

      {editing && unlocked && (
        <DeptHeadForm head={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}

      {unlocked && (
        <>
          <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
            <MessageCircle size={15} color="var(--primary)" />
            <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Envoyer un message pour un séminaire national</div>
          </div>
          <Field label="Séminaire concerné">
            <select style={inputStyle} value={seminarId} onChange={e => { setSeminarId(e.target.value); setSelected([]); }}>
              <option value="">— Choisir un séminaire national —</option>
              {sortedSeminars.map(s => <option key={s.id} value={s.id}>{s.theme} — {s.date ? formatDateLong(s.date) : "date à définir"}</option>)}
            </select>
          </Field>

          {seminar && (
            <>
              <Field label="Message (modifiable)">
                <textarea style={{ ...inputStyle, minHeight: 120, resize: "vertical", fontSize: 13.5 }} value={message} onChange={e => setMessage(e.target.value)} />
              </Field>
              <Field label="Destinataires">
                <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
                  {deptHeads.map(d => (
                    <div key={d.id} style={{
                      display: "flex", alignItems: "center", gap: 10, background: "#fff", border: "1px solid var(--border)",
                      borderRadius: 11, padding: "10px 12px"
                    }}>
                      <div onClick={() => toggleSelected(d.id)} style={{
                        width: 18, height: 18, borderRadius: 5, border: `1.5px solid ${selected.includes(d.id) ? "var(--accent-dark)" : "var(--border)"}`,
                        background: selected.includes(d.id) ? "var(--accent-dark)" : "#fff", display: "flex", alignItems: "center", justifyContent: "center", flexShrink: 0, cursor: "pointer"
                      }}>
                        {selected.includes(d.id) && <Check size={12} color="#fff" />}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ fontSize: 13.5, fontWeight: 700 }}>{d.nom}</div>
                        <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{d.departement} · {d.contact || "N° manquant"}</div>
                      </div>
                      <button onClick={() => copyMessage(d.id)} style={{
                        display: "flex", alignItems: "center", gap: 4, fontSize: 11.5, color: "var(--ink-soft)",
                        padding: "6px 8px", borderRadius: 8, border: "1px solid var(--border)"
                      }}>
                        {copiedId === d.id ? <Check size={13} color="var(--primary)" /> : <Copy size={13} />}
                      </button>
                      {d.contact ? (
                        <a href={whatsappLink(d.contact, message)} target="_blank" rel="noopener noreferrer" style={{
                          display: "flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                          fontSize: 12, fontWeight: 700, padding: "8px 11px", borderRadius: 8
                        }}>
                          <Send size={13} /> WhatsApp
                        </a>
                      ) : <span style={{ fontSize: 10.5, color: "var(--danger)" }}>—</span>}
                    </div>
                  ))}
                </div>
              </Field>
            </>
          )}
        </>
      )}
    </div>
  );
}

function DeptHeadForm({ head, onSave, onDelete, onClose }) {
  const isNew = !head.id;
  const [nom, setNom] = useState(head.nom || "");
  const [departement, setDepartement] = useState(head.departement || "");
  const [contact, setContact] = useState(head.contact || "");

  function handleSubmit() {
    if (!nom.trim()) { alert("Merci de renseigner le nom."); return; }
    onSave({ id: head.id || uid(), nom: nom.trim(), departement: departement.trim(), contact: contact.trim() });
  }

  return (
    <ModalShell title={isNew ? "Nouveau responsable" : "Modifier le responsable"} onClose={onClose}>
      <Field label="Nom complet"><input style={inputStyle} value={nom} onChange={e => setNom(e.target.value)} placeholder="Ex : Jean Ouédraogo" /></Field>
      <Field label="Département"><input style={inputStyle} value={departement} onChange={e => setDepartement(e.target.value)} placeholder="Ex : Département Évangélisation" /></Field>
      <Field label="Contact (téléphone)"><input style={inputStyle} value={contact} onChange={e => setContact(e.target.value)} placeholder="Ex : 70 00 00 00" /></Field>
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce responsable ?")) onDelete(head.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce responsable
        </button>
      )}
    </ModalShell>
  );
}

/* --- Plan d'action annuel / mensuel / hebdomadaire ------------------ */

/* ------------------------------------------------------------------ */
/*  PLANS D'ACTION DES DÉPARTEMENTS (annuel / trimestriel / mensuel)    */
/* ------------------------------------------------------------------ */

const DEPARTEMENTS_COORD = ["Missions et Formations", "Communication", "Finance", "Patrimoine", "Socioculturel et Famille", "Autres"];
const DP_AXES = [
  "Évangélisation & mission", "Formation des prédicateurs", "Séminaires & conventions", "Implantation de cellules",
  "Prière & intercession", "Communication & médias", "Finances & collecte", "Patrimoine (terrains, lieux de culte, matériel)",
  "Social & famille", "Jeunesse", "Femmes", "Hommes", "Enfants (plus jeunes)", "Culture & loisirs", "Administration",
];
const DP_SOURCES = ["Caisse coordination", "Caisse assemblée", "Dons volontaires", "Part Convention", "Contribution des participants", "Partenaires", "Autre"];
const DP_STATUTS = [
  { value: "prevue", label: "Prévue", tone: "var(--ink-soft)", bg: "#EEEEE8" },
  { value: "encours", label: "En cours", tone: "var(--primary)", bg: "#E6E9F2" },
  { value: "realisee", label: "Réalisée", tone: "#1F7A5C", bg: "#E3F1EA" },
  { value: "reportee", label: "Reportée", tone: "var(--accent-dark)", bg: "var(--accent-soft)" },
  { value: "annulee", label: "Annulée", tone: "var(--danger)", bg: "#F5E4E4" },
];
const TRIMESTRES = [
  { n: 1, label: "T1", mois: "janv. – mars" },
  { n: 2, label: "T2", mois: "avr. – juin" },
  { n: 3, label: "T3", mois: "juil. – sept." },
  { n: 4, label: "T4", mois: "oct. – déc." },
];
const NIVEAUX_PLAN = { annuel: "de l'année", trimestriel: "du trimestre", mensuel: "du mois" };

function dpStatut(v) { return DP_STATUTS.find(s => s.value === v) || DP_STATUTS[0]; }
function trimestreOfMonth(m) { return Math.floor(m / 3) + 1; }

function StatutChip({ value }) {
  const s = dpStatut(value);
  return <span style={{ fontSize: 10.5, fontWeight: 700, color: s.tone, background: s.bg, borderRadius: 99, padding: "2px 8px", whiteSpace: "nowrap" }}>{s.label}</span>;
}

function ChipPicker({ options, value, onChange, small }) {
  return (
    <div style={{ display: "flex", gap: 6, flexWrap: "wrap" }}>
      {options.map(o => {
        const v = typeof o === "object" ? o.value : o;
        const l = typeof o === "object" ? o.label : o;
        const active = value === v;
        return (
          <button key={v} onClick={() => onChange(v)} style={{
            padding: small ? "5px 10px" : "7px 12px", borderRadius: 99, fontSize: small ? 11.5 : 12.5, fontWeight: 700,
            border: `1.5px solid ${active ? "var(--primary)" : "var(--border)"}`,
            background: active ? "var(--primary)" : "#fff", color: active ? "#fff" : "var(--ink-soft)"
          }}>{l}</button>
        );
      })}
    </div>
  );
}

function dpStats(items) {
  const actifs = items.filter(i => i.statut !== "annulee");
  const realisees = items.filter(i => i.statut === "realisee").length;
  const budget = items.reduce((s, i) => s + (Number(i.budget) || 0), 0);
  const depense = items.reduce((s, i) => s + (Number(i.depenseReelle) || 0), 0);
  return { total: items.length, actifs: actifs.length, realisees, taux: actifs.length ? Math.round(realisees / actifs.length * 100) : null, budget, depense };
}

function planToText(dept, titre, items) {
  const L = [`🎯 *Plan d'action ${titre}*`, `Département : ${dept}`, ""];
  items.forEach((i, k) => {
    L.push(`${k + 1}. ${i.activite}${i.date ? ` (${formatDateLong(i.date)})` : ""} — ${dpStatut(i.statut).label}`);
    if (i.objectif) L.push(`   Objectif : ${i.objectif}`);
    if (i.responsable) L.push(`   Responsable : ${i.responsable}`);
    if (Number(i.budget) > 0) L.push(`   Budget : ${fcfa(i.budget)}`);
  });
  const st = dpStats(items);
  L.push("", `Total : ${st.total} activité(s) · ${st.realisees} réalisée(s) · budget ${fcfa(st.budget)}`, "", "Mission Parole de Vie Burkina");
  return L.join("\n");
}

function readUnlockedDepts() {
  try { return JSON.parse(sessionStorage.getItem("mpv-dept-unlocked") || "[]"); } catch (e) { return []; }
}
function writeUnlockedDepts(list) {
  try { sessionStorage.setItem("mpv-dept-unlocked", JSON.stringify(list)); } catch (e) {}
}
function responsableOf(deptHeads, dept) {
  const norm = (x) => (x || "").normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
  const d = norm(dept).split(" ")[0];
  return (deptHeads || []).find(h => norm(h.departement).includes(d));
}

function PlansDepartements({ deptPlans, saveDeptPlan, deleteDeptPlan, deptBilans, saveDeptBilan, deleteDeptBilan, deptCodes, saveDeptCode, deptHeads, leadership, adminUnlocked, onAdminUnlock, onAdminLock, showToast }) {
  const [espace, setEspace] = useState("dept");
  const [unlockedDepts, setUnlockedDepts] = useState(readUnlockedDepts);
  const [changingCode, setChangingCode] = useState(false);
  const [natVue, setNatVue] = useState("tableau");
  const now = new Date();
  const [dept, setDept] = useState(() => { try { return localStorage.getItem("mpv-dp-dept") || ""; } catch (e) { return ""; } });
  const [annee, setAnnee] = useState(now.getFullYear());
  const [vue, setVue] = useState("annee");
  const [trim, setTrim] = useState(trimestreOfMonth(now.getMonth()));
  const [mois, setMois] = useState(now.getMonth());
  const [editing, setEditing] = useState(null);
  const [editingBilan, setEditingBilan] = useState(null);

  function chooseDept(d) { setDept(d); try { localStorage.setItem("mpv-dp-dept", d); } catch (e) {} }

  const duDept = deptPlans.filter(p => p.departement === dept && Number(p.annee) === Number(annee));
  const annuels = duDept.filter(p => p.niveau === "annuel");
  const trimestriels = duDept.filter(p => p.niveau === "trimestriel");
  const mensuels = duDept.filter(p => p.niveau === "mensuel");

  async function handleSave(item) {
    const ok = await saveDeptPlan(item);
    if (ok) { setEditing(null); showToast("Activité enregistrée"); }
  }
  async function handleDelete(item) {
    const ok = await deleteDeptPlan(item);
    if (ok) { setEditing(null); showToast("Activité supprimée"); }
  }
  async function quickStatut(item, statut) {
    const ok = await saveDeptPlan({ ...item, statut, modifieLe: new Date().toISOString() });
    if (ok) showToast(`Marquée « ${dpStatut(statut).label} »`);
  }
  function nouveau(niveau, extra = {}) {
    setEditing({ niveau, departement: dept, annee, statut: "prevue", ...extra });
  }

  const annees = [now.getFullYear() - 1, now.getFullYear(), now.getFullYear() + 1, now.getFullYear() + 2];
  const viaCode = unlockedDepts.includes(dept);
  const acces = !!dept && (adminUnlocked || viaCode);
  const resp = responsableOf(deptHeads, dept);

  function unlockDept(d) { const next = [...new Set([...unlockedDepts, d])]; setUnlockedDepts(next); writeUnlockedDepts(next); }
  function lockDept(d) { const next = unlockedDepts.filter(x => x !== d); setUnlockedDepts(next); writeUnlockedDepts(next); }

  const choixAnnee = (
    <Field label="Année">
      <ChipPicker options={annees.map(a => ({ value: a, label: String(a) }))} value={annee} onChange={setAnnee} small />
    </Field>
  );

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14 }}>
        {[["dept", "Mon département"], ["national", "Vue nationale"]].map(([k, l]) => (
          <button key={k} onClick={() => setEspace(k)} style={{
            flex: 1, padding: "9px 0", borderRadius: 10, fontSize: 12.5, fontWeight: 700,
            border: `1.5px solid ${espace === k ? "var(--primary)" : "var(--border)"}`,
            background: espace === k ? "var(--primary)" : "#fff", color: espace === k ? "#fff" : "var(--ink-soft)"
          }}>{l}</button>
        ))}
      </div>

      {espace === "national" ? (
        <>
          <CoordLockPanel
            leadership={leadership} unlocked={adminUnlocked} onUnlock={onAdminUnlock} onLock={onAdminLock}
            description="La vue nationale (tableau de tous les départements et codes d'accès des départements) est réservée au chef du département."
          />
          {adminUnlocked && (
            <>
              <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
                <button onClick={() => setNatVue("tableau")} style={segButtonStyle(natVue === "tableau")}>Tableau des départements</button>
                <button onClick={() => setNatVue("codes")} style={segButtonStyle(natVue === "codes")}>Codes d'accès</button>
              </div>
              {natVue === "tableau" ? (
                <>{choixAnnee}<PlansTableau deptPlans={deptPlans} annee={annee} /></>
              ) : (
                <DeptCodesAdmin deptCodes={deptCodes} saveDeptCode={saveDeptCode} showToast={showToast} />
              )}
            </>
          )}
        </>
      ) : (
        <>
      <Field label="Choisissez votre département">
        <ChipPicker options={DEPARTEMENTS_COORD} value={dept} onChange={chooseDept} small />
      </Field>

      {!dept ? (
        <EmptyState icon={Target} text="Touchez le nom de votre département pour ouvrir son espace." />
      ) : !acces ? (
        <DeptLockPanel dept={dept} code={deptCodes[dept]} onUnlock={() => { unlockDept(dept); showToast(`Espace ${dept} ouvert`); }} />
      ) : (
        <>
          <div style={{ background: "linear-gradient(135deg, var(--primary), var(--primary-light))", color: "#fff", borderRadius: 14, padding: "13px 15px", marginBottom: 14 }}>
            <div style={{ fontSize: 10.5, textTransform: "uppercase", letterSpacing: ".08em", color: "var(--accent)", fontWeight: 700 }}>Espace du département</div>
            <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, marginTop: 2 }}>{dept}</div>
            <div style={{ fontSize: 12, opacity: .85, marginTop: 2 }}>
              {resp ? `Chef : ${resp.nom}${resp.contact ? " · " + resp.contact : ""}` : "Chef du département non renseigné (Coord. → Responsables)"}
            </div>
            <div style={{ display: "flex", gap: 8, marginTop: 10, flexWrap: "wrap" }}>
              {(viaCode || adminUnlocked) && (
                <button onClick={() => setChangingCode(true)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 10px" }}>
                  <Lock size={13} /> Changer le code
                </button>
              )}
              {viaCode && (
                <button onClick={() => { lockDept(dept); showToast("Espace verrouillé"); }} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12, fontWeight: 700, color: "#fff", background: "rgba(255,255,255,.15)", borderRadius: 8, padding: "6px 10px" }}>
                  <Unlock size={13} /> Verrouiller
                </button>
              )}
              {!viaCode && adminUnlocked && (
                <span style={{ fontSize: 11.5, opacity: .85, alignSelf: "center" }}>Ouvert avec le code du chef du département</span>
              )}
            </div>
          </div>

          {choixAnnee}

          <div style={{ display: "flex", gap: 4, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)", overflowX: "auto" }}>
            {[["annee", "Année"], ["trimestre", "Trimestre"], ["mois", "Mois"], ["bilan", "Bilan"]].map(([k, l]) => (
              <button key={k} onClick={() => setVue(k)} style={{ ...segButtonStyle(vue === k), flex: "1 0 auto", padding: "8px 9px" }}>{l}</button>
            ))}
          </div>

      {vue === "annee" ? (
        <PlanListe
          titre={`de l'année ${annee}`} dept={dept} items={annuels}
          groupBy={i => i.trimestre ? `${TRIMESTRES[i.trimestre - 1].label} · ${TRIMESTRES[i.trimestre - 1].mois}` : "Trimestre non précisé"}
          onAdd={() => nouveau("annuel", { trimestre: trim })} addLabel="Ajouter une activité de l'année"
          onOpen={setEditing} onQuick={quickStatut}
          vide="Aucune activité prévue pour cette année. Commencez par les grandes activités du département."
        />
      ) : vue === "trimestre" ? (
        <>
          <Field label="Trimestre">
            <ChipPicker options={TRIMESTRES.map(t => ({ value: t.n, label: `${t.label} · ${t.mois}` }))} value={trim} onChange={setTrim} small />
          </Field>
          {annuels.filter(a => Number(a.trimestre) === trim).length > 0 && (
            <div style={{ background: "var(--accent-soft)", borderRadius: 10, padding: "9px 11px", marginBottom: 12, fontSize: 12, color: "var(--accent-dark)", lineHeight: 1.45 }}>
              <b>Prévu dans le plan de l'année pour ce trimestre :</b> {annuels.filter(a => Number(a.trimestre) === trim).map(a => a.activite).join(" · ")}
            </div>
          )}
          <PlanListe
            titre={`du ${TRIMESTRES[trim - 1].label} ${annee}`} dept={dept}
            items={trimestriels.filter(p => Number(p.trimestre) === trim)}
            onAdd={() => nouveau("trimestriel", { trimestre: trim })} addLabel="Ajouter une action du trimestre"
            onOpen={setEditing} onQuick={quickStatut}
            vide="Aucune action pour ce trimestre. Découpez les activités de l'année en actions datées."
          />
        </>
      ) : vue === "mois" ? (
        <>
          <Field label="Mois">
            <select style={inputStyle} value={mois} onChange={e => setMois(Number(e.target.value))}>
              {MOIS_ANNEE.map((m, i) => <option key={m} value={i}>{m} {annee}</option>)}
            </select>
          </Field>
          <PlanListe
            titre={`de ${MOIS_ANNEE[mois].toLowerCase()} ${annee}`} dept={dept} mensuel
            items={mensuels.filter(p => Number(p.mois) === mois)}
            onAdd={() => nouveau("mensuel", { mois, trimestre: trimestreOfMonth(mois) })} addLabel="Ajouter une tâche du mois"
            onOpen={setEditing} onQuick={quickStatut}
            vide="Aucune tâche pour ce mois. Ajoutez les tâches concrètes à faire."
          />
        </>
      ) : (
        <BilansListe
          dept={dept} annee={annee} bilans={deptBilans.filter(b => b.departement === dept && Number(b.annee) === Number(annee))}
          onAdd={() => setEditingBilan({ departement: dept, annee, typePeriode: "Mois", mois, trimestre: trim })}
          onOpen={setEditingBilan}
          statsFor={b => dpStats(b.typePeriode === "Mois" ? mensuels.filter(p => Number(p.mois) === Number(b.mois))
            : b.typePeriode === "Trimestre" ? trimestriels.filter(p => Number(p.trimestre) === Number(b.trimestre)) : annuels)}
        />
      )}
        </>
      )}
        </>
      )}

      {changingCode && (
        <ChangeDeptCodeForm
          dept={dept} onClose={() => setChangingCode(false)}
          onSave={async code => { const ok = await saveDeptCode(dept, code); if (ok) { setChangingCode(false); showToast("Nouveau code enregistré"); } }}
        />
      )}
      {editing && (
        <PlanItemForm
          entry={editing} parents={editing.niveau === "trimestriel" ? annuels : editing.niveau === "mensuel" ? trimestriels : []}
          onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)}
        />
      )}
      {editingBilan && (
        <BilanForm
          entry={editingBilan}
          onSave={async b => { const ok = await saveDeptBilan(b); if (ok) { setEditingBilan(null); showToast("Bilan enregistré"); } }}
          onDelete={async b => { const ok = await deleteDeptBilan(b); if (ok) { setEditingBilan(null); showToast("Bilan supprimé"); } }}
          onClose={() => setEditingBilan(null)}
        />
      )}
    </div>
  );
}

function DeptLockPanel({ dept, code, onUnlock }) {
  const [pin, setPin] = useState("");
  const [err, setErr] = useState(false);
  function tryUnlock() {
    if (code && pin.trim() === String(code)) { setPin(""); setErr(false); onUnlock(); }
    else setErr(true);
  }
  return (
    <div style={{ background: "#fff", borderRadius: 14, border: "1px solid var(--border)", padding: 16, marginBottom: 16 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 6 }}>
        <Lock size={16} color="var(--accent-dark)" />
        <div style={{ fontSize: 14.5, fontWeight: 700, color: "var(--primary)" }}>Espace réservé · {dept}</div>
      </div>
      {!code ? (
        <div style={{ fontSize: 12.5, color: "var(--danger)", lineHeight: 1.45 }}>
          Aucun code n'a encore été créé pour ce département. Le chef du département national doit le créer dans « Vue nationale → Codes d'accès », puis le remettre au chef de ce département.
        </div>
      ) : (
        <>
          <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10, lineHeight: 1.45 }}>
            Entrez le code du département. Seuls le chef du département et les personnes à qui il l'a remis peuvent ouvrir cet espace.
          </div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>
              <PinField value={pin} placeholder="Code du département" onChange={v => { setPin(v); setErr(false); }} onKeyDown={e => e.key === "Enter" && tryUnlock()} />
            </div>
            <button onClick={tryUnlock} aria-label="Ouvrir l'espace" style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 16px" }}>
              <Unlock size={15} />
            </button>
          </div>
          {err && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 6 }}>Code incorrect.</div>}
        </>
      )}
    </div>
  );
}

function ChangeDeptCodeForm({ dept, onSave, onClose }) {
  const [a, setA] = useState("");
  const [b, setB] = useState("");
  const [err, setErr] = useState("");
  const [saving, setSaving] = useState(false);
  async function submit() {
    if (a.trim().length < 4) { setErr("Le code doit avoir au moins 4 caractères."); return; }
    if (a.trim() !== b.trim()) { setErr("Les deux codes ne sont pas identiques."); return; }
    setSaving(true); await onSave(a.trim()); setSaving(false);
  }
  return (
    <ModalShell title={`Nouveau code · ${dept}`} onClose={onClose}>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.45 }}>
        L'ancien code ne marchera plus. Remettez le nouveau code uniquement aux personnes qui doivent travailler dans cet espace.
      </div>
      <Field label="Nouveau code"><PinField value={a} onChange={v => { setA(v); setErr(""); }} placeholder="Au moins 4 chiffres ou lettres" /></Field>
      <Field label="Confirmer le nouveau code"><PinField value={b} onChange={v => { setB(v); setErr(""); }} placeholder="Retapez le code" /></Field>
      {err && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 10 }}>{err}</div>}
      <PrimaryButton full icon={Check} onClick={saving ? undefined : submit}>{saving ? "Enregistrement…" : "Enregistrer le nouveau code"}</PrimaryButton>
    </ModalShell>
  );
}

function DeptCodesAdmin({ deptCodes, saveDeptCode, showToast }) {
  const [drafts, setDrafts] = useState({});
  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 12, lineHeight: 1.45 }}>
        Créez un code pour chaque département et remettez-le à son chef. Il pourra ensuite le changer lui-même et le partager avec ses collaborateurs. Le code du chef du département national ouvre tous les espaces.
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
        {DEPARTEMENTS_COORD.map(d => {
          const draft = drafts[d] ?? (deptCodes[d] || "");
          const changed = draft !== (deptCodes[d] || "");
          return (
            <div key={d} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 12, padding: "11px 12px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
                <div style={{ fontSize: 13.5, fontWeight: 700 }}>{d}</div>
                <span style={{ fontSize: 10.5, fontWeight: 700, borderRadius: 99, padding: "2px 8px", color: deptCodes[d] ? "#1F7A5C" : "var(--danger)", background: deptCodes[d] ? "#E3F1EA" : "#F5E4E4" }}>
                  {deptCodes[d] ? "Code créé" : "Pas de code"}
                </span>
              </div>
              <div style={{ display: "flex", gap: 8 }}>
                <div style={{ flex: 1 }}>
                  <PinField value={draft} onChange={v => setDrafts({ ...drafts, [d]: v })} placeholder="Au moins 4 caractères" />
                </div>
                {changed && (
                  <button onClick={async () => {
                    if (draft.trim().length < 4) { showToast("Le code doit avoir au moins 4 caractères"); return; }
                    const ok = await saveDeptCode(d, draft.trim());
                    if (ok) { showToast(`Code de ${d} enregistré`); setDrafts(x => { const n = { ...x }; delete n[d]; return n; }); }
                  }} style={{ background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px", fontSize: 12.5, fontWeight: 700 }}>
                    Enregistrer
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

function PlanListe({ titre, dept, items, groupBy, onAdd, addLabel, onOpen, onQuick, vide, mensuel }) {
  const sorted = [...items].sort((a, b) => (Number(a.trimestre) || 9) - (Number(b.trimestre) || 9) || (a.date || "").localeCompare(b.date || ""));
  const st = dpStats(items);
  const groups = [];
  sorted.forEach(i => {
    const g = groupBy ? groupBy(i) : "";
    const last = groups[groups.length - 1];
    if (last && last.g === g) last.items.push(i); else groups.push({ g, items: [i] });
  });

  return (
    <div>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 8, marginBottom: 12 }}>
        {[["Activités", st.total], ["Réalisées", st.taux === null ? "—" : `${st.realisees} · ${st.taux} %`], [mensuel ? "Dépensé / prévu" : "Budget prévu", mensuel ? `${fcfa(st.depense)} / ${fcfa(st.budget)}` : fcfa(st.budget)]].map(([l, v]) => (
          <div key={l} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "8px 9px" }}>
            <div style={{ fontSize: 10, textTransform: "uppercase", fontWeight: 700, color: "var(--ink-soft)" }}>{l}</div>
            <div style={{ fontSize: 13, fontWeight: 700, color: mensuel && l.startsWith("Dépensé") && st.depense > st.budget && st.budget > 0 ? "var(--danger)" : "var(--ink)", fontVariantNumeric: "tabular-nums" }}>{v}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <div style={{ flex: 1 }}><PrimaryButton full icon={Plus} onClick={onAdd}>{addLabel}</PrimaryButton></div>
        {items.length > 0 && (
          <a href={shareWhatsappLink(planToText(dept, titre, sorted))} target="_blank" rel="noopener noreferrer" aria-label="Partager par WhatsApp" style={{
            background: "#25D366", color: "#fff", borderRadius: 10, padding: "0 14px", display: "flex", alignItems: "center"
          }}><Send size={16} /></a>
        )}
      </div>

      {items.length === 0 ? <EmptyState icon={Target} text={vide} /> : groups.map(gr => (
        <div key={gr.g || "all"} style={{ marginBottom: 12 }}>
          {gr.g && <div style={{ fontSize: 11.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 6 }}>{gr.g}</div>}
          <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
            {gr.items.map(i => {
              const s = dpStatut(i.statut);
              const depasse = mensuel && Number(i.depenseReelle) > Number(i.budget) && Number(i.budget) > 0;
              return (
                <div key={i.id} style={{ background: "#fff", border: "1px solid var(--border)", borderLeft: `4px solid ${s.tone}`, borderRadius: 12, padding: "11px 12px" }}>
                  <div onClick={() => onOpen(i)} style={{ cursor: "pointer" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", gap: 8, alignItems: "flex-start" }}>
                      <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{i.activite}</div>
                      <StatutChip value={i.statut} />
                    </div>
                    {i.objectif && <div style={{ fontSize: 12, color: "var(--ink-soft)", marginTop: 3 }}>{i.objectif}</div>}
                    <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 5, display: "flex", flexWrap: "wrap", gap: "2px 10px" }}>
                      {i.date && <span>📅 {formatDateLong(i.date)}</span>}
                      {i.lieu && <span>📍 {i.lieu}</span>}
                      {i.responsable && <span>👤 {i.responsable}</span>}
                      {Number(i.budget) > 0 && <span>💰 {fcfa(i.budget)}{mensuel && Number(i.depenseReelle) > 0 ? ` · dépensé ${fcfa(i.depenseReelle)}` : ""}</span>}
                    </div>
                    {depasse && <div style={{ fontSize: 11.5, color: "var(--danger)", fontWeight: 700, marginTop: 4 }}>Budget dépassé de {fcfa(Number(i.depenseReelle) - Number(i.budget))}</div>}
                  </div>
                  {i.statut !== "realisee" && i.statut !== "annulee" && (
                    <div style={{ display: "flex", gap: 6, marginTop: 9 }}>
                      {i.statut === "prevue" && (
                        <button onClick={() => onQuick(i, "encours")} style={{ fontSize: 11.5, fontWeight: 700, color: "var(--primary)", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 9px" }}>Démarrer</button>
                      )}
                      <button onClick={() => mensuel ? onOpen({ ...i, statut: "realisee" }) : onQuick(i, "realisee")} style={{ fontSize: 11.5, fontWeight: 700, color: "#1F7A5C", border: "1px solid var(--border)", borderRadius: 8, padding: "5px 9px", display: "flex", alignItems: "center", gap: 4 }}>
                        <Check size={12} /> {mensuel ? "Réalisée (saisir le bilan)" : "Marquer réalisée"}
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      ))}
    </div>
  );
}

function PlanItemForm({ entry, parents, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const niveau = entry.niveau;
  const [f, setF] = useState({
    activite: entry.activite || "", objectif: entry.objectif || "", axe: entry.axe || "", indicateur: entry.indicateur || "",
    cible: numInput(entry.cible), trimestre: entry.trimestre || 1, date: entry.date || "", lieu: entry.lieu || "",
    responsable: entry.responsable || "", budget: numInput(entry.budget), source: entry.source || "",
    statut: entry.statut || "prevue", parentId: entry.parentId || "", ressources: entry.ressources || "",
    participantsAttendus: numInput(entry.participantsAttendus), participantsReels: numInput(entry.participantsReels),
    depenseReelle: numInput(entry.depenseReelle), observations: entry.observations || "",
  });
  const [plus, setPlus] = useState(!isNew);
  const [error, setError] = useState("");
  const set = (k, v) => { setF(p => ({ ...p, [k]: v })); setError(""); };

  const parentsUtiles = parents.filter(p => niveau !== "trimestriel" || !p.trimestre || Number(p.trimestre) === Number(f.trimestre));
  function chooseParent(id) {
    const p = parents.find(x => x.id === id);
    setF(prev => ({ ...prev, parentId: id, objectif: prev.objectif || p?.objectif || "", axe: prev.axe || p?.axe || "", activite: prev.activite || p?.activite || "" }));
  }
  const ecart = (Number(f.budget) || 0) - (Number(f.depenseReelle) || 0);

  function handleSubmit() {
    if (!f.activite.trim()) { setError("Indiquez l'activité."); return; }
    const num = v => v === "" ? "" : Number(v) || 0;
    onSave({
      ...entry, id: entry.id || uid(), ...f,
      activite: f.activite.trim(), objectif: f.objectif.trim(), indicateur: f.indicateur.trim(), lieu: f.lieu.trim(),
      responsable: f.responsable.trim(), observations: f.observations.trim(), ressources: f.ressources.trim(),
      cible: num(f.cible), budget: num(f.budget), participantsAttendus: num(f.participantsAttendus),
      participantsReels: num(f.participantsReels), depenseReelle: num(f.depenseReelle),
      trimestre: niveau === "mensuel" ? trimestreOfMonth(Number(entry.mois)) : Number(f.trimestre),
      creeLe: entry.creeLe || new Date().toISOString(), modifieLe: new Date().toISOString(),
    });
  }

  const txt = (k, label, ph) => <Field label={label}><input style={inputStyle} value={f[k]} onChange={e => set(k, e.target.value)} placeholder={ph} /></Field>;
  const num = (k, label, money) => (
    <Field label={label}><input type="number" inputMode="numeric" min="0" style={inputStyle} value={f[k]} onChange={e => set(k, e.target.value)} placeholder={money ? "0 F" : "0"} /></Field>
  );

  return (
    <ModalShell title={isNew ? `Nouvelle activité ${NIVEAUX_PLAN[niveau]}` : "Modifier l'activité"} onClose={onClose}>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>
        {entry.departement} · {niveau === "mensuel" ? `${MOIS_ANNEE[entry.mois]} ${entry.annee}` : entry.annee}
      </div>

      {parentsUtiles.length > 0 && (
        <Field label={niveau === "trimestriel" ? "Activité de l'année concernée" : "Action du trimestre concernée"}>
          <select style={inputStyle} value={f.parentId} onChange={e => chooseParent(e.target.value)}>
            <option value="">— Aucune / nouvelle —</option>
            {parentsUtiles.map(p => <option key={p.id} value={p.id}>{p.activite}</option>)}
          </select>
        </Field>
      )}

      {txt("activite", niveau === "mensuel" ? "Tâche à faire" : "Activité", niveau === "mensuel" ? "Ex. Réserver la salle du séminaire" : "Ex. Grand séminaire des prédicateurs à Bobo")}
      {txt("objectif", "Objectif", "Ex. Former 60 prédicateurs")}

      {niveau === "annuel" && (
        <Field label="Trimestre prévu">
          <ChipPicker options={TRIMESTRES.map(t => ({ value: t.n, label: `${t.label} · ${t.mois}` }))} value={Number(f.trimestre)} onChange={v => set("trimestre", v)} small />
        </Field>
      )}
      {niveau !== "annuel" && (
        <Field label="Date prévue"><input type="date" style={inputStyle} value={f.date} onChange={e => set("date", e.target.value)} /></Field>
      )}

      {num("budget", "Budget prévu (FCFA)", true)}

      <Field label="Statut">
        <ChipPicker options={DP_STATUTS} value={f.statut} onChange={v => set("statut", v)} small />
      </Field>

      {niveau === "mensuel" && (f.statut === "realisee" || f.statut === "encours" || f.participantsReels !== "" || f.depenseReelle !== "") && (
        <div style={{ background: "#F4F5EE", borderRadius: 11, padding: "11px 11px 1px", marginBottom: 13 }}>
          <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", marginBottom: 8 }}>Bilan de la tâche</div>
          <div style={{ display: "flex", gap: 8 }}>
            <div style={{ flex: 1 }}>{num("participantsAttendus", "Participants attendus")}</div>
            <div style={{ flex: 1 }}>{num("participantsReels", "Participants réels")}</div>
          </div>
          {num("depenseReelle", "Dépense réelle (FCFA)", true)}
          {(f.budget !== "" || f.depenseReelle !== "") && (
            <div style={{ fontSize: 12.5, fontWeight: 700, marginBottom: 12, color: ecart < 0 ? "var(--danger)" : "#1F7A5C" }}>
              {ecart < 0 ? `Dépassement de ${fcfa(-ecart)}` : `Économie de ${fcfa(ecart)}`}
            </div>
          )}
        </div>
      )}

      <button onClick={() => setPlus(!plus)} style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", marginBottom: 12, display: "flex", alignItems: "center", gap: 4 }}>
        <ChevronRight size={14} style={{ transform: plus ? "rotate(90deg)" : "none" }} /> {plus ? "Moins de détails" : "Plus de détails (facultatif)"}
      </button>
      {plus && (
        <>
          {txt("responsable", "Responsable", "Nom de la personne chargée")}
          {txt("lieu", "Lieu / assemblées concernées", "Ex. BOBO, HOUNDE")}
          {niveau === "annuel" && (
            <Field label="Axe / domaine">
              <select style={inputStyle} value={f.axe} onChange={e => set("axe", e.target.value)}>
                <option value="">— Choisir —</option>
                {DP_AXES.map(a => <option key={a}>{a}</option>)}
              </select>
            </Field>
          )}
          {niveau !== "mensuel" && (
            <div style={{ display: "flex", gap: 8 }}>
              <div style={{ flex: 2 }}>{txt("indicateur", "Indicateur de réussite", "Ex. Nombre de prédicateurs formés")}</div>
              <div style={{ flex: 1 }}>{num("cible", "Cible")}</div>
            </div>
          )}
          {niveau !== "annuel" && txt("ressources", "Ressources nécessaires", "Ex. Salle, sonorisation, hébergement")}
          {niveau === "mensuel" && f.statut !== "realisee" && f.statut !== "encours" && num("participantsAttendus", "Participants attendus")}
          <Field label="Source de financement">
            <select style={inputStyle} value={f.source} onChange={e => set("source", e.target.value)}>
              <option value="">— Choisir —</option>
              {DP_SOURCES.map(s => <option key={s}>{s}</option>)}
            </select>
          </Field>
          <Field label="Observations">
            <textarea style={{ ...inputStyle, minHeight: 60, resize: "vertical" }} value={f.observations} onChange={e => set("observations", e.target.value)} />
          </Field>
        </>
      )}

      {error && <div style={{ fontSize: 12.5, color: "var(--danger)", fontWeight: 600, marginBottom: 10 }}>{error}</div>}
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer cette activité ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer cette activité
        </button>
      )}
    </ModalShell>
  );
}

function bilanPeriodeLabel(b) {
  if (b.typePeriode === "Mois") return `${MOIS_ANNEE[b.mois] || ""} ${b.annee}`;
  if (b.typePeriode === "Trimestre") return `${TRIMESTRES[(b.trimestre || 1) - 1].label} ${b.annee}`;
  return `Année ${b.annee}`;
}

function BilansListe({ dept, annee, bilans, onAdd, onOpen, statsFor }) {
  const ordre = { "Année": 0, "Trimestre": 1, "Mois": 2 };
  const sorted = [...bilans].sort((a, b) => ordre[a.typePeriode] - ordre[b.typePeriode] || (Number(b.trimestre) || 0) - (Number(a.trimestre) || 0) || (Number(b.mois) || 0) - (Number(a.mois) || 0));
  return (
    <div>
      <div style={{ marginBottom: 14 }}><PrimaryButton full icon={Plus} onClick={onAdd}>Faire un bilan</PrimaryButton></div>
      {sorted.length === 0 ? <EmptyState icon={FileText} text={`Aucun bilan pour ${dept} en ${annee}.`} /> : (
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {sorted.map(b => {
            const st = statsFor(b);
            const text = [
              `📋 *Bilan ${bilanPeriodeLabel(b)}* — ${b.departement}`,
              st.total ? `${st.realisees}/${st.actifs} activités réalisées${st.taux !== null ? ` (${st.taux} %)` : ""} · Budget ${fcfa(st.budget)} · Dépensé ${fcfa(st.depense)}` : "",
              b.resultats ? `\n*Résultats :* ${b.resultats}` : "", b.difficultes ? `*Difficultés :* ${b.difficultes}` : "",
              b.solutions ? `*Solutions :* ${b.solutions}` : "", b.decisions ? `*Décisions :* ${b.decisions}` : "",
              b.redigePar ? `\nRédigé par ${b.redigePar}` : "", "Mission Parole de Vie Burkina",
            ].filter(Boolean).join("\n");
            return (
              <div key={b.id} style={{ background: "#fff", border: "1px solid var(--border)", borderLeft: "4px solid var(--accent)", borderRadius: 12, padding: "11px 12px" }}>
                <div onClick={() => onOpen(b)} style={{ cursor: "pointer" }}>
                  <div style={{ display: "flex", justifyContent: "space-between", gap: 8 }}>
                    <div style={{ fontSize: 13.5, fontWeight: 700 }}>Bilan · {bilanPeriodeLabel(b)}</div>
                    {st.taux !== null && <span style={{ fontSize: 12, fontWeight: 700, color: st.taux >= 70 ? "#1F7A5C" : st.taux >= 40 ? "var(--accent-dark)" : "var(--danger)" }}>{st.taux} % réalisé</span>}
                  </div>
                  {b.resultats && <div style={{ fontSize: 12, color: "var(--ink)", marginTop: 4 }}>✔ {b.resultats}</div>}
                  {b.difficultes && <div style={{ fontSize: 12, color: "var(--danger)", marginTop: 3 }}>⚠ {b.difficultes}</div>}
                </div>
                <a href={shareWhatsappLink(text)} target="_blank" rel="noopener noreferrer" style={{
                  display: "inline-flex", alignItems: "center", gap: 5, background: "#25D366", color: "#fff",
                  fontSize: 11.5, fontWeight: 700, padding: "5px 10px", borderRadius: 8, marginTop: 9
                }}><Send size={12} /> Partager</a>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function BilanForm({ entry, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [b, setB] = useState({
    typePeriode: entry.typePeriode || "Mois", mois: entry.mois ?? 0, trimestre: entry.trimestre || 1,
    resultats: entry.resultats || "", difficultes: entry.difficultes || "", causes: entry.causes || "",
    solutions: entry.solutions || "", decisions: entry.decisions || "", redigePar: entry.redigePar || "",
  });
  const set = (k, v) => setB(p => ({ ...p, [k]: v }));
  const area = (k, label, ph) => (
    <Field label={label}><textarea style={{ ...inputStyle, minHeight: 64, resize: "vertical" }} value={b[k]} onChange={e => set(k, e.target.value)} placeholder={ph} /></Field>
  );
  return (
    <ModalShell title={isNew ? "Nouveau bilan" : "Modifier le bilan"} onClose={onClose}>
      <div style={{ fontSize: 12, color: "var(--ink-soft)", marginBottom: 12 }}>{entry.departement} · {entry.annee}</div>
      <Field label="Bilan de quelle période ?">
        <ChipPicker options={["Mois", "Trimestre", "Année"]} value={b.typePeriode} onChange={v => set("typePeriode", v)} small />
      </Field>
      {b.typePeriode === "Mois" && (
        <Field label="Mois">
          <select style={inputStyle} value={b.mois} onChange={e => set("mois", Number(e.target.value))}>
            {MOIS_ANNEE.map((m, i) => <option key={m} value={i}>{m}</option>)}
          </select>
        </Field>
      )}
      {b.typePeriode === "Trimestre" && (
        <Field label="Trimestre">
          <ChipPicker options={TRIMESTRES.map(t => ({ value: t.n, label: t.label }))} value={b.trimestre} onChange={v => set("trimestre", v)} small />
        </Field>
      )}
      {area("resultats", "Résultats obtenus / points forts", "Ce qui a été réalisé")}
      {area("difficultes", "Difficultés rencontrées")}
      {area("causes", "Causes")}
      {area("solutions", "Solutions / recommandations")}
      {area("decisions", "Décisions pour la période suivante")}
      <Field label="Rédigé par"><input style={inputStyle} value={b.redigePar} onChange={e => set("redigePar", e.target.value)} /></Field>
      <PrimaryButton full icon={Check} onClick={() => onSave({
        ...entry, ...b, id: entry.id || uid(), date: new Date().toISOString().slice(0, 10),
        mois: b.typePeriode === "Mois" ? b.mois : null, trimestre: b.typePeriode === "Trimestre" ? b.trimestre : null,
      })}>Enregistrer le bilan</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce bilan ?")) onDelete(entry); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}><Trash2 size={14} /> Supprimer ce bilan</button>
      )}
    </ModalShell>
  );
}

function PlansTableau({ deptPlans, annee }) {
  const de = deptPlans.filter(p => Number(p.annee) === Number(annee));
  const rows = DEPARTEMENTS_COORD.map(d => {
    const items = de.filter(p => p.departement === d);
    return {
      d,
      annuel: dpStats(items.filter(p => p.niveau === "annuel")),
      mensuel: dpStats(items.filter(p => p.niveau === "mensuel")),
    };
  });
  const tot = { annuel: dpStats(de.filter(p => p.niveau === "annuel")), mensuel: dpStats(de.filter(p => p.niveau === "mensuel")) };
  const cell = { padding: "7px 5px", borderBottom: "1px solid var(--border)", textAlign: "right", whiteSpace: "nowrap", fontVariantNumeric: "tabular-nums" };
  const tauxColor = t => t === null ? "var(--ink-soft)" : t >= 70 ? "#1F7A5C" : t >= 40 ? "var(--accent-dark)" : "var(--danger)";

  const text = [
    `📊 *Plans d'action ${annee} — Coordination nationale*`, "",
    ...rows.map(r => `• ${r.d} : ${r.annuel.total} activité(s) de l'année, ${r.mensuel.realisees}/${r.mensuel.actifs} tâches réalisées${r.mensuel.taux !== null ? ` (${r.mensuel.taux} %)` : ""}, budget ${fcfa(r.annuel.budget)}`),
    "", `Total : ${tot.annuel.total} activités · budget annuel ${fcfa(tot.annuel.budget)} · dépensé ${fcfa(tot.mensuel.depense)}`,
    "", "Mission Parole de Vie Burkina",
  ].join("\n");

  const trims = TRIMESTRES.map(t => ({ t, st: dpStats(de.filter(p => p.niveau === "annuel" && Number(p.trimestre) === t.n)) }));

  return (
    <div>
      <div style={{ fontSize: 12.5, color: "var(--ink-soft)", marginBottom: 10 }}>Vue d'ensemble de tous les départements pour {annee}. Se met à jour tout seul.</div>
      <div style={{ overflowX: "auto", background: "#fff", border: "1px solid var(--border)", borderRadius: 11, padding: "4px 8px", marginBottom: 14 }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 11.5 }}>
          <thead>
            <tr style={{ color: "var(--ink-soft)", fontSize: 10, textTransform: "uppercase" }}>
              <th style={{ ...cell, textAlign: "left" }}>Département</th>
              <th style={cell}>Activ. année</th><th style={cell}>Budget prévu</th><th style={cell}>Tâches</th><th style={cell}>Réalisé</th><th style={cell}>Dépensé</th>
            </tr>
          </thead>
          <tbody>
            {rows.map(r => (
              <tr key={r.d}>
                <td style={{ ...cell, textAlign: "left", fontWeight: 700 }}>{r.d}</td>
                <td style={cell}>{r.annuel.total}</td>
                <td style={cell}>{fcfa(r.annuel.budget)}</td>
                <td style={cell}>{r.mensuel.total}</td>
                <td style={{ ...cell, fontWeight: 700, color: tauxColor(r.mensuel.taux) }}>{r.mensuel.taux === null ? "—" : `${r.mensuel.taux} %`}</td>
                <td style={{ ...cell, color: r.mensuel.depense > r.mensuel.budget && r.mensuel.budget > 0 ? "var(--danger)" : "var(--ink)" }}>{fcfa(r.mensuel.depense)}</td>
              </tr>
            ))}
            <tr style={{ fontWeight: 700, color: "var(--primary)" }}>
              <td style={{ ...cell, textAlign: "left", borderBottom: "none" }}>Total</td>
              <td style={{ ...cell, borderBottom: "none" }}>{tot.annuel.total}</td>
              <td style={{ ...cell, borderBottom: "none" }}>{fcfa(tot.annuel.budget)}</td>
              <td style={{ ...cell, borderBottom: "none" }}>{tot.mensuel.total}</td>
              <td style={{ ...cell, borderBottom: "none", color: tauxColor(tot.mensuel.taux) }}>{tot.mensuel.taux === null ? "—" : `${tot.mensuel.taux} %`}</td>
              <td style={{ ...cell, borderBottom: "none" }}>{fcfa(tot.mensuel.depense)}</td>
            </tr>
          </tbody>
        </table>
      </div>

      <div style={{ fontSize: 13, fontWeight: 700, marginBottom: 8 }}>Activités de l'année par trimestre</div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 14 }}>
        {trims.map(({ t, st }) => (
          <div key={t.n} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 10px" }}>
            <div style={{ fontSize: 11, fontWeight: 700, color: "var(--accent-dark)" }}>{t.label} · {t.mois}</div>
            <div style={{ fontSize: 13, fontWeight: 700, marginTop: 2 }}>{st.realisees}/{st.actifs} réalisées</div>
            <div style={{ fontSize: 11.5, color: "var(--ink-soft)" }}>Budget {fcfa(st.budget)}</div>
          </div>
        ))}
      </div>

      <a href={shareWhatsappLink(text)} target="_blank" rel="noopener noreferrer" style={{
        display: "flex", alignItems: "center", justifyContent: "center", gap: 6, background: "#25D366", color: "#fff",
        fontSize: 12.5, fontWeight: 700, padding: "10px 0", borderRadius: 9
      }}><Send size={13} /> Partager le tableau par WhatsApp</a>
    </div>
  );
}

function ActionPlans({ actionPlans, setActionPlans, plansAnnuels, setPlansAnnuels, unlocked, showToast }) {
  const [mode, setMode] = useState("annuel"); // "annuel" | "suivi"
  const [editing, setEditing] = useState(null);
  const [filterPeriode, setFilterPeriode] = useState("");

  const filtered = actionPlans
    .filter(p => !filterPeriode || p.periode === filterPeriode)
    .sort((a, b) => (b.dateCreation || "").localeCompare(a.dateCreation || ""));

  function handleSave(p) {
    const exists = actionPlans.some(x => x.id === p.id);
    const next = exists ? actionPlans.map(x => x.id === p.id ? p : x) : [...actionPlans, p];
    setActionPlans(next);
    setEditing(null);
    showToast(exists ? "Plan mis à jour" : "Plan ajouté");
  }
  function handleDelete(id) {
    setActionPlans(actionPlans.filter(x => x.id !== id));
    setEditing(null);
    showToast("Plan supprimé");
  }

  return (
    <div>
      <div style={{ display: "flex", gap: 6, marginBottom: 14, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setMode("annuel")} style={segButtonStyle(mode === "annuel")}>Plan annuel complet</button>
        <button onClick={() => setMode("suivi")} style={segButtonStyle(mode === "suivi")}>Suivi rapide</button>
      </div>

      {mode === "annuel" ? (
        <PlanAnnuelTab plansAnnuels={plansAnnuels} setPlansAnnuels={setPlansAnnuels} unlocked={unlocked} showToast={showToast} />
      ) : (
        <>
          <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
            <select style={{ ...inputStyle, flex: 1, fontSize: 13 }} value={filterPeriode} onChange={e => setFilterPeriode(e.target.value)}>
              <option value="">Toutes les périodes</option>
              {PLAN_PERIODES.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
            {unlocked && (
              <button onClick={() => setEditing({})} style={{
                background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
                display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
              }}>
                <Plus size={16} /> Ajouter
              </button>
            )}
          </div>

          {filtered.length === 0 ? (
            <EmptyState icon={Target} text="Aucun plan d'action enregistré pour l'instant." />
          ) : (
            <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
              {filtered.map(p => {
                const statutInfo = PLAN_STATUTS.find(s => s.value === p.statut) || PLAN_STATUTS[0];
                const StatutIcon = statutInfo.icon;
                return (
                  <div key={p.id} onClick={() => unlocked && setEditing(p)} style={{
                    background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                    borderLeft: `4px solid ${statutInfo.tone}`, cursor: unlocked ? "pointer" : "default"
                  }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                      <span style={{
                        fontSize: 10.5, fontWeight: 700, textTransform: "uppercase", letterSpacing: ".04em",
                        color: "var(--accent-dark)", background: "var(--accent-soft)", padding: "2px 8px", borderRadius: 999
                      }}>{p.periode}</span>
                      <span style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, fontWeight: 700, color: statutInfo.tone }}>
                        <StatutIcon size={13} /> {statutInfo.label}
                      </span>
                    </div>
                    <div style={{ fontSize: 13.5, color: "var(--ink)", whiteSpace: "pre-wrap", lineHeight: 1.5 }}>{p.contenu}</div>
                  </div>
                );
              })}
            </div>
          )}

          {editing && unlocked && (
            <ActionPlanForm plan={editing} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
          )}
        </>
      )}
    </div>
  );
}

function ActionPlanForm({ plan, onSave, onDelete, onClose }) {
  const isNew = !plan.id;
  const [periode, setPeriode] = useState(plan.periode || "Hebdomadaire");
  const [contenu, setContenu] = useState(plan.contenu || "");
  const [statut, setStatut] = useState(plan.statut || "respecte");

  function handleSubmit() {
    if (!contenu.trim()) { alert("Merci de décrire le plan d'action."); return; }
    onSave({
      id: plan.id || uid(), periode, contenu: contenu.trim(), statut,
      dateCreation: plan.dateCreation || new Date().toISOString().slice(0, 10),
    });
  }

  return (
    <ModalShell title={isNew ? "Nouveau plan d'action" : "Modifier le plan d'action"} onClose={onClose}>
      <Field label="Période">
        <select style={inputStyle} value={periode} onChange={e => setPeriode(e.target.value)}>
          {PLAN_PERIODES.map(p => <option key={p} value={p}>{p}</option>)}
        </select>
      </Field>
      <Field label="Plan d'action">
        <textarea
          style={{ ...inputStyle, minHeight: 130, resize: "vertical", fontSize: 13.5 }}
          value={contenu} onChange={e => setContenu(e.target.value)}
          placeholder="Décrivez les objectifs et actions prévues pour cette période…"
        />
      </Field>
      <Field label="Évaluation de l'application">
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {PLAN_STATUTS.map(s => {
            const Icon = s.icon;
            const active = statut === s.value;
            return (
              <div key={s.value} onClick={() => setStatut(s.value)} style={{
                display: "flex", alignItems: "center", gap: 9, padding: "10px 12px", borderRadius: 10,
                border: `1.5px solid ${active ? s.tone : "var(--border)"}`, background: active ? "var(--accent-soft)" : "#fff", cursor: "pointer"
              }}>
                <Icon size={16} color={s.tone} />
                <span style={{ fontSize: 13, fontWeight: active ? 700 : 500 }}>{s.label}</span>
              </div>
            );
          })}
        </div>
      </Field>
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce plan d'action ?")) onDelete(plan.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce plan
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  PLAN D'ACTION ANNUEL COMPLET (4 axes, sur le modèle du document)   */
/* ------------------------------------------------------------------ */

function PlanAnnuelTab({ plansAnnuels, setPlansAnnuels, unlocked, showToast }) {
  const [openId, setOpenId] = useState(null);
  const sorted = [...plansAnnuels].sort((a, b) => (b.annee || 0) - (a.annee || 0));
  const openPlan = plansAnnuels.find(p => p.id === openId);

  function creerNouveau() {
    const anneeDefaut = new Date().getFullYear();
    const nouveau = {
      id: uid(), annee: anneeDefaut, chargeDepartement: "",
      situation: emptyMoisRow(SITUATION_EGLISE_FIELDS),
      axe1: MOIS_ANNEE.map(m => ({ mois: m, ...emptyMoisRow(AXE1_FIELDS) })),
      axe4: MOIS_ANNEE.map(m => ({ mois: m, ...emptyMoisRow(AXE4_FIELDS) })),
      axe2: [], axe3: [],
    };
    setPlansAnnuels([...plansAnnuels, nouveau]);
    setOpenId(nouveau.id);
    showToast("Nouveau plan annuel créé");
  }

  function dupliquer(plan) {
    const copie = {
      ...JSON.parse(JSON.stringify(plan)),
      id: uid(), annee: (Number(plan.annee) || new Date().getFullYear()) + 1,
    };
    setPlansAnnuels([...plansAnnuels, copie]);
    setOpenId(copie.id);
    showToast(`Plan ${copie.annee} créé à partir de ${plan.annee} — il ne reste qu'à mettre les chiffres à jour`);
  }

  function updatePlan(updated) {
    setPlansAnnuels(plansAnnuels.map(p => p.id === updated.id ? updated : p));
  }
  function deletePlan(id) {
    setPlansAnnuels(plansAnnuels.filter(p => p.id !== id));
    setOpenId(null);
    showToast("Plan annuel supprimé");
  }

  if (openPlan) {
    return (
      <PlanAnnuelEditor
        plan={openPlan} onChange={updatePlan} onDelete={deletePlan}
        onClose={() => setOpenId(null)} unlocked={unlocked}
      />
    );
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4 }}>
        Structure calquée sur le plan d'action officiel : 4 axes (évangélisation, formation, affermissement, missionnaires internationaux). Pour une nouvelle année, dupliquez le plan précédent et mettez seulement les chiffres à jour.
      </div>

      {unlocked && (
        <button onClick={creerNouveau} style={{
          width: "100%", marginBottom: 14, background: "var(--primary)", color: "#fff", borderRadius: 10, padding: "11px 0",
          display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 13.5, fontWeight: 700
        }}>
          <Plus size={16} /> Nouveau plan annuel (à partir de zéro)
        </button>
      )}

      {sorted.length === 0 ? (
        <EmptyState icon={Target} text="Aucun plan d'action annuel enregistré pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {sorted.map(p => {
            const totalBudget = sumMoisRows(p.axe1, AXE1_FIELDS).budget;
            return (
              <div key={p.id} style={{ background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "14px 15px" }}>
                <div onClick={() => setOpenId(p.id)} style={{ cursor: "pointer" }}>
                  <div style={{ fontFamily: "var(--font-display)", fontSize: 18, fontWeight: 700, color: "var(--primary)" }}>
                    Plan d'action {p.annee}
                  </div>
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>
                    {p.chargeDepartement ? `Chargé : ${p.chargeDepartement} · ` : ""}Budget Axe I prévu : {totalBudget.toLocaleString("fr-FR")} FCFA
                  </div>
                </div>
                {unlocked && (
                  <div style={{ display: "flex", gap: 8, marginTop: 10 }}>
                    <button onClick={() => setOpenId(p.id)} style={{
                      flex: 1, fontSize: 12, fontWeight: 700, color: "var(--primary)", background: "var(--accent-soft)",
                      borderRadius: 8, padding: "8px 0"
                    }}>Ouvrir</button>
                    <button onClick={() => dupliquer(p)} style={{
                      flex: 1, fontSize: 12, fontWeight: 700, color: "var(--accent-dark)", background: "#fff",
                      border: "1px solid var(--border)", borderRadius: 8, padding: "8px 0", display: "flex", alignItems: "center", justifyContent: "center", gap: 4
                    }}><Copy size={12} /> Dupliquer pour {Number(p.annee) + 1}</button>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function PlanAnnuelEditor({ plan, onChange, onDelete, onClose, unlocked }) {
  const [local, setLocal] = useState(plan);
  const [editingMois, setEditingMois] = useState(null); // { axe: "axe1"|"axe4", index }
  const [editingProjet, setEditingProjet] = useState(null); // { axe: "axe2"|"axe3", projet }

  function persist(next) {
    setLocal(next);
    onChange(next);
  }

  function saveMois(values) {
    const { axe, index } = editingMois;
    const next = { ...local, [axe]: local[axe].map((m, i) => i === index ? { ...m, ...values } : m) };
    persist(next);
    setEditingMois(null);
  }

  function saveProjet(p) {
    const { axe } = editingProjet;
    const list = local[axe] || [];
    const exists = list.some(x => x.id === p.id);
    const nextList = exists ? list.map(x => x.id === p.id ? p : x) : [...list, p];
    persist({ ...local, [axe]: nextList });
    setEditingProjet(null);
  }
  function deleteProjet(axe, id) {
    persist({ ...local, [axe]: (local[axe] || []).filter(x => x.id !== id) });
    setEditingProjet(null);
  }

  const totalAxe1 = sumMoisRows(local.axe1, AXE1_FIELDS);
  const totalAxe4 = sumMoisRows(local.axe4, AXE4_FIELDS);

  return (
    <div>
      <button onClick={onClose} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>
        <ChevronLeft size={15} /> Tous les plans annuels
      </button>

      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 16 }}>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Année</div>
          <input
            type="number" style={inputStyle} value={local.annee} disabled={!unlocked}
            onChange={e => persist({ ...local, annee: e.target.value })}
          />
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 3 }}>Chargé du département</div>
          <input
            style={inputStyle} value={local.chargeDepartement || ""} disabled={!unlocked}
            onChange={e => persist({ ...local, chargeDepartement: e.target.value })}
            placeholder="Nom"
          />
        </div>
      </div>

      {/* Situation de l'église */}
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <BarChart3 size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>Situation de l'église (effectifs actuels)</div>
      </div>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, marginBottom: 22 }}>
        {SITUATION_EGLISE_FIELDS.map(f => (
          <div key={f.key} style={{ background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "9px 11px" }}>
            <div style={{ fontSize: 10.5, color: "var(--ink-soft)", marginBottom: 4 }}>{f.label}</div>
            <input
              type="number" style={{ ...inputStyle, padding: "6px 8px", fontSize: 14, fontWeight: 700 }} disabled={!unlocked}
              value={local.situation?.[f.key] ?? 0}
              onChange={e => persist({ ...local, situation: { ...local.situation, [f.key]: e.target.value === "" ? 0 : Number(e.target.value) } })}
            />
          </div>
        ))}
      </div>

      {/* Axe I */}
      <AxeMoisSection
        titre="Axe I — Projets d'action d'évangélisation" icon={Globe}
        mois={local.axe1} fields={AXE1_FIELDS} totals={totalAxe1} unlocked={unlocked}
        onEditMois={(index) => setEditingMois({ axe: "axe1", index })}
      />

      {/* Axe II */}
      <AxeProjetsSection
        titre="Axe II — Projets d'action de formation" icon={ClipboardList}
        projets={local.axe2 || []} unlocked={unlocked}
        onAdd={() => setEditingProjet({ axe: "axe2", projet: {} })}
        onEdit={(projet) => setEditingProjet({ axe: "axe2", projet })}
      />

      {/* Axe III */}
      <AxeProjetsSection
        titre="Axe III — Affermissement & renforcement de capacités" icon={ShieldCheck}
        projets={local.axe3 || []} unlocked={unlocked}
        onAdd={() => setEditingProjet({ axe: "axe3", projet: {} })}
        onEdit={(projet) => setEditingProjet({ axe: "axe3", projet })}
      />

      {/* Axe IV */}
      <AxeMoisSection
        titre="Axe IV — Estimation des besoins en missionnaires internationaux" icon={Building2}
        mois={local.axe4} fields={AXE4_FIELDS} totals={totalAxe4} unlocked={unlocked}
        onEditMois={(index) => setEditingMois({ axe: "axe4", index })}
      />

      {unlocked && (
        <button onClick={() => { if (confirm(`Supprimer le plan d'action ${local.annee} ?`)) onDelete(local.id); }} style={{
          width: "100%", marginTop: 8, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 10,
          border: "1px solid var(--border)", borderRadius: 10
        }}>
          <Trash2 size={14} /> Supprimer ce plan annuel
        </button>
      )}

      {editingMois && (
        <MoisForm
          mois={local[editingMois.axe][editingMois.index]}
          fields={editingMois.axe === "axe1" ? AXE1_FIELDS : AXE4_FIELDS}
          onSave={saveMois} onClose={() => setEditingMois(null)}
        />
      )}
      {editingProjet && (
        <ProjetAxeForm
          projet={editingProjet.projet}
          onSave={saveProjet} onDelete={(id) => deleteProjet(editingProjet.axe, id)}
          onClose={() => setEditingProjet(null)}
        />
      )}
    </div>
  );
}

function AxeMoisSection({ titre, icon: Icon, mois, fields, totals, unlocked, onEditMois }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", gap: 6, marginBottom: 10 }}>
        <Icon size={15} color="var(--primary)" />
        <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{titre}</div>
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
        {mois.map((m, i) => {
          const rempli = fields.some(f => Number(m[f.key]) > 0);
          return (
            <div key={m.mois} onClick={() => onEditMois(i)} style={{
              display: "flex", alignItems: "center", justifyContent: "space-between", background: "#fff",
              border: "1px solid var(--border)", borderRadius: 9, padding: "9px 12px", cursor: "pointer"
            }}>
              <span style={{ fontSize: 13, fontWeight: 600, color: rempli ? "var(--ink)" : "var(--ink-soft)" }}>{m.mois}</span>
              {rempli ? (
                <span style={{ fontSize: 10.5, color: "var(--accent-dark)", fontWeight: 700, background: "var(--accent-soft)", padding: "2px 8px", borderRadius: 999 }}>Rempli</span>
              ) : (
                <span style={{ fontSize: 10.5, color: "var(--ink-soft)" }}>—</span>
              )}
            </div>
          );
        })}
      </div>
      <div style={{ marginTop: 8, background: "var(--accent-soft)", borderRadius: 10, padding: "11px 13px" }}>
        <div style={{ fontSize: 10.5, fontWeight: 700, color: "var(--accent-dark)", textTransform: "uppercase", letterSpacing: ".03em", marginBottom: 6 }}>
          Total sur l'année
        </div>
        <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "3px 10px" }}>
          {fields.map(f => (
            <div key={f.key} style={{ fontSize: 11.5, color: "var(--ink)", display: "flex", justifyContent: "space-between" }}>
              <span style={{ color: "var(--ink-soft)" }}>{f.label}</span>
              <span style={{ fontWeight: 700 }}>{f.key === "budget" ? totals[f.key].toLocaleString("fr-FR") : totals[f.key]}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function MoisForm({ mois, fields, onSave, onClose }) {
  const [values, setValues] = useState(() => {
    const v = {};
    fields.forEach(f => { v[f.key] = mois[f.key] ?? 0; });
    return v;
  });

  return (
    <ModalShell title={mois.mois} onClose={onClose}>
      {fields.map(f => (
        <Field key={f.key} label={f.label}>
          <input
            type="number" inputMode="numeric" style={inputStyle}
            value={values[f.key]}
            onChange={e => setValues({ ...values, [f.key]: e.target.value === "" ? 0 : Number(e.target.value) })}
          />
        </Field>
      ))}
      <PrimaryButton onClick={() => onSave(values)} icon={Check} full>Enregistrer</PrimaryButton>
    </ModalShell>
  );
}

function AxeProjetsSection({ titre, icon: Icon, projets, unlocked, onAdd, onEdit }) {
  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <Icon size={15} color="var(--primary)" />
          <div style={{ fontSize: 13.5, fontWeight: 700, color: "var(--ink)" }}>{titre}</div>
        </div>
        {unlocked && (
          <button onClick={onAdd} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 12, fontWeight: 700, color: "var(--primary)" }}>
            <Plus size={13} /> Ajouter
          </button>
        )}
      </div>
      {projets.length === 0 ? (
        <div style={{ fontSize: 12, color: "var(--ink-soft)", background: "#fff", border: "1px dashed var(--border)", borderRadius: 10, padding: "10px 12px" }}>
          Aucun projet renseigné.
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 7 }}>
          {projets.map(p => (
            <div key={p.id} onClick={() => onEdit(p)} style={{
              background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", cursor: "pointer"
            }}>
              <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 700, color: "var(--ink)" }}>
                <span>{p.localite || "(Localité non précisée)"}</span>
                <span style={{ color: "var(--ink-soft)", fontWeight: 500, fontSize: 11.5 }}>{p.periode}</span>
              </div>
              {p.publicCible && <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginTop: 3 }}>{p.publicCible}</div>}
              <div style={{ display: "flex", gap: 12, marginTop: 5, fontSize: 11, color: "var(--ink-soft)" }}>
                {p.participants ? <span>{p.participants} participants</span> : null}
                {p.formateurs ? <span>{p.formateurs} formateurs</span> : null}
                {p.budget ? <span>{Number(p.budget).toLocaleString("fr-FR")} FCFA</span> : null}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function ProjetAxeForm({ projet, onSave, onDelete, onClose }) {
  const isNew = !projet.id;
  const [values, setValues] = useState(() => {
    const v = {};
    PROJET_AXE_FIELDS.forEach(f => { v[f.key] = projet[f.key] ?? (f.type === "number" ? 0 : ""); });
    return v;
  });

  function handleSubmit() {
    onSave({ id: projet.id || uid(), ...values });
  }

  return (
    <ModalShell title={isNew ? "Nouveau projet" : "Modifier le projet"} onClose={onClose}>
      {PROJET_AXE_FIELDS.map(f => (
        <Field key={f.key} label={f.label}>
          {f.type === "textarea" ? (
            <textarea
              style={{ ...inputStyle, minHeight: 80, resize: "vertical" }}
              value={values[f.key]} onChange={e => setValues({ ...values, [f.key]: e.target.value })}
            />
          ) : (
            <input
              type={f.type === "number" ? "number" : "text"} style={inputStyle}
              value={values[f.key]}
              onChange={e => setValues({ ...values, [f.key]: f.type === "number" ? (e.target.value === "" ? 0 : Number(e.target.value)) : e.target.value })}
            />
          )}
        </Field>
      ))}
      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce projet ?")) onDelete(projet.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce projet
        </button>
      )}
    </ModalShell>
  );
}

/* ------------------------------------------------------------------ */
/*  BIBLE : lecteur complet + rapports de lecture hebdomadaires        */
/* ------------------------------------------------------------------ */

function BibleTab({ pastors, regions, bibleReports, setBibleReports, showToast }) {
  const [subTab, setSubTab] = useState("lecteur");

  return (
    <div>
      <SectionTitle sub="Lecteur biblique et rapports de lecture hebdomadaires des pasteurs">Bible</SectionTitle>

      <div style={{ display: "flex", gap: 6, marginBottom: 16, background: "#fff", padding: 4, borderRadius: 11, border: "1px solid var(--border)" }}>
        <button onClick={() => setSubTab("lecteur")} style={segButtonStyle(subTab === "lecteur")}>Lecteur</button>
        <button onClick={() => setSubTab("rapport")} style={segButtonStyle(subTab === "rapport")}>Rapport de lecture</button>
      </div>

      {subTab === "lecteur" ? (
        <BibleReader />
      ) : (
        <BibleReports pastors={pastors} regions={regions} bibleReports={bibleReports} setBibleReports={setBibleReports} showToast={showToast} />
      )}
    </div>
  );
}

/* --- Lecteur biblique ------------------------------------------------ */

function BibleReader() {
  const [category, setCategory] = useState("Tous");
  const [search, setSearch] = useState("");
  const [book, setBook] = useState(null);
  const [chapter, setChapter] = useState(null);

  const filteredBooks = FRENCH_BIBLE_BOOKS.filter(b =>
    (category === "Tous" || b.category === category) &&
    b.name.toLowerCase().includes(search.toLowerCase())
  );

  if (book && chapter) {
    const verses = getChapterVerses(book, chapter);
    return (
      <div>
        <button onClick={() => setChapter(null)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>
          <ChevronLeft size={15} /> {book.name} — chapitres
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>
          {book.name} {chapter}
        </div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 14 }}>Texte : Segond 1910 (domaine public)</div>

        {verses.length === 0 ? (
          <div style={{ background: "#fff", borderRadius: 13, border: "1px dashed var(--border)", padding: 18, textAlign: "center" }}>
            <div style={{ fontSize: 13, color: "var(--ink-soft)", marginBottom: 10 }}>
              Ce chapitre n'est pas encore disponible dans notre sélection de versets.
            </div>
            <a href={wikisourceLink(book.id)} target="_blank" rel="noopener noreferrer" style={{
              display: "inline-flex", alignItems: "center", gap: 5, fontSize: 12.5, fontWeight: 600, color: "#fff",
              background: "var(--primary)", padding: "9px 14px", borderRadius: 9
            }}>
              Lire ce chapitre en ligne <ExternalLink size={12} />
            </a>
          </div>
        ) : (
          <div style={{ background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "16px 18px", display: "flex", flexDirection: "column", gap: 12 }}>
            {verses.map(v => (
              <div key={v.verse} style={{ fontSize: 14.5, lineHeight: 1.7, color: "var(--ink)" }}>
                <span style={{ fontWeight: 700, color: "var(--accent-dark)", marginRight: 6 }}>{v.verse}</span>
                {v.text}
              </div>
            ))}
          </div>
        )}

        <div style={{ display: "flex", gap: 8, marginTop: 14 }}>
          {chapter > 1 && (
            <button onClick={() => setChapter(chapter - 1)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fff", border: "1px solid var(--border)", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 600 }}>
              <ChevronLeft size={14} /> Chap. précédent
            </button>
          )}
          {chapter < book.chaptersCount && (
            <button onClick={() => setChapter(chapter + 1)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 5, background: "#fff", border: "1px solid var(--border)", borderRadius: 9, padding: "9px 0", fontSize: 12.5, fontWeight: 600 }}>
              Chap. suivant <ChevronRight size={14} />
            </button>
          )}
        </div>
      </div>
    );
  }

  if (book) {
    const chapters = Array.from({ length: book.chaptersCount }, (_, i) => i + 1);
    return (
      <div>
        <button onClick={() => setBook(null)} style={{ display: "flex", alignItems: "center", gap: 5, fontSize: 12.5, color: "var(--primary)", fontWeight: 600, marginBottom: 12 }}>
          <ChevronLeft size={15} /> Tous les livres
        </button>
        <div style={{ fontFamily: "var(--font-display)", fontSize: 19, fontWeight: 700, color: "var(--primary)", marginBottom: 4 }}>{book.name}</div>
        <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 14 }}>{book.testament} Testament · {book.chaptersCount} chapitres</div>
        <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8 }}>
          {chapters.map(c => {
            const hasContent = (book.chapters[c] || []).length > 0;
            return (
              <button key={c} onClick={() => setChapter(c)} style={{
                aspectRatio: "1", borderRadius: 9, fontSize: 13, fontWeight: 700,
                background: hasContent ? "var(--accent-soft)" : "#fff", color: hasContent ? "var(--accent-dark)" : "var(--ink-soft)",
                border: "1px solid var(--border)"
              }}>{c}</button>
            );
          })}
        </div>
        <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 12 }}>
          <span style={{ display: "inline-block", width: 10, height: 10, background: "var(--accent-soft)", borderRadius: 3, marginRight: 5, verticalAlign: "middle" }} />
          Chapitre avec versets disponibles dans l'app
        </div>
      </div>
    );
  }

  return (
    <div>
      <div style={{ position: "relative", marginBottom: 10 }}>
        <Search size={14} style={{ position: "absolute", left: 10, top: 12.5, color: "var(--ink-soft)" }} />
        <input style={{ ...inputStyle, paddingLeft: 30 }} placeholder="Rechercher un livre…" value={search} onChange={e => setSearch(e.target.value)} />
      </div>
      <div style={{ display: "flex", gap: 6, marginBottom: 16, overflowX: "auto", paddingBottom: 2 }}>
        {BIBLE_CATEGORIES.map(c => (
          <button key={c} onClick={() => setCategory(c)} style={{
            padding: "7px 13px", borderRadius: 999, fontSize: 12, fontWeight: 700, whiteSpace: "nowrap",
            background: category === c ? "var(--primary)" : "#fff", color: category === c ? "#fff" : "var(--ink-soft)",
            border: "1px solid var(--border)"
          }}>{c}</button>
        ))}
      </div>
      <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
        {filteredBooks.map(b => (
          <div key={b.id} onClick={() => setBook(b)} style={{
            background: "#fff", borderRadius: 12, border: "1px solid var(--border)", padding: "12px 14px",
            display: "flex", alignItems: "center", justifyContent: "space-between", cursor: "pointer"
          }}>
            <div>
              <div style={{ fontSize: 14, fontWeight: 700, color: "var(--ink)" }}>{b.name}</div>
              <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{b.testament} Testament · {b.chaptersCount} chapitres</div>
            </div>
            <ChevronRight size={16} color="var(--ink-soft)" />
          </div>
        ))}
      </div>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginTop: 16, lineHeight: 1.5, textAlign: "center" }}>
        Sélection de versets marquants par livre (Segond 1910, domaine public).<br />
        <a href="https://fr.wikisource.org/wiki/Bible_Segond_1910" target="_blank" rel="noopener noreferrer" style={{ color: "var(--primary)", fontWeight: 600 }}>
          Lire la Bible intégrale (Segond 1910, page web) ↗
        </a>
        <br />
        <a href={BIBLE_LINK} target="_blank" rel="noopener noreferrer" style={{ color: "var(--ink-soft)", fontWeight: 500, fontSize: 10.5 }}>
          ou en français facile via bible.com (peut proposer d'installer une app)
        </a>
      </div>
    </div>
  );
}

/* --- Rapport de lecture biblique hebdomadaire ------------------------ */

const JOURS_LECTURE = ["Lundi", "Mardi", "Mercredi", "Jeudi", "Vendredi", "Samedi", "Dimanche"];

function emptyJoursLecture(semaineDebut) {
  return JOURS_LECTURE.map((j, i) => {
    if (!semaineDebut) return { jour: j, at1: "", at2: "", nt: "" };
    const d = new Date(semaineDebut + "T00:00:00");
    d.setDate(d.getDate() + i);
    const suggestion = suggestedReadingForDate(d.toISOString().slice(0, 10));
    return { jour: j, ...suggestion };
  });
}

function BibleReports({ pastors, regions, bibleReports, setBibleReports, showToast }) {
  const [assemblee, setAssemblee] = useState("");
  const [editing, setEditing] = useState(null);

  const entries = bibleReports
    .filter(r => !assemblee || r.assemblee === assemblee)
    .sort((a, b) => (b.semaine || "").localeCompare(a.semaine || ""));

  function handleSave(r) {
    const exists = bibleReports.some(x => x.id === r.id);
    const next = exists ? bibleReports.map(x => x.id === r.id ? r : x) : [...bibleReports, r];
    setBibleReports(next);
    setEditing(null);
    showToast(exists ? "Rapport de lecture mis à jour" : "Rapport de lecture déposé");
  }
  function handleDelete(id) {
    setBibleReports(bibleReports.filter(x => x.id !== id));
    setEditing(null);
    showToast("Rapport supprimé");
  }

  return (
    <div>
      <div style={{ fontSize: 11.5, color: "var(--ink-soft)", background: "#fff", border: "1px solid var(--border)", borderRadius: 10, padding: "10px 12px", marginBottom: 14, lineHeight: 1.4 }}>
        À déposer chaque fin de semaine, le dimanche soir avant minuit. Le pasteur lecteur remplit, pour chaque jour, 2 chapitres de l'Ancien Testament et 1 chapitre du Nouveau Testament, puis un résumé en bas.
      </div>
      <div style={{ display: "flex", gap: 8, marginBottom: 14 }}>
        <AssembleeSelect regions={regions} value={assemblee} onChange={setAssemblee} style={{ ...inputStyle, flex: 1, fontSize: 13 }} />
        <button onClick={() => { const debut = mondayOf(new Date().toISOString().slice(0, 10)); setEditing({ assemblee, semaine: debut, jours: emptyJoursLecture(debut) }); }} style={{
          background: "var(--primary)", color: "#fff", borderRadius: 9, padding: "0 14px",
          display: "flex", alignItems: "center", gap: 5, fontSize: 13, fontWeight: 600
        }}>
          <Plus size={16} /> Déposer
        </button>
      </div>

      {entries.length === 0 ? (
        <EmptyState icon={BookOpen} text="Aucun rapport de lecture biblique pour l'instant." />
      ) : (
        <div style={{ display: "flex", flexDirection: "column", gap: 9 }}>
          {entries.map(r => {
            const jours = r.jours && r.jours.length > 0 ? r.jours : null;
            const joursRemplis = jours ? jours.filter(j => j.at1 || j.at2 || j.nt).length : 0;
            return (
              <div key={r.id} onClick={() => setEditing(r)} style={{
                background: "#fff", borderRadius: 13, border: "1px solid var(--border)", padding: "13px 14px",
                borderLeft: "4px solid var(--primary)", cursor: "pointer"
              }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6 }}>
                  <div style={{ fontSize: 12.5, fontWeight: 700, color: "var(--primary)", textTransform: "capitalize" }}>
                    {r.semaineFin && r.semaineFin !== r.semaine
                      ? `Du ${formatDateLong(r.semaine)} au ${formatDateLong(r.semaineFin)}`
                      : `Semaine du ${formatDateLong(r.semaine)}`}
                  </div>
                  {r.pasteur && <div style={{ fontSize: 11, color: "var(--ink-soft)" }}>{r.pasteur}</div>}
                </div>
                {jours ? (
                  <div style={{ fontSize: 11.5, color: "var(--ink-soft)", marginBottom: 4 }}>{joursRemplis} / 7 jours renseignés</div>
                ) : r.versesRead && (
                  <div style={{ fontSize: 12.5, color: "var(--ink)", marginBottom: 4 }}>
                    <span style={{ color: "var(--ink-soft)" }}>Lecture : </span>{r.versesRead}
                  </div>
                )}
                {(r.resume || r.reflexion) && (
                  <div style={{ fontSize: 12.5, color: "var(--ink-soft)", fontStyle: "italic" }}>« {r.resume || r.reflexion} »</div>
                )}
              </div>
            );
          })}
        </div>
      )}

      {editing && (
        <BibleReportForm entry={editing} pastors={pastors} onSave={handleSave} onDelete={handleDelete} onClose={() => setEditing(null)} />
      )}
    </div>
  );
}

function BibleReportForm({ entry, pastors, onSave, onDelete, onClose }) {
  const isNew = !entry.id;
  const [pasteur, setPasteur] = useState(entry.pasteur || "");
  const [semaine, setSemaine] = useState(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10)));
  const [semaineFin, setSemaineFin] = useState(entry.semaineFin || sundayOf(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10))));
  const [jours, setJours] = useState(entry.jours && entry.jours.length > 0 ? entry.jours : emptyJoursLecture(entry.semaine || mondayOf(new Date().toISOString().slice(0, 10))));
  const [resume, setResume] = useState(entry.resume || entry.reflexion || "");

  const tousPastors = [...pastors].sort((a, b) => a.nom.localeCompare(b.nom));

  function updateJour(index, field, value) {
    setJours(jours.map((j, i) => i === index ? { ...j, [field]: value } : j));
  }

  function changerDebut(v) {
    setSemaine(v);
    setSemaineFin(v ? sundayOf(v) : "");
    setJours(emptyJoursLecture(v));
  }

  function reappliquerSuggestion() {
    setJours(emptyJoursLecture(semaine));
  }

  function handleSubmit() {
    const auMoinsUnJour = jours.some(j => j.at1 || j.at2 || j.nt);
    if (!auMoinsUnJour) { alert("Merci de renseigner au moins un jour de lecture."); return; }
    if (!semaine || !semaineFin) { alert("Merci de renseigner la date de début et la date de fin."); return; }
    const nbJours = Math.round((new Date(semaineFin + "T00:00:00") - new Date(semaine + "T00:00:00")) / 86400000) + 1;
    if (nbJours !== 7) {
      alert(`La période doit correspondre à une semaine exacte (7 jours). Actuellement : ${nbJours} jour${nbJours > 1 ? "s" : ""}. Enregistrement refusé.`);
      return;
    }
    onSave({ id: entry.id || uid(), assemblee: entry.assemblee, pasteur: pasteur.trim(), semaine, semaineFin, jours, resume: resume.trim() });
  }

  return (
    <ModalShell title={isNew ? "Nouveau rapport de lecture" : "Modifier le rapport"} onClose={onClose}>
      <Field label="Pasteur lecteur">
        <select style={inputStyle} value={pasteur} onChange={e => setPasteur(e.target.value)}>
          <option value="">— Choisir dans le répertoire —</option>
          {tousPastors.map(p => <option key={p.id} value={p.nom}>{p.nom}{p.assemblee ? ` · ${p.assemblee}` : ""}</option>)}
        </select>
        <input style={{ ...inputStyle, marginTop: 8 }} value={pasteur} onChange={e => setPasteur(e.target.value)} placeholder="Ou saisir un autre nom" />
      </Field>
      <div style={{ fontSize: 11, color: "var(--ink-soft)", marginBottom: 8, lineHeight: 1.4 }}>
        La période doit couvrir exactement 7 jours. La date de fin se règle automatiquement au dimanche suivant, mais reste modifiable.
      </div>
      <div style={{ display: "flex", gap: 10 }}>
        <div style={{ flex: 1 }}>
          <Field label="Date de début">
            <input type="date" style={inputStyle} value={semaine} onChange={e => changerDebut(e.target.value)} />
          </Field>
        </div>
        <div style={{ flex: 1 }}>
          <Field label="Date de fin (7 jours après le début)">
            <input type="date" style={inputStyle} value={semaineFin} min={semaine || undefined} onChange={e => setSemaineFin(e.target.value)} />
          </Field>
        </div>
      </div>

      <Field label="Plan de lecture — 2 chapitres AT + 1 chapitre NT par jour">
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
          <div style={{ fontSize: 11, color: "var(--ink-soft)", lineHeight: 1.4 }}>
            Suggéré automatiquement, en continu depuis Genèse 1 et Matthieu 1 — modifiable librement.
          </div>
          <button onClick={reappliquerSuggestion} style={{ fontSize: 11, fontWeight: 700, color: "var(--primary)", whiteSpace: "nowrap", marginLeft: 8 }}>
            Réinitialiser
          </button>
        </div>
        <div style={{ display: "flex", flexDirection: "column", gap: 8 }}>
          {jours.map((j, i) => (
            <div key={j.jour} style={{ background: "var(--bg)", borderRadius: 10, padding: 10, border: "1px solid var(--border)" }}>
              <div style={{ fontSize: 12, fontWeight: 700, color: "var(--primary)", marginBottom: 6 }}>{j.jour}</div>
              <div style={{ display: "flex", flexDirection: "column", gap: 6 }}>
                <input
                  style={{ ...inputStyle, fontSize: 12.5 }} value={j.at1} onChange={e => updateJour(i, "at1", e.target.value)}
                  placeholder="Ancien Testament — chapitre 1 (ex : Genèse 1)"
                />
                <input
                  style={{ ...inputStyle, fontSize: 12.5 }} value={j.at2} onChange={e => updateJour(i, "at2", e.target.value)}
                  placeholder="Ancien Testament — chapitre 2 (ex : Genèse 2)"
                />
                <input
                  style={{ ...inputStyle, fontSize: 12.5 }} value={j.nt} onChange={e => updateJour(i, "nt", e.target.value)}
                  placeholder="Nouveau Testament — chapitre (ex : Matthieu 1)"
                />
              </div>
            </div>
          ))}
        </div>
      </Field>

      <Field label="Résumé de la lecture">
        <textarea style={{ ...inputStyle, minHeight: 100, resize: "vertical" }} value={resume} onChange={e => setResume(e.target.value)} placeholder="Ce que cette lecture vous a appris cette semaine…" />
      </Field>

      <PrimaryButton onClick={handleSubmit} icon={Check} full>Enregistrer</PrimaryButton>
      {!isNew && (
        <button onClick={() => { if (confirm("Supprimer ce rapport ?")) onDelete(entry.id); }} style={{
          width: "100%", marginTop: 10, color: "var(--danger)", fontSize: 13, fontWeight: 600,
          display: "flex", alignItems: "center", justifyContent: "center", gap: 5, padding: 8
        }}>
          <Trash2 size={14} /> Supprimer ce rapport
        </button>
      )}
    </ModalShell>
  );
}