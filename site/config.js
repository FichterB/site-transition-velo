/* =====================================================================
   Transition Vélo — configuration du site
   À déposer sur le FTP, dans le même dossier que index.html et simulateur.html.
   Modifiez uniquement les valeurs à droite des « : ».
   Les textes vont entre apostrophes 'comme ceci', les nombres sans.
   ===================================================================== */
window.TV_CONFIG = {

  /* ---------- Mesure d'audience (Google Analytics 4 + Microsoft Clarity) ----------
     GA4 : Admin > Flux de données > Web > identifiant de mesure.
     Clarity : clarity.microsoft.com > projet > Paramètres > Présentation > ID du projet.
     Laisser '' pour désactiver un outil ; les deux vides = aucun bandeau cookies. */
  ga4Id: 'G-KQR5HW2G6D',               // ex. 'G-AB12CD34EF'
  clarityId: '',             // ex. 'abcd1234ef'
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
    prixMax: 8000,                           // total HT maximum du simulateur (plusieurs vélos cumulés)
    coeffDuree: { 12: 1.7, 24: 1.25, 36: 1 }, // majoration des contrats courts
    // Part du loyer payée par le salarié (en %), le reste par l'employeur
    partSalarie: { defaut: 30, choix: [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100] }
  }
};
