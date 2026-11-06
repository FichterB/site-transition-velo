# Landing pages d'opération (OP)

Une page à part par opération commerciale (salon, partenariat, offre limitée…), à l'adresse :

- production : `https://transitionvelo.net/op/<nom-de-l-op>/`
- préprod : `https://transitionvelo.net/preprod/op/<nom-de-l-op>/`

Chaque OP est un dossier `site/op/<nom-de-l-op>/` contenant un `index.html`. Apache sert ce fichier tout seul : aucune configuration serveur.

## Créer une OP

1. Copier `site/op/modele/` en `site/op/<nom-de-l-op>/` (minuscules, chiffres et tirets, ex. `salon-valence-2026`).
2. Dans le nouveau `index.html` :
   - bloc `window.TV_OP` : `slug` (= nom du dossier), `velos` (vélos mis en avant, index de la liste de `simulateur-calcul.js`), `finLe` (date de fin, facultative) ;
   - `<body data-page="op-<nom-de-l-op>">` (sert au suivi GA4) ;
   - `<title>`, `<meta name="description">` et tous les textes entre crochets `[ … ]` ;
   - `<meta name="robots">` : garder `noindex` si l'OP n'est diffusée que par email, pub ou QR code ; le retirer si elle doit apparaître dans Google.
3. Pousser sur `main` → vérifier en préprod → pull request `main` → `production`.

## Ce que fait la page

- Les chemins partent de la racine du site grâce à `<base href="../../">` : images, scripts et liens fonctionnent depuis n'importe quel dossier d'OP, en préprod comme en production.
- Liste des vélos de l'OP (mêmes prix et loyers que le reste du site), sélection de plusieurs vélos, puis « Simuler ce choix » → `simulateur.html?velos=…&op=<nom-de-l-op>`.
- Le simulateur garde le **formulaire HubSpot avant les résultats** pour un visiteur arrivé directement sur l'OP (capture du prospect).
- GA4 : les événements de la page portent `page_type = op-<nom-de-l-op>` ; la simulation porte le paramètre `operation = <nom-de-l-op>`.

## Liens de campagne

Ajouter les paramètres UTM à l'adresse diffusée, ex. :
`https://transitionvelo.net/op/salon-valence-2026/?utm_source=salon&utm_medium=qrcode&utm_campaign=salon-valence-2026`

## Fin d'une OP

Supprimer le dossier dans le dépôt ne l'efface pas du serveur (le déploiement ne supprime jamais rien). Pour la retirer : la remplacer par une page qui renvoie vers l'accueil, ou supprimer le dossier dans FileZilla.
