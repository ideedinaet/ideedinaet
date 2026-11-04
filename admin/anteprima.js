// Anteprima nel pannello: mostra la categoria con lo stesso stile del sito vero
(function () {
  var base = window.PANNELLO_BASE || '/';
  CMS.registerPreviewStyle('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:wght@500;600&family=Jost:wght@300;400;500;600&family=Outfit:wght@500;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700&family=Italiana&display=swap');
  CMS.registerPreviewStyle(base + 'stile.css');
  var h = window.h;
  // Stessa resa del sito: **grassetto**, *corsivo*, <b>, <i>
  function esc(t) { return String(t || '').replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
  function formatta(t) {
    return String(t || '').split(/\n\s*\n/).filter(function (p) { return p.trim(); }).map(function (p) {
      var salvati = [];
      var s = p.trim().replace(/&nbsp;| /g, ' ').replace(/\\([\\`*_{}\[\]()#+\-.!<>~|])/g, function (m, c) { salvati.push(c); return '\u0000' + (salvati.length - 1) + '\u0000'; });
      s = esc(s)
        .replace(/&lt;(b|strong)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<strong>$2</strong>')
        .replace(/&lt;(i|em)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<em>$2</em>')
        .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
        .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
        .replace(/\*(?=[^\s*])([^*]*?[^\s*])\*/g, '<em>$1</em>')
        .replace(/(^|[^\w])_(?=[^\s_])([^_]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>')
        .replace(/( {2,}|\\)\n/g, '<br>').replace(/\n/g, ' ');
      return '<p>' + s.replace(/\u0000(\d+)\u0000/g, function (m, i) { return esc(salvati[i]); }) + '</p>';
    }).join('');
  }

  var Categoria = createClass({
    render: function () {
      var e = this.props.entry, getAsset = this.props.getAsset;
      var dato = function (k) { return e.getIn(['data', k]); };
      var lavori = (dato('lavori') || []).toArray ? dato('lavori').toArray() : [];
      var src = function (p) { if (!p) return ''; var a = getAsset(p); return a ? a.toString() : p; };
      return h('div', { className: 'tema-' + (window.TEMA_SITO || 'bottega'), style: { background: 'var(--carta)', color: 'var(--inchiostro)', fontFamily: 'var(--testo)', minHeight: '100vh' } },
        h('section', { className: 'titolo-pagina' }, h('div', { className: 'contenitore' },
          h('h1', {}, dato('titolo') || 'Nuova categoria'),
          dato('descrizione') ? h('div', { className: 'descrizione-categoria', dangerouslySetInnerHTML: { __html: formatta(dato('descrizione')) } }) : null)),
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
                g('descrizione') ? h('span', { className: 'desc', dangerouslySetInnerHTML: { __html: formatta(g('descrizione')).replace(/<\/p><p>/g, '<br>').replace(/<\/?p>/g, '') } }) : null,
                g('prezzo') ? h('span', { className: 'prezzo' }, g('prezzo')) : null,
                g('instagram') ? h('span', { className: 'ig' }, '◎ Instagram + QR code: ' + g('instagram')) : null));
          })) : h('p', { className: 'vuoto' }, 'Aggiungi il primo lavoro con il pulsante "Aggiungi lavoro".'))));
    }
  });
  CMS.registerPreviewTemplate('categorie', Categoria);
})();
