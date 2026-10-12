# Life Word Mission

Application de l'Église pour **tous les pays d'Afrique et de la diaspora** (React + Vite + Firebase, installable sur téléphone). Elle est née comme l'app du département Mission et Formation de Mission Parole de Vie Burkina.

## Pays
- Au premier lancement, chacun choisit son pays (54 pays d'Afrique + pays de la diaspora, liste dans `src/pays.js`). Le choix est gardé sur le téléphone (`localStorage`, clé `lwm-pays`) ; on change de pays dans **Menu → Mon pays** ou **Église → Pays** (l'app redémarre).
- **Chaque pays a ses propres données** : régions et assemblées, répertoire, séminaires, programmes, rapports, finances, caisses, membres, districts, plans des départements, annonces. Dans Firestore, les documents d'un pays sont préfixés par son code : `CI__seminars-list`, `CM__regions-assemblies`, sous-collection `CI__assembly-members/items`…
- **Le Burkina Faso garde ses documents d'origine, sans préfixe** : aucune donnée existante n'a été déplacée.
- Communs à toute l'Afrique : `leadership-afrique` (Président, Vice-Président, Secrétaire du Bureau Afrique, Chef de département Afrique), `missionaries-africa` et `pays-actifs` (pays qui utilisent l'app).
- La monnaie (FCFA, NGN, CDF, EUR…) et l'indicatif WhatsApp (+226, +225, +237…) suivent le pays choisi.
- **Église → Pays** : vue du Bureau Afrique avec chaque pays qui utilise l'app (coordonnateur, assemblées, districts, rapports de la semaine) et bouton pour ouvrir un autre pays.

## Onglets principaux
- Accueil, **Église**, Séminaires, Programme, Bible, Répertoire, Coordination, Messages, Direction

## Église (document cadre ALWM)
L'onglet **Église** reprend l'organisation du *Document cadre d'Africa Life Word Mission* (Mission Parole de Vie Burkina = Coordination nationale d'ALWM au Burkina). Tout le contenu est dans `src/organisation.js`.
- **Mon rôle** : chacun choisit son niveau (Bureau Afrique, Coordination nationale, District, Assemblée, Membre) et sa fonction. L'app affiche ses missions, à qui il rend compte, l'état des rapports de la semaine de son assemblée et ses raccourcis. Le choix est gardé sur le téléphone (`localStorage`, clé `mpv-profil`) et ne donne aucun accès protégé. Une carte « Mon rôle » apparaît sur l'accueil.
- **Organigramme** : Bureau Afrique → Coordination nationale (chefs des 8 départements) → Districts → Comité Directeur des assemblées, avec les noms saisis dans Direction, Coord. → Responsables et Districts.
- **Districts** (document `districts`) : un district regroupe au moins deux assemblées, avec son coordonnateur et son secrétaire. Pour chaque semaine, l'app montre quelles assemblées ont déposé le rapport d'activités et le rapport financier, avec un rappel WhatsApp au pasteur et le partage du point de la semaine. Création et modification avec le code du coordonnateur national (ou du chef du département tant que ce code n'existe pas).
- **Qui fait quoi** : le circuit des rapports (Assemblée → District → Coordination nationale → Point focal → Bureau Afrique) et les attributions de chaque responsable.
- **Départements** : les 8 départements officiels (DMF, Communication, Arts et Culture, Finances, Protocole, Développement Socioéconomique et Famille, Patrimoine/Logistique/Investissements, Affaires Juridiques et Règlementation).
- **Rencontres** : conventions, QG, CPP, réunions des bureaux, cultes ; formations (classique, capacitation, renforcement des capacités), séminaire biblique et casse de béquilles.

Alignements faits dans le reste de l'app :
- Les plans des départements utilisent les 8 départements officiels (+ « Autres »). Les anciens noms (« Missions et Formations », « Finance », « Patrimoine », « Socioculturel et Famille ») sont convertis automatiquement : plans, bilans, codes d'accès et fiches du répertoire sont conservés.
- Postes du Comité Directeur conformes au document (Pasteur principal, adjoint, secrétaires, trésorier(e), agent comptable, porte-parole de chaque département, conseillers) ; les anciens libellés sont convertis à l'affichage.
- Nouvelles fonctions dans le répertoire (Point focal, Coordonnateur national, Chef de département national, Coordonnateur de district, Délégué de district, Pasteur principal…).
- Nouveaux types de programme : QG District, Culte d'ensemble, CPP, Casse de béquilles.
- Direction : Bureau Afrique (PA, Vice-Président, Secrétaire, Point focal, Chef de département Afrique) et Coordination nationale (Coordonnateur, Secrétaire du BCN, Chef du département Mission et Formation).
- **Rapport** : rapports des séminaires, **rapport hebdomadaire d'activités** (culte, mission, formation, famille, bilan) et rapport de coordination
- **Finances** : chaque financier d'assemblée dépose le rapport financier de la semaine (offrandes, dîmes, BP, dons volontaires). La répartition Assemblée / District / Coordination / Afrique est calculée automatiquement. Le récapitulatif national est protégé par le code du chef du département.

## Répartition des finances
| Source | Assemblée | District | Coordination | Afrique |
|---|---|---|---|---|
| Offrandes | 70 % | 10 % | 10 % | 10 % |
| Dîmes | 20 % | 25 % | 35 % | 20 % |
| Besoin présent (BP) | 20 % | 25 % | 35 % | 20 % |
| Dons volontaires | 100 % | 0 % | 0 % | 0 % |
| **Total G** | X | Y | Z | A |
| **Convention** | 10 % de X | 10 % de Y | 20 % de Z | 0 % de A |

L'app affiche aussi le reste de chaque niveau après la part Convention.

## Caisse & dépenses
- Chaque assemblée a sa caisse ; la coordination nationale a la sienne (protégée par le code du chef du département).
- **Recettes** : le reste après Convention de chaque rapport financier (part Assemblée, ou part Coordination pour la caisse nationale).
- **Dépenses prévues** (réservées) et **dépenses effectuées** (payées), saisies dans « Caisse & dépenses ».
- **Séminaires** : le budget d'un séminaire compte automatiquement comme dépense prévue ; dès que le rapport du séminaire déclare des dépenses, elles deviennent des dépenses effectuées. Les séminaires rejetés ne comptent pas.
- **Solde en caisse** = recettes − dépenses effectuées (en rouge si négatif).
- **Reste disponible à ne pas dépasser** = solde − dépenses prévues. L'app avertit avant toute dépense qui le dépasse.

## Plans d'action des départements
Onglet **Coord. → Plans départements**. Chaque département (Missions et Formations, Communication, Finance, Patrimoine, Socioculturel et Famille, Autres) a son **espace réservé**, ouvert par son propre code :
- le chef du département national crée les codes dans « Vue nationale → Codes d'accès » (document `dept-codes`) ;
- chaque chef de département peut changer son code et le remettre à ses collaborateurs ;
- le code du chef du département national ouvre tous les espaces et la vue nationale.

Dans son espace, le département remplit :
- **Année** : les grandes activités, rangées par trimestre ;
- **Trimestre** : les actions datées, reliées à une activité de l'année ;
- **Mois** : les tâches concrètes, avec participants et dépense réelle (l'écart de budget se calcule seul) ;
- **Bilan** : résultats, difficultés, solutions et décisions, par mois, trimestre ou année ;
- **Vue nationale → Tableau** : vue d'ensemble de tous les départements (taux de réalisation, budgets, dépenses), réservée au chef du département national.

## Menu : partager l'app et guide
Bouton **MENU** en haut à droite (et raccourci « Partager & aide » sur l'accueil) :
- **Partager l'application** : envoi du lien par WhatsApp (avec les instructions d'installation), partage natif du téléphone, copie du lien, code QR à scanner ;
- **Installer l'app** sur Android et iPhone ;
- **Guide d'utilisation** de chaque onglet, avec un bouton pour l'ouvrir ;
- **Codes d'accès** et **bon à savoir**.

## Réunions & annonces
Onglet **Messages → Réunions & annonces** (raccourci « Réunions » sur l'accueil) :
- annoncer une **réunion**, un **programme** (repris d'un séminaire existant) ou une **annonce** : titre, date, heure, lieu, ordre du jour ;
- **visioconférence** : un lien Jitsi Meet unique est créé automatiquement (ou coller un lien Google Meet / Zoom) ; bouton « Rejoindre la visio » dans la liste et sur l'accueil ;
- **visio dans l'app** (dès que le serveur de l'église est installé, voir `serveur/INSTALL-JITSI.md` puis `VISIO_SERVER` dans `src/visio.js`) : la réunion s'ouvre dans l'app, 50+ participants, chat, salle d'attente, partage d'écran (depuis un ordinateur, ou via l'app Jitsi Meet sur téléphone), enregistrement par l'organisateur ; tant que `VISIO_SERVER` vaut `meet.jit.si`, le lien s'ouvre dehors comme avant ;
- **rappels** : badge « Dans 12 min » / « En cours » sur les réunions, et notification 15 min avant (bouton « Activer les rappels » sur l'accueil ; fonctionne quand l'app est ouverte ou vient d'être utilisée) ;
- **destinataires** : tout le monde, chefs de département, un ou plusieurs départements, une fonction, une assemblée, personne par personne, ou invités hors répertoire ;
- **envoi WhatsApp** : un bouton « Envoyer à … » par personne, message personnalisé, l'app retient qui a été prévenu ; aussi « Dans un groupe WhatsApp » et « Copier le message ».
Chaque fiche du Répertoire peut être rattachée à un département de la coordination (champ facultatif) pour inviter tout un département d'un geste.

**Compte rendu** (bouton « Faire le compte rendu » le jour de la réunion et après) :
- présences : chaque invité passe de Présent à Excusé puis Absent d'un toucher ; ajout des présents non invités ;
- captures d'écran de la visio (faites avec le téléphone), jusqu'à 4, avec légende ;
- propos : dictée vocale du navigateur (Chrome) qui écrit ce que le micro entend, avec l'heure et le nom de l'orateur ;
- points abordés, décisions, actions (quoi / qui / quand), prochaine réunion ;
- partage du résumé par WhatsApp, copie avec les propos. Chaque compte rendu est un document `cr-<id de la réunion>`.

## Données
Toutes les données sont dans Firestore, collection `mpv-data` (voir `firestore.rules`), un jeu de documents par pays (voir « Pays » plus haut).
Les nouveaux documents sont `finance-reports`, `activity-reports`, `expense-reports`, `dept-plans`, `dept-bilans`, `dept-codes` et `annonces`.

Les codes d'accès de l'onglet Direction sont masqués tant que le code du chef du département n'est pas saisi.

## Commandes
- `npm install` puis `npm run dev` pour lancer en local
- `npm run build` pour construire (Vercel le fait automatiquement à chaque envoi sur GitHub)
