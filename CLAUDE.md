# Istruzioni per Claude

## Pubblicazione: MAI pubblicare su Netlify

- Ogni push su `main` fa partire una pubblicazione su Netlify, che consuma crediti.
  Le pubblicazioni le decide e le fa solo la proprietaria del sito.
- Ogni commit che Claude fa su questo repository deve avere **`[skip netlify]`**
  alla fine della prima riga del messaggio, senza eccezioni.
- Claude rende disponibili le modifiche su GitHub perché vengano scaricate in locale
  con `git pull`. Non deve mai cercare di pubblicare il sito.
- Prima di ogni push, controllare che **tutti** i commit da inviare abbiano
  `[skip netlify]` (`git log origin/main..HEAD --format=%s`).

## Messaggi di commit

- In italiano: una prima riga che riassume, poi un elenco puntato di cosa cambia
  per chi usa il sito.

## Prove

- Costruire il sito con `node build.js` (crea `_site/`, che non va nel repository)
  e controllare con un browser headless, sia su computer sia su telefono.
