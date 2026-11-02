(function () {
  // Visualizzatore a schermo intero: scorre tutte le foto di ogni lavoro, poi passa al lavoro successivo
  var visore = document.querySelector('.visore');
  if (!visore || typeof visore.showModal !== 'function') return;
  var img = visore.querySelector('img');
  var titolo = visore.querySelector('.didascalia strong');
  var testo = visore.querySelector('.didascalia span');
  var contatore = visore.querySelector('.contatore');
  var social = visore.querySelector('.social');
  var linkIG = visore.querySelector('.bottone-ig');
  var codice = visore.querySelector('.codice-qr');
  var foto = [], indice = 0;

  function fotoDelLavoro(b) {
    var altre = (b.getAttribute('data-altre') || '').split('|').filter(Boolean);
    return [b.getAttribute('data-grande')].concat(altre);
  }

  function mostra(i) {
    indice = (i + foto.length) % foto.length;
    var f = foto[indice], b = f.bottone;
    img.src = f.src;
    img.alt = b.getAttribute('data-titolo') || '';
    titolo.textContent = b.getAttribute('data-titolo') || '';
    testo.textContent = b.getAttribute('data-testo') || '';
    contatore.textContent = f.totale > 1 ? 'Foto ' + (f.n + 1) + ' di ' + f.totale : '';
    var ig = b.getAttribute('data-instagram');
    var modello = b.closest('figure') && b.closest('figure').querySelector('template.qr');
    social.hidden = !ig;
    linkIG.href = ig || '#';
    codice.innerHTML = modello ? modello.innerHTML : '';
    codice.parentNode.classList.toggle('senza-qr', !modello);
    // precarica la foto successiva
    var dopo = foto[(indice + 1) % foto.length];
    if (dopo) { var p = new Image(); p.src = dopo.src; }
  }

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-grande]');
    if (!b) return;
    var galleria = b.closest('.galleria');
    foto = []; var inizio = 0;
    Array.prototype.forEach.call(galleria.querySelectorAll('[data-grande]'), function (bt) {
      var elenco = fotoDelLavoro(bt);
      if (bt === b) inizio = foto.length;
      elenco.forEach(function (src, n) { foto.push({ src: src, bottone: bt, n: n, totale: elenco.length }); });
    });
    mostra(inizio);
    visore.showModal();
  });
  visore.querySelector('.chiudi').addEventListener('click', function () { visore.close(); });
  visore.querySelector('.prec').addEventListener('click', function () { mostra(indice - 1); });
  visore.querySelector('.succ').addEventListener('click', function () { mostra(indice + 1); });
  visore.addEventListener('click', function (e) { if (e.target === visore || e.target.classList.contains('area')) visore.close(); });
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
