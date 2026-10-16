# Suivi d'audience (Google Analytics 4 + Microsoft Clarity)

Plan de taggage validé : https://claude.ai/code/artifact/b00d87e1-8e02-44bf-b949-05e5062311ea

## Fonctionnement

- Tout le code est dans `site/tracking.js`, chargé par les deux pages juste après `config.js`.
- GA4 et Clarity ne sont chargés **qu'après un clic sur « Accepter »** dans le bandeau cookies (approche prudente vis-à-vis de la CNIL). Les visiteurs qui refusent ne sont pas comptés.
- Les événements déclenchés avant le choix sont mis en attente, puis envoyés seulement si le visiteur accepte.
- Le choix est conservé `consentDays` jours (`config.js`, 182 par défaut) dans `localStorage` (`tv_consent`). Lien « Gérer les cookies » en pied de page. Un refus efface les cookies GA (`_ga…`) et Clarity (`_clck`, `_clsk`).
- `ga4Id` et `clarityId` vides dans `config.js` : outil désactivé. Les deux vides : aucun bandeau, aucune donnée envoyée.
- En préproduction, le déploiement vide automatiquement les deux identifiants.
- Chaque événement est aussi envoyé à Clarity (`clarity('event', nom)`), pour filtrer les enregistrements (ex. sessions avec `form_view` mais sans `generate_lead`).

Pour ajouter une mesure : `window.tvTrack('nom_evenement', { param: valeur })`. Ne jamais envoyer de nom, email ou téléphone.

## Événements envoyés

| Événement | Déclencheur | Paramètres |
|---|---|---|
| `generate_lead` | formulaire HubSpot envoyé — **événement clé** | `form` + les valeurs de simulation |
| `sim_step_view` | chaque étape du simulateur | `step`, `step_name` (prix, profil, formulaire, resultats) ; à partir de l'étape 3 : `velo_prix` (total HT), `nb_velos`, `parcours` (direct = formulaire avant les résultats, accueil = résultats directs), `salaire_brut`, `tmi`, `duree_mois`, `part_salarie_pct`, `cout_net_salarie`, `cout_net_employeur` |
| `sim_param_change` | réglage du simulateur modifié (un envoi par réglage, 0,8 s après le dernier mouvement) | `param` (prix, nb_velos, salaire, tmi, duree, part_salarie), `value` |
| `form_view` | formulaire HubSpot affiché et prêt | `form` |
| `contact_click` | clic téléphone ou email — **événement clé** (téléphone) | `method` (phone, email), `location` |
| `cta_click` | liens vers `#simulateur` ou `#contact` | `target`, `location`, `label` |
| `sim_detail_tab` | onglets détail salarié / employeur / bilan | `tab` |
| `section_view` | section de l'accueil vue (moitié visible, ou moitié de l'écran), une fois par page | `section` (hero, avantages, etapes, fiscalite, velos, atelier, contact, cgv) |
| `bike_click` | clic sur une carte du catalogue de vélos (accueil) | `modele`, `velo_prix` |

Tous les événements portent `page_type` (`simulateur` ou `accueil`). L'accueil n'a plus de simulateur : il envoie vers `simulateur.html` (avec les vélos choisis).

Marquage dans le HTML : `data-track-section="…"` sur une section, `data-bike="…" data-bike-prix="…"` sur une carte vélo, `data-track="nom_evenement"` sur un bouton.

## Réglages à faire dans GA4

1. **Admin → Définitions personnalisées** :
   - Dimensions (portée événement) : `parcours`, `page_type`, `step_name`, `method`, `location`, `target`, `tab`, `param`, `section`, `modele`
   - Métriques : `velo_prix` (devise), `nb_velos`, `salaire_brut` (devise), `tmi`, `duree_mois`, `part_salarie_pct`, `cout_net_salarie` (devise), `cout_net_employeur` (devise)
2. **Admin → Événements** : marquer `generate_lead` et `contact_click` comme **événements clés**.
3. **Explorer → Exploration de l'entonnoir** : `sim_step_view` (prix → profil → formulaire), `form_view`, `generate_lead`.
4. **Admin → Associations → BigQuery** (optionnel) : à faire dès la création, l'historique n'est pas repris.
5. Campagnes : ajouter `?utm_source=…&utm_medium=…&utm_campaign=…` aux liens (conventions dans le plan de taggage).

## Réglages à faire dans Clarity

1. **Paramètres → Configuration** : laisser le masquage par défaut (« Équilibré ») pour ne jamais enregistrer de saisie.
2. **Paramètres → Intégrations → Google Analytics** : relier la propriété GA4.
3. Ajouter `transitionvelo.net` comme seul domaine autorisé.
