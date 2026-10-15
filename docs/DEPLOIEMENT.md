# Mise en production

## Le circuit

```
 Onglet </> Code (Mac)  ──git push──►  GitHub (dépôt privé)
                                           │  Action « Déployer » (automatique)
                                           ▼
                                   /preprod/  (test, non indexé, sans Google Analytics)
                                           │  vérification manuelle
                                           ▼  Action « Déployer » → production (manuel)
                                   Site public
```

- Un **push sur `main`** qui touche au dossier `site/` déploie automatiquement en préproduction.
- La **production** se déploie à la main : GitHub → onglet **Actions** → **Déployer** → **Run workflow** → cible `production`.
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

Sans `MISSIVE_TOKEN`, l'étape est simplement sautée. Un problème côté Missive ne fait jamais échouer la mise en production.

La version en ligne est marquée par l'étiquette git `production`, déplacée après chaque mise en production réussie : c'est elle qui sert à calculer « les changements depuis la dernière fois ».

### 4. Protéger la production (recommandé)
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
