/** POST /api/auth/logout — supprime le cookie de session puis revient à l'accueil. */
import { NextResponse } from 'next/server';
import { isSameOrigin, SESSION_COOKIE, sessionCookieOptions } from '@/lib/auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });
  const response = NextResponse.redirect(new URL('/', request.url), 303);
  response.cookies.set(SESSION_COOKIE, '', sessionCookieOptions(0));
  return response;
}
