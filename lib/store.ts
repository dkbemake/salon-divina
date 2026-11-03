/**
 * Stockage permanent du contenu et des photos.
 *
 * - Sur Netlify : Netlify Blobs (aucune base de données à configurer).
 *     · magasin « divina-content » → clé « site » : le JSON du contenu
 *     · magasin « divina-images »  → une entrée par photo téléversée
 * - En local avec `next dev` (pas d'environnement Netlify) : repli automatique
 *   sur le dossier `.data/` à la racine du projet.
 */
import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { getStore } from '@netlify/blobs';
import { DEFAULT_CONTENT, normalizeContent, type SiteContent } from './content';

const CONTENT_STORE = 'divina-content';
const IMAGE_STORE = 'divina-images';
const CONTENT_KEY = 'site';
const LOCAL_DIR = path.join(process.cwd(), '.data');
/** Attente maximale d'une lecture Netlify Blobs, pour ne jamais bloquer une page. */
const BLOBS_READ_TIMEOUT_MS = 4000;

type BlobStore = ReturnType<typeof getStore>;

/**
 * Sur Netlify, Blobs annule le corps des réponses d'erreur (dont le 404 « clé
 * absente ») et cette annulation ne se termine jamais. Lire ce corps d'abord
 * évite le blocage ; les réponses réussies restent transmises telles quelles.
 */
const fetchForBlobs: typeof fetch = async (input, init) => {
  const response = await fetch(input, init);
  if (response.status < 400) return response;
  return new Response(await response.arrayBuffer(), {
    status: response.status,
    statusText: response.statusText,
    headers: response.headers,
  });
};

/** Renvoie le magasin Netlify Blobs, ou null hors de l'environnement Netlify. */
function netlifyStore(name: string): BlobStore | null {
  try {
    return getStore({ name, consistency: 'strong', fetch: fetchForBlobs });
  } catch (error) {
    if (error instanceof Error && error.name === 'MissingBlobsEnvironmentError') return null;
    throw error;
  }
}

/** Rejette la promesse si Netlify Blobs ne répond pas à temps. */
async function withBlobsTimeout<T>(read: Promise<T>): Promise<T> {
  let timer: ReturnType<typeof setTimeout> | undefined;
  const timeout = new Promise<never>((_, reject) => {
    timer = setTimeout(() => reject(new Error(`Netlify Blobs : aucune réponse après ${BLOBS_READ_TIMEOUT_MS} ms`)), BLOBS_READ_TIMEOUT_MS);
  });
  try {
    return await Promise.race([read, timeout]);
  } finally {
    clearTimeout(timer);
  }
}

/* ------------------------------- Contenu -------------------------------- */

export async function getContent(): Promise<SiteContent> {
  const store = netlifyStore(CONTENT_STORE);
  try {
    if (store) {
      const data = await withBlobsTimeout(store.get(CONTENT_KEY, { type: 'json' }));
      return data ? normalizeContent(data) : DEFAULT_CONTENT;
    }
    const raw = await fs.readFile(path.join(LOCAL_DIR, 'content.json'), 'utf8');
    return normalizeContent(JSON.parse(raw));
  } catch (error) {
    // Fichier local absent au premier lancement : on utilise le contenu par défaut.
    if ((error as NodeJS.ErrnoException).code !== 'ENOENT') console.error('Lecture du contenu impossible', error);
    return DEFAULT_CONTENT;
  }
}

export async function saveContent(content: SiteContent): Promise<void> {
  const store = netlifyStore(CONTENT_STORE);
  if (store) {
    await store.setJSON(CONTENT_KEY, content);
    return;
  }
  await fs.mkdir(LOCAL_DIR, { recursive: true });
  await fs.writeFile(path.join(LOCAL_DIR, 'content.json'), JSON.stringify(content, null, 2), 'utf8');
}

/* -------------------------------- Photos -------------------------------- */

export async function saveImage(key: string, data: ArrayBuffer, contentType: string): Promise<void> {
  const store = netlifyStore(IMAGE_STORE);
  if (store) {
    await store.set(key, data, { metadata: { contentType } });
    return;
  }
  const dir = path.join(LOCAL_DIR, 'uploads');
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, key), Buffer.from(data));
}

export async function readImage(key: string): Promise<{ data: ArrayBuffer; contentType: string } | null> {
  const store = netlifyStore(IMAGE_STORE);
  if (store) {
    let result;
    try {
      result = await withBlobsTimeout(store.getWithMetadata(key, { type: 'arrayBuffer' }));
    } catch (error) {
      console.error('Lecture de la photo impossible', error);
      return null;
    }
    if (!result) return null;
    const contentType = typeof result.metadata.contentType === 'string' ? result.metadata.contentType : 'image/webp';
    return { data: result.data, contentType };
  }
  try {
    const file = await fs.readFile(path.join(LOCAL_DIR, 'uploads', key));
    const ext = path.extname(key).slice(1);
    return {
      data: file.buffer.slice(file.byteOffset, file.byteOffset + file.byteLength) as ArrayBuffer,
      contentType: IMAGE_TYPES[ext] ?? 'application/octet-stream',
    };
  } catch {
    return null;
  }
}

/** Formats acceptés au téléversement (extension → type MIME). */
export const IMAGE_TYPES: Record<string, string> = {
  webp: 'image/webp',
  jpg: 'image/jpeg',
  png: 'image/png',
  avif: 'image/avif',
};
