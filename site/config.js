/* =====================================================================
   Transition Vélo — configuration du site
   À déposer sur le FTP, dans le même dossier que index.html et simulateur.html.
   Modifiez uniquement les valeurs à droite des « : ».
   Les textes vont entre apostrophes 'comme ceci', les nombres sans.
   ===================================================================== */
window.TV_CONFIG = {

  /* ---------- Mesure d'audience (Google Analytics 4) ----------
     Identifiant de mesure : GA4 > Admin > Flux de données > Web.
     Laisser '' pour désactiver le suivi (aucun bandeau cookies affiché). */
  ga4Id: '',                 // ex. 'G-AB12CD34EF'
  consentDays: 182,          // durée de conservation du choix cookies (jours, 395 max selon la CNIL)

  /* ---------- Formulaire HubSpot ---------- */
  hubspot: {
    region:   'eu1',
    portalId: '145421861',
    formId:   '079ed762-8b3e-400f-8242-d5c480381dfb'
  },

  /* ---------- Paramètres du simulateur ----------
     Loyer mensuel HT = prix HT du vélo × tauxLoyer × coefficient de durée */
  calcul: {
    tauxLoyer: 0.0335,                       // 3,35 % du prix HT par mois (base 36 mois)
    coeffDuree: { 12: 1.7, 24: 1.25, 36: 1 }  // majoration des contrats courts
  }
};
