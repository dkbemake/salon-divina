/** POST /api/upload — téléverse une photo (réservé à l'administratrice). */
import { randomBytes } from 'node:crypto';
import { NextResponse } from 'next/server';
import { isAdmin, isSameOrigin } from '@/lib/auth';
import { IMAGE_TYPES, saveImage } from '@/lib/store';

// Les fonctions Netlify acceptent ~6 Mo par requête ; les photos sont
// redimensionnées dans le navigateur avant l'envoi, elles restent bien en deçà.
const MAX_BYTES = 4.5 * 1024 * 1024;

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Session expirée. Veuillez vous reconnecter.' }, { status: 401 });
  }

  const form = await request.formData().catch(() => null);
  const file = form?.get('file');
  if (!(file instanceof File)) return NextResponse.json({ error: 'Aucun fichier reçu.' }, { status: 400 });

  const ext = Object.keys(IMAGE_TYPES).find((key) => IMAGE_TYPES[key] === file.type);
  if (!ext) return NextResponse.json({ error: 'Format non pris en charge (JPG, PNG, WebP ou AVIF).' }, { status: 415 });
  if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Photo trop lourde (4,5 Mo maximum).' }, { status: 413 });

  const key = `${Date.now()}-${randomBytes(6).toString('hex')}.${ext}`;
  await saveImage(key, await file.arrayBuffer(), file.type);
  return NextResponse.json({ url: `/api/images/${key}` });
}
