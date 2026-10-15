/* =====================================================================
   Transition Vélo — mesure d'audience (GA4 + Microsoft Clarity)
   Partagé par index.html et simulateur.html, chargé juste après config.js.
   Rien n'est chargé avant un clic sur « Accepter » dans le bandeau cookies.
   Plan de taggage et événements : docs/SUIVI-ANALYTICS.md
   ===================================================================== */
(function(){
  // Réglages lus dans config.js (identifiants GA4 et Clarity, durée du consentement)
  var CFG = window.TV_CONFIG || {};
  var GA_ID = String(CFG.ga4Id || '').trim();
  var CLARITY_ID = String(CFG.clarityId || '').trim();
  var KEY = 'tv_consent', MAX_AGE = 1000*60*60*24*(+CFG.consentDays || 182);

  var gaOk = /^G-[A-Z0-9]{6,}$/.test(GA_ID);
  var clarityOk = /^[a-z0-9]{6,}$/i.test(CLARITY_ID);
  var configured = gaOk || clarityOk;
  var state = 'pending', queue = [], loaded = false;
  window.dataLayer = window.dataLayer || [];
  function gtag(){ window.dataLayer.push(arguments); }

  function readChoice(){
    try { var c = JSON.parse(localStorage.getItem(KEY) || 'null');
      if (c && Date.now() - c.t < MAX_AGE) return c.v; } catch(e){}
    return null;
  }
  function saveChoice(v){ try { localStorage.setItem(KEY, JSON.stringify({ v:v, t:Date.now() })); } catch(e){} }

  function load(){
    if (loaded || !configured) return;
    loaded = true;
    if (gaOk) {
      var s = document.createElement('script');
      s.async = true; s.src = 'https://www.googletagmanager.com/gtag/js?id=' + GA_ID;
      document.head.appendChild(s);
      gtag('js', new Date());
      gtag('config', GA_ID);
    }
    if (clarityOk) {
      window.clarity = window.clarity || function(){ (window.clarity.q = window.clarity.q || []).push(arguments); };
      var c = document.createElement('script');
      c.async = true; c.src = 'https://www.clarity.ms/tag/' + CLARITY_ID;
      document.head.appendChild(c);
      window.clarity('consent');   // consentement donné : Clarity peut poser ses cookies
    }
    queue.forEach(function(e){ send(e[0], e[1]); });
    queue = [];
  }

  function send(name, params){
    if (gaOk) gtag('event', name, params);
    if (clarityOk && window.clarity) window.clarity('event', name); // pour filtrer les enregistrements par événement
  }

  // API utilisée par les pages : window.tvTrack('nom_evenement', { ... })
  window.tvTrack = function(name, params){
    params = params || {};
    if (!params.page_type) params.page_type = document.body.getAttribute('data-page') || 'site';
    if (state === 'granted') send(name, params);
    else if (state === 'pending' && queue.length < 50) queue.push([name, params]); // envoyés seulement si le visiteur accepte
  };

  // Réglage du simulateur modifié : un seul envoi par réglage une fois le curseur relâché (0,8 s)
  var paramTimers = {};
  window.tvTrackParam = function(param, value){
    clearTimeout(paramTimers[param]);
    paramTimers[param] = setTimeout(function(){ window.tvTrack('sim_param_change', { param:param, value:value }); }, 800);
  };

  // ---------- Bandeau cookies ----------
  var banner;
  function showBanner(){
    if (!configured) return;
    if (banner) { banner.style.display = 'flex'; return; }
    banner = document.createElement('div');
    banner.setAttribute('role','dialog'); banner.setAttribute('aria-label','Cookies de mesure d\'audience');
    Object.assign(banner.style, { position:'fixed', left:'16px', right:'16px', bottom:'16px', zIndex:'2000', maxWidth:'560px', margin:'0 auto',
      background:'#1C232B', color:'#fff', borderRadius:'14px', padding:'18px 20px', boxShadow:'0 16px 50px rgba(0,0,0,.35)',
      display:'flex', flexWrap:'wrap', alignItems:'center', gap:'14px', fontFamily:"'Hanken Grotesk',system-ui,sans-serif" });
    var txt = document.createElement('div');
    Object.assign(txt.style, { flex:'1 1 260px', fontSize:'13.5px', lineHeight:'1.5', color:'rgba(255,255,255,.85)' });
    var tools = [];
    if (gaOk) tools.push('mesurer l\'audience (Google Analytics)');
    if (clarityOk) tools.push('voir comment les pages sont utilisées : clics, défilement, sessions anonymisées (Microsoft Clarity)');
    txt.textContent = 'Avec votre accord, nous utilisons des cookies pour ' + tools.join(' et ') + ', afin d\'améliorer le simulateur. Acceptez-vous ?';
    var btns = document.createElement('div');
    Object.assign(btns.style, { display:'flex', gap:'8px' });
    function mk(label, primary, v){
      var b = document.createElement('button'); b.type = 'button'; b.textContent = label;
      Object.assign(b.style, { fontFamily:'inherit', fontSize:'14px', fontWeight:'700', padding:'10px 18px', borderRadius:'9px', cursor:'pointer',
        border: primary ? 'none' : '1px solid rgba(255,255,255,.35)', background: primary ? '#D4412B' : 'transparent', color:'#fff' });
      b.addEventListener('click', function(){ decide(v); });
      return b;
    }
    btns.appendChild(mk('Refuser', false, 'denied'));
    btns.appendChild(mk('Accepter', true, 'granted'));
    banner.appendChild(txt); banner.appendChild(btns);
    document.body.appendChild(banner);
  }
  function decide(v){
    saveChoice(v); state = v;
    if (banner) banner.style.display = 'none';
    if (v === 'granted') load();
    else {
      queue = [];
      if (loaded && clarityOk && window.clarity) window.clarity('consent', false); // Clarity efface ses cookies et s'arrête
      // retire les cookies GA et Clarity déjà posés le cas échéant
      document.cookie.split(';').forEach(function(c){ var n = c.split('=')[0].trim();
        if (/^(_ga|_clck|_clsk)/.test(n)) document.cookie = n + '=; Max-Age=0; path=/; domain=' + location.hostname.replace(/^www\./,'.'); });
    }
  }

  var choice = readChoice();
  if (!configured) { state = 'denied'; if (window.console) console.info('[tracking] ga4Id et clarityId non renseignés dans config.js : aucune donnée envoyée.'); }
  else if (choice) { state = choice; if (choice === 'granted') load(); }
  else if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', showBanner); else showBanner();

  // ---------- Clics suivis automatiquement ----------
  function where(el){
    var z = el.closest('[data-track-loc], header, nav, footer, section[id]');
    if (!z) return 'page';
    return z.getAttribute('data-track-loc') || z.id || z.tagName.toLowerCase();
  }
  document.addEventListener('click', function(e){
    var bike = e.target.closest('[data-bike]');
    if (bike) window.tvTrack('bike_click', { modele: bike.getAttribute('data-bike'), velo_prix: +bike.getAttribute('data-bike-prix') || undefined });
    var el = e.target.closest('a, button, [data-track], [data-cookie-settings]');
    if (!el) return;
    if (el.hasAttribute('data-cookie-settings')) { e.preventDefault(); showBanner(); return; }
    var href = el.getAttribute('href') || '';
    if (href.indexOf('tel:') === 0)    window.tvTrack('contact_click', { method:'phone', location: where(el) });
    else if (href.indexOf('mailto:') === 0) window.tvTrack('contact_click', { method:'email', location: where(el) });
    else if (/^#(simulateur|contact)$/.test(href)) window.tvTrack('cta_click', { target: href.slice(1), location: where(el), label: (el.textContent || '').trim().slice(0,60) });
    if (el.hasAttribute('data-track')) window.tvTrack(el.getAttribute('data-track'), { location: where(el), label: (el.textContent || '').trim().slice(0,60) });
  }, true);

  // ---------- Sections vues (une fois par visite de page) ----------
  // Une section compte comme vue quand la moitié d'elle est à l'écran, ou qu'elle occupe la moitié de l'écran
  // L'accueil est dessiné par support.js après le chargement : on surveille les sections à mesure qu'elles apparaissent
  if ('IntersectionObserver' in window) {
    var seen = {};
    var io = new IntersectionObserver(function(entries){
      entries.forEach(function(en){
        var id = en.target.getAttribute('data-track-section');
        if (seen[id] || !en.isIntersecting) return;
        if (en.intersectionRatio >= 0.5 || en.intersectionRect.height >= window.innerHeight * 0.5) {
          seen[id] = true; io.unobserve(en.target);
          window.tvTrack('section_view', { section:id });
        }
      });
    }, { threshold:[0, 0.25, 0.5, 0.75, 1] });
    var scanSections = function(){
      document.querySelectorAll('[data-track-section]').forEach(function(s){
        if (!s.__tvWatched) { s.__tvWatched = true; io.observe(s); }
      });
    };
    var mo = new MutationObserver(scanSections);
    var startScan = function(){ scanSections(); mo.observe(document.body, { childList:true, subtree:true }); setTimeout(function(){ mo.disconnect(); }, 15000); };
    if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', startScan); else startScan();
  }

  // ---------- Formulaire HubSpot ----------
  var formSeen = false, leadSent = false;
  window.addEventListener('hs-form-event:on-ready', function(){
    if (formSeen) return; formSeen = true;
    window.tvTrack('form_view', { form:'hubspot_simulation' });
  });
  function lead(){
    if (leadSent) return; leadSent = true;
    var v = window.tvSimValues || {};
    window.tvTrack('generate_lead', Object.assign({ form:'hubspot_simulation' }, v));
  }
  window.addEventListener('hs-form-event:on-submission:success', lead);
  window.addEventListener('message', function(e){ var d = e.data; if (d && d.type === 'hsFormCallback' && d.eventName === 'onFormSubmitted') lead(); });
})();
