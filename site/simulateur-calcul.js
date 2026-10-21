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
  var PRIX_MIN = 600, PRIX_MAX = +CC.prixMax || 8000;
  var FIN = CC.finDeContrat || {};
  var VR = FIN.valeurResiduelle || { 12: 0.5, 24: 0.25, 36: 0.1 };
  var REVENTE = FIN.revente != null ? +FIN.revente : 0.3;

  // Vélos proposés en raccourci : chaque clic en ajoute un (le même plusieurs fois possible), leurs prix s'additionnent
  // Liste unique, utilisée par le simulateur (boutons) et l'accueil (catalogue). img = photo dans images/, ou null.
  var VELOS = [
    { prix: 639,  nom: 'VTC',          titre: 'VTC confort',            cat: 'Vélo de ville',            img: 'velo-vtc.png',    usage: 'Pour démarrer à petit prix, trajets jusqu\u2019à 15 km.' },
    { prix: 832,  nom: 'Gravel',       titre: 'Gravel route et chemin', cat: 'Gravel',                   img: 'velo-gravel.png', usage: 'Routes et chemins, pour les reliefs ardéchois.' },
    { prix: 1915, nom: 'VAE ville',    titre: 'VAE urbain',             cat: 'Vélo électrique de ville', img: 'velo-ville.png',  usage: 'Trajets domicile-travail, batterie longue portée, porte-bagages.' },
    { prix: 2332, nom: 'VAE premium',  titre: 'VAE premium',            cat: 'Vélo électrique de ville', img: 'velo-vae-premium.jpg', usage: 'Vélo électrique haut de gamme pour les trajets quotidiens.', defaut: true },
    { prix: 3249, nom: 'Gravel élec.', titre: 'Gravel électrique',      cat: 'Gravel électrique',        img: 'velo-gravel-elec.jpg',              usage: 'Gravel à assistance électrique, routes et chemins.' },
    { prix: 3915, nom: 'VTT élec.',    titre: 'VAE tout-terrain',       cat: 'VTT électrique',           img: 'velo-vtt.png',    usage: 'Salariés en zone rurale ou à fort dénivelé.' },
    { prix: 3915, nom: 'Cargo élec.',  titre: 'Cargo électrique',       cat: 'Vélo cargo électrique',    img: 'velo-cargo.jpg',  usage: 'Transport de matériel : artisans, commerces, livraisons.' }
  ];
  var VELO_DEFAUT = VELOS.findIndex(function(v){ return v.defaut; });

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
    // Fin de contrat : le salarié rachète le vélo à la valeur résiduelle, puis le revend (estimation)
    var rachat = Math.round(s.prix * (VR[s.duree] || 0));
    var revente = Math.round(s.prix * REVENTE);
    var payeSal = coutNetSal * s.duree;
    var resteSal = payeSal + rachat - revente;
    var finUtile = revente > rachat;   // la revente ne rapporte rien si elle vaut moins que le rachat (contrats courts)
    return { rachat:rachat, revente:revente, payeSal:payeSal, resteSal:resteSal, finUtile:finUtile,
             vrPct:Math.round((VR[s.duree] || 0) * 100), reventePct:Math.round(REVENTE * 100),
             loyer:loyer, partSal:partSal, partEmp:partEmp, ecoCot:ecoCot, ecoIR:ecoIR, coutNetSal:coutNetSal, ecoSalPct:ecoSalPct,
             reduIS:reduIS, deductIS:deductIS, coutNetEmp:coutNetEmp, ecoEmpPct:ecoEmpPct, brut:brut, ecoSalT:ecoSalT, ecoEmpT:ecoEmpT, saving:ecoSalT+ecoEmpT };
  }

  // Texte sous le sélecteur de part salarié
  function partInfo(part){
    return part === 0 ? 'Vélo 100 % pris en charge par l\'employeur'
      : part === 100 ? 'Vélo 100 % payé par le salarié'
      : 'Salarié ' + part + ' % · Employeur ' + (100 - part) + ' %';
  }

  // Note sous chaque durée : « Recommandé » ou « +25% vs 36 »
  function dureeNote(d){
    return d === 36 ? 'Recommandé' : '+' + Math.round((COEFF[d] || 1) * 100 - 100) + '% vs 36';
  }

  // sel = liste d'index dans VELOS, un par vélo choisi (ex. [1, 1] = deux VAE ville)
  function total(sel){ return sel.reduce(function(t, i){ return t + VELOS[i].prix; }, 0); }
  function quantite(sel, i){ return sel.filter(function(j){ return j === i; }).length; }
  // Ajoute un vélo ; renvoie la nouvelle sélection, ou null si le total dépasserait le maximum
  function ajouter(sel, i){ return horsLimite(sel, i) ? null : sel.concat([i]); }
  // Retire un exemplaire du vélo
  function retirer(sel, i){ var k = sel.lastIndexOf(i); return k < 0 ? sel : sel.slice(0, k).concat(sel.slice(k + 1)); }
  // Un vélo de plus ferait-il dépasser le maximum ?
  function horsLimite(sel, i){ return total(sel) + VELOS[i].prix > PRIX_MAX; }
  function libelleVelo(i, n){ return VELOS[i].nom + ' ' + VELOS[i].prix.toLocaleString('fr-FR') + ' €' + (n > 1 ? ' ×' + n : ''); }
  // Valeur affichée dans l'onglet « Prix du vélo »
  function resumePrix(prix, sel){
    var t = Math.round(prix).toLocaleString('fr-FR') + ' € HT';
    return sel.length > 1 ? sel.length + ' vélos · ' + t : t;
  }
  function borner(prix){ return Math.min(PRIX_MAX, Math.max(PRIX_MIN, prix)); }
  // Ligne de la liste des vélos (accueil et simulateur) : photo, description, loyer, boutons Ajouter / − n +.
  // Les pages fournissent le style (classes .bike, .pic, .qty…) et écoutent les clics sur [data-plus] / [data-moins].
  function esc(t){ return String(t).replace(/[&<>"]/g, function(c){ return { '&':'&amp;', '<':'&lt;', '>':'&gt;', '"':'&quot;' }[c]; }); }
  function eur(n){ return Math.round(n).toLocaleString('fr-FR') + ' €'; }
  function ligneVelo(i, sel){
    var v = VELOS[i], n = quantite(sel, i), plein = horsLimite(sel, i);
    var loyer = calc({ prix: v.prix, tmi: 0, duree: 36, part: 0 }).loyer;
    var pic = v.img ? '<img src="images/' + v.img + '" alt="' + esc(v.titre) + '" loading="lazy">' : '<img class="wheel" src="images/favicon.svg" alt="">';
    var qty = n
      ? '<button type="button" class="pm" data-moins="' + i + '" aria-label="Retirer un ' + esc(v.titre) + '">−</button><span class="n">' + n + '</span>' +
        '<button type="button" class="pm" data-plus="' + i + '" aria-label="Ajouter un ' + esc(v.titre) + '"' + (plein ? ' disabled' : '') + '>+</button>'
      : '<button type="button" class="add" data-plus="' + i + '"' + (plein ? ' disabled' : '') + '>Ajouter</button>';
    return '<li class="bike' + (n ? ' on' : '') + '" data-bike="' + esc(v.titre) + '" data-bike-prix="' + v.prix + '">' +
      '<div class="pic">' + pic + '</div>' +
      '<div><div class="cat">' + esc(v.cat) + '</div><h3>' + esc(v.titre) + '</h3><p>' + esc(v.usage) + '</p></div>' +
      '<p class="loyer">dès <b>' + loyer + ' €</b> HT/mois<br><small>vélo ' + eur(v.prix) + ' HT</small></p>' +
      '<div class="qty">' + qty + '</div></li>';
  }

  // Sélection transmise dans l'adresse : simulateur.html?velos=2,2,5 (index dans VELOS)
  function lireSelection(texte){
    var sel = [];
    String(texte || '').split(',').forEach(function(t){
      var i = parseInt(t, 10);
      if (i >= 0 && i < VELOS.length) { var n = ajouter(sel, i); if (n) sel = n; }
    });
    return sel;
  }

  return {
    calc: calc,
    velos: VELOS,
    ligneVelo: ligneVelo,
    eur: eur,
    veloDefaut: VELO_DEFAUT,
    lireSelection: lireSelection,
    prixMin: PRIX_MIN,
    prixMax: PRIX_MAX,
    total: total,
    quantite: quantite,
    ajouter: ajouter,
    retirer: retirer,
    horsLimite: horsLimite,
    libelleVelo: libelleVelo,
    resumePrix: resumePrix,
    borner: borner,
    partInfo: partInfo,
    dureeNote: dureeNote,
    partChoix: PART.choix || [0, 10, 20, 30, 40, 50, 60, 70, 80, 90, 100],
    partDefaut: PART.defaut != null ? +PART.defaut : 30
  };
})();
