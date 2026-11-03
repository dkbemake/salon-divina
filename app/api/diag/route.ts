/**
 * TEMPORAIRE — diagnostic de Netlify Blobs, à retirer une fois le problème trouvé.
 * Ne renvoie que des codes HTTP, des durées et des noms de champs : aucun jeton,
 * aucune URL signée ni valeur de configuration.
 */
import { getStore } from '@netlify/blobs';

export const dynamic = 'force-dynamic';

const WAIT_MS = 12000;

type PatchedFetch = typeof fetch & { __nextPatched?: boolean; _nextOriginalFetch?: typeof fetch };

function hostOf(input: unknown): string {
  try {
    return new URL(String(input)).host;
  } catch {
    return 'invalide';
  }
}

async function probe(label: string, baseFetch: typeof fetch) {
  const attempts: Record<string, unknown>[] = [];
  const spy = (async (input: Parameters<typeof fetch>[0], init?: RequestInit) => {
    const started = Date.now();
    const host = hostOf(input);
    try {
      const res = await baseFetch(input, init);
      attempts.push({
        host,
        status: res.status,
        ms: Date.now() - started,
        rateLimitReset: res.headers.get('x-ratelimit-reset'),
        retryAfter: res.headers.get('retry-after'),
        // Le corps des erreurs seulement : un 200 contient le contenu du site.
        body: res.ok ? undefined : (await res.clone().text()).slice(0, 300),
      });
      return res;
    } catch (error) {
      const err = error as Error & { cause?: { code?: string; message?: string } };
      attempts.push({
        host,
        ms: Date.now() - started,
        error: err.name,
        message: err.message?.slice(0, 200),
        cause: err.cause?.code ?? err.cause?.message?.slice(0, 200),
      });
      throw error;
    }
  }) as typeof fetch;

  const started = Date.now();
  const outcome = await Promise.race([
    (async () => {
      try {
        const store = getStore({ name: 'divina-content', fetch: spy });
        const data = await store.get('site', { type: 'text' });
        return data === null ? 'réussi : aucune donnée enregistrée' : 'réussi : données présentes';
      } catch (error) {
        return `erreur : ${(error as Error).name} ${(error as Error).message?.slice(0, 300)}`;
      }
    })(),
    new Promise<string>((resolve) => setTimeout(() => resolve(`pas de résultat après ${WAIT_MS} ms`), WAIT_MS)),
  ]);
  return { label, outcome, ms: Date.now() - started, attempts };
}

function contextShape() {
  const fromGlobal = (globalThis as { netlifyBlobsContext?: string }).netlifyBlobsContext;
  const raw = fromGlobal ?? process.env.NETLIFY_BLOBS_CONTEXT;
  if (!raw) return { source: 'absent' };
  try {
    const parsed = JSON.parse(Buffer.from(raw, 'base64').toString('utf8')) as Record<string, unknown>;
    return {
      source: fromGlobal ? 'globalThis' : 'env',
      fields: Object.keys(parsed),
      edgeHost: parsed.edgeURL ? hostOf(parsed.edgeURL) : null,
      uncachedEdgeHost: parsed.uncachedEdgeURL ? hostOf(parsed.uncachedEdgeURL) : null,
      apiHost: parsed.apiURL ? hostOf(parsed.apiURL) : null,
      primaryRegion: parsed.primaryRegion ?? null,
    };
  } catch {
    return { source: fromGlobal ? 'globalThis' : 'env', fields: 'illisible' };
  }
}

export async function GET() {
  const current = globalThis.fetch as PatchedFetch;
  const probes = [probe('fetch actuel', current)];
  if (current._nextOriginalFetch) probes.push(probe('fetch d’origine', current._nextOriginalFetch));

  const results = await Promise.all(probes);
  return Response.json(
    {
      node: process.version,
      nextPatchedFetch: Boolean(current.__nextPatched),
      hasOriginalFetch: Boolean(current._nextOriginalFetch),
      context: contextShape(),
      results,
    },
    { headers: { 'Cache-Control': 'no-store' } },
  );
}
