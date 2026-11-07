// Pannello: sotto ogni foto (foto principale, altre foto, copertina, logo…) mostra il nome
// del file e la cartella in cui si trova, es. «line-01.jpg — cartella taglieri».
(function () {
  var h = window.h, createClass = window.createClass;
  var originale = CMS.getWidget('image');
  if (!originale || !h || !createClass) return;
  var Controllo = originale.control;

  function descrivi(valore) {
    var v = String(valore || '').split('?')[0];
    if (!v) return null;
    if (/^https?:\/\//.test(v)) return { nome: v.split('/').pop() || v, cartella: 'indirizzo esterno' };
    var parti = v.replace(/^\/+/, '').split('/');
    var nome = parti.pop();
    if (parti[0] === 'immagini') parti.shift();
    return { nome: nome, cartella: parti.length ? 'cartella ' + parti.join('/') : 'cartella immagini' };
  }

  var ConNome = createClass({
    // Il pannello chiede al campo se è valido: giriamo la domanda al campo originale
    isValid: function () {
      return this.interno && this.interno.isValid ? this.interno.isValid() : true;
    },
    render: function () {
      var self = this;
      var d = descrivi(this.props.value);
      var props = Object.assign({}, this.props, { ref: function (r) { self.interno = r; } });
      return h('div', {},
        h(Controllo, props),
        d ? h('div', {
          className: 'nome-foto',
          title: String(this.props.value),
          style: { margin: '6px 0 2px', fontSize: '13px', lineHeight: 1.4, color: '#313d3e', wordBreak: 'break-all' }
        },
          h('span', { style: { fontWeight: 600 } }, d.nome),
          h('span', { style: { color: '#7a8285' } }, ' — ' + d.cartella)
        ) : null
      );
    }
  });

  CMS.registerWidget('image', ConNome, originale.preview, originale.schema);
})();
