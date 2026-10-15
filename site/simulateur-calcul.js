/* =====================================================================
   Transition Vélo — calcul du simulateur
   Partagé par index.html et simulateur.html : toute modification de la
   formule se fait ici, une seule fois. Les réglages chiffrés restent dans
   config.js (à charger AVANT ce fichier).
   Règles détaillées : docs/REGLES-METIER.md
   ===================================================================== */
window.TV_SIM = (function(){
  var CC = (window.TV_CONFIG || {}).calcul || {};
  var PART = CC.partSalarie || {};
  var COEFF = CC.coeffDuree || { 12: 1.7, 24: 1.25, 36: 1 };
  var TAUX = +CC.tauxLoyer || 0.0335;

  /* s = { prix, tmi, duree, part }  (part = % du loyer payé par le salarié) */
  function calc(s){
    var loyer = Math.round(s.prix * TAUX * (COEFF[s.duree] || 1));
    var partSal = Math.round(loyer * s.part / 100);
    var partEmp = loyer - partSal;
    var ecoCot = Math.round(partSal * 0.23);
    var ecoIR = Math.round((partSal - ecoCot) * (s.tmi / 100) * 0.9);
    var coutNetSal = Math.max(0, partSal - ecoCot - ecoIR);
    var ecoSalPct = partSal ? Math.round((ecoCot + ecoIR) / partSal * 100) : 0;
    var reduIS = Math.round(partEmp * 0.25);
    var deductIS = Math.round(partEmp * 0.25 * 0.25);
    var coutNetEmp = Math.max(0, partEmp - reduIS - deductIS);
    var ecoEmpPct = partEmp ? Math.round((reduIS + deductIS) / partEmp * 100) : 0;
    var brut = loyer * s.duree;
    var ecoSalT = (ecoCot + ecoIR) * s.duree;
    var ecoEmpT = (reduIS + deductIS) * s.duree;
    return { loyer:loyer, partSal:partSal, partEmp:partEmp, ecoCot:ecoCot, ecoIR:ecoIR, coutNetSal:coutNetSal, ecoSalPct:ecoSalPct,
             reduIS:reduIS, deductIS:deductIS, coutNetEmp:coutNetEmp, ecoEmpPct:ecoEmpPct, brut:brut, ecoSalT:ecoSalT, ecoEmpT:ecoEmpT, saving:ecoSalT+ecoEmpT };
  }

  // Texte sous le sélecteur de part salarié
  function partInfo(part){
    return part === 0 ? 'Vélo 100 % pris en charge par l\'employeur'
      : 'Salarié ' + part + ' % · Employeur ' + (100 - part) + ' %';
  }

  // Note sous chaque durée : « Recommandé » ou « +25% vs 36 »
  function dureeNote(d){
    return d === 36 ? 'Recommandé' : '+' + Math.round((COEFF[d] || 1) * 100 - 100) + '% vs 36';
  }

  return {
    calc: calc,
    partInfo: partInfo,
    dureeNote: dureeNote,
    partChoix: PART.choix || [0, 10, 20, 30, 40, 50],
    partDefaut: PART.defaut != null ? +PART.defaut : 30
  };
})();
