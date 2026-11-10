#!/usr/bin/env node
/*
 * Generatore del sito vetrina — nessuna dipendenza, basta Node.
 *   node build.js              → crea il sito completo nella cartella _site/
 *   node build.js --anteprima  → crea un unico file anteprima.html (per vederlo al volo)
 * I contenuti stanno in content/ (modificabili dal pannello /admin), le foto in immagini/.
 */
const fs = require('fs');
const path = require('path');

const RADICE = __dirname;
const USCITA = path.join(RADICE, '_site');
const ANTEPRIMA = process.argv.includes('--anteprima');
const NETLIFY = process.env.NETLIFY === 'true';

const leggi = (f) => JSON.parse(fs.readFileSync(path.join(RADICE, f), 'utf8'));
const esc = (s) => String(s == null ? '' : s).replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
// Testo con grassetto e corsivo: **grassetto**, *corsivo* (o _corsivo_), oppure <b>…</b>, <i>…</i>.
// Tutto il resto viene mostrato così com'è (nessun altro codice passa).
function formatta(t) {
  const salvati = [];
  let s = String(t || '').replace(/&nbsp;|&#x20;|\u00a0/g, ' ')
    .replace(/\\([\\`*_{}\[\]()#+\-.!<>~|])/g, (m, c) => { salvati.push(c); return '\u0000' + (salvati.length - 1) + '\u0000'; });
  s = esc(s)
    .replace(/&lt;(b|strong)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<strong>$2</strong>')
    .replace(/&lt;(i|em)&gt;([\s\S]*?)&lt;\/\1&gt;/gi, '<em>$2</em>')
    .replace(/\*\*\*(?=\S)([\s\S]*?\S)\*\*\*/g, '<strong><em>$1</em></strong>')
    .replace(/(\*\*|__)(?=\S)([\s\S]*?\S)\1/g, '<strong>$2</strong>')
    .replace(/\*(?=[^\s*])([^*]*?[^\s*])\*/g, '<em>$1</em>')
    .replace(/(^|[^\w])_(?=[^\s_])([^_]*?[^\s_])_(?!\w)/g, '$1<em>$2</em>')
    .replace(/( {2,}|\\)\n/g, '<br>').replace(/\n/g, ' ');
  return s.replace(/\u0000(\d+)\u0000/g, (m, i) => esc(salvati[i]));
}
const formattaInRiga = (t) => String(t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map(formatta).join('<br>');
const paragrafiFormattati = (t) => String(t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${formatta(p)}</p>`).join('\n');
// Per Google e anteprime dei link: solo il testo, senza segni
const testoSemplice = (t) => formatta(t).replace(/<br>/g, ' ').replace(/<[^>]+>/g, '').replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/\s+/g, ' ').trim();
const paragrafi = (t) => String(t || '').split(/\n\s*\n/).map((p) => p.trim()).filter(Boolean).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('\n');

// ---- Lingue: il sito italiano sta nella radice, quello inglese in /en/ ----
// I testi inglesi stanno nel campo «en» di sito, categorie e lavori (sezione «In inglese» del pannello).
// Un campo inglese vuoto = si usa il testo italiano.
let LINGUA = 'it';
const IN_INGLESE = () => LINGUA === 'en';
// Quante cartelle in più ha la lingua corrente (/en/ = 1)
const PROFONDITA = () => (IN_INGLESE() ? 1 : 0);
const pieno = (v) => typeof v === 'string' && v.trim() !== '';

const sitoIT = leggi('content/sito.json');
let sito = sitoIT;
const nascosto = (x) => x.nascosto === true || x.nascosto === 'true';
const urlBase = (sito.url || '').replace(/\/+$/, '');
const categorie = fs.readdirSync(path.join(RADICE, 'content/categorie'))
  .filter((f) => f.endsWith('.json'))
  .map((f) => {
    const c = leggi(path.join('content/categorie', f));
    c.slug = path.basename(f, '.json');
    // «Nascondi dal sito»: i lavori nascosti non vengono proprio messi nelle pagine
    c.lavori = (c.lavori || []).filter((l) => l && l.foto && !nascosto(l));
    c.lavori.forEach((l) => {
      l.altre_foto = (Array.isArray(l.altre_foto) ? l.altre_foto : [])
        .map((x) => (typeof x === 'string' ? x : x && x.foto)).filter(Boolean);
      l._it = { titolo: l.titolo, descrizione: l.descrizione };
    });
    c._it = { titolo: c.titolo, descrizione: c.descrizione };
    c.copertina = c.copertina || (c.lavori[0] && c.lavori[0].foto) || '';
    return c;
  })
  .filter((c) => !nascosto(c))   // categoria nascosta: niente pagina, menu, home né Novità
  .sort((a, b) => (a.ordine || 99) - (b.ordine || 99) || String(a.titolo).localeCompare(String(b.titolo), 'it'));

// ---- Novità: lavori con data di inserimento recente ----
const MOSTRA_NOVITA = sito.novita_attiva !== false;
const GIORNI_NOVITA = Math.max(1, parseInt(sito.novita_giorni, 10) || 30);
const OGGI = new Date();
const MESI = ['gennaio', 'febbraio', 'marzo', 'aprile', 'maggio', 'giugno', 'luglio', 'agosto', 'settembre', 'ottobre', 'novembre', 'dicembre'];
const recente = (d) => !!d && (OGGI - new Date(d + 'T00:00:00')) / 864e5 <= GIORNI_NOVITA;
categorie.forEach((c) => c.lavori.forEach((l) => {
  const m = String(l.data || '').match(/^(\d{4})-(\d{2})-(\d{2})/);
  l.data = m ? `${m[1]}-${m[2]}-${m[3]}` : '';
  l.categoria = c;
}));
const novita = MOSTRA_NOVITA
  ? categorie.flatMap((c) => c.lavori).filter((l) => recente(l.data)).sort((a, b) => b.data.localeCompare(a.data))
  : [];
// Date delle novità, dalla più recente: il browser le ricontrolla ogni giorno (src/script.js)
const dateNovita = () => ` data-novita-date="${novita.map((l) => l.data).join(',')}"`;

// ---- Testi del sito (modificabili dal pannello) ----
const TESTI_PREDEFINITI = {
  "occhiello_home": "Fatto a mano",
  "bottone_home": "Guarda i nostri lavori",
  "titolo_lavori": "I nostri lavori",
  "occhiello_chi_siamo": "Chi siamo",
  "titolo_chi_siamo": "Due persone, quattro mani",
  "titolo_contatti": "Scrivici",
  "testo_contatti": "Ti piace qualcosa o hai in mente un pezzo su misura? Contattaci, ti rispondiamo volentieri.",
  "piede": "Fatto a mano",
  "nessuna_foto": "Presto nuove foto.",
  "titolo_novita": "Novità",
  "testo_novita": "Gli ultimi lavori aggiunti, da tutte le categorie.",
  "etichetta_nuovo": "Nuovo",
  "nessuna_novita": "Al momento non ci sono novità: dai un'occhiata alle categorie!",
  "prezzo_vuoto": "Prezzo su richiesta",
  "bottone_chiedi": "Chiedi info"
};
const TESTI_PREDEFINITI_EN = {
  "occhiello_home": "Handmade",
  "bottone_home": "See our work",
  "titolo_lavori": "Our work",
  "occhiello_chi_siamo": "About us",
  "titolo_chi_siamo": "Two people, four hands",
  "titolo_contatti": "Get in touch",
  "testo_contatti": "Like something or have a custom piece in mind? Get in touch, we'll be happy to reply.",
  "piede": "Handmade",
  "nessuna_foto": "New photos coming soon.",
  "titolo_novita": "New",
  "testo_novita": "The latest additions, from every category.",
  "etichetta_nuovo": "New",
  "nessuna_novita": "Nothing new right now: have a look at the categories!",
  "prezzo_vuoto": "Price on request",
  "bottone_chiedi": "Ask for info"
};
// Testi fissi della lingua corrente: predefiniti + quelli scritti nel pannello («-» = nascosto).
// In inglese, una scritta nascosta in italiano resta nascosta se non ha un testo inglese.
function testiDellaLingua() {
  const t = { ...(IN_INGLESE() ? TESTI_PREDEFINITI_EN : TESTI_PREDEFINITI) };
  const metti = (o) => { for (const [k, v] of Object.entries(o || {})) if (pieno(v)) t[k] = v.trim() === '-' ? '' : v.trim(); };
  if (IN_INGLESE()) {
    for (const [k, v] of Object.entries(sitoIT.testi || {})) if (pieno(v) && v.trim() === '-') t[k] = '';
    metti(sitoIT.en && sitoIT.en.testi);
  } else metti(sitoIT.testi);
  return t;
}
let testi = testiDellaLingua();
const T = (k) => esc(testi[k]);

// Scritte del sito che non si cambiano dal pannello
const PAROLE = {
  it: {
    contatti: 'Contatti', menu_principale: 'Menu principale', apri_menu: 'Apri il menu', email: 'Email', negozio: 'Negozio online',
    lavoro: 'lavoro', lavori: 'lavori', vedi_tutte: 'Vedi tutte →', chi_siamo: 'Chi siamo', leggi_tutto: 'Leggi tutto ›',
    vedi_ig: 'Vedi su Instagram', ingrandisci: 'Ingrandisci', foto: 'foto', con_video: ', con video', video: 'Video',
    foto_ingrandita: 'Foto ingrandita', guarda_video: 'Guarda il video', video_caricato: 'Premendo ▶&#xFE0E; il video viene caricato da',
    foto_prec: 'Foto precedente', foto_succ: 'Foto successiva', su_questo: 'su questo lavoro', inquadra: 'Inquadra il codice con il telefono<br>oppure',
    apri_ig: 'Apri su Instagram', chiudi: 'Chiudi', a_chi: 'A chi vuoi scrivere?', annulla: 'Annulla', torna_su: 'Torna su',
    scrivici_wa: 'Scrivici su WhatsApp', non_trovata: 'Pagina non trovata', torna_home: 'Torna alla <a href="/">pagina principale</a>.',
    altra_lingua: 'EN', altra_lingua_nome: 'English version', anteprima: 'anteprima',
  },
  en: {
    contatti: 'Contact', menu_principale: 'Main menu', apri_menu: 'Open the menu', email: 'Email', negozio: 'Online shop',
    lavoro: 'piece', lavori: 'pieces', vedi_tutte: 'See all →', chi_siamo: 'About us', leggi_tutto: 'Read more ›',
    vedi_ig: 'See on Instagram', ingrandisci: 'Enlarge', foto: 'photos', con_video: ', with video', video: 'Video',
    foto_ingrandita: 'Enlarged photo', guarda_video: 'Watch the video', video_caricato: 'When you press ▶&#xFE0E; the video is loaded from',
    foto_prec: 'Previous photo', foto_succ: 'Next photo', su_questo: 'about this piece', inquadra: 'Scan the code with your phone<br>or',
    apri_ig: 'Open on Instagram', chiudi: 'Close', a_chi: 'Who would you like to write to?', annulla: 'Cancel', torna_su: 'Back to top',
    scrivici_wa: 'Message us on WhatsApp', non_trovata: 'Page not found', torna_home: 'Go back to the <a href="/en/">home page</a>.',
    altra_lingua: 'IT', altra_lingua_nome: 'Versione italiana', anteprima: 'preview',
  },
};
const P = (k) => PAROLE[LINGUA][k];
// Mostra un elemento solo se il suo testo non è stato nascosto con «-»
const se = (k, html) => (testi[k] ? html : '');

// ---- Statistiche visite (solo sul sito pubblicato, non in locale né nelle anteprime) ----
const PRODUZIONE = NETLIFY && (process.env.CONTEXT || 'production') === 'production';
function statistiche() {
  if (!PRODUZIONE || ANTEPRIMA) return '';
  const gc = String(sito.statistiche_goatcounter || '').trim().replace(/^https?:\/\//, '').replace(/\.goatcounter\.com.*$/, '');
  if (/^[a-z0-9-]+$/i.test(gc)) return `<script data-goatcounter="https://${gc}.goatcounter.com/count" async src="//gc.zgo.at/count.js"></script>`;
  const cf = String(sito.statistiche_cloudflare || '').trim();
  if (/^[a-f0-9]{20,}$/i.test(cf)) return `<script defer src="https://static.cloudflareinsights.com/beacon.min.js" data-cf-beacon='{"token": "${cf}"}'></script>`;
  return '';
}

// ---- Verifica Google Search Console: accetta il tag <meta> intero o solo il codice ----
function verificaGoogle() {
  const v = String(sito.google_verifica || '').trim();
  const codice = (v.match(/content\s*=\s*["']([^"']+)["']/i) || [null, v])[1].trim();
  return /^[A-Za-z0-9_-]{10,}$/.test(codice) ? `<meta name="google-site-verification" content="${codice}">` : '';
}

// ---- Temi grafici ----
const TEMI = {
  bottega: 'family=Cormorant+Garamond:wght@500;600&family=Jost:wght@400;500;600',
  catalogo: 'family=Outfit:wght@500;600;700&family=Nunito+Sans:opsz,wght@6..12,400;6..12,600;6..12,700',
  notte: 'family=Italiana&family=Jost:wght@300;400;500',
};
const PROPOSTE = process.argv.includes('--proposte');
const tema = TEMI[sito.tema] ? sito.tema : 'bottega';
const fontTemi = PROPOSTE ? Object.values(TEMI).join('&') : TEMI[tema];
const elencoPunti = (v) => (Array.isArray(v) ? v : []).map((x) => (typeof x === 'string' ? x : x && x.testo)).filter(pieno);
const puntiDellaLingua = () => {
  const it = elencoPunti(sitoIT.punti_forza);
  const en = elencoPunti(sitoIT.en && sitoIT.en.punti_forza);
  if (IN_INGLESE()) return en.length ? en : (it.length ? it : ['Handmade', 'One-of-a-kind pieces', 'Made to order']);
  return it.length ? it : ['Fatto a mano', 'Pezzi unici', 'Anche su misura'];
};
let puntiForza = puntiDellaLingua();

// Passa all'altra lingua: testi del sito, delle categorie e dei lavori (campo inglese vuoto = italiano)
const CAMPI_SITO_EN = ['nome', 'sottotitolo', 'descrizione_seo', 'avviso', 'citta', 'chi_siamo'];
function impostaLingua(l) {
  LINGUA = l;
  const en = (IN_INGLESE() && sitoIT.en) || {};
  sito = { ...sitoIT };
  for (const k of CAMPI_SITO_EN) if (pieno(en[k])) sito[k] = en[k];
  testi = testiDellaLingua();
  puntiForza = puntiDellaLingua();
  for (const c of categorie) {
    const ce = (IN_INGLESE() && c.en) || {};
    c.titolo = pieno(ce.titolo) ? ce.titolo.trim() : c._it.titolo;
    c.descrizione = pieno(ce.descrizione) ? ce.descrizione : c._it.descrizione;
    for (const lv of c.lavori) {
      const le = (IN_INGLESE() && lv.en) || {};
      lv.titolo = pieno(le.titolo) ? le.titolo.trim() : lv._it.titolo;
      lv.descrizione = pieno(le.descrizione) ? le.descrizione : lv._it.descrizione;
    }
  }
}
const iconePunti = [
  '<path d="M12 21c-4-3-8-6.5-8-11a4.5 4.5 0 0 1 8-2.8A4.5 4.5 0 0 1 20 10c0 4.5-4 8-8 11z"/>',
  '<path d="M12 3l2.6 5.3 5.9.9-4.3 4.1 1 5.8L12 16.4 6.8 19.1l1-5.8L3.5 9.2l5.9-.9z"/>',
  '<path d="M4 20l4-1 11-11-3-3L5 16zM14 6l3 3"/>',
  '<path d="M3 7h13v10H3zM16 10h3l2 3v4h-5M7 19a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3zm11 0a1.5 1.5 0 1 0 0-3 1.5 1.5 0 0 0 0 3z"/>',
];

// ---- Instagram e QR code ----
let QRCode = null;
try { QRCode = require('qrcode'); } catch (e) { console.warn('Attenzione: libreria "qrcode" non installata (npm install): i QR code non verranno creati.'); }
function normalizzaInstagram(v) {
  v = String(v || '').trim();
  if (!v) return '';
  if (/^https?:\/\//i.test(v)) return v;
  if (/^(www\.)?instagram\.com\//i.test(v)) return 'https://' + v;
  const nome = v.replace(/^@/, '');
  if (/^[A-Za-z0-9._]{1,30}$/.test(nome)) return `https://www.instagram.com/${nome}/`;
  return '';
}
// Video da mostrare nel sito: prima il link YouTube del lavoro, se manca il reel di Instagram.
// L'interruttore «Nascondi il video dal sito» acceso = nessun video (resta il link Instagram).
// Il video si carica solo quando il visitatore preme ▶ (niente dati a Google/Meta prima).
function videoInstagram(url) {
  const m = String(url || '').match(/instagram\.com\/(?:[A-Za-z0-9._]+\/)?(reels?|tv)\/([A-Za-z0-9_-]+)/i);
  return m ? { src: `https://www.instagram.com/${m[1].toLowerCase() === 'tv' ? 'tv' : 'reel'}/${m[2]}/embed/`, da: 'Instagram', forma: 'verticale' } : null;
}
function videoYouTube(url) {
  const v = String(url || '').trim();
  const m = v.match(/(?:youtu\.be\/|youtube(?:-nocookie)?\.com\/(?:watch\?(?:.*&)?v=|embed\/|shorts\/|live\/|v\/))([A-Za-z0-9_-]{11})/i);
  if (!m) { if (v) console.warn(`  ! link YouTube non riconosciuto: ${v}`); return null; }
  // Avvio automatico dopo il clic su ▶; rel=0: a fine video solo video dello stesso canale
  return { src: `https://www.youtube-nocookie.com/embed/${m[1]}?autoplay=1&rel=0&playsinline=1`, da: 'YouTube', forma: /\/shorts\//i.test(v) ? 'verticale' : 'orizzontale' };
}
function videoDelLavoro(l) {
  if (l.nascondi_video === true || l.nascondi_video === 'true') return null;
  return videoYouTube(l.youtube) || videoInstagram(l.instagram);
}
const codiciQR = {};
async function preparaQR() {
  for (const c of categorie) for (const l of c.lavori) {
    l.instagram = normalizzaInstagram(l.instagram);
    l.video = videoDelLavoro(l);
    if (l.instagram && QRCode && !codiciQR[l.instagram]) {
      codiciQR[l.instagram] = await QRCode.toString(l.instagram, { type: 'svg', margin: 1, errorCorrectionLevel: 'M', color: { dark: '#2a2420ff', light: '#ffffffff' } });
    }
  }
}
const iconaInstagram = '<svg class="icona-ig" viewBox="0 0 24 24" width="16" height="16" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/></svg>';

// ---- WhatsApp: uno o più numeri, ognuno con il suo nome ----
function numeroWA(v) {
  let d = String(v || '').trim();
  if (!d || /[_a-z]/i.test(d)) return '';           // numeri incompleti o mascherati: niente link rotti
  d = d.replace(/[^\d+]/g, '');
  if (d.startsWith('+')) d = d.slice(1);
  else if (d.startsWith('00')) d = d.slice(2);
  else if (/^[03]\d{5,10}$/.test(d)) d = '39' + d;   // numero italiano senza prefisso
  return /^\d{10,15}$/.test(d) ? d : '';
}
const numeriWA = (Array.isArray(sito.whatsapp) && sito.whatsapp.length
  ? sito.whatsapp.map((x) => (typeof x === 'string' ? { numero: x } : x || {}))
  : String(sito.telefono || '').split(/\s[-–]\s|[,;]|\s+e\s+/).map((n) => ({ numero: n })))
  .map((x) => ({ nome: String(x.nome || '').trim(), testo: String(x.numero || '').trim(), numero: numeroWA(x.numero) }))
  .filter((x) => x.numero);
const PUO_CHIEDERE = numeriWA.length > 0 || !!sito.email;
const iconaWA = '<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round"><path d="M20.5 11.6a8.6 8.6 0 0 1-12.7 7.5L3.5 20.5l1.4-4.1a8.6 8.6 0 1 1 15.6-4.8z"/><path d="M9 8.6c.2-.4.4-.5.7-.5h.5c.2 0 .4.1.5.4l.6 1.5c.1.2 0 .5-.1.6l-.5.6c.6 1.2 1.5 2.1 2.7 2.7l.6-.5c.2-.2.4-.2.6-.1l1.5.6c.3.1.4.3.4.5v.5c0 .3-.1.5-.5.7-.6.4-1.5.5-2.4.2-2.2-.8-3.9-2.5-4.7-4.7-.3-.9-.2-1.8.2-2.4z" fill="currentColor" stroke="none"/></svg>';

// ---- Indirizzi di immagini e pagine ----
const cacheDati = {};
// Tutte le foto, cercate anche nelle sottocartelle (immagini/bomboniere/, immagini/sito/, …),
// così una foto spostata in un'altra cartella si trova lo stesso, purché il nome del file sia uguale.
const fotoPerNome = {};
(function elenca(dir) {
  if (!fs.existsSync(path.join(RADICE, dir))) return;
  for (const n of fs.readdirSync(path.join(RADICE, dir), { withFileTypes: true })) {
    const rel = dir + '/' + n.name;
    if (n.isDirectory()) elenca(rel);
    else if (!fotoPerNome[n.name]) fotoPerNome[n.name] = rel;
  }
})('immagini');
const fotoAvvisate = new Set();
function trovaFoto(rel) {
  if (fs.existsSync(path.join(RADICE, rel))) return rel;
  const altrove = fotoPerNome[path.basename(rel)];
  if (!fotoAvvisate.has(rel)) {
    fotoAvvisate.add(rel);
    console.warn(altrove ? `  ! foto ${rel} trovata in ${altrove}` : `  ! foto mancante: ${rel}`);
  }
  return altrove || rel;
}
function immagine(p, larghezza, livello) {
  if (!p) return '';
  if (/^https?:\/\//.test(p)) return p;
  const rel = trovaFoto(p.replace(/^\/+/, ''));
  if (ANTEPRIMA) {
    if (!cacheDati[rel]) {
      const ext = path.extname(rel).slice(1).toLowerCase().replace('jpg', 'jpeg');
      const f = path.join(RADICE, rel);
      cacheDati[rel] = fs.existsSync(f) ? `data:image/${ext};base64,` + fs.readFileSync(f).toString("base64") : "";
    }
    return cacheDati[rel];
  }
  if (NETLIFY && larghezza) return `/.netlify/images?url=${encodeURIComponent('/' + rel)}&w=${larghezza}`;
  return '../'.repeat(livello) + rel;
}
function collegamento(slug, livello) {
  if (ANTEPRIMA) return '#' + (slug || 'home');
  // «livello» conta anche la cartella della lingua (/en/): i link alle pagine restano nella stessa lingua
  return '../'.repeat(livello - PROFONDITA()) + (slug ? slug + '/' : '') || './';
}
// Link alla stessa pagina nell'altra lingua
function altraLingua(attiva, livello) {
  const pagina = attiva ? attiva + '/' : '';
  const href = '../'.repeat(livello) + (IN_INGLESE() ? '' : 'en/') + pagina || './';
  const lingua = IN_INGLESE() ? 'it' : 'en';
  return `href="${href}" hreflang="${lingua}" lang="${lingua}" aria-label="${P('altra_lingua_nome')}"`;
}

// Icone dei contatti, nello stesso stile (linea sottile) di quella di WhatsApp
const iconaContatto = (corpo) => `<svg viewBox="0 0 24 24" width="18" height="18" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">${corpo}</svg>`;
const iconaEmail = iconaContatto('<rect x="3" y="5" width="18" height="14" rx="2.5"/><path d="M3.8 6.5 12 12.8l8.2-6.3"/>');
const iconaIG = iconaContatto('<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none"/>');
const iconaFB = iconaContatto('<rect x="3" y="3" width="18" height="18" rx="5"/><path d="M15.5 8.2h-1.6c-1.2 0-1.9.7-1.9 1.9V21M9.5 13h5.5"/>');
const iconaNegozio = iconaContatto('<path d="M5 8h14l-1.2 11.2a2 2 0 0 1-2 1.8H8.2a2 2 0 0 1-2-1.8z"/><path d="M9 10V7a3 3 0 0 1 6 0v3"/>');

// ---- Pezzi comuni ----
function testata(attiva, livello) {
  const voci = (novita.length ? `<a href="${collegamento('novita', livello)}"${attiva === 'novita' ? ' aria-current="page"' : ''}${dateNovita()}>${T('titolo_novita')}</a>` : '')
    + categorie.map((c) =>
    `<a href="${collegamento(c.slug, livello)}"${attiva === c.slug ? ' aria-current="page"' : ''}>${esc(c.titolo)}</a>`).join('');
  const marchio = sito.logo
    ? `<img class="logo logo-scuro" src="${immagine(sito.logo, 0, livello)}" alt="${esc(sito.nome)}"><img class="logo logo-chiaro" src="${immagine(sito.logo_chiaro || sito.logo, 0, livello)}" alt="${esc(sito.nome)}">`
    : esc(sito.nome);
  const avviso = sito.avviso || puntiForza.join(' · ');
  return `${avviso ? `<div class="avviso-top">${esc(avviso)}</div>` : ''}<header class="testata"><div class="contenitore">
  <a class="marchio" href="${collegamento('', livello)}">${marchio}</a>
  <nav class="menu" aria-label="${P('menu_principale')}">${voci}<a class="voce-contatti" href="#contatti">${P('contatti')}</a>${ANTEPRIMA ? '' : `<a class="voce-lingua" ${altraLingua(attiva, livello)}>${P('altra_lingua')}</a>`}</nav>
  ${ANTEPRIMA ? '' : `<a class="lingua-telefono" ${altraLingua(attiva, livello)}>${P('altra_lingua')}</a>`}<button type="button" class="apri-menu" aria-expanded="false" aria-controls="menu-telefono" aria-label="${P('apri_menu')}"><svg viewBox="0 0 24 24" width="26" height="26" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round"><path class="riga-1" d="M4 7h16"/><path class="riga-2" d="M4 12h16"/><path class="riga-3" d="M4 17h16"/></svg></button>
</div></header>
${menuTelefono(attiva, livello)}`;
}

// Menu del telefono: si apre con ☰; ogni voce ha la foto di copertina della categoria
function menuTelefono(attiva, livello) {
  const voce = (slug, titolo, foto, quanti, extra = '') => `<a href="${collegamento(slug, livello)}"${attiva === slug ? ' aria-current="page"' : ''}${extra}>${foto ? `<img src="${immagine(foto, 160, livello)}" alt="" loading="lazy">` : '<span class="senza-foto" aria-hidden="true"></span>'}<span class="nome">${esc(titolo)}</span><small>${quanti}</small><span class="freccia" aria-hidden="true">›</span></a>`;
  // Per Novità: le foto di tutte le novità, così il browser mostra quella della più recente ancora valida
  const voci = (novita.length ? voce('novita', T('titolo_novita'), novita[0].foto, novita.length,
      dateNovita() + ` data-novita-foto="${esc(novita.map((l) => immagine(l.foto, 160, livello)).join('|'))}"`) : '')
    + categorie.map((c) => voce(c.slug, c.titolo, c.copertina || (c.lavori[0] && c.lavori[0].foto), c.lavori.length)).join('');
  const contatti = [
    ...numeriWA.map((n) => `<a class="wa" href="https://wa.me/${n.numero}" target="_blank" rel="noopener">${iconaWA}${numeriWA.length > 1 ? esc(n.nome || n.testo) : 'WhatsApp'}</a>`),
    sito.email ? `<a href="mailto:${esc(sito.email)}">${iconaEmail}${P('email')}</a>` : '',
    `<a href="#contatti">${P('contatti')}</a>`,
  ].join('');
  return `<div class="menu-telefono" id="menu-telefono" hidden><nav aria-label="Menu">${voci}</nav><div class="contatti-rapidi">${contatti}</div></div>`;
}

function contatti() {
  const voci = [];
  if (sito.email) voci.push(`<a href="mailto:${esc(sito.email)}">${iconaEmail}${esc(sito.email)}</a>`);
  for (const n of numeriWA) voci.push(`<a class="wa" href="https://wa.me/${n.numero}" target="_blank" rel="noopener">${iconaWA}WhatsApp ${esc(n.nome || n.testo)}</a>`);
  if (sito.instagram) voci.push(`<a href="${esc(sito.instagram)}" target="_blank" rel="noopener">${iconaIG}Instagram</a>`);
  if (sito.facebook) voci.push(`<a href="${esc(sito.facebook)}" target="_blank" rel="noopener">${iconaFB}Facebook</a>`);
  if (sito.etsy) voci.push(`<a href="${esc(sito.etsy)}" target="_blank" rel="noopener">${iconaNegozio}${P('negozio')}</a>`);
  return `<section class="sezione contatti" id="contatti"><div class="contenitore">
  ${se('titolo_contatti', `<h2>${T('titolo_contatti')}</h2>`)}
  ${paragrafi(testi.testo_contatti)}
  <div class="lista">${voci.join('')}</div>
</div></section>
<footer class="piede"><div class="contenitore">© ${new Date().getFullYear()} ${esc(sito.nome)}${sito.citta ? ' · ' + esc(sito.citta) : ''}${testi.piede ? ' · ' + T('piede') : ''}</div></footer>`;
}

const visore = () => `<dialog class="visore" aria-label="${P('foto_ingrandita')}"><div class="area"><div class="sfondo" aria-hidden="true"></div>
  <div class="finestra-foto"><span class="quadro"><img alt=""></span><div class="video" hidden><button type="button" class="play" aria-label="${P('guarda_video')}">▶&#xFE0E;</button><p class="avviso-video">${P('video_caricato')} <span class="video-da">Instagram</span></p></div><button class="prec" aria-label="${P('foto_prec')}">‹</button><button class="succ" aria-label="${P('foto_succ')}">›</button></div><div class="didascalia"><div class="testi"><strong></strong><span class="desc"></span><em class="contatore"></em>${PUO_CHIEDERE ? `<a class="bottone-chiedi" href="#contatti" data-chiedi="">${iconaWA}${T('bottone_chiedi')} ${P('su_questo')}</a>` : ''}</div>
  <div class="social" hidden><div class="codice-qr"></div><div><small>${P('inquadra')}</small><a class="bottone-ig" target="_blank" rel="noopener">${iconaInstagram}${P('apri_ig')}</a></div></div></div></div>
  <button class="chiudi" aria-label="${P('chiudi')}">×</button>
</dialog>`;

// ---- Contenuto delle pagine ----
function corpoHome(livello) {
  const schede = categorie.map((c) => `<a class="scheda" href="${collegamento(c.slug, livello)}">
    <div class="foto">${c.copertina ? `<img src="${immagine(c.copertina, 700, livello)}" alt="${esc(c.titolo)}" loading="lazy">` : ''}</div>
    <h3>${esc(c.titolo)}</h3>${c.descrizione ? `<p>${formatta(String(c.descrizione).replace(/\n\s*\n/g, '\n'))}</p>` : ''}
    <span class="conta">${c.lavori.length} ${c.lavori.length === 1 ? P('lavoro') : P('lavori')} →</span></a>`).join('\n');
  return `<section class="apertura"><div class="contenitore">
  <div>${se('occhiello_home', `<p class="occhiello">${T('occhiello_home')}${sito.citta ? ' · ' + esc(sito.citta) : ''}</p>`)}
    ${sito.logo ? `<img class="logo-grande" src="${immagine(sito.logo_chiaro || sito.logo, 0, livello)}" alt="">` : ''}<h1>${esc(sito.nome)}</h1>${sito.sottotitolo ? `<p class="sotto">${esc(sito.sottotitolo)}</p>` : ''}
    ${se('bottone_home', `<a class="bottone" href="#lavori">${T('bottone_home')}</a>`)}</div>
  ${sito.immagine_copertina ? `<div class="cornice"><img src="${immagine(sito.immagine_copertina, 900, livello)}" alt="${esc(sito.nome)}"></div>` : ''}
</div></section>
<section class="punti"><div class="contenitore"><ul>${puntiForza.map((t, i) => `<li><svg viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linejoin="round" aria-hidden="true">${iconePunti[i % iconePunti.length]}</svg>${esc(t)}</li>`).join('')}</ul></div></section>
${novita.length ? `<section class="sezione novita-home" data-novita-sezione><div class="contenitore">
  <div class="intestazione"><h2>${T('titolo_novita')}</h2><a class="vedi-tutte" href="${collegamento('novita', livello)}">${P('vedi_tutte')}</a></div>
  <div class="galleria galleria-novita" data-solo-novita>${novita.slice(0, 4).map((l) => figura(l, livello, true)).join('\n')}</div>
</div></section>` : ''}
<section class="sezione" id="lavori"><div class="contenitore">
  ${se('titolo_lavori', `<div class="intestazione"><h2>${T('titolo_lavori')}</h2></div>`)}
  <div class="categorie">${schede}</div>
</div></section>
${sito.chi_siamo ? `<section class="sezione" id="chi-siamo"><div class="contenitore chi-siamo">
  ${sito.foto_chi_siamo ? `<div class="foto"><img src="${immagine(sito.foto_chi_siamo, 700, livello)}" alt="${P('chi_siamo')}" loading="lazy"></div>` : '<div></div>'}
  <div>${se('occhiello_chi_siamo', `<p class="occhiello">${T('occhiello_chi_siamo')}</p>`)}${se('titolo_chi_siamo', `<h2>${T('titolo_chi_siamo')}</h2>`)}${paragrafiFormattati(sito.chi_siamo)}</div>
</div></section>` : ''}`;
}

function figura(l, livello, conCategoria) {
  const c = l.categoria;
  const nuovo = recente(l.data);
  const didascalia = [
    conCategoria ? `<a class="cat" href="${collegamento(c.slug, livello)}">${esc(c.titolo)}</a>` : '',
    l.titolo ? `<strong>${esc(l.titolo)}</strong>` : '',
    l.descrizione ? `<span class="desc">${formattaInRiga(l.descrizione)}</span><a class="leggi" href="#" hidden>${P('leggi_tutto')}</a>` : '',
    l.prezzo ? `<span class="prezzo">${esc(l.prezzo)}</span>` : (testi.prezzo_vuoto ? `<span class="prezzo su-richiesta">${T('prezzo_vuoto')}</span>` : ''),
  ].join('');
  const azioni = [
    PUO_CHIEDERE && testi.bottone_chiedi ? `<a class="chiedi" href="#contatti" data-chiedi="${esc(l.titolo || c.titolo)}">${iconaWA}${T('bottone_chiedi')}</a>` : '',
    l.instagram ? `<a class="ig" href="${esc(l.instagram)}" target="_blank" rel="noopener" aria-label="${P('vedi_ig')}">${iconaInstagram}Instagram</a>` : '',
  ].join('');
  return `<figure class="lavoro"${l.data ? ` data-data="${l.data}"` : ''}>
    <button type="button" data-grande="${immagine(l.foto, 1800, livello)}" data-titolo="${esc(l.titolo)}" data-testo="${esc([formattaInRiga(l.descrizione), esc(l.prezzo)].filter(Boolean).join(' · '))}" data-instagram="${esc(l.instagram)}"${l.video ? ` data-video="${esc(l.video.src)}" data-video-da="${l.video.da}" data-video-forma="${l.video.forma}"` : ''} data-altre="${esc(l.altre_foto.map((f) => immagine(f, 1800, livello)).join('|'))}" aria-label="${P('ingrandisci')} ${esc(l.titolo || P('foto'))}${l.altre_foto.length ? ` (${l.altre_foto.length + 1} ${P('foto')})` : ''}${l.video ? P('con_video') : ''}">
      <img src="${immagine(l.foto, 800, livello)}" alt="${esc(l.titolo || c.titolo)}" loading="lazy"><span class="luce" aria-hidden="true"></span>${l.altre_foto.length || l.video ? `<span class="etichette">${l.altre_foto.length ? `<span class="piu-foto">+${l.altre_foto.length} ${P('foto')}</span>` : ''}${l.video ? `<span class="ha-video">▶&#xFE0E; ${P('video')}</span>` : ''}</span>` : ''}${nuovo && MOSTRA_NOVITA && testi.etichetta_nuovo ? `<span class="nuovo">${T('etichetta_nuovo')}</span>` : ''}</button>
    ${didascalia || azioni ? `<figcaption>${didascalia}${azioni ? `<div class="azioni">${azioni}</div>` : ''}</figcaption>` : ''}
    ${l.instagram && codiciQR[l.instagram] ? `<template class="qr">${codiciQR[l.instagram]}</template>` : ''}
  </figure>`;
}

function corpoNovita(livello) {
  return `<section class="titolo-pagina"><div class="contenitore">
  <div class="briciole"><a href="${collegamento('', livello)}">${esc(sito.nome)}</a> / ${T('titolo_novita')}</div>
  <h1>${T('titolo_novita')}</h1>${testi.testo_novita ? `<p>${T('testo_novita')}</p>` : ''}
</div></section>
<section><div class="contenitore"><div class="galleria galleria-novita" data-solo-novita>${novita.map((l) => figura(l, livello, true)).join('\n')}</div>
<p class="vuoto novita-vuoto"${novita.length ? ' hidden' : ''}>${T('nessuna_novita')}</p></div></section>`;
}

function corpoCategoria(c, livello) {
  const lavori = c.lavori.map((l) => figura(l, livello, false)).join('\n');
  return `<section class="titolo-pagina"><div class="contenitore">
  <div class="briciole"><a href="${collegamento('', livello)}">${esc(sito.nome)}</a> / ${esc(c.titolo)}</div>
  <h1>${esc(c.titolo)}</h1>${c.descrizione ? `<div class="descrizione-categoria">${paragrafiFormattati(c.descrizione)}</div>` : ''}
</div></section>
<section><div class="contenitore">${lavori ? `<div class="galleria">${lavori}</div>` : `<p class="vuoto">${T('nessuna_foto')}</p>`}</div></section>`;
}

// ---- Documento completo ----
function documento({ titolo, descrizione, corpo, livello, percorso, foto, extraTesta = '', script }) {
  // «percorso» è lo stesso nelle due lingue (es. taglieri/): l'inglese sta sotto en/
  const indirizzo = (l) => urlBase + '/' + (l === 'en' ? 'en/' : '') + percorso;
  const canonico = urlBase ? indirizzo(LINGUA) : '';
  // Per Google: la stessa pagina nell'altra lingua (non per la pagina 404)
  const alternative = urlBase && !ANTEPRIMA && percorso !== '404.html'
    ? ['it', 'en'].map((l) => `<link rel="alternate" hreflang="${l}" href="${esc(indirizzo(l))}">`).join('') + `<link rel="alternate" hreflang="x-default" href="${esc(indirizzo('it'))}">`
    : '';
  const og = foto && urlBase ? urlBase + '/' + foto.replace(/^\/+/, '') : '';
  const sameAs = [sito.instagram, sito.facebook, sito.etsy].filter((u) => u && /^https?:\/\/.+\/.+/.test(u));
  const jsonld = { '@context': 'https://schema.org', '@type': 'Organization', name: sito.nome, description: sito.descrizione_seo || undefined, url: urlBase || undefined, email: sito.email || undefined, sameAs: sameAs.length ? sameAs : undefined };
  const css = ANTEPRIMA ? `<style>${fs.readFileSync(path.join(RADICE, 'src/stile.css'), 'utf8')}</style>` : `<link rel="stylesheet" href="${'../'.repeat(livello)}stile.css">`;
  const js = ANTEPRIMA ? `<script>${fs.readFileSync(path.join(RADICE, 'src/script.js'), 'utf8')}</script>` : `<script src="${'../'.repeat(livello)}script.js" defer></script>`;
  return `<!DOCTYPE html>
<html lang="${LINGUA}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<title>${esc(titolo)}</title>
<meta name="description" content="${esc(descrizione)}">
${canonico ? `<link rel="canonical" href="${esc(canonico)}">` : ''}
${alternative}
<meta property="og:type" content="website">
<meta property="og:title" content="${esc(titolo)}">
<meta property="og:description" content="${esc(descrizione)}">
${og ? `<meta property="og:image" content="${esc(og)}">` : ''}
<meta property="og:locale" content="${IN_INGLESE() ? 'en_GB' : 'it_IT'}">
${verificaGoogle()}
<link rel="preconnect" href="https://fonts.googleapis.com"><link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link rel="stylesheet" href="https://fonts.googleapis.com/css2?${fontTemi}&display=swap">
${css}
<script type="application/ld+json">${JSON.stringify(jsonld)}</script>
${extraTesta}
</head>
<body class="tema-${tema}" data-novita-giorni="${MOSTRA_NOVITA ? GIORNI_NOVITA : 0}" data-whatsapp="${esc(JSON.stringify(numeriWA.map((n) => ({ n: n.nome || n.testo, w: n.numero }))))}" data-email="${esc(sito.email || '')}">
${corpo}
${visore()}
<dialog class="scelta" aria-label="${P('a_chi')}"><p>${P('a_chi')}</p><div class="voci"></div><button type="button" class="annulla">${P('annulla')}</button></dialog>
<div class="flottanti"><button type="button" class="torna-su" aria-label="${P('torna_su')}"><svg viewBox="0 0 24 24" width="20" height="20" aria-hidden="true" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 19V5M5 12l7-7 7 7"/></svg></button>${numeriWA.length ? `<a class="wa-fisso" href="#contatti" data-chiedi="" aria-label="${P('scrivici_wa')}">${iconaWA}</a>` : ''}</div>
${js}${script || ''}
${statistiche()}
</body>
</html>
`;
}

// ---- Costruzione ----
preparaQR().then(costruisci).catch((e) => { console.error(e); process.exit(1); });
function costruisci() {
const selettore = `<div class="selettore-proposte" role="group" aria-label="Proposte grafiche"><span>Proposta:</span>
<button data-tema="bottega" aria-pressed="true"><b>1</b> Bottega</button><button data-tema="catalogo"><b>2</b> Catalogo</button><button data-tema="notte"><b>3</b> Notte</button></div>
<style>.selettore-proposte{position:fixed;left:50%;bottom:14px;transform:translateX(-50%);z-index:50;display:flex;align-items:center;gap:4px;background:#111;color:#fff;padding:6px;border-radius:999px;box-shadow:0 6px 24px rgba(0,0,0,.3);font:500 14px/1 system-ui,sans-serif}
.selettore-proposte span{padding:0 8px 0 10px;opacity:.7}.selettore-proposte button{all:unset;cursor:pointer;padding:9px 14px;border-radius:999px;white-space:nowrap}
.selettore-proposte button b{display:inline-grid;place-items:center;width:20px;height:20px;border-radius:50%;background:#333;margin-right:6px;font-size:12px}
.selettore-proposte button[aria-pressed=true]{background:#c9a54a;color:#111}.selettore-proposte button[aria-pressed=true] b{background:#111;color:#c9a54a}
@media(max-width:520px){.selettore-proposte span{display:none}.selettore-proposte button{padding:9px 10px}}</style>
<script>(function(){var bs=document.querySelectorAll('.selettore-proposte button');bs.forEach(function(b){b.addEventListener('click',function(){document.body.className='tema-'+b.dataset.tema;bs.forEach(function(x){x.setAttribute('aria-pressed',x===b)});});});})();</script>`;
if (ANTEPRIMA) {
  const pagine = [`<div data-pagina="home">${testata('', 0)}${corpoHome(0)}</div>`]
    .concat(categorie.map((c) => `<div data-pagina="${c.slug}" hidden>${testata(c.slug, 0)}${corpoCategoria(c, 0)}</div>`))
    .concat(MOSTRA_NOVITA ? [`<div data-pagina="novita" hidden>${testata('novita', 0)}${corpoNovita(0)}</div>`] : []);
  const router = `<script>(function(){var pagine=[].slice.call(document.querySelectorAll('[data-pagina]'));
function vai(){var h=(location.hash||'#home').slice(1);var p=pagine.filter(function(x){return x.getAttribute('data-pagina')===h})[0];
var el=!p&&document.getElementById(h);if(!p)p=el?(el.closest('[data-pagina]')||null):null;if(!p&&!el)p=pagine[0];
if(p){pagine.forEach(function(x){x.hidden=x!==p});}if(el){el.scrollIntoView();}else{window.scrollTo(0,0);}}
window.addEventListener('hashchange',vai);vai();})();</script>`;
  const html = documento({ titolo: sito.nome + ' — anteprima', descrizione: sito.descrizione_seo, corpo: pagine.join('\n') + contatti(), livello: 0, percorso: '', script: router + (PROPOSTE ? selettore : '') });
  fs.writeFileSync(path.join(RADICE, 'anteprima.html'), html);
  console.log('Anteprima creata: anteprima.html (' + Math.round(html.length / 1024) + ' KB)');
  process.exit(0);
}

fs.rmSync(USCITA, { recursive: true, force: true });
fs.mkdirSync(USCITA, { recursive: true });
const scrivi = (rel, testo) => { const f = path.join(USCITA, rel); fs.mkdirSync(path.dirname(f), { recursive: true }); fs.writeFileSync(f, testo); };
const copia = (da, a) => fs.cpSync(path.join(RADICE, da), path.join(USCITA, a), { recursive: true });

// Reindirizza i link di invito/recupero password del pannello verso /admin/
const invito = `<script>if(/(invite|recovery|confirmation|email_change)_token=/.test(location.hash)){location.replace('/admin/'+location.hash);}</script>`;

// Le pagine, prima in italiano (nella radice) e poi in inglese (in en/)
for (const lingua of ['it', 'en']) {
  impostaLingua(lingua);
  const cartella = IN_INGLESE() ? 'en/' : '';
  const su = PROFONDITA();   // livelli in più per le pagine inglesi
  scrivi(cartella + 'index.html', documento({
    titolo: sito.nome + (sito.sottotitolo ? ' — ' + sito.sottotitolo : ''),
    descrizione: sito.descrizione_seo || sito.sottotitolo || '',
    corpo: testata('', su) + corpoHome(su) + contatti(), livello: su, percorso: '', foto: sito.immagine_copertina, extraTesta: IN_INGLESE() ? '' : invito,
  }));
  for (const c of categorie) {
    scrivi(cartella + c.slug + '/index.html', documento({
      titolo: `${c.titolo} — ${sito.nome}`,
      descrizione: testoSemplice(c.descrizione) || sito.descrizione_seo || '',
      corpo: testata(c.slug, 1 + su) + corpoCategoria(c, 1 + su) + contatti(), livello: 1 + su, percorso: c.slug + '/', foto: c.copertina,
    }));
  }
  if (MOSTRA_NOVITA) {
    scrivi(cartella + 'novita/index.html', documento({
      titolo: `${testi.titolo_novita || (IN_INGLESE() ? 'New' : 'Novità')} — ${sito.nome}`,
      descrizione: testi.testo_novita || sito.descrizione_seo || '',
      corpo: testata('novita', 1 + su) + corpoNovita(1 + su) + contatti(), livello: 1 + su, percorso: 'novita/', foto: novita[0] && novita[0].foto,
    }));
  }
}
// Pagina «non trovata» (una sola, in italiano: Netlify la usa per ogni indirizzo inesistente)
impostaLingua('it');
scrivi('404.html', documento({
  titolo: P('non_trovata') + ' — ' + sito.nome, descrizione: '', livello: 0, percorso: '404.html',
  corpo: testata('', 0) + `<section class="titolo-pagina"><div class="contenitore"><h1>${P('non_trovata')}</h1><p>${P('torna_home')}</p></div></section>` + contatti(),
}).replace(/href="(stile\.css|script\.js)"/g, 'href="/$1"').replace(/src="script\.js"/, 'src="/script.js"').replace(/href="en\/"/g, 'href="/en/"'));

copia('src/stile.css', 'stile.css');
copia('src/script.js', 'script.js');
copia('immagini', 'immagini');
copia('admin', 'admin');
// File di verifica di Google Search Console (google….html nella cartella principale): vanno pubblicati così come sono
for (const f of fs.readdirSync(RADICE)) if (/^google[a-z0-9]+\.html$/i.test(f)) copia(f, f);
scrivi('admin/tema.js', `window.TEMA_SITO = ${JSON.stringify(tema)};\nwindow.NETLIFY_IMMAGINI = ${NETLIFY};\n`);

if (urlBase) {
  const indirizzi = [''].concat(MOSTRA_NOVITA ? ['novita/'] : [], categorie.map((c) => c.slug + '/'));
  // Ogni pagina in italiano e in inglese, con il collegamento tra le due lingue
  const alternative = (u) => ['it', 'en'].map((l) => `<xhtml:link rel="alternate" hreflang="${l}" href="${esc(urlBase + '/' + (l === 'en' ? 'en/' : '') + u)}"/>`).join('');
  const voci = indirizzi.flatMap((u) => ['', 'en/'].map((pre) => `  <url><loc>${esc(urlBase + '/' + pre + u)}</loc>${alternative(u)}</url>`));
  scrivi('sitemap.xml', `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">\n${voci.join('\n')}\n</urlset>\n`);
  scrivi('robots.txt', `User-agent: *\nDisallow: /admin/\nSitemap: ${urlBase}/sitemap.xml\n`);
} else {
  scrivi('robots.txt', 'User-agent: *\nDisallow: /admin/\n');
}
console.log(`Sito creato in _site/ (italiano + inglese in en/): home + ${categorie.length} categorie (${categorie.reduce((n, c) => n + c.lavori.length, 0)} lavori, ${Object.keys(codiciQR).length} QR code).`);
}
