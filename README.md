# Site Transition Vélo

Site vitrine et simulateur de vélo de fonction en LLD — Saint-Péray, Drôme & Ardèche.

## Démarrer avec l'onglet </> Code

1. Placer ce dossier sur le Mac (ex. `~/Sites/site-transition-velo`).
2. Ouvrir l'application Claude → onglet **</> Code** → choisir ce dossier.
3. Premier message à envoyer :

   > Lis CLAUDE.md et les fichiers de docs/. Ensuite initialise git, fais un premier commit, et aide-moi à créer le dépôt GitHub privé et à configurer le déploiement FTP décrit dans docs/DEPLOIEMENT.md.

Claude lit automatiquement `CLAUDE.md` à chaque session : il y trouve le contexte, la charte et les règles à respecter.

## Contenu

| Dossier / fichier | Rôle |
|---|---|
| `site/` | ce qui est publié sur le FTP |
| `site/config.js` | réglages (identifiant Google Analytics, HubSpot, taux de loyer) |
| `ressources/` | logo source (.ai), fiche technique Roadster4, photo HD — non publiés |
| `docs/DEPLOIEMENT.md` | circuit de mise en production, secrets FTP, checklist |
| `docs/REGLES-METIER.md` | règles fiscales (VAE vs speedbike, BOSS, IS) et formule du simulateur |
| `docs/SUIVI-ANALYTICS.md` | événements Google Analytics et réglages GA4 |
| `CLAUDE.md` | contexte pour Claude |
| `.github/workflows/deploy.yml` | déploiement automatique par FTP |

## Exemples de demandes à faire dans l'onglet Code

- « Change le taux de loyer à 3,2 % et déploie en préprod. »
- « Ajoute la mention speedbikes non éligibles sous le simulateur. »
- « La préprod est bonne, déploie en production. »
- « Annule le dernier changement. »
