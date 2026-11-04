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

  function mostra(i) {
    if (i < 0 || i >= foto.length) return;
    indice = i;
    img.src = foto[indice];
    visore.style.setProperty('--foto', 'url("' + foto[indice] + '")');
    quadro.style.animation = 'none'; void quadro.offsetWidth; quadro.style.animation = '';
    contatore.textContent = foto.length > 1 ? 'Foto ' + (indice + 1) + ' di ' + foto.length : '';
    prec.hidden = indice === 0;
    succ.hidden = indice === foto.length - 1;
    if (foto[indice + 1]) { var p = new Image(); p.src = foto[indice + 1]; }
  }

  function apri(b) {
    bottone = b;
    var altre = (b.getAttribute('data-altre') || '').split('|').filter(Boolean);
    foto = [b.getAttribute('data-grande')].concat(altre);
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
    mostra(0);
    visore.showModal();
    var area = visore.querySelector('.area'); if (area) area.scrollTop = 0;
    testo.scrollTop = 0;
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-grande]');
    if (b) apri(b);
  });
  visore.querySelector('.chiudi').addEventListener('click', function () { visore.close(); });
  prec.addEventListener('click', function () { mostra(indice - 1); });
  succ.addEventListener('click', function () { mostra(indice + 1); });
  visore.addEventListener('click', function (e) { if (e.target === visore || e.target.classList.contains('area')) visore.close(); });
  visore.addEventListener('close', function () { if (bottone) bottone.focus(); });
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

  function messaggio(t) {
    return t ? 'Ciao! Mi interessa «' + t + '», che ho visto sul vostro sito (' + pagina + '). Potete darmi qualche informazione?'
             : 'Ciao! Vi scrivo dal vostro sito: vorrei qualche informazione.';
  }
  function linkWA(n, t) { return 'https://wa.me/' + n + '?text=' + encodeURIComponent(messaggio(t)); }
  function linkEmail(t) { return 'mailto:' + email + '?subject=' + encodeURIComponent(t ? 'Informazioni: ' + t : 'Informazioni') + '&body=' + encodeURIComponent(messaggio(t)); }
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
    if (email) voce(linkEmail(t), 'Email', false);
    scelta.showModal();
    return true;
  }
  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-chiedi]');
    if (b && chiedi(b.getAttribute('data-chiedi'))) e.preventDefault();
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
