(function () {
  // Visualizzatore a schermo intero per le foto dei lavori
  var visore = document.querySelector('.visore');
  if (!visore || typeof visore.showModal !== 'function') return;
  var img = visore.querySelector('img');
  var titolo = visore.querySelector('.didascalia strong');
  var testo = visore.querySelector('.didascalia span');
  var elenco = [], indice = 0;

  function mostra(i) {
    indice = (i + elenco.length) % elenco.length;
    var b = elenco[indice];
    img.src = b.getAttribute('data-grande');
    img.alt = b.getAttribute('data-titolo') || '';
    titolo.textContent = b.getAttribute('data-titolo') || '';
    testo.textContent = b.getAttribute('data-testo') || '';
    var ig = b.getAttribute('data-instagram');
    var modello = b.closest('figure') && b.closest('figure').querySelector('template.qr');
    social.hidden = !ig;
    linkIG.href = ig || '#';
    codice.innerHTML = modello ? modello.innerHTML : '';
    codice.parentNode.classList.toggle('senza-qr', !modello);
  }
  var social = visore.querySelector('.social');
  var linkIG = visore.querySelector('.bottone-ig');
  var codice = visore.querySelector('.codice-qr');

  document.addEventListener('click', function (e) {
    var b = e.target.closest('[data-grande]');
    if (!b) return;
    var galleria = b.closest('.galleria');
    elenco = Array.prototype.slice.call(galleria.querySelectorAll('[data-grande]'));
    mostra(elenco.indexOf(b));
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
