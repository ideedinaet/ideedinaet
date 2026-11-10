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

## Sito in inglese

Il sito ha anche una versione in inglese all'indirizzo `/en/` (es. `https://ideedinaet.it/en/taglieri/`).
In alto a destra il pulsante **EN** / **IT** porta alla stessa pagina nell'altra lingua.

- Ogni lavoro e ogni categoria ha in fondo una sezione **«In inglese (facoltativo)»**, chiusa:
  apritela per scrivere titolo e descrizione in inglese. Foto, prezzo, Instagram e video sono gli stessi.
- In *Impostazioni del sito* c'è la sezione **«Versione inglese del sito»** (frase sotto il nome,
  «Chi siamo», punti di forza, descrizione per Google, scritte fisse delle pagine).
- **Un campo inglese vuoto non è un problema**: sul sito inglese compare il testo italiano.
  Potete quindi aggiungere un lavoro come sempre e tradurlo quando avete tempo.
- Anche il messaggio già scritto di «Ask for info» (WhatsApp o email) è in inglese.
- Google trova le due versioni da solo: la mappa del sito contiene entrambe le lingue.

## Codice dei lavori

Ogni lavoro ha un **codice breve** (es. `BIG-02`, `TAG-05`): prime tre lettere della categoria + un numero.
Compare nei messaggi WhatsApp ed email di chi preme «Chiedi info», così sapete di quale lavoro si parla
anche se due hanno lo stesso titolo:

> Ciao! Mi interessa «Biglietto Auguri Natale» (codice BIG-02), che ho visto sul vostro sito …

- Nel pannello il codice è nell'elenco dei lavori (sotto il titolo, insieme a data e numero di foto)
  e nel campo **Codice** del lavoro. Nella casella di ricerca si può cercare anche per codice.
- I lavori nuovi ricevono il codice da soli al salvataggio. Si può cambiare, ma ogni lavoro deve averne uno diverso.

## «Mi piace» ai lavori

Sotto ogni lavoro c'è un cuore ♡: i visitatori possono mettere «mi piace» (uno per browser; premendo di nuovo lo tolgono).
Il numero compare solo da 4 like in su (si cambia in *Impostazioni del sito → Mostra il numero di «mi piace» da*);
sotto, si vede solo il cuore. Sito italiano e inglese contano insieme.

- **Classifica:** nel pannello, pulsante **♥ Classifica** in alto (oppure `https://ideedinaet.it/admin/classifica.html`).
- **Dove stanno i conteggi:** su Netlify (funzione `netlify/functions/mi-piace.mjs`, archivio «mi-piace» di Netlify Blobs).
  Si salva solo il numero di like di ogni lavoro: nessun dato personale, nessun cookie.
- **Costo:** ogni pagina aperta e ogni like è una piccola richiesta a Netlify: per un sito come questo, pochi crediti al mese.
- **Ogni lavoro ha un identificativo fisso** (campo nascosto `id`, assegnato dal pannello al salvataggio):
  i like restano al lavoro anche se si cambiano foto, titolo o categoria.
- **In locale** i cuori funzionano, ma i conteggi sono di prova e si azzerano chiudendo la finestra del sito locale.
- Per spegnerli: *Impostazioni del sito → Mostra i «mi piace» sui lavori*.
- **I tuoi preferiti:** dal primo cuore, nel menu compare ♥ con il numero (sul telefono: «I tuoi preferiti» nel menu ☰).
  La pagina `/preferiti/` (e `/en/preferiti/`) mostra i lavori a cui il visitatore ha messo il cuore, dal più recente,
  con il pulsante «Chiedi info su questi lavori» che apre WhatsApp con l'elenco già scritto.
  L'elenco resta solo in quel browser (non arriva a voi né a Netlify) e la pagina non va su Google.
- **Avviso sull'uso dei dati:** in fondo a ogni pagina e nella pagina dei preferiti c'è una riga che spiega che
  «mi piace» e preferiti restano solo nel browser. Il testo si cambia in *Impostazioni del sito → Testi del sito*
  (e nella sezione inglese).

## Uso quotidiano

**Bozze e pubblicazione.** Nel pannello «Salva» crea una *bozza*: il sito vero non cambia
e non si consumano crediti Netlify. Dopo qualche minuto in alto compare **«Controlla l'anteprima»**,
un link gratuito per vedere la bozza com'è. Quando siete soddisfatti premete **Pubblica → Pubblica ora**:
solo allora il sito si aggiorna (ogni pubblicazione costa 15 crediti, circa 20 al mese nel piano gratuito).
Conviene fare più modifiche e pubblicarle insieme. Le bozze in sospeso si vedono in **Flusso editoriale**.

Aprite `https://IL-VOSTRO-SITO/admin/` (funziona anche dal telefono):
- **Categorie** → scegliete una categoria → **Lavori** → "Aggiungi lavoro" → caricate la foto → **Pubblica**.
- Per una nuova categoria: **Categorie → Nuova categoria**. Comparirà nel menu e in home.
- **Lavori a due colonne**: dentro una categoria, a sinistra c'è l'elenco dei lavori (foto, titolo,
  data, numero di foto) e a destra si modifica solo il lavoro selezionato. Cliccate un lavoro
  nell'elenco per aprirlo; con ‹ › passate al precedente o al successivo; con ▲ ▼ ne cambiate
  l'ordine; «Cerca per titolo…» filtra l'elenco; «Elimina» chiede conferma prima di cancellare.
  Le «Altre foto» sono affiancate in riquadri: trascinatele dalla maniglia in alto per riordinarle.
  Con l'anteprima chiusa (icona dell'occhio, in alto a destra) c'è più spazio.
- Il numero "Posizione nel menu" decide l'ordine delle categorie.
- **Nascondi dal sito**: ogni lavoro e ogni categoria ha questo interruttore. Se è attivo,
  il lavoro (o la categoria con tutti i suoi lavori) sparisce dal sito ma resta salvato
  nel pannello, dove compare con «⛔ NASCOSTO». Basta spegnerlo per rimostrarlo.
- **Link Instagram** di un lavoro (facoltativo): incollate il link del post
  (su Instagram: ··· → Copia link) oppure scrivete `@nomeprofilo`. Sul sito compare
  "Vedi su Instagram" sotto la foto e, aprendo la foto in grande dal computer,
  un QR code da inquadrare con il telefono.

Le foto dal telefono vanno benissimo: il sito le ridimensiona automaticamente
(servizio immagini di Netlify) per caricarsi veloci.

**Cartelle delle foto.** Ogni categoria ha la sua cartella dentro `immagini/`, con lo stesso nome
della categoria: `immagini/bomboniere/`, `immagini/taglieri/`, `immagini/profumatori/`, …
- Quando caricate una foto dentro una categoria, finisce **da sola** nella sua cartella, e
  scegliendo una foto vedete solo quelle di quella categoria.
- Per una **categoria nuova** la cartella si crea da sola al primo caricamento: scrivete prima il
  nome della categoria, poi caricate le foto.
- Logo, foto della home e di «Chi siamo» (*Impostazioni del sito*) stanno in `immagini/sito/`.
- `immagini/non-usate/` contiene le vecchie foto che il sito non usa: si possono cancellare.
- Se rinominate una categoria, le foto già caricate restano dove sono e quelle nuove vanno in una
  cartella col nome nuovo: il sito le trova comunque.

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

**Da un altro computer o dal telefono di casa**: all'avvio la finestra nera mostra anche un indirizzo
del tipo `http://192.168.1.20:8080/admin/`. Apritelo dall'altro dispositivo, collegato alla stessa rete.
La prima volta Windows può chiedere di consentire *Node.js* nel firewall: rispondete Sì per le **reti private**.
Finché la finestra è aperta, chiunque sia sulla vostra rete può modificare i contenuti: usatelo solo a casa.
- **WhatsApp**: in *Impostazioni del sito → WhatsApp* aggiungete uno o due numeri, ognuno con il
  nome da mostrare sul pulsante (es. «Andrea» e 347 1234567). Con i numeri compilati compaiono:
  i pulsanti «WhatsApp Andrea» nei contatti, il pulsante verde fisso sul telefono e, sotto ogni
  lavoro, **«Chiedi info»**, che apre WhatsApp con un messaggio già scritto che nomina il lavoro
  (con due numeri il visitatore sceglie a chi scrivere). Senza numeri, «Chiedi info» apre l'email.
- Se un lavoro non ha prezzo compare «Prezzo su richiesta» (modificabile in *Testi del sito*).
- **Grassetto e corsivo** (descrizione delle categorie, descrizione dei lavori e «Chi siamo»): selezionate le parole e premete
  **G** (grassetto) o **C** (corsivo) sopra il campo, oppure Ctrl+B / Ctrl+I. Funzionano anche
  `**parola**` e `*parola*` scritti a mano (in modalità «Markdown» del campo) e i tag `<b>…</b>`, `<i>…</i>`.
