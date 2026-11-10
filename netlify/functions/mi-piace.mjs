// Funzione Netlify per i «mi piace» ai lavori: risponde su /api/mi-piace.
// I conteggi sono salvati in Netlify Blobs (archivio «mi-piace»), senza dati personali.
// La logica è in netlify/lib/mi-piace.mjs.
import { getStore } from '@netlify/blobs';
import { rispondi } from '../lib/mi-piace.mjs';

export default async (richiesta) => rispondi(richiesta, getStore({ name: 'mi-piace', consistency: 'strong' }));

export const config = {
  path: '/api/mi-piace',
  // Al massimo 60 richieste al minuto dallo stesso indirizzo: basta per chi naviga, frena chi abusa
  rateLimit: { windowLimit: 60, windowSize: 60, aggregateBy: ['ip', 'domain'] },
};
