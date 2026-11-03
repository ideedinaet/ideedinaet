# Il vostro sito vetrina

Sito semplice e veloce, con un **pannello di gestione** (`/admin`) dove potete,
senza toccare codice:

- aggiungere, rinominare, riordinare o eliminare **categorie** (Taglieri, Lavori in carta, Profumato, …);
- caricare **foto** dei lavori, con titolo, descrizione e prezzo facoltativo;
- modificare nome, testo "Chi siamo", foto principale e **contatti** (email, WhatsApp, Instagram, Facebook, Etsy).

Ogni volta che salvate dal pannello, il sito si aggiorna da solo in 1–2 minuti.
Hosting gratuito su Netlify.

---

## Messa online (una volta sola, ~20 minuti)

1. **GitHub** – Create un account gratuito su github.com, poi un nuovo repository
   (es. `bottega`) e caricate tutto il contenuto di questa cartella
   ("Add file → Upload files", trascinando i file e le cartelle).
2. **Netlify** – Create un account gratuito su netlify.com accedendo con GitHub.
   "Add new site → Import an existing project → GitHub" e scegliete il repository.
   Le impostazioni si leggono da sole (`netlify.toml`): premete **Deploy**.
3. **Accesso al pannello** – Su Netlify, nel vostro sito:
   - *Project configuration → Identity* → **Enable Identity**;
   - in *Registration* scegliete **Invite only** (così nessun altro può registrarsi);
   - in *Services → Git Gateway* → **Enable Git Gateway**;
   - in *Identity → Invite users* invitate le vostre due email.
   Cliccate il link nell'email, scegliete una password: si apre il pannello.
4. **Indirizzo del sito** – Netlify vi dà un indirizzo tipo `bottega.netlify.app`
   (rinominabile in *Site configuration → Change site name*). Se volete un dominio
   vostro (es. `bottegaquattromani.it`, ~10–15 €/anno) lo collegate in *Domain management*.
5. **Inserite l'indirizzo nel pannello** – In *Impostazioni del sito → Indirizzo del sito*
   scrivete l'indirizzo completo (es. `https://bottega.netlify.app`): serve a generare
   la mappa del sito per Google.

## Farvi trovare su Google

- Andate su **Google Search Console** (search.google.com/search-console), aggiungete
  il sito e inviate la sitemap: `https://IL-VOSTRO-SITO/sitemap.xml`.
- Mettete il link del sito nella bio di Instagram/Facebook: aiuta molto.
- Facoltativo ma utile: una scheda gratuita su **Google Business Profile**.
- Usate titoli e descrizioni concrete nelle foto (es. "Tagliere in noce con manico"):
  sono testi che Google legge.

## Uso quotidiano

**Bozze e pubblicazione.** Nel pannello «Salva» crea una *bozza*: il sito vero non cambia
e non si consumano crediti Netlify. Dopo qualche minuto in alto compare **«Controlla l'anteprima»**,
un link gratuito per vedere la bozza com'è. Quando siete soddisfatti premete **Pubblica → Pubblica ora**:
solo allora il sito si aggiorna (ogni pubblicazione costa 15 crediti, circa 20 al mese nel piano gratuito).
Conviene fare più modifiche e pubblicarle insieme. Le bozze in sospeso si vedono in **Flusso editoriale**.

Aprite `https://IL-VOSTRO-SITO/admin/` (funziona anche dal telefono):
- **Categorie** → scegliete una categoria → **Lavori** → "Aggiungi lavoro" → caricate la foto → **Pubblica**.
- Per una nuova categoria: **Categorie → Nuova categoria**. Comparirà nel menu e in home.
- Il numero "Posizione nel menu" decide l'ordine delle categorie.
- **Link Instagram** di un lavoro (facoltativo): incollate il link del post
  (su Instagram: ··· → Copia link) oppure scrivete `@nomeprofilo`. Sul sito compare
  "Vedi su Instagram" sotto la foto e, aprendo la foto in grande dal computer,
  un QR code da inquadrare con il telefono.

Le foto dal telefono vanno benissimo: il sito le ridimensiona automaticamente
(servizio immagini di Netlify) per caricarsi veloci.

## Per chi vuole smanettare

- `content/` contiene i testi (file JSON), `immagini/` le foto.
- `npm install` una volta (installa la libreria dei QR code; su Netlify avviene da solo).
- `node build.js` genera il sito in `_site/`; `node build.js --anteprima` crea un
  unico `anteprima.html` da aprire nel browser.
- Colori e caratteri si cambiano in cima a `src/stile.css`.

## Lavorare sul proprio computer (veloce e gratis)

Si usa lo stesso pannello, ma sul computer: ogni modifica si vede subito e **non consuma crediti**.
Alla fine si manda tutto online insieme = **una sola pubblicazione**.

**Preparazione (una volta sola)**
1. Serve **Node.js 20 o più recente**. Se sul computer avete una versione più vecchia che vi serve per altro,
   scaricate da https://nodejs.org la versione LTS per Windows **in formato .zip** ed estraetela in `C:\node-sito`
   (deve esistere `C:\node-sito\node.exe`): il file di avvio la userà solo per il sito, senza toccare le altre.
   Cartella diversa? Scrivetene il percorso in un file `percorso-node.txt` nella cartella del sito.
2. Installate **GitHub Desktop** da https://desktop.github.com ed entrate con l'account *ideedinaet*.
3. In GitHub Desktop: *File → Clone repository → ideedinaet/ideedinaet* e scegliete una cartella.

**Ogni volta**
1. In GitHub Desktop premete **Fetch origin / Pull origin** (prende le ultime modifiche online).
2. Nella cartella del sito fate doppio clic su **avvia-sito-locale.bat** (la prima volta scarica i componenti: un paio di minuti).
3. Si apre il pannello su `http://localhost:8080/admin/` (niente password). Modificate e premete **Pubblica**:
   il file si salva sul computer e il sito su `http://localhost:8080` si aggiorna da solo
   (in basso a sinistra c'è la scritta blu *VERSIONE LOCALE*).
4. Quando avete finito: in GitHub Desktop scrivete una breve descrizione, premete **Commit to main** e poi **Push origin**.
   Netlify pubblica tutto in 1–2 minuti, con **una sola** pubblicazione.
5. Chiudete la finestra nera del programma (o Ctrl + C).

Consiglio: non usate contemporaneamente il pannello online e quello locale, per non creare versioni diverse.
- **WhatsApp**: in *Impostazioni del sito → WhatsApp* aggiungete uno o due numeri, ognuno con il
  nome da mostrare sul pulsante (es. «Andrea» e 347 1234567). Con i numeri compilati compaiono:
  i pulsanti «WhatsApp Andrea» nei contatti, il pulsante verde fisso sul telefono e, sotto ogni
  lavoro, **«Chiedi info»**, che apre WhatsApp con un messaggio già scritto che nomina il lavoro
  (con due numeri il visitatore sceglie a chi scrivere). Senza numeri, «Chiedi info» apre l'email.
- Se un lavoro non ha prezzo compare «Prezzo su richiesta» (modificabile in *Testi del sito*).
