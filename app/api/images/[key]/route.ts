/** GET /api/images/:key — sert une photo téléversée (publique, mise en cache longue). */
import { readImage } from '@/lib/store';

export async function GET(_request: Request, { params }: { params: Promise<{ key: string }> }) {
  const { key } = await params;
  // Les clés sont générées par /api/upload : chiffres, lettres, tiret et extension.
  if (!/^[\w-]+\.(webp|jpg|png|avif)$/.test(key)) return new Response('Introuvable', { status: 404 });

  const image = await readImage(key);
  if (!image) return new Response('Introuvable', { status: 404 });

  return new Response(image.data, {
    headers: {
      'Content-Type': image.contentType,
      // Chaque clé est unique : le fichier ne change jamais, on peut le garder un an.
      'Cache-Control': 'public, max-age=31536000, immutable',
    },
  });
}
