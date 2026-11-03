/**
 * GET /api/content — contenu courant (réservé à l'administratrice).
 * PUT /api/content — enregistre le contenu modifié dans Netlify Blobs.
 */
import { NextResponse } from 'next/server';
import { isAdmin, isSameOrigin } from '@/lib/auth';
import { normalizeContent } from '@/lib/content';
import { getContent, saveContent } from '@/lib/store';

const NO_STORE = { 'Cache-Control': 'no-store' };

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: 'Non autorisé.' }, { status: 401 });
  return NextResponse.json(await getContent(), { headers: NO_STORE });
}

export async function PUT(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
  if (!(await isAdmin())) {
    return NextResponse.json({ error: 'Session expirée. Veuillez vous reconnecter.' }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  if (!body) return NextResponse.json({ error: 'Contenu invalide.' }, { status: 400 });

  const content = normalizeContent(body);
  await saveContent(content);
  return NextResponse.json(content, { headers: NO_STORE });
}
