# Landing pages d'opération B2C (magasin)

Pages autonomes pour les opérations commerciales du **magasin Cyclable Valence – Saint-Péray** (activité B2C, exploitée par Transition Vélo SAS). Elles ne sont **pas liées au site B2B** : pas de lien depuis l'accueil, pas de lien vers le simulateur.

- production : `https://transitionvelo.net/op/<nom-de-l-op>/`
- préprod : `https://transitionvelo.net/preprod/op/<nom-de-l-op>/`

Chaque OP est un dossier `site/op/<nom-de-l-op>/` avec son `index.html` et ses photos dans `img/`. Apache sert le dossier tout seul : aucune configuration serveur.

## OP en ligne

| Dossier | Opération | Contenu |
|---|---|---|
| `op/saison-des-cadeaux/` | Saison des cadeaux Moustache (déstockage) | 21 modèles Moustache, filtres par famille, tri, recherche, coloris |

## Créer une nouvelle OP

1. Copier un dossier existant (ex. `op/saison-des-cadeaux/`) en `site/op/<nom>/` (minuscules, chiffres, tirets).
2. Dans `index.html` :
   - `<title>`, `<meta name="description">`, titre et texte du bandeau ;
   - `const OP = '<nom>'` (suivi GA4) et `<body data-page="op-<nom>">` ;
   - `MODELS` : les vélos et leurs variantes (prix initial `o`, prix remisé `p`, remise `d`, tailles `s`, etc.) ;
   - `PHOTOS` : une photo par modèle, placée dans `img/`, avec le coloris qu'elle montre ;
   - `FORM_URL` : le formulaire HubSpot B2C (actuellement `share-eu1.hsforms.com/2B57XYos-QA-CQtXEgDgd-w2ekw85`).
3. Pousser sur `main` → vérifier en préprod → pull request `main` → `production`.

## Ce que fait la page

- « Demander plus d'infos » ouvre le formulaire HubSpot B2C dans un nouvel onglet, avec le message pré-rempli (modèle, coloris, prix).
- Suivi GA4 (après consentement, via `tracking.js`) : événement `op_demande_infos` avec `operation`, `modele` et `velo_prix`. Aucune donnée personnelle.
- Mise en page : chaque carte partage les rangées de sa ligne (CSS `subgrid`) pour que photos, listes de prix et boutons soient alignés.
- Polices et couleurs de la charte (Anton pour le titre, Hanken Grotesk pour le texte).

## Liens de campagne

Ajouter les paramètres UTM à l'adresse diffusée, ex. :
`https://transitionvelo.net/op/saison-des-cadeaux/?utm_source=facebook&utm_medium=social&utm_campaign=saison-des-cadeaux`

## Fin d'une OP

Le déploiement ne supprime jamais rien sur le serveur : supprimer le dossier du dépôt ne retire pas la page en ligne. Pour l'arrêter, remplacer son contenu par un message de fin d'offre, ou supprimer le dossier dans FileZilla.
