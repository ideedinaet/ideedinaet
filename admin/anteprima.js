// Anteprima nel pannello: mostra la categoria con lo stesso stile del sito vero
(function () {
  var base = window.PANNELLO_BASE || '/';
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=DM+Sans:opsz,wght@9..40,400;9..40,600&family=Fraunces:opsz,wght@9..144,500;9..144,600&display=swap');
  CMS.registerPreviewStyle(base + 'stile.css');
  var h = window.h;

  var Categoria = createClass({
    render: function () {
      var e = this.props.entry, getAsset = this.props.getAsset;
      var dato = function (k) { return e.getIn(['data', k]); };
      var lavori = (dato('lavori') || []).toArray ? dato('lavori').toArray() : [];
      var src = function (p) { if (!p) return ''; var a = getAsset(p); return a ? a.toString() : p; };
      return h('div', { style: { background: 'var(--carta)', minHeight: '100vh' } },
        h('section', { className: 'titolo-pagina' }, h('div', { className: 'contenitore' },
          h('h1', {}, dato('titolo') || 'Nuova categoria'),
          dato('descrizione') ? h('p', {}, dato('descrizione')) : null)),
        h('section', {}, h('div', { className: 'contenitore' },
          lavori.length ? h('div', { className: 'galleria' }, lavori.map(function (l, i) {
            var g = function (k) { return l.get ? l.get(k) : l[k]; };
            var altre = g('altre_foto'); altre = altre && altre.toArray ? altre.toArray() : (altre || []);
            altre = altre.map(function (x) { return typeof x === 'string' ? x : (x && x.get ? x.get('foto') : x && x.foto); }).filter(Boolean);
            return h('figure', { className: 'lavoro', key: i },
              g('foto') ? h('img', { src: src(g('foto')), style: { borderRadius: '6px' } }) : h('div', { className: 'vuoto' }, '(foto mancante)'),
              altre.length ? h('div', { style: { display: 'flex', gap: '6px', marginTop: '6px', flexWrap: 'wrap' } }, altre.map(function (f, j) {
                return h('img', { key: j, src: src(f), style: { width: '56px', height: '56px', objectFit: 'cover', borderRadius: '4px' } });
              })) : null,
              h('figcaption', {},
                g('titolo') ? h('strong', {}, g('titolo')) : null,
                g('descrizione') ? h('span', {}, g('descrizione')) : null,
                g('prezzo') ? h('span', { className: 'prezzo' }, g('prezzo')) : null,
                g('instagram') ? h('span', { className: 'ig' }, '◎ Instagram + QR code: ' + g('instagram')) : null));
          })) : h('p', { className: 'vuoto' }, 'Aggiungi il primo lavoro con il pulsante "Aggiungi lavoro".'))));
    }
  });
  CMS.registerPreviewTemplate('categorie', Categoria);
})();
