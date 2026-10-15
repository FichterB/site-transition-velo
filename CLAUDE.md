# Transition Vélo — site vitrine et simulateur

Contexte projet pour Claude (onglet Code). À lire avant toute modification.

## Le projet

Transition Vélo (Saint-Péray, 07) propose des **vélos de fonction en location longue durée (LLD)** aux entreprises de la Drôme et de l'Ardèche. Contact commercial : Adrien Wicart — 06 58 77 58 36 — adrien@transitionvelo.fr.

Le site sert à générer des prospects : le visiteur simule le coût d'un vélo, laisse ses coordonnées dans le formulaire HubSpot, puis Adrien le rappelle.

## Arborescence

```
site/                 ← tout ce qui est publié sur le FTP (et rien d'autre)
  index.html          page d'accueil complète (avantages, simulateur, vélos, CGV, contact)
  simulateur.html     simulateur seul, formulaire HubSpot obligatoire avant les résultats
  config.js           réglages modifiables sans toucher au HTML (GA4, HubSpot, taux de loyer)
  support.js          moteur de rendu de index.html (ne pas modifier)
  images/             logos SVG + photos
ressources/           sources non publiées : logo .ai, fiches PDF, photos HD
docs/                 documentation détaillée (déploiement, règles métier, analytics)
.github/workflows/    déploiement automatique par FTP
```

## Les deux pages, deux techniques différentes

- **`simulateur.html`** : HTML + CSS + JavaScript classique, autonome. Tout le code est dans le fichier (logo SVG inline compris). Dépend seulement de `config.js`, du formulaire HubSpot et de Google Fonts.
- **`index.html`** : écrite avec un framework de maquettage (balises `<x-dc>`, `<sc-for>`, `<sc-if>`, `{{ variables }}`, classe `Component extends DCLogic` dans `<script type="text/x-dc">`). Elle **ne s'affiche pas sans `support.js`**. Respecter cette syntaxe quand on la modifie, ou proposer de la réécrire en HTML classique comme le simulateur (sujet en attente, à valider avec l'utilisateur).

Les deux pages lisent `window.TV_CONFIG` (défini par `config.js`) et ont des valeurs par défaut si le fichier est absent.

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
- Formule du simulateur : `loyer mensuel HT = prix HT × tauxLoyer × coeffDuree[durée]` (valeurs dans `config.js`). Part salarié 30 %, part employeur 70 %.
- Le cumul « participation du salarié + réduction d'IS de 25 % » est juridiquement discutable (la loi exige une mise à disposition gratuite). Ne pas renforcer les promesses fiscales sans validation d'un expert-comptable.

## Formulaire HubSpot

Portail `145421861`, région `eu1`, formulaire `079ed762-8b3e-400f-8242-d5c480381dfb` (dans `config.js`). Le simulateur détecte l'envoi via l'événement `hs-form-event:on-submission:success` (et `hsFormCallback` pour les anciens formulaires). Ne pas casser ce mécanisme : c'est lui qui débloque les résultats.

## Suivi d'audience (détails : `docs/SUIVI-ANALYTICS.md`)

Google Analytics 4, chargé **uniquement après consentement** (bandeau maison, choix stocké dans `localStorage` sous `tv_consent`). Toute nouvelle mesure passe par `window.tvTrack('nom_evenement', { ... })`. Ne jamais envoyer de donnée personnelle (nom, email, téléphone) à GA.

## Déploiement (détails : `docs/DEPLOIEMENT.md`)

- Push sur `main` → déploiement automatique en **préproduction** (`/preprod/`), avec le suivi GA désactivé.
- Mise en **production** : manuelle, depuis l'onglet Actions de GitHub (« Déployer » → cible `production`), après vérification de la préprod.
- Seul le dossier `site/` est envoyé sur le FTP.

## Avant chaque commit

1. Ouvrir `site/simulateur.html` dans un navigateur : parcours complet en 4 étapes, aucune erreur dans la console.
2. Vérifier l'affichage mobile (390 px de large) et ordinateur.
3. Si `config.js` change : vérifier que la syntaxe JavaScript reste valide (`node --check site/config.js`).
4. Messages de commit en français, courts et explicites.

## Chantiers en attente

- Mettre la mention « Offre réservée aux vélos et VAE (25 km/h). Speedbikes non éligibles aux avantages fiscaux » sur les deux pages (proposée, pas encore validée).
- Le simulateur de `index.html` affiche les résultats sans formulaire : faut-il le rediriger vers `simulateur.html` ?
- Transmettre les valeurs de simulation à HubSpot dans des champs cachés (besoin des noms de propriétés HubSpot).
- Fiche `ressources/fiche_technique_roadster4_touring_hs.pdf` : l'en-tête du tableau est illisible (texte sombre sur fond sombre) et la photo montre peut-être une autre version (courroie au lieu du dérailleur XT annoncé).
