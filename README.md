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
Onglet **Coord. → Plans départements**. Chaque chef de département (Missions et Formations, Communication, Finance, Patrimoine, Socioculturel et Famille, Autres) choisit son département et son année, puis remplit :
- **Année** : les grandes activités, rangées par trimestre ;
- **Trimestre** : les actions datées, reliées à une activité de l'année ;
- **Mois** : les tâches concrètes, avec participants et dépense réelle (l'écart de budget se calcule seul) ;
- **Bilan** : résultats, difficultés, solutions et décisions, par mois, trimestre ou année ;
- **Tableau** : vue d'ensemble de tous les départements (taux de réalisation, budgets, dépenses).

## Données
Toutes les données sont dans Firestore, collection `mpv-data` (voir `firestore.rules`).
Les nouveaux documents sont `finance-reports`, `activity-reports`, `expense-reports`, `dept-plans` et `dept-bilans`.

## Commandes
- `npm install` puis `npm run dev` pour lancer en local
- `npm run build` pour construire (Vercel le fait automatiquement à chaque envoi sur GitHub)
