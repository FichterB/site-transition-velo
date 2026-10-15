# Suivi d'audience (Google Analytics 4)

## Fonctionnement

- Le script GA4 n'est chargé **qu'après un clic sur « Accepter »** dans le bandeau cookies (approche prudente vis-à-vis de la CNIL). Les visiteurs qui refusent ne sont pas comptés.
- Les événements déclenchés avant le choix sont mis en attente, puis envoyés seulement si le visiteur accepte.
- Le choix est conservé `consentDays` jours (`config.js`, 182 par défaut) dans `localStorage` (`tv_consent`). Lien « Gérer les cookies » en pied de page.
- Sans `ga4Id` dans `config.js` : aucun bandeau, aucune donnée envoyée.
- En préproduction, le déploiement vide automatiquement `ga4Id`.

Pour ajouter une mesure : `window.tvTrack('nom_evenement', { param: valeur })`. Ne jamais envoyer de nom, email ou téléphone.

## Événements envoyés

| Événement | Déclencheur | Paramètres |
|---|---|---|
| `sim_step_view` | chaque étape du simulateur | `step`, `step_name` (prix, profil, formulaire, resultats) ; à partir de l'étape 3 : `velo_prix`, `salaire_brut`, `tmi`, `duree_mois`, `cout_net_salarie`, `cout_net_employeur` |
| `generate_lead` | formulaire HubSpot envoyé | `form` + les mêmes valeurs de simulation |
| `contact_click` | clic téléphone ou email | `method` (phone, email), `location` |
| `cta_click` | liens vers `#simulateur` ou `#contact` | `target`, `location`, `label` |
| `lead_form_open` | bouton « Ouvrir le formulaire » (accueil) | `location`, `label` |
| `sim_detail_tab` | onglets détail salarié / employeur / bilan | `tab` |

Tous les événements portent `page_type` (`simulateur` ou `accueil`). Sur l'accueil, le simulateur a 3 étapes (pas de formulaire avant les résultats).

## Réglages à faire dans GA4

1. **Admin → Définitions personnalisées** :
   - Dimensions (portée événement) : `step_name`, `page_type`, `method`, `location`, `target`, `tab`
   - Métriques : `velo_prix` (devise), `salaire_brut` (devise), `tmi`, `duree_mois`, `cout_net_salarie` (devise), `cout_net_employeur` (devise)
2. **Admin → Événements** : marquer `generate_lead` comme **événement clé**.
3. **Explorer → Exploration de l'entonnoir** : étapes `sim_step_view` avec `step_name` = prix → profil → formulaire, puis `generate_lead`, puis `sim_step_view` = resultats.
4. Campagnes : ajouter `?utm_source=…&utm_medium=…&utm_campaign=…` aux liens (LinkedIn, emailing, QR codes des fiches PDF).
