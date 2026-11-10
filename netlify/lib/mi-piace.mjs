// Logica dei «mi piace» ai lavori, usata dalla funzione Netlify (netlify/functions/mi-piace.mjs)
// e dal sito locale (strumenti/locale.js, con un archivio in memoria).
//
// Tutti i conteggi stanno in un solo oggetto JSON { "id-del-lavoro": numero, ... }.
// Le scritture sono «condizionali»: se due persone premono il cuore nello stesso istante,
// la seconda rilegge il valore aggiornato e riprova, così nessun like va perso.
//
// Non si salva nessun dato personale: solo il numero di like di ogni lavoro.

const CHIAVE = 'conteggi';
// Identificativo di un lavoro, es. "taglieri/fg1-1" (vedi idLavoro in build.js)
const ID_VALIDO = /^[a-z0-9][a-z0-9/_-]{0,99}$/;
// Limite di sicurezza: oltre questo numero di lavori diversi non si accettano nuovi identificativi
const MASSIMO_LAVORI = 3000;

const json = (dati, stato = 200) => new Response(JSON.stringify(dati), {
  status: stato,
  headers: { 'Content-Type': 'application/json; charset=utf-8', 'Cache-Control': 'no-store' },
});
const pausa = (ms) => new Promise((r) => setTimeout(r, ms));

export async function leggiConteggi(archivio) {
  const r = await archivio.getWithMetadata(CHIAVE, { type: 'json' });
  return r && r.data && typeof r.data === 'object' ? { dati: r.data, etag: r.etag } : { dati: {}, etag: null };
}

// Aggiunge (+1) o toglie (-1) un like e restituisce il nuovo conteggio del lavoro
export async function cambiaConteggio(archivio, id, differenza) {
  for (let tentativo = 0; tentativo < 8; tentativo++) {
    const { dati, etag } = await leggiConteggi(archivio);
    if (!(id in dati) && Object.keys(dati).length >= MASSIMO_LAVORI) throw new Error('troppi lavori');
    const nuovo = Math.max(0, (Number(dati[id]) || 0) + differenza);
    const nuovi = { ...dati, [id]: nuovo };
    if (nuovo === 0) delete nuovi[id];
    const r = await archivio.setJSON(CHIAVE, nuovi, etag ? { onlyIfMatch: etag } : { onlyIfNew: true });
    if (!r || r.modified !== false) return nuovo;
    await pausa(40 * (tentativo + 1) + Math.random() * 60);
  }
  throw new Error('archivio occupato');
}

// GET  → { "id": numero, ... } con tutti i conteggi
// POST { "id": "...", "azione": "aggiungi" | "togli" } → { "id": "...", "conteggio": numero }
export async function rispondi(richiesta, archivio) {
  // Solo dal sito stesso (i browser mandano «Origin» nelle richieste POST)
  const origine = richiesta.headers.get('origin');
  if (origine && new URL(origine).host !== new URL(richiesta.url).host) return json({ errore: 'origine non ammessa' }, 403);

  try {
    if (richiesta.method === 'GET') return json((await leggiConteggi(archivio)).dati);
    if (richiesta.method !== 'POST') return json({ errore: 'metodo non ammesso' }, 405);

    let corpo;
    try { corpo = await richiesta.json(); } catch { return json({ errore: 'richiesta non valida' }, 400); }
    const id = corpo && typeof corpo.id === 'string' ? corpo.id : '';
    const differenza = corpo && corpo.azione === 'aggiungi' ? 1 : corpo && corpo.azione === 'togli' ? -1 : 0;
    if (!ID_VALIDO.test(id) || !differenza) return json({ errore: 'richiesta non valida' }, 400);

    return json({ id, conteggio: await cambiaConteggio(archivio, id, differenza) });
  } catch (e) {
    console.error('mi-piace:', e && e.message);
    return json({ errore: 'non disponibile' }, 503);
  }
}

// Archivio in memoria con la stessa interfaccia di Netlify Blobs (per il sito locale e le prove)
export function archivioInMemoria() {
  let valore = null;
  let versione = 0;
  return {
    async getWithMetadata() { return valore === null ? null : { data: JSON.parse(valore), etag: String(versione), metadata: {} }; },
    async setJSON(_chiave, dati, opzioni = {}) {
      if (opzioni.onlyIfNew && valore !== null) return { modified: false };
      if (opzioni.onlyIfMatch && opzioni.onlyIfMatch !== String(versione)) return { modified: false };
      valore = JSON.stringify(dati); versione++;
      return { modified: true, etag: String(versione) };
    },
  };
}
