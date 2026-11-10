// «Mi piace» e codici nel pannello:
// 0) al salvataggio di una categoria, ogni lavoro senza codice ne riceve uno breve (es. BIG-02), usato nei messaggi;
// 1) al salvataggio di una categoria, ogni lavoro senza identificativo ne riceve uno fisso (campo nascosto «id»),
//    ricavato dalla foto principale: così i like restano al lavoro anche se poi si cambiano foto, titolo o categoria;
// 2) in alto nel pannello compare il pulsante «♥ Classifica», che apre la classifica dei lavori più apprezzati.
(function () {
  if (!window.CMS) return;

  // Stessa regola di build.js (pulisciId)
  var ID_VALIDO = /^[a-z0-9][a-z0-9/_-]{0,99}$/;
  function pulisci(v) {
    return String(v || '').toLowerCase().replace(/^\/?immagini\//, '').replace(/\.[a-z0-9]+$/, '')
      .normalize('NFD').replace(/[̀-ͯ]/g, '').replace(/[^a-z0-9/_-]+/g, '-').replace(/^[^a-z0-9]+|-+$/g, '').slice(0, 100);
  }

  CMS.registerEventListener({
    name: 'preSave',
    handler: function (ctx) {
      var entry = ctx && ctx.entry;
      if (!entry || entry.get('collection') !== 'categorie') return;
      var dati = entry.get('data');
      var lavori = dati && dati.get('lavori');
      if (!lavori || !lavori.map) return;
      var slug = entry.get('slug') || dati.get('slug') || 'lavoro';
      var usati = {};
      // Codici brevi (es. BIG-02): prime 3 lettere della categoria + numero dopo il più alto già usato
      var prefisso = String(slug).normalize('NFD').replace(/[^a-zA-Z]/g, '').slice(0, 3).toUpperCase() || 'LAV';
      var massimo = 0, codiciUsati = {};
      lavori.forEach(function (l) {
        var c = l && l.get && String(l.get('codice') || '').trim().toUpperCase();
        if (!c) return;
        codiciUsati[c] = true;
        var m = c.match(/-(\d+)$/); if (m) massimo = Math.max(massimo, +m[1]);
      });
      lavori = lavori.map(function (l) {
        if (!l || !l.get || String(l.get('codice') || '').trim()) return l;
        var c;
        do { c = prefisso + '-' + String(++massimo).padStart(2, '0'); } while (codiciUsati[c]);
        codiciUsati[c] = true;
        return l.set('codice', c);
      });
      var nuovi = lavori.map(function (l) {
        if (!l || !l.get) return l;
        var id = l.get('id');
        if (typeof id === 'string' && ID_VALIDO.test(id) && !usati[id]) { usati[id] = true; return l; }
        var base = pulisci(l.get('foto')) || pulisci(slug + '/' + Date.now().toString(36));
        var nuovo = base, n = 2;
        while (usati[nuovo]) nuovo = base + '-' + n++;
        usati[nuovo] = true;
        return l.set('id', nuovo);
      });
      return dati.set('lavori', nuovi);
    },
  });

  // Pulsante «♥ Classifica» nella barra in alto del pannello
  function aggiungiPulsante() {
    if (document.querySelector('.pulsante-classifica')) return;
    var lista = document.querySelector('header nav ul');
    if (!lista) return;
    var voce = document.createElement('li');
    var a = document.createElement('a');
    a.className = 'pulsante-classifica';
    a.href = 'classifica.html';
    a.target = '_blank';
    a.rel = 'noopener';
    a.textContent = '♥ Classifica';
    a.title = 'I lavori con più «mi piace» (si apre in una nuova scheda)';
    a.style.cssText = 'display:inline-flex;align-items:center;height:100%;padding:0 16px;font-size:14px;font-weight:500;color:#c0392b;text-decoration:none;white-space:nowrap';
    voce.appendChild(a);
    lista.appendChild(voce);
  }
  new MutationObserver(aggiungiPulsante).observe(document.body, { childList: true, subtree: true });
})();
