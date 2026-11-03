/** POST /api/auth/login — vérifie l'identifiant et le mot de passe côté serveur. */
import { NextResponse } from 'next/server';
import {
  checkCredentials,
  createSessionToken,
  isPasswordConfigured,
  isSameOrigin,
  SESSION_COOKIE,
  SESSION_DURATION_SECONDS,
  sessionCookieOptions,
} from '@/lib/auth';

export async function POST(request: Request) {
  if (!isSameOrigin(request)) return NextResponse.json({ error: 'Requête refusée.' }, { status: 403 });

  if (!isPasswordConfigured()) {
    return NextResponse.json(
      { error: "L'espace administrateur n'est pas encore configuré (variable ADMIN_PASSWORD manquante)." },
      { status: 503 },
    );
  }

  const body = await request.json().catch(() => ({}));
  const username = typeof body.username === 'string' ? body.username.slice(0, 200) : '';
  const password = typeof body.password === 'string' ? body.password.slice(0, 500) : '';

  if (!checkCredentials(username, password)) {
    // Petit délai pour ralentir les tentatives répétées.
    await new Promise((resolve) => setTimeout(resolve, 800));
    return NextResponse.json({ error: 'Identifiant ou mot de passe incorrect.' }, { status: 401 });
  }

  const response = NextResponse.json({ ok: true });
  response.cookies.set(SESSION_COOKIE, createSessionToken(), sessionCookieOptions(SESSION_DURATION_SECONDS));
  return response;
}
