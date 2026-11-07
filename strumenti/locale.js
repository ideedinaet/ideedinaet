#!/usr/bin/env node
/*
 * Sito e pannello SUL VOSTRO COMPUTER — nessun deploy, nessun credito Netlify.
 *   npm run locale   (oppure doppio clic su "avvia-sito-locale.bat" su Windows)
 *
 * - Sito:     http://localhost:8080
 * - Pannello: http://localhost:8080/admin/   (le modifiche si salvano subito nei file di questa cartella)
 * Ogni modifica rigenera il sito e la pagina si ricarica da sola.
 * Quando avete finito: GitHub Desktop → Commit → Push = UNA sola pubblicazione su Netlify.
 */
const http = require('http');
const fs = require('fs');
const path = require('path');
const { spawn, exec } = require('child_process');

const RADICE = path.join(__dirname, '..');
const SITO = path.join(RADICE, '_site');
const net = require('net');

// Trova una porta libera a partire da quella preferita (8080, 8081, ... se occupate)
function portaLibera(da, esclusa) {
  return new Promise((ok) => {
    const prova = (p) => {
      if (p === esclusa) return prova(p + 1);
      const srv = net.createServer();
      srv.once('error', () => prova(p + 1));
      srv.once('listening', () => srv.close(() => ok(p)));
      srv.listen(p, '127.0.0.1');
    };
    prova(da);
  });
}

// Sistema i percorsi delle foto nei contenuti: se una foto indicata non c'è più in quella
// cartella ma esiste (una sola volta) in un'altra cartella di immagini/, aggiorna il percorso.
// Così nel pannello le anteprime non restano vuote dopo che le foto sono state spostate.
function sistemaPercorsiFoto() {
  const perNome = {};
  (function elenca(dir) {
    for (const n of fs.readdirSync(path.join(RADICE, dir), { withFileTypes: true })) {
      if (n.isDirectory()) elenca(dir + '/' + n.name);
      else (perNome[n.name] = perNome[n.name] || []).push('/' + dir + '/' + n.name);
    }
  })('immagini');
  const file = ['content/sito.json'].concat(fs.readdirSync(path.join(RADICE, 'content/categorie'))
    .filter((f) => f.endsWith('.json')).map((f) => 'content/categorie/' + f));
  let tot = 0;
  for (const f of file) {
    const p = path.join(RADICE, f);
    if (!fs.existsSync(p)) continue;
    const prima = fs.readFileSync(p, 'utf8');
    const dopo = prima.replace(/"(\/immagini\/[^"?]+)"/g, (t, rif) => {
      if (fs.existsSync(path.join(RADICE, rif))) return t;
      const trovate = perNome[path.basename(rif)] || [];
      if (trovate.length !== 1) return t;
      tot++;
      console.log(`  Foto spostata: ${rif}  →  ${trovate[0]}`);
      return `"${trovate[0]}"`;
    });
    if (dopo !== prima) fs.writeFileSync(p, dopo);
  }
  if (tot) console.log(`  Aggiornati ${tot} percorsi di foto (da salvare poi con GitHub Desktop).\n`);
}
try { sistemaPercorsiFoto(); } catch (e) { console.warn('  Controllo percorsi foto non riuscito:', e.message); }

(async () => {
const PORTA = await portaLibera(Number(process.env.PORTA_SITO || 8080));
const PORTA_PANNELLO = await portaLibera(8081, PORTA);

// ---- 1. Server locale del pannello (scrive i file nella cartella) ----
const binDecap = path.join(RADICE, 'node_modules', 'decap-server', 'dist', 'index.js');
if (!fs.existsSync(binDecap)) {
  console.error('\nManca qualcosa: eseguite prima  npm install  (il file .bat lo fa da solo).\n');
  process.exit(1);
}
const decap = spawn(process.execPath, [binDecap], {
  cwd: RADICE,
  env: { ...process.env, PORT: String(PORTA_PANNELLO), MODE: 'fs', GIT_REPO_DIRECTORY: RADICE, DECAP_NO_BROWSER: '1', LOG_LEVEL: 'warn' },
  stdio: ['ignore', 'inherit', 'inherit'],
});

// ---- 2. Generazione del sito (all'avvio e a ogni modifica) ----
let inCorso = false, daRifare = false, clienti = [];
function genera() {
  if (inCorso) { daRifare = true; return; }
  inCorso = true;
  const t0 = Date.now();
  const p = spawn(process.execPath, ['build.js'], { cwd: RADICE, env: { ...process.env, NETLIFY: '' }, stdio: ['ignore', 'pipe', 'inherit'] });
  p.stdout.on('data', () => {});
  p.on('close', (codice) => {
    inCorso = false;
    if (codice === 0) {
      console.log(`  ✓ sito aggiornato (${Date.now() - t0} ms)`);
      clienti.forEach((r) => r.write('data: ricarica\n\n'));
    } else console.log('  ✗ errore nella generazione del sito (vedi sopra)');
    if (daRifare) { daRifare = false; genera(); }
  });
}
let timer = null;
function cambiato(_, file) {
  if (file && /(^|[\\/])(\.|_site|node_modules)/.test(file)) return;
  clearTimeout(timer); timer = setTimeout(genera, 300);
}
for (const d of ['content', 'immagini', 'src', 'admin']) {
  try { fs.watch(path.join(RADICE, d), { recursive: true }, cambiato); } catch (e) { fs.watch(path.join(RADICE, d), cambiato); }
}
fs.watch(path.join(RADICE, 'build.js'), cambiato);

// ---- 3. Server del sito ----
const TIPI = { '.html': 'text/html; charset=utf-8', '.css': 'text/css', '.js': 'text/javascript', '.json': 'application/json', '.svg': 'image/svg+xml', '.png': 'image/png', '.jpg': 'image/jpeg', '.jpeg': 'image/jpeg', '.webp': 'image/webp', '.gif': 'image/gif', '.xml': 'application/xml', '.txt': 'text/plain', '.yml': 'text/yaml', '.ico': 'image/x-icon' };
const ricarica = `<script>try{new EventSource('/__ricarica').onmessage=function(){location.reload()}}catch(e){}</script>`;
const avviso = `<div style="position:fixed;left:12px;bottom:12px;z-index:9999;background:#2563eb;color:#fff;font:600 12px system-ui;padding:6px 10px;border-radius:6px;opacity:.9">VERSIONE LOCALE — non è online</div>`;

http.createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0]);
  if (url === '/__ricarica') {
    res.writeHead(200, { 'Content-Type': 'text/event-stream', 'Cache-Control': 'no-cache', Connection: 'keep-alive' });
    res.write('\n'); clienti.push(res);
    req.on('close', () => { clienti = clienti.filter((c) => c !== res); });
    return;
  }
  // Il pannello in locale usa il server locale (niente login, niente bozze: si salva direttamente nei file)
  if (url === '/admin/config.yml') {
    let cfg = fs.readFileSync(path.join(RADICE, 'admin', 'config.yml'), 'utf8');
    // Il pannello parla con il server locale passando da questa stessa porta (vedi /api/v1 sotto),
    // così funziona anche da un altro computer della rete di casa (http://192.168.x.x:8080/admin/)
    const host = String(req.headers.host || `localhost:${PORTA}`).replace(/[^\w.:\-\[\]]/g, '');
    const nome = host.replace(/:\d+$/, '').replace(/^\[|\]$/g, '');
    cfg = cfg.replace(/^publish_mode:.*$/m, '').replace(/^backend:/m, `local_backend:\n  url: http://${host}/api/v1\n  allowed_hosts: ["${nome}"]\nbackend:`);
    res.writeHead(200, { 'Content-Type': 'text/yaml; charset=utf-8', 'Cache-Control': 'no-store' });
    return res.end(cfg);
  }
  // Inoltra le richieste del pannello al server locale (che accetta solo connessioni da questo computer)
  if (url.startsWith('/api/v1')) {
    const intestazioni = { ...req.headers, host: `localhost:${PORTA_PANNELLO}` };
    delete intestazioni.origin; delete intestazioni.referer;
    const inoltro = http.request({ host: '127.0.0.1', port: PORTA_PANNELLO, path: req.url, method: req.method, headers: intestazioni }, (r) => {
      res.writeHead(r.statusCode, r.headers); r.pipe(res);
    });
    inoltro.on('error', () => { if (!res.headersSent) res.writeHead(502); res.end(); });
    return req.pipe(inoltro);
  }
  let file = path.join(SITO, url);
  if (!file.startsWith(SITO)) { res.writeHead(403); return res.end(); }
  if (fs.existsSync(file) && fs.statSync(file).isDirectory()) file = path.join(file, 'index.html');
  if (!fs.existsSync(file)) {
    // Le foto appena caricate dal pannello: servile direttamente dalla cartella immagini
    const orig = path.join(RADICE, url);
    if (url.startsWith('/immagini/') && fs.existsSync(orig)) file = orig;
    else { res.writeHead(404, { 'Content-Type': 'text/html; charset=utf-8' }); return res.end('<p>Pagina non trovata. <a href="/">Torna al sito</a></p>'); }
  }
  const ext = path.extname(file).toLowerCase();
  res.writeHead(200, { 'Content-Type': TIPI[ext] || 'application/octet-stream', 'Cache-Control': 'no-store' });
  if (ext === '.html' && !url.startsWith('/admin')) {
    return res.end(fs.readFileSync(file, 'utf8').replace('</body>', avviso + ricarica + '</body>'));
  }
  fs.createReadStream(file).pipe(res);
}).listen(PORTA, () => {
  console.log(`\n  Sito locale:     http://localhost:${PORTA}`);
  console.log(`  Pannello locale: http://localhost:${PORTA}/admin/\n`);
  // Indirizzi per aprire sito e pannello da un altro computer o telefono della stessa rete di casa
  const ip = Object.values(require('os').networkInterfaces()).flat()
    .filter((i) => i && i.family === 'IPv4' && !i.internal).map((i) => i.address);
  if (ip.length) {
    console.log('  Da un altro computer o telefono della stessa rete:');
    ip.forEach((a) => console.log(`    http://${a}:${PORTA}/admin/`));
    console.log('  (Attenzione: chiunque sia collegato alla vostra rete può modificare i contenuti finché questa finestra è aperta.)\n');
  }
  console.log('  Lasciate aperta questa finestra mentre lavorate. Per chiudere: Ctrl + C.\n');
  if (!process.env.NON_APRIRE) {
    const cmd = process.platform === 'win32' ? `start "" "http://localhost:${PORTA}/admin/"` : process.platform === 'darwin' ? `open http://localhost:${PORTA}/admin/` : `xdg-open http://localhost:${PORTA}/admin/`;
    setTimeout(() => exec(cmd, () => {}), 1500);
  }
});
genera();

process.on('SIGINT', () => { decap.kill(); process.exit(0); });
})();
