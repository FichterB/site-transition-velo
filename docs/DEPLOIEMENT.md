# Mise en production

## Le circuit

```
 Onglet </> Code (Mac)  ──git push──►  branche main
                                           │  Action « Déployer » (automatique)
                                           ▼
                                   /preprod/  (test, non indexé, sans GA4 ni Clarity)
                                           │  vérification manuelle
                                           ▼  pull request main → production, puis « Merge »
                                   branche production
                                           │  Action « Déployer » (automatique) + récap Missive
                                           ▼
                                   Site public
```

- Deux branches : `main` (travail en cours, = préprod) et `production` (= ce qui est en ligne).
- Un **push sur `main`** qui touche au dossier `site/` déploie automatiquement en préproduction.
- La **production** ne bouge que par un **merge de `main` dans `production`** :
  1. Ouvrir https://github.com/FichterB/site-transition-velo/compare/production...main
  2. **Create pull request** : la page liste les commits et les fichiers qui vont partir en ligne.
  3. **Merge pull request** → le déploiement en production démarre tout seul.
- Ce qui est poussé sur `main` après la vérification de la préprod ne part pas en production tant que la pull request n'est pas créée et fusionnée : on voit toujours exactement ce qui part.
- Redéployer la version en ligne sans changement : Actions → **Déployer** → **Run workflow** → cible `production` (utilise toujours la branche `production`).
- Seul le contenu de `site/` est envoyé. `docs/`, `ressources/` et les fichiers `.md` ne partent jamais sur le serveur.

## Mise en place (une seule fois)

### 1. Dépôt GitHub
Créer un dépôt **privé** (ex. `transition-velo-site`), puis depuis l'onglet Code, demander à Claude :
« Initialise git dans ce dossier, fais un premier commit et pousse sur github.com/<compte>/transition-velo-site ».

### 2. Accès SFTP
Hébergement OVH mutualisé, connexion **SFTP** (port 22). Serveur, identifiant et dossiers sont écrits dans `.github/workflows/deploy.yml` (bloc `env`) :

| Réglage | Valeur |
|---|---|
| Serveur | `ftp.cluster029.hosting.ovh.net` (port 22) |
| Identifiant | `xszitdx` |
| Dossier production | `www/` |
| Dossier préproduction | `www/preprod/` |

Seul le mot de passe est à saisir dans GitHub → dépôt → **Settings → Secrets and variables → Actions** → onglet **Secrets** → **New repository secret** :

| Nom | Valeur |
|---|---|
| `FTP_PASSWORD` | mot de passe SFTP OVH |

Les mots de passe ne doivent **jamais** être écrits dans un fichier du dépôt.

L'envoi remplace les fichiers du même nom mais **ne supprime rien** sur le serveur.

### 3. Récap Missive à chaque mise en production (optionnel)
À la fin de chaque déploiement en **production**, un message est posté dans Missive : qui a déployé, quelle version, et la liste des changements depuis la mise en production précédente. Tous les récaps arrivent dans **la même conversation** « Mises en production — transitionvelo.net » (créée automatiquement la première fois).

1. Missive → Préférences → onglet **API** → **Create a new token** (nécessite le forfait Productive).
2. GitHub → Settings → Secrets and variables → Actions → **Secrets** : `MISSIVE_TOKEN` = ce jeton.
3. (Recommandé) Onglet **Variables** : `MISSIVE_CONVERSATION` = l'ID d'une conversation Missive partagée avec l'équipe, où poster les récaps. Pour le trouver : ouvrir la conversation, menu « … » → **Copier le lien** ; l'ID est la suite de lettres, chiffres et tirets à la fin du lien.
   Sans cette variable, Missive crée sa propre conversation « Mises en production — transitionvelo.net », visible seulement du propriétaire du jeton (sauf si `MISSIVE_ORGANIZATION` est renseignée).

Avec `MISSIVE_CONVERSATION`, les récaps précédents sont **supprimés** avant de poster le nouveau : la conversation ne garde que le dernier. Seuls les posts signés « Déploiement site » sont supprimés (jamais les emails ni les commentaires). Dans une conversation partagée avec l'organisation, Missive n'autorise cette suppression que si le jeton appartient à un **admin** ; sinon le nouveau récap est quand même posté, à la suite des anciens.

Sans `MISSIVE_TOKEN`, l'étape est simplement sautée. Un problème côté Missive ne fait jamais échouer la mise en production.

Le récap liste les commits apportés par le merge dans `production` (« les changements depuis la dernière fois »).

### 4. Protéger la production (recommandé)
Settings → **Branches** → **Add branch ruleset** (ou *Add rule*) sur `production` : cocher **Require a pull request before merging** et interdire les suppressions / force push. Ainsi personne (ni Claude) ne peut pousser directement en production.

Settings → **Environments** → `production` → cocher **Required reviewers** et s'ajouter. Chaque mise en production demandera alors une validation.

### 5. Premier déploiement
Lancer d'abord l'action en préprod et vérifier `https://transitionvelo.net/preprod/simulateur.html`.

> Le premier envoi en production réécrit les fichiers existants du même nom sur le serveur. Faire une sauvegarde du site actuel (téléchargement FTP) avant.

## Checklist de vérification en préprod

- [ ] `simulateur.html` : les 4 étapes s'enchaînent, le formulaire HubSpot s'affiche, les résultats apparaissent après envoi
- [ ] `index.html` : la page s'affiche (sinon `support.js` manque), le bouton « Ouvrir le formulaire » fonctionne
- [ ] Logo net en haut et en pied de page, favicon dans l'onglet
- [ ] Affichage correct sur téléphone
- [ ] Pas d'erreur dans la console du navigateur
- [ ] En préprod, aucun bandeau cookies (normal : GA est coupé)
- [ ] Après la mise en production : le bandeau cookies apparaît (si `ga4Id` est renseigné) et les événements arrivent dans GA4 → Rapports → Temps réel

## Revenir en arrière

Dans l'onglet Code : « Annule le dernier changement et redéploie » (Claude fait un `git revert` puis un push).
Ou sur GitHub : Actions → un ancien déploiement réussi → **Re-run jobs**.

## Cache navigateur

Après une mise à jour de `config.js`, certains visiteurs peuvent garder l'ancienne version quelques heures. Pour forcer le rechargement, changer la référence dans les deux pages : `config.js?v=2`, `config.js?v=3`, etc.
