/**
 * TEMPORAIRE — diagnostic de Netlify Blobs, à retirer une fois le problème trouvé.
 * Ne renvoie que des résultats et des durées : aucun jeton ni valeur de configuration.
 */
import { getStore } from '@netlify/blobs';

export const dynamic = 'force-dynamic';

const WAIT_MS = 6000;

type PatchedFetch = typeof fetch & { _nextOriginalFetch?: typeof fetch };

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

export async function GET() {
  const current = globalThis.fetch as PatchedFetch;
  const original = current._nextOriginalFetch;
  const noStore = ((input: Parameters<typeof fetch>[0], init?: RequestInit) =>
    current(input, { ...init, cache: 'no-store' })) as typeof fetch;
  const absent = 'cle-inexistante';

  const results = await Promise.all([
    timed('A. fetch par défaut, clé absente', () => getStore('divina-content').get(absent, { type: 'json' })),
    timed('B. fetch d’origine, clé absente', () =>
      original ? getStore({ name: 'divina-content', fetch: original }).get(absent, { type: 'json' }) : Promise.reject(new Error('indisponible')),
    ),
    timed('C. fetch no-store, clé absente', () => getStore({ name: 'divina-content', fetch: noStore }).get(absent, { type: 'json' })),
    timed('D. photo, fetch par défaut, clé absente', () => getStore('divina-images').getWithMetadata(absent, { type: 'arrayBuffer' })),
    timed('E. photo, fetch d’origine, clé absente', () =>
      original ? getStore({ name: 'divina-images', fetch: original }).getWithMetadata(absent, { type: 'arrayBuffer' }) : Promise.reject(new Error('indisponible')),
    ),
  ]);
  return Response.json({ hasOriginalFetch: Boolean(original), results }, { headers: { 'Cache-Control': 'no-store' } });
}
