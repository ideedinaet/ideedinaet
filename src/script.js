(function () {
  // Visualizzatore a schermo intero: scorre le foto del lavoro aperto, senza passare ad altri lavori
  var visore = document.querySelector('.visore');
  if (!visore || typeof visore.showModal !== 'function') return;
  var img = visore.querySelector('img');
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
    testo.textContent = b.getAttribute('data-testo') || '';
    var ig = b.getAttribute('data-instagram');
    var modello = b.closest('figure') && b.closest('figure').querySelector('template.qr');
    social.hidden = !ig;
    linkIG.href = ig || '#';
    codice.innerHTML = modello ? modello.innerHTML : '';
    codice.parentNode.classList.toggle('senza-qr', !modello);
    mostra(0);
    visore.showModal();
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
