# Mission Parole de Vie Burkina — Mission & Formation

Application du département Mission et Formation (React + Vite + Firebase, installable sur téléphone).

## Onglets principaux
- Accueil, Séminaires, Programme, Bible, Répertoire, Coordination, Messages, Direction
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
Toutes les données sont dans Firestore, collection `mpv-data` (voir `firestore.rules`).
Les nouveaux documents sont `finance-reports`, `activity-reports`, `expense-reports`, `dept-plans`, `dept-bilans`, `dept-codes` et `annonces`.

Les codes d'accès de l'onglet Direction sont masqués tant que le code du chef du département n'est pas saisi.

## Commandes
- `npm install` puis `npm run dev` pour lancer en local
- `npm run build` pour construire (Vercel le fait automatiquement à chaque envoi sur GitHub)
