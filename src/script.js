// Scritte usate dagli script, nella lingua della pagina (<html lang="en"> = sito inglese)
var PAROLE_JS = document.documentElement.lang === 'en' ? {
  video_ig: 'Video on Instagram', video: 'Video', foto: function (i, n) { return 'Photo ' + i + ' of ' + n; }, poi_video: ' · then the video', poi_video_solo: 'Then the video ›',
  msg_lavoro: function (t, p) { return 'Hello! I\'m interested in “' + t + '”, which I saw on your website (' + p + '). Could you give me some information?'; },
  msg: 'Hello! I\'m writing from your website: I\'d like some information.', oggetto: 'Information', email: 'Email',
  apri_menu: 'Open the menu', chiudi_menu: 'Close the menu',
  mi_piace: 'Like', non_mi_piace_piu: 'Remove like', aggiunto: 'Added to your favourites', vedi: 'View',
  msg_elenco: function (elenco) { return 'Hello! I\'m interested in these pieces I saw on your website:\n' + elenco.map(function (t) { return '• ' + t; }).join('\n') + '\nCould you give me some information?'; }
} : {
  video_ig: 'Video su Instagram', video: 'Video', foto: function (i, n) { return 'Foto ' + i + ' di ' + n; }, poi_video: ' · poi il video', poi_video_solo: 'Poi il video ›',
  msg_lavoro: function (t, p) { return 'Ciao! Mi interessa «' + t + '», che ho visto sul vostro sito (' + p + '). Potete darmi qualche informazione?'; },
  msg: 'Ciao! Vi scrivo dal vostro sito: vorrei qualche informazione.', oggetto: 'Informazioni', email: 'Email',
  apri_menu: 'Apri il menu', chiudi_menu: 'Chiudi il menu',
  mi_piace: 'Mi piace', non_mi_piace_piu: 'Togli il mi piace', aggiunto: 'Aggiunto ai tuoi preferiti', vedi: 'Vedi',
  msg_elenco: function (elenco) { return 'Ciao! Mi interessano questi lavori che ho visto sul vostro sito:\n' + elenco.map(function (t) { return '• ' + t; }).join('\n') + '\nPotete darmi qualche informazione?'; }
};

(function () {
  // Novità: dopo il periodo scelto, toglie l'etichetta «Nuovo» e i lavori dalle sezioni Novità,
  // anche se il sito non viene ripubblicato.
  var giorni = parseInt(document.body.getAttribute('data-novita-giorni'), 10);
  if (!giorni) return;
  var oggi = Date.now();
  Array.prototype.forEach.call(document.querySelectorAll('[data-data]'), function (f) {
    var d = Date.parse(f.getAttribute('data-data') + 'T00:00:00');
    if (isNaN(d) || (oggi - d) / 864e5 <= giorni) return;
    var b = f.querySelector('.nuovo'); if (b) b.parentNode.removeChild(b);
    if (f.closest('[data-solo-novita]')) f.parentNode.removeChild(f);
  });
  Array.prototype.forEach.call(document.querySelectorAll('[data-solo-novita]'), function (box) {
    if (box.querySelector('figure')) return;
    var sez = box.closest('[data-novita-sezione]'); if (sez) sez.hidden = true;
    var msg = box.parentNode.querySelector('.novita-vuoto'); if (msg) msg.hidden = false;
  });
  // Voci «Novità» dei menu: conta solo le novità ancora valide oggi; se non ce ne sono, la voce sparisce
  Array.prototype.forEach.call(document.querySelectorAll('[data-novita-date]'), function (a) {
    var date = a.getAttribute('data-novita-date').split(',');
    var foto = (a.getAttribute('data-novita-foto') || '').split('|');
    var valide = [];
    date.forEach(function (x, i) {
      var d = Date.parse(x + 'T00:00:00');
      if (!isNaN(d) && (oggi - d) / 864e5 <= giorni) valide.push(i);
    });
    if (!valide.length) { a.hidden = true; return; }
    var conta = a.querySelector('small'); if (conta) conta.textContent = valide.length;
    var img = a.querySelector('img'); if (img && foto[valide[0]]) img.src = foto[valide[0]];
  });
})();

(function () {
  // Visualizzatore a schermo intero: scorre le foto del lavoro aperto, senza passare ad altri lavori
  var visore = document.querySelector('.visore');
  if (!visore || typeof visore.showModal !== 'function') return;
  var img = visore.querySelector('img');
  var quadro = visore.querySelector('.quadro') || img;
  var titolo = visore.querySelector('.didascalia strong');
  var testo = visore.querySelector('.didascalia span');
  var contatore = visore.querySelector('.contatore');
  var social = visore.querySelector('.social');
  var linkIG = visore.querySelector('.bottone-ig');
  var codice = visore.querySelector('.codice-qr');
  var prec = visore.querySelector('.prec');
  var succ = visore.querySelector('.succ');
  var foto = [], indice = 0, bottone = null;
  // Video di Instagram: è l'ultima «pagina» dopo le foto. Si carica solo premendo ▶.
  var VIDEO = '#video', indirizzoVideo = '';
  var boxVideo = visore.querySelector('.video');
  var play = boxVideo && boxVideo.querySelector('.play');
  function fermaVideo() {
    if (!boxVideo) return;
    var f = boxVideo.querySelector('iframe'); if (f) f.parentNode.removeChild(f);
    boxVideo.classList.remove('attivo');
  }
  if (play) play.addEventListener('click', function () {
    if (!indirizzoVideo || boxVideo.querySelector('iframe')) return;
    var f = document.createElement('iframe');
    f.src = indirizzoVideo;
    f.title = PAROLE_JS.video_ig;
    f.allow = 'autoplay; encrypted-media; picture-in-picture; fullscreen';
    f.setAttribute('allowfullscreen', '');
    boxVideo.appendChild(f);
    boxVideo.classList.add('attivo');
  });

  function mostra(i) {
    if (i < 0 || i >= foto.length) return;
    indice = i;
    var eVideo = foto[indice] === VIDEO;
    var quanteFoto = foto.length - (indirizzoVideo ? 1 : 0);
    if (boxVideo) boxVideo.hidden = !eVideo;
    quadro.style.display = eVideo ? 'none' : '';
    visore.classList.toggle('su-video', eVideo);
    if (eVideo) {
      boxVideo.style.backgroundImage = 'url("' + foto[0] + '")';
      visore.style.setProperty('--foto', 'url("' + foto[0] + '")');
      contatore.textContent = PAROLE_JS.video;
    } else {
      fermaVideo();
      img.src = foto[indice];
      visore.style.setProperty('--foto', 'url("' + foto[indice] + '")');
      quadro.style.animation = 'none'; void quadro.offsetWidth; quadro.style.animation = '';
      contatore.textContent = quanteFoto > 1 ? PAROLE_JS.foto(indice + 1, quanteFoto) + (indirizzoVideo ? PAROLE_JS.poi_video : '')
        : (indirizzoVideo ? PAROLE_JS.poi_video_solo : '');
    }
    prec.hidden = indice === 0;
    succ.hidden = indice === foto.length - 1;
    if (foto[indice + 1] && foto[indice + 1] !== VIDEO) { var p = new Image(); p.src = foto[indice + 1]; }
  }

  function apri(b, suVideo) {
    bottone = b;
    var altre = (b.getAttribute('data-altre') || '').split('|').filter(Boolean);
    foto = [b.getAttribute('data-grande')].concat(altre);
    fermaVideo();
    indirizzoVideo = boxVideo ? (b.getAttribute('data-video') || '') : '';
    if (indirizzoVideo) {
      foto.push(VIDEO);
      var da = boxVideo.querySelector('.video-da'); if (da) da.textContent = b.getAttribute('data-video-da') || 'Instagram';
      boxVideo.classList.toggle('orizzontale', b.getAttribute('data-video-forma') === 'orizzontale');
    }
    img.alt = b.getAttribute('data-titolo') || '';
    titolo.textContent = b.getAttribute('data-titolo') || '';
    var chiedi = visore.querySelector('.bottone-chiedi');
    if (chiedi) chiedi.setAttribute('data-chiedi', b.getAttribute('data-titolo') || '');
    testo.innerHTML = b.getAttribute('data-testo') || '';   // già ripulito dal generatore: solo grassetto e corsivo
    var ig = b.getAttribute('data-instagram');
    var modello = b.closest('figure') && b.closest('figure').querySelector('template.qr');
    social.hidden = !ig;
    linkIG.href = ig || '#';
    codice.innerHTML = modello ? modello.innerHTML : '';
    codice.parentNode.classList.toggle('senza-qr', !modello);
    mostra(suVideo && indirizzoVideo ? foto.length - 1 : 0);
    visore.showModal();
    var area = visore.querySelector('.area'); if (area) area.scrollTop = 0;
    testo.scrollTop = 0;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-grande]');
    if (b) apri(b, !!e.target.closest('.ha-video'));
  });
  visore.querySelector('.chiudi').addEventListener('click', function () { visore.close(); });
  prec.addEventListener('click', function () { mostra(indice - 1); });
  succ.addEventListener('click', function () { mostra(indice + 1); });
  visore.addEventListener('click', function (e) { if (e.target === visore || e.target.classList.contains('area')) visore.close(); });
  visore.addEventListener('close', function () { fermaVideo(); if (bottone) bottone.focus(); });
  document.addEventListener('keydown', function (e) {
    if (!visore.open) return;
    if (e.key === 'ArrowLeft') mostra(indice - 1);
    if (e.key === 'ArrowRight') mostra(indice + 1);
  });

  // Swipe sul telefono
  var x0 = null;
  visore.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; }, { passive: true });
  visore.addEventListener('touchend', function (e) {
    if (x0 === null) return;
    var dx = e.changedTouches[0].clientX - x0;
    if (Math.abs(dx) > 50) mostra(indice + (dx < 0 ? 1 : -1));
    x0 = null;
  });
})();

(function () {
  // «Chiedi info»: apre WhatsApp (o l'email) con un messaggio già scritto che nomina il lavoro.
  // Con più numeri WhatsApp il visitatore sceglie a chi scrivere.
  var wa = [];
  try { wa = JSON.parse(document.body.getAttribute('data-whatsapp') || '[]'); } catch (e) {}
  var email = document.body.getAttribute('data-email') || '';
  var scelta = document.querySelector('.scelta');
  var voci = scelta && scelta.querySelector('.voci');
  var pagina = location.href.split('#')[0];

  // t = titolo di un lavoro, oppure elenco di titoli (pagina «I tuoi preferiti»)
  function messaggio(t) {
    if (Array.isArray(t)) return PAROLE_JS.msg_elenco(t);
    return t ? PAROLE_JS.msg_lavoro(t, pagina) : PAROLE_JS.msg;
  }
  function linkWA(n, t) { return 'https://wa.me/' + n + '?text=' + encodeURIComponent(messaggio(t)); }
  function linkEmail(t) { return 'mailto:' + email + '?subject=' + encodeURIComponent(t && !Array.isArray(t) ? PAROLE_JS.oggetto + ': ' + t : PAROLE_JS.oggetto) + '&body=' + encodeURIComponent(messaggio(t)); }
  function voce(href, testo, nuova) {
    var a = document.createElement('a'); a.href = href; a.textContent = testo;
    if (nuova) { a.target = '_blank'; a.rel = 'noopener'; }
    a.addEventListener('click', function () { scelta.close(); });
    voci.appendChild(a);
  }
  function chiedi(t) {
    if (wa.length === 1) { window.open(linkWA(wa[0].w, t), '_blank', 'noopener'); return true; }
    if (!wa.length) { if (!email) return false; location.href = linkEmail(t); return true; }
    if (!scelta || typeof scelta.showModal !== 'function') return false;
    voci.innerHTML = '';
    wa.forEach(function (c) { voce(linkWA(c.w, t), 'WhatsApp ' + c.n, true); });
    if (email) voce(linkEmail(t), PAROLE_JS.email, false);
    scelta.showModal();
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-chiedi]');
    if (b && chiedi(b.getAttribute('data-chiedi'))) { e.preventDefault(); return; }
    // «Chiedi info su questi lavori»: tutti i preferiti visibili nella pagina
    var p = e.target.closest('[data-chiedi-preferiti]');
    if (!p) return;
    var titoli = [];
    document.querySelectorAll('[data-preferiti] .lavoro:not([hidden]) [data-chiedi]').forEach(function (x) { titoli.push(x.getAttribute('data-chiedi')); });
    if (titoli.length && chiedi(titoli)) e.preventDefault();
  });
  if (scelta) {
    scelta.querySelector('.annulla').addEventListener('click', function () { scelta.close(); });
    scelta.addEventListener('click', function (e) { if (e.target === scelta) scelta.close(); });
  }

  // Pulsante «torna su»: compare dopo aver scorso un po' la pagina
  var su = document.querySelector('.torna-su');
  if (su) {
    var aggiorna = function () { su.classList.toggle('visibile', window.scrollY > 700); };
    window.addEventListener('scroll', aggiorna, { passive: true });
    aggiorna();
    su.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: 'smooth' }); });
  }
})();

(function () {
  // Galleria: le descrizioni lunghe si fermano a 3 righe; «Leggi tutto» apre il lavoro con il testo completo
  var leggi = [].slice.call(document.querySelectorAll('.lavoro .leggi'));
  if (!leggi.length) return;
  function controlla() {
    leggi.forEach(function (a) {
      var d = a.previousElementSibling;
      a.hidden = !(d && d.scrollHeight > d.clientHeight + 2);
    });
  }
  controlla();
  window.addEventListener('load', controlla);
  window.addEventListener('resize', controlla);
  document.addEventListener('click', function (e) {
    var a = e.target.closest('.lavoro .leggi');
    if (!a) return;
    e.preventDefault();
    var b = a.closest('figure').querySelector('[data-grande]');
    if (b) b.click();
  });
})();

// Menu del telefono: ☰ apre il pannello con le voci, ✕ / Esc / una voce lo chiudono.
(function () {
  var bottone = document.querySelector('.apri-menu');
  var pannello = document.getElementById('menu-telefono');
  var testata = document.querySelector('.testata');
  if (!bottone || !pannello || !testata) return;
  function apri(si) {
    if (si) document.documentElement.style.setProperty('--sotto-testata', Math.max(0, testata.getBoundingClientRect().bottom) + 'px');
    pannello.hidden = !si;
    bottone.setAttribute('aria-expanded', si ? 'true' : 'false');
    bottone.setAttribute('aria-label', si ? PAROLE_JS.chiudi_menu : PAROLE_JS.apri_menu);
    document.body.classList.toggle('menu-aperto', si);
  }
  bottone.addEventListener('click', function () { apri(pannello.hidden); });
  pannello.addEventListener('click', function (e) { if (e.target.closest('a')) apri(false); });
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && !pannello.hidden) { apri(false); bottone.focus(); } });
  window.addEventListener('resize', function () { if (!pannello.hidden && window.innerWidth > 760) apri(false); });
})();

// ---- «Mi piace» ai lavori e «I tuoi preferiti» ----
// I conteggi arrivano dalla funzione Netlify /api/mi-piace (netlify/functions/mi-piace.mjs).
// Il cuore compare solo se la funzione risponde (sul sito pubblicato o con il sito locale);
// il numero compare solo da «mi-piace-minimo» like in su (impostazione del pannello).
// Il browser ricorda quali lavori ha apprezzato (e quando), solo per sé: serve per il cuore pieno,
// per non contare due volte lo stesso visitatore e per la pagina «I tuoi preferiti». Non viene inviato a nessuno.
(function () {
  var bottoni = document.querySelectorAll('.mi-piace[data-id]');
  var INDIRIZZO = '/api/mi-piace';
  var meta = document.querySelector('meta[name="mi-piace-minimo"]');
  var minimo = Math.max(1, parseInt(meta && meta.content, 10) || 4);
  var CHIAVE = 'mi-piace-dati';
  var miei = {};
  try { miei = JSON.parse(localStorage.getItem(CHIAVE) || '{}') || {}; } catch (e) { miei = {}; }
  function salvaMiei() { try { localStorage.setItem(CHIAVE, JSON.stringify(miei)); } catch (e) { /* navigazione privata: pazienza */ } }
  var conteggi = {};
  var galleria = document.querySelector('[data-preferiti]');

  // Voce «I tuoi preferiti» nel menu, con il numero: compare dal primo cuore
  function aggiornaMenu() {
    var n = Object.keys(miei).length;
    document.querySelectorAll('.link-preferiti').forEach(function (a) {
      a.hidden = !n && a.getAttribute('aria-current') !== 'page';
      var q = a.querySelector('.n'); if (q) q.textContent = n ? String(n) : '';
    });
  }

  // Pagina «I tuoi preferiti»: mostra solo i lavori col cuore, dal più recente
  function aggiornaPagina() {
    if (!galleria) return;
    var figure = [].slice.call(galleria.querySelectorAll('.lavoro'));
    var visibili = figure.filter(function (f) {
      var b = f.querySelector('.mi-piace[data-id]');
      var si = !!(b && miei[b.getAttribute('data-id')]);
      f.hidden = !si;
      return si;
    });
    visibili.sort(function (a, b) {
      return (miei[b.querySelector('.mi-piace').getAttribute('data-id')] || 0) - (miei[a.querySelector('.mi-piace').getAttribute('data-id')] || 0);
    }).forEach(function (f) { galleria.appendChild(f); });
    var vuoto = document.querySelector('.preferiti-vuoto');
    if (vuoto) vuoto.hidden = visibili.length > 0;
    var chiedi = document.querySelector('.chiedi-preferiti');
    if (chiedi) chiedi.hidden = !visibili.length;
  }

  function aggiorna(id) {
    var n = Math.max(0, conteggi[id] || 0);
    document.querySelectorAll('.mi-piace[data-id="' + id.replace(/"/g, '') + '"]').forEach(function (b) {
      var si = !!miei[id];
      b.setAttribute('aria-pressed', si ? 'true' : 'false');
      b.classList.toggle('attivo', si);
      b.querySelector('.conta').textContent = n >= minimo ? String(n) : '';
      b.title = si ? PAROLE_JS.non_mi_piace_piu : PAROLE_JS.mi_piace;
    });
    aggiornaMenu();
  }

  // Avviso breve dopo un nuovo cuore, con il link alla pagina dei preferiti
  var avviso, timer;
  function avvisa() {
    var link = document.querySelector('.link-preferiti');
    if (!link || galleria) return;
    if (!avviso) {
      avviso = document.createElement('div');
      avviso.className = 'avviso-preferiti';
      avviso.setAttribute('role', 'status');
      document.body.appendChild(avviso);
    }
    avviso.innerHTML = '';
    var t = document.createElement('span'); t.textContent = '♥ ' + PAROLE_JS.aggiunto;
    var a = document.createElement('a'); a.href = link.getAttribute('href'); a.textContent = PAROLE_JS.vedi + ' ›';
    avviso.appendChild(t); avviso.appendChild(a);
    avviso.classList.add('visibile');
    clearTimeout(timer);
    timer = setTimeout(function () { avviso.classList.remove('visibile'); }, 3500);
  }

  aggiornaMenu();
  aggiornaPagina();
  if (!bottoni.length || !window.fetch) return;

  fetch(INDIRIZZO, { headers: { Accept: 'application/json' } })
    .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
    .then(function (dati) {
      conteggi = dati && typeof dati === 'object' ? dati : {};
      bottoni.forEach(function (b) { b.hidden = false; aggiorna(b.getAttribute('data-id')); });
    })
    .catch(function () { /* funzione non disponibile (es. sito aperto da file): niente cuori */ });

  var inCorso = {};
  bottoni.forEach(function (b) {
    b.addEventListener('click', function (ev) {
      ev.preventDefault();
      var id = b.getAttribute('data-id');
      if (inCorso[id]) return;
      inCorso[id] = true;
      var prima = miei[id];
      var aggiungi = !prima;
      // Subito a schermo, poi conferma dal server
      if (aggiungi) miei[id] = Date.now(); else delete miei[id];
      conteggi[id] = Math.max(0, (conteggi[id] || 0) + (aggiungi ? 1 : -1));
      salvaMiei();
      aggiorna(id);
      if (aggiungi) { b.classList.remove('battito'); void b.offsetWidth; b.classList.add('battito'); avvisa(); }
      fetch(INDIRIZZO, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ id: id, azione: aggiungi ? 'aggiungi' : 'togli' }) })
        .then(function (r) { if (!r.ok) throw new Error(r.status); return r.json(); })
        .then(function (d) {
          if (d && typeof d.conteggio === 'number') conteggi[id] = d.conteggio;
          // Nella pagina dei preferiti, il lavoro tolto sparisce
          if (!aggiungi && galleria) aggiornaPagina();
        })
        .catch(function () {
          // Non è andata: si torna com'era
          if (aggiungi) delete miei[id]; else miei[id] = prima;
          conteggi[id] = Math.max(0, (conteggi[id] || 0) + (aggiungi ? -1 : 1));
          salvaMiei();
        })
        .then(function () { inCorso[id] = false; aggiorna(id); });
    });
  });
})();
