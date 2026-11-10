// Pannello: lista dei lavori a due colonne.
// A sinistra l'elenco compatto dei lavori (miniatura, titolo, data, numero di foto);
// a destra si modifica solo il lavoro selezionato, senza scorrere tra tutti gli altri.
// Si attiva sulle liste che in config.yml hanno «due_colonne: true» (oggi: i Lavori).
// Con «griglia: true» (oggi: le Altre foto) le foto di una lista stanno affiancate in riquadri.
// Il salvataggio, i controlli e il caricamento delle foto restano quelli originali del
// pannello: qui cambia solo cosa si vede.
(function () {
  var h = window.h;
  var originale = window.CMS && CMS.getWidget('list');
  if (!originale || !h) return;
  var Base = originale.control;

  var css = [
    '.dc-contenitore{container-type:inline-size}',
    '.dc{display:flex;gap:16px;align-items:flex-start}',
    '.dc-nav{flex:0 0 260px;position:sticky;top:12px;max-height:calc(100vh - 160px);display:flex;flex-direction:column;',
    '  background:#fff;border:2px solid #dfdfe3;border-radius:5px;overflow:hidden;margin-top:12px}',
    '.dc-testa{display:flex;align-items:center;justify-content:space-between;gap:8px;padding:10px;border-bottom:1px solid #eff0f4;background:#f7f8fa}',
    '.dc-testa strong{font-size:14px;color:#313d3e}',
    '.dc-agg{border:0;border-radius:5px;background:#3a69c7;color:#fff;font:600 13px inherit;padding:7px 10px;cursor:pointer;white-space:nowrap}',
    '.dc-agg:hover{background:#2c56ad}',
    '.dc-cerca{margin:8px 10px 4px;padding:7px 9px;border:2px solid #dfdfe3;border-radius:5px;font:14px inherit;outline:none}',
    '.dc-cerca:focus{border-color:#3a69c7}',
    '.dc-righe{overflow-y:auto;flex:1;padding:4px 0}',
    '.dc-riga{display:flex;align-items:center;gap:9px;padding:6px 8px 6px 6px;cursor:pointer;border-left:4px solid transparent;user-select:none}',
    '.dc-riga:hover{background:#f3f5f9}',
    '.dc-riga.dc-sel{background:#e8f0fe;border-left-color:#3a69c7}',
    '.dc-riga.dc-nascosto .dc-mini,.dc-riga.dc-nascosto .dc-tit{opacity:.5}',
    '.dc-mini{flex:0 0 46px;width:46px;height:46px;border-radius:4px;object-fit:cover;background:#eff0f4}',
    '.dc-info{flex:1;min-width:0;line-height:1.3}',
    '.dc-tit{display:-webkit-box;-webkit-line-clamp:2;-webkit-box-orient:vertical;font-size:14px;font-weight:600;color:#313d3e;overflow:hidden;word-break:break-word}',
    '.dc-meta{display:block;font-size:12px;color:#7a8285;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.dc-errore{color:#b3261e;font-weight:700}',
    '.dc-frecce{display:flex;flex-direction:column;gap:2px;opacity:0;transition:opacity .15s}',
    '.dc-riga:hover .dc-frecce,.dc-riga.dc-sel .dc-frecce{opacity:1}',
    '.dc-frecce button{border:1px solid #dfdfe3;background:#fff;border-radius:3px;width:24px;height:20px;line-height:1;font-size:11px;cursor:pointer;color:#313d3e;padding:0}',
    '.dc-frecce button:hover:not(:disabled){border-color:#3a69c7;color:#3a69c7}',
    '.dc-frecce button:disabled{opacity:.3;cursor:default}',
    '.dc-vuoto{padding:14px 10px;color:#7a8285;font-size:13px}',
    '.dc-destra{flex:1;min-width:0}',
    '.dc-barra{display:flex;align-items:center;gap:8px;margin:12px 0 0;padding:8px 10px;background:#f7f8fa;border:2px solid #dfdfe3;border-radius:5px}',
    '.dc-barra span{flex:1;min-width:0;font-size:14px;color:#313d3e;white-space:nowrap;overflow:hidden;text-overflow:ellipsis}',
    '.dc-barra button{border:1px solid #dfdfe3;background:#fff;border-radius:4px;padding:5px 9px;font:13px inherit;cursor:pointer;color:#313d3e;white-space:nowrap}',
    '.dc-barra button:hover:not(:disabled){border-color:#3a69c7;color:#3a69c7}',
    '.dc-barra button:disabled{opacity:.35;cursor:default}',
    // Si mostra solo il lavoro selezionato; la barra originale della lista (contatore, «Aggiungi», «chiudi tutti»)
    // è sostituita dalla colonna di sinistra.
    '.dc-lista > div > :first-child{display:none}',
    '.dc-voce{display:none}',
    '.dc-voce.dc-voce-sel{display:block}',
    '.dc-voce.dc-voce-sel > *{margin-top:12px !important}',
    // Nel lavoro aperto la barretta originale (chiudi, trascina, ×) non serve più: «Elimina» è nella barra sopra
    '.dc-voce.dc-voce-sel > * > :first-child{display:none}',
    '.dc-barra button.dc-elimina{color:#b3261e}',
    '.dc-barra button.dc-elimina:hover{border-color:#b3261e;color:#b3261e;background:#fdf1f0}',
    // Liste di foto con «griglia: true» (le «Altre foto»): riquadri affiancati invece che uno sotto l'altro
    '.dc-griglia > div > div:last-child{display:grid;grid-template-columns:repeat(auto-fill,minmax(170px,1fr));gap:10px;margin-top:10px}',
    '.dc-griglia > div > div:last-child > *{margin-top:0 !important;min-width:0}',
    '.dc-griglia > div > div:last-child > * > :first-child > button:first-child{visibility:hidden}',
    '.dc-griglia > div > div:last-child label,.dc-griglia > div > div:last-child p{display:none}',
    '.dc-griglia > div > div:last-child .nome-foto{font-size:12px !important;margin-top:4px !important}',
    // Colonna stretta (pannello con l\'anteprima aperta su uno schermo piccolo, o telefono): elenco sopra
    '@container (max-width: 620px){',
    '  .dc{flex-direction:column;gap:0}',
    '  .dc-nav{position:static;flex:none;width:100%;max-height:45vh;box-sizing:border-box}',
    '  .dc-destra{width:100%}',
    '}'
  ].join('\n');
  var stile = document.createElement('style');
  stile.textContent = css;
  document.head.appendChild(stile);

  function testo(v) { return v == null ? '' : String(v); }
  function leggi(item, k) { return item && item.get ? item.get(k) : item && item[k]; }
  function dataIt(v) {
    if (!v) return '';
    if (v instanceof Date) return ('0' + v.getDate()).slice(-2) + '/' + ('0' + (v.getMonth() + 1)).slice(-2) + '/' + v.getFullYear();
    var m = /^(\d{4})-(\d{2})-(\d{2})/.exec(String(v));
    return m ? m[3] + '/' + m[2] + '/' + m[1] : String(v);
  }
  function quanteFoto(item) {
    var n = leggi(item, 'foto') ? 1 : 0;
    var altre = leggi(item, 'altre_foto');
    altre = altre && altre.toArray ? altre.toArray() : (altre || []);
    altre.forEach(function (x) { if (typeof x === 'string' ? x : (x && (x.get ? x.get('foto') : x.foto))) n++; });
    return n;
  }
  // Miniatura leggera: sul sito pubblicato passa dal servizio immagini di Netlify
  function miniatura(p) {
    p = testo(p).split('?')[0];
    if (!p) return '';
    if (/^(https?:|blob:|data:)/.test(p)) return p;
    var u = p.charAt(0) === '/' ? p : '/' + p;
    return window.NETLIFY_IMMAGINI ? '/.netlify/images?url=' + encodeURIComponent(u) + '&w=96&h=96&fit=cover' : u;
  }

  class ListaDueColonne extends Base {
    constructor(props) {
      super(props);
      this.asset = {};
      if (!this.dueColonne()) return;
      var self = this;
      var primo = this.state.keys[0] || null;
      this.state.sel = primo;
      this.state.cerca = '';
      this.state.itemsCollapsed = this.state.keys.map(function (k) { return k !== primo; });
      // Ogni lavoro resta nella pagina (così i controlli dei campi obbligatori funzionano su tutti),
      // ma si vede solo quello selezionato.
      var renderOriginale = this.renderItem;
      this.renderItem = function (item, index) {
        var key = self.state.keys[index];
        return h('div', { key: key, className: 'dc-voce' + (key === self.state.sel ? ' dc-voce-sel' : '') }, renderOriginale(item, index));
      };
    }

    dueColonne() {
      var f = this.props.field;
      // Se un aggiornamento del pannello cambiasse la lista originale, si torna alla lista classica
      var compatibile = this.state && Array.isArray(this.state.keys) && Array.isArray(this.state.itemsCollapsed) &&
        typeof this.renderItem === 'function' && typeof this.handleAdd === 'function' &&
        typeof this.handleRemove === 'function' && typeof this.onSortEnd === 'function' &&
        typeof this.hasError === 'function' && typeof this.renderListControl === 'function';
      return !!(f && f.get('due_colonne') && f.get('fields') && compatibile);
    }

    seleziona(key, scorri) {
      if (!key) return;
      this.setState({
        sel: key,
        itemsCollapsed: this.state.keys.map(function (k) { return k !== key; })
      });
      if (scorri && this.destra) {
        var el = this.destra;
        setTimeout(function () { if (el.getBoundingClientRect().top < 60) el.scrollIntoView({ block: 'start' }); }, 0);
      }
    }

    sposta(da, a, e) {
      e.stopPropagation(); e.preventDefault();
      var n = this.props.value ? this.props.value.size : 0;
      if (a < 0 || a >= n) return;
      this.onSortEnd({ oldIndex: da, newIndex: a });
    }

    componentDidUpdate(prevProps, prevState) {
      if (super.componentDidUpdate) super.componentDidUpdate(prevProps, prevState);
      if (!this.dueColonne()) return;
      var keys = this.state.keys, prima = prevState.keys || [];
      // Lavoro appena aggiunto: aprilo subito
      var nuovo = keys.filter(function (k) { return prima.indexOf(k) === -1; })[0];
      if (nuovo && nuovo !== this.state.sel) return this.seleziona(nuovo, true);
      // Lavoro selezionato eliminato: passa al vicino
      if (this.state.sel && keys.indexOf(this.state.sel) === -1) {
        var i = Math.max(0, prima.indexOf(this.state.sel));
        return this.seleziona(keys[Math.min(i, keys.length - 1)] || null);
      }
      if (!this.state.sel && keys.length) return this.seleziona(keys[0]);
      // Errori (es. foto principale mancante) in un lavoro non visibile: mostralo
      if (this.props.fieldsErrors !== prevProps.fieldsErrors && this.props.fieldsErrors && this.props.fieldsErrors.size) {
        var iSel = keys.indexOf(this.state.sel);
        if (!this.hasError(iSel)) {
          for (var j = 0; j < keys.length; j++) if (this.hasError(j)) return this.seleziona(keys[j], true);
        }
      }
    }

    // Foto non ancora pubblicate (bozza): le chiede al pannello
    caricaAsset(p) {
      var self = this;
      if (this.asset[p] !== undefined) return;
      this.asset[p] = null;
      var campo = (this.props.field.get('fields') || []).find(function (f) { return f.get('name') === 'foto'; });
      var fine = function (a) { self.asset[p] = a ? String(a.toString()) : ''; self.forceUpdate(); };
      try {
        var r = this.props.getAsset(p, campo);
        if (r && typeof r.then === 'function') r.then(fine, function () { self.asset[p] = ''; });
        else fine(r);
      } catch (e) { this.asset[p] = ''; }
    }

    renderRiga(item, index, totale, filtrato) {
      var self = this;
      var key = this.state.keys[index];
      var sel = key === this.state.sel;
      var foto = testo(leggi(item, 'foto'));
      var nascosto = leggi(item, 'nascosto') === true || leggi(item, 'nascosto') === 'true';
      var errore = this.hasError(index);
      var n = quanteFoto(item);
      var meta = [];
      if (nascosto) meta.push('⛔ nascosto');
      if (testo(leggi(item, 'codice'))) meta.push(testo(leggi(item, 'codice')));
      if (leggi(item, 'data')) meta.push(dataIt(leggi(item, 'data')));
      meta.push(n === 1 ? '1 foto' : n + ' foto');
      var src = this.asset[foto] || miniatura(foto);
      return h('div', {
        key: key,
        className: 'dc-riga' + (sel ? ' dc-sel' : '') + (nascosto ? ' dc-nascosto' : ''),
        onClick: function () { self.seleziona(key, true); },
        title: testo(leggi(item, 'titolo')) || 'Lavoro senza titolo'
      },
        src ? h('img', {
          className: 'dc-mini', src: src, alt: '', loading: 'lazy',
          onError: function (e) {
            if (self.asset[foto] === undefined) self.caricaAsset(foto);
            else e.target.style.visibility = 'hidden';
          }
        }) : h('div', { className: 'dc-mini' }),
        h('span', { className: 'dc-info' },
          h('span', { className: 'dc-tit' }, (errore ? h('span', { className: 'dc-errore' }, '⚠ ') : null), testo(leggi(item, 'titolo')) || '(senza titolo)'),
          h('span', { className: 'dc-meta' }, meta.join(' · '))),
        filtrato ? null : h('span', { className: 'dc-frecce' },
          h('button', { type: 'button', title: 'Sposta su', disabled: index === 0, onClick: function (e) { self.sposta(index, index - 1, e); } }, '▲'),
          h('button', { type: 'button', title: 'Sposta giù', disabled: index === totale - 1, onClick: function (e) { self.sposta(index, index + 1, e); } }, '▼'))
      );
    }

    render() {
      if (!this.dueColonne()) {
        if (this.props.field && this.props.field.get('griglia')) return h('div', { className: 'dc-griglia' }, super.render());
        return super.render();
      }
      var self = this;
      var field = this.props.field;
      var items = this.props.value || [];
      var arr = items.toArray ? items.toArray() : items;
      var tot = arr.length;
      var singolare = (field.get('label_singular') || 'elemento').toLowerCase();
      var plurale = (field.get('label') || field.get('name')).toLowerCase();
      var cerca = this.state.cerca.trim().toLowerCase();
      var righe = [];
      arr.forEach(function (item, i) {
        if (cerca && (testo(leggi(item, 'titolo')) + ' ' + testo(leggi(item, 'codice'))).toLowerCase().indexOf(cerca) === -1) return;
        righe.push(self.renderRiga(item, i, tot, !!cerca));
      });
      var iSel = this.state.keys.indexOf(this.state.sel);
      var itemSel = iSel >= 0 ? arr[iSel] : null;

      var nav = h('div', { className: 'dc-nav' },
        h('div', { className: 'dc-testa' },
          h('strong', {}, tot + ' ' + (tot === 1 ? singolare : plurale)),
          h('button', { type: 'button', className: 'dc-agg', onClick: function (e) { self.setState({ cerca: '' }); self.handleAdd(e); } }, '+ Aggiungi ' + singolare)),
        tot > 5 ? h('input', {
          className: 'dc-cerca', type: 'search', placeholder: 'Cerca per titolo o codice…', value: this.state.cerca,
          onChange: function (e) { self.setState({ cerca: e.target.value }); }
        }) : null,
        h('div', { className: 'dc-righe' },
          righe.length ? righe : h('div', { className: 'dc-vuoto' }, tot ? 'Nessun ' + singolare + ' con questo titolo.' : 'Ancora nessun ' + singolare + ': premete «+ Aggiungi ' + singolare + '».')));

      var barra = itemSel ? h('div', { className: 'dc-barra' },
        h('button', { type: 'button', disabled: iSel <= 0, title: 'Lavoro precedente', onClick: function () { self.seleziona(self.state.keys[iSel - 1], true); } }, '‹'),
        h('span', {}, h('strong', {}, singolare.charAt(0).toUpperCase() + singolare.slice(1) + ' ' + (iSel + 1) + ' di ' + tot), testo(leggi(itemSel, 'titolo')) ? ' · ' + leggi(itemSel, 'titolo') : ''),
        h('button', { type: 'button', disabled: iSel >= tot - 1, title: 'Lavoro successivo', onClick: function () { self.seleziona(self.state.keys[iSel + 1], true); } }, '›'),
        field.get('allow_remove', true) ? h('button', {
          type: 'button', className: 'dc-elimina', title: 'Elimina questo ' + singolare,
          onClick: function (e) {
            var nome = testo(leggi(itemSel, 'titolo')) || 'senza titolo';
            if (window.confirm('Eliminare il ' + singolare + ' «' + nome + '»?\n\nSe volete solo toglierlo dal sito per un po\', usate invece «Nascondi dal sito».')) self.handleRemove(iSel, e);
          }
        }, 'Elimina') : null) : null;

      return h('div', { className: 'dc-contenitore' },
        h('div', { className: 'dc' },
          nav,
          h('div', { className: 'dc-destra', ref: function (r) { self.destra = r; } }, barra, h('div', { className: 'dc-lista' }, super.render()))));
    }
  }

  CMS.registerWidget('list', ListaDueColonne, originale.preview, originale.schema);
})();
