# Newsletters Brevo — clients du magasin Cyclable

Modèles d'emails pour les clients particuliers du magasin **Cyclable Valence – Saint-Péray**, envoyés depuis Brevo.

| Fichier | Contenu |
|---|---|
| `newsletters/cyclable-saison-des-cadeaux.html` | Saison des cadeaux Moustache : accroche, sélection de 4 vélos, essai en magasin, infos pratiques |

Le dossier `newsletters/` n'est **pas** publié sur le site. Les images, elles, le sont : `site/newsletter/img/` → `https://transitionvelo.net/newsletter/img/` (les emails vont chercher les images sur le site).

## Importer dans Brevo

1. Brevo → **Campagnes** → **Modèles** → **Nouveau modèle** → **Coder votre propre modèle** (éditeur HTML).
2. Coller tout le contenu du fichier `.html`, enregistrer.
3. Créer la campagne à partir du modèle : objet, expéditeur, liste de contacts.
4. **Envoyer un test** à vous-même (Gmail + iPhone si possible) avant l'envoi réel.

## Balises Brevo utilisées

| Balise | Rôle |
|---|---|
| `{% if contact.PRENOM %} {{ contact.PRENOM }}{% endif %}` | prénom du client ; rien si le prénom est vide (« Bonjour, ») |
| `{{ mirror }}` | lien « Version en ligne » |
| `{{ unsubscribe }}` | lien de désinscription — **obligatoire**, ne pas le retirer |

Si l'attribut prénom de votre compte Brevo s'appelle `FIRSTNAME` (comptes en anglais) au lieu de `PRENOM`, remplacer les deux occurrences.

## Règles de conception (compatibilité des messageries)

- Mise en page en **tableaux**, largeur 600 px, styles écrits dans chaque balise (`style="…"`) : c'est ce que lisent toutes les messageries, Outlook compris.
- Images en **JPEG ou PNG** (Outlook n'affiche pas le WebP), hébergées sur le site, avec un texte `alt`.
- Sur mobile (moins de 620 px), les colonnes passent l'une sous l'autre (classes `col` / `col-auto`). Une colonne qui a des marges intérieures utilise `col-auto`, sinon elle déborde.
- Polices du site (Anton, Hanken Grotesk) avec repli Arial / Impact : certaines messageries ne chargent pas les polices web.
- Liens vers le site avec paramètres UTM (`utm_source=brevo&utm_medium=email&utm_campaign=<op>`) pour mesurer les visites dans GA4.

## Nouvelle newsletter

1. Copier le fichier existant, changer accroche, sélection de vélos (photo, nom, prix, remise) et liens.
2. Mettre les nouvelles images en JPEG dans `site/newsletter/img/` (560 px de large pour les vélos), pousser et **mettre en production** : les images doivent être en ligne avant l'envoi.
3. Importer dans Brevo, envoyer un test, puis la campagne.

## RGPD

N'envoyer qu'aux clients qui ont accepté de recevoir des emails, ou aux clients existants informés qu'ils pouvaient s'y opposer lors de leur achat (offres analogues). Le lien de désinscription doit rester dans chaque email.
