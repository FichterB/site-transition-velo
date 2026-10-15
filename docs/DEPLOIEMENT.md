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

### 2. Accès FTP (secrets)
GitHub → dépôt → **Settings → Secrets and variables → Actions**.

Onglet **Secrets** :
| Nom | Valeur |
|---|---|
| `FTP_SERVER` | adresse du serveur FTP (ex. `ftp.cluster0xx.hosting.ovh.net`) |
| `FTP_USERNAME` | identifiant FTP |
| `FTP_PASSWORD` | mot de passe FTP |

Onglet **Variables** :
| Nom | Valeur |
|---|---|
| `FTP_DIR_PROD` | dossier du site public, terminé par `/` (ex. `/www/`) |
| `FTP_DIR_PREPROD` | dossier de test, terminé par `/` (ex. `/www/preprod/`) |
| `FTP_PROTOCOL` | `ftps` (recommandé) ou `ftp` si l'hébergeur ne gère pas le chiffrement |

Les mots de passe ne doivent **jamais** être écrits dans un fichier du dépôt.

### 3. Protéger la production (recommandé)
Settings → **Environments** → `production` → cocher **Required reviewers** et s'ajouter. Chaque mise en production demandera alors une validation.

### 4. Premier déploiement
Lancer d'abord l'action en préprod et vérifier `https://<domaine>/preprod/simulateur.html`.

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
