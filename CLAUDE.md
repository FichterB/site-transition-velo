# Transition Vélo — site vitrine et simulateur

Contexte projet pour Claude (onglet Code). À lire avant toute modification.

## Le projet

Transition Vélo (Saint-Péray, 07) propose des **vélos de fonction en location longue durée (LLD)** aux entreprises de la Drôme et de l'Ardèche. Contact commercial : Adrien Wicart — 06 58 77 58 36 — adrien@transitionvelo.fr.

Le site sert à générer des prospects : le visiteur simule le coût d'un vélo, laisse ses coordonnées dans le formulaire HubSpot, puis Adrien le rappelle.

## Arborescence

```
site/                 ← tout ce qui est publié sur le FTP (et rien d'autre)
  index.html          page d'accueil (service, étapes, fiscalité, catalogue de vélos, atelier, contact, conditions)
  simulateur.html     simulateur seul, formulaire HubSpot obligatoire avant les résultats
  config.js           réglages modifiables sans toucher au HTML (GA4, HubSpot, taux de loyer, part salarié)
  simulateur-calcul.js  formule du simulateur + liste des vélos, partagées par les deux pages (window.TV_SIM)
  tracking.js         bandeau cookies + GA4 + Clarity, partagé par les deux pages (window.tvTrack)
  images/             logos SVG + photos
ressources/           sources non publiées : logo .ai, fiches PDF, photos HD
docs/                 documentation détaillée (déploiement, règles métier, analytics)
.github/workflows/    déploiement automatique par SFTP
```

## Les deux pages

Les deux pages sont en HTML + CSS + JavaScript classique, sans framework ni étape de construction. Elles dépendent de `config.js`, `simulateur-calcul.js`, `tracking.js` et de Google Fonts (plus le formulaire HubSpot pour le simulateur).

- **`index.html`** : présentation de l'offre. Pas de simulateur intégré : le catalogue permet d'ajouter un ou plusieurs vélos, puis « Simuler ce choix » ouvre `simulateur.html?velos=2,2,5` (index dans la liste des vélos).
- **`simulateur.html`** : 4 étapes (vélos, profil, formulaire HubSpot, résultats). Les résultats ne s'affichent qu'après l'envoi du formulaire. Paramètres d'adresse acceptés : `?velos=…` (vélos choisis sur l'accueil) et `?prix=…` (prix libre).

Style « éditorial » voulu, pour éviter le rendu générique type IA : pas de cartes à ombre, pas d'icônes dans des carrés colorés, pas de bordure gauche colorée, pas de pastilles, pas de petits sur-titres en capitales au-dessus de chaque section, pas de chiffres non sourcés. Préférer filets fins, listes, vraies photos, texte concret.

Les deux pages lisent `window.TV_CONFIG` (défini par `config.js`). **Le calcul du simulateur est dans `simulateur-calcul.js`, commun aux deux pages** : toute modification de formule se fait là, une seule fois. Seul l'affichage est propre à chaque page.

## Charte graphique

| Rôle | Couleur |
|---|---|
| Accent (boutons, liens, chiffres clés) | `#D4412B` (survol `#B5341F`) — proche du rouge-orangé du logo `#DE4832` |
| Texte et fonds sombres | `#1C232B` (bleu nuit du logo) ; pied de page `#141A20` |
| Fonds clairs | `#FCFBF9`, `#F4F0E7` (crème) |
| Économies / validation | `#1F7A45` (vert), `#C8960C` (or) |
| Texte secondaire | `#8A8271`, `#6B6454` |

Polices : **Anton** (titres en capitales), **Hanken Grotesk** (texte), **JetBrains Mono** (chiffres).
Logo : `site/images/logo-transition-velo.svg` (fond clair), `logo-transition-velo-blanc.svg` (fond sombre), `favicon.svg` (roue seule). Source : `ressources/logo-transition-velo.ai`. Ne jamais redessiner ni recolorer le logo.

## Règles métier à respecter (détails : `docs/REGLES-METIER.md`)

- L'offre et les avantages fiscaux concernent **uniquement les vélos et VAE** (assistance coupée à 25 km/h, 250 W max). **Les speedbikes (45 km/h) sont des cyclomoteurs** : pas d'exonération BOSS, pas de réduction d'IS. Ne jamais afficher d'avantage fiscal pour un speedbike.
- Formule du simulateur : `loyer mensuel HT = prix HT × tauxLoyer × coeffDuree[durée]` (valeurs dans `config.js`). Le visiteur peut ajouter plusieurs vélos suggérés, y compris le même plusieurs fois (« − » pour en retirer) : leurs prix s'additionnent (total max `prixMax`, 8 000 € HT). Part salarié choisie par le visiteur (0 à 50 %, 30 % par défaut, réglable dans `config.js`), le reste pour l'employeur.
- Le cumul « participation du salarié + réduction d'IS de 25 % » est juridiquement discutable (la loi exige une mise à disposition gratuite). Ne pas renforcer les promesses fiscales sans validation d'un expert-comptable.

## Formulaire HubSpot

Portail `145421861`, région `eu1`, formulaire `079ed762-8b3e-400f-8242-d5c480381dfb` (dans `config.js`). Le simulateur détecte l'envoi via l'événement `hs-form-event:on-submission:success` (et `hsFormCallback` pour les anciens formulaires). Ne pas casser ce mécanisme : c'est lui qui débloque les résultats.

## Suivi d'audience (détails : `docs/SUIVI-ANALYTICS.md`)

Google Analytics 4 et Microsoft Clarity (code commun : `site/tracking.js`), chargés **uniquement après consentement** (bandeau maison, choix stocké dans `localStorage` sous `tv_consent`). Toute nouvelle mesure passe par `window.tvTrack('nom_evenement', { ... })`. Ne jamais envoyer de donnée personnelle (nom, email, téléphone) à GA.

## Déploiement (détails : `docs/DEPLOIEMENT.md`)

- Site : **https://transitionvelo.net** — préprod : https://transitionvelo.net/preprod/ (hébergement OVH, SFTP).
- Deux branches : `main` (= préprod) et `production` (= site en ligne). Ne jamais pousser directement sur `production`.
- Push sur `main` → déploiement automatique en **préproduction** (`/preprod/`), avec GA4 et Clarity coupés.
- Mise en **production** : l'utilisateur ouvre une pull request `main` → `production` sur GitHub et la fusionne (lien : https://github.com/FichterB/site-transition-velo/compare/production...main) ; le déploiement et le récap Missive suivent automatiquement.
- Seul le dossier `site/` est envoyé sur le FTP.

## Avant chaque commit

1. Ouvrir `site/simulateur.html` dans un navigateur : parcours complet en 4 étapes, aucune erreur dans la console.
2. Vérifier l'affichage mobile (390 px de large) et ordinateur.
3. Si `config.js` change : vérifier que la syntaxe JavaScript reste valide (`node --check site/config.js`).
4. Messages de commit en français, courts et explicites.

## Chantiers en attente

- Mention speedbikes : présente sur l'accueil (section fiscalité), à ajouter sur le simulateur.
- Email de contact : `adrien@transitionvelo.fr` ne peut rien recevoir (domaine inexistant) ; l'accueil affiche `adrien@transitionvelo.net` (à confirmer) ; le simulateur affiche encore l'ancien.
- Photos manquantes : VAE premium et Gravel électrique (la roue du logo s'affiche à la place).
- Transmettre les valeurs de simulation à HubSpot dans des champs cachés (besoin des noms de propriétés HubSpot).
- Fiche `ressources/fiche_technique_roadster4_touring_hs.pdf` : l'en-tête du tableau est illisible (texte sombre sur fond sombre) et la photo montre peut-être une autre version (courroie au lieu du dérailleur XT annoncé).
