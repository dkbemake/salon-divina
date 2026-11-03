/**
 * TEMPORAIRE — diagnostic de Netlify Blobs, à retirer une fois le problème trouvé.
 * Ne renvoie que des résultats et des durées : aucun jeton ni valeur de configuration.
 */
import { getStore } from '@netlify/blobs';

export const dynamic = 'force-dynamic';

const WAIT_MS = 6000;

async function timed(label: string, run: () => Promise<unknown>) {
  const started = Date.now();
  const outcome = await Promise.race([
    run().then(
      (value) => (value === null ? 'réussi : null' : 'réussi : données'),
      (error: Error) => `erreur : ${error.name} ${error.message?.slice(0, 200)}`,
    ),
    new Promise<string>((resolve) => setTimeout(() => resolve('BLOQUÉ'), WAIT_MS)),
  ]);
  return { label, outcome, ms: Date.now() - started };
}

/** Lit entièrement le corps des réponses d'erreur avant de les rendre à Blobs. */
const buffered = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  const res = await fetch(input, init);
  if (res.status < 400) return res;
  return new Response(await res.arrayBuffer(), { status: res.status, statusText: res.statusText, headers: res.headers });
}) as typeof fetch;

/** Annule directement le corps, comme le fait Blobs, et mesure si cela se termine. */
const cancelling = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
  const res = await fetch(input, init);
  await res.body?.cancel();
  return new Response(null, { status: res.status === 200 ? 204 : res.status, headers: res.headers });
}) as typeof fetch;

export async function GET() {
  const absent = 'cle-inexistante';
  const results = await Promise.all([
    timed('F. corps lu d’abord, contenu, clé absente', () => getStore({ name: 'divina-content', fetch: buffered }).get(absent, { type: 'json' })),
    timed('G. corps lu d’abord, photo, clé absente', () => getStore({ name: 'divina-images', fetch: buffered }).getWithMetadata(absent, { type: 'arrayBuffer' })),
    timed('H. corps lu d’abord, clé « site »', () => getStore({ name: 'divina-content', fetch: buffered }).get('site', { type: 'json' })),
    timed('I. fetch par défaut, clé « site »', () => getStore('divina-content').get('site', { type: 'json' })),
    timed('J. annulation seule, sans Blobs autour', async () => {
      const store = getStore({ name: 'divina-content', fetch: cancelling });
      return store.get(absent, { type: 'text' });
    }),
  ]);
  return Response.json({ results }, { headers: { 'Cache-Control': 'no-store' } });
}
