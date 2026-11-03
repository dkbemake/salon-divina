/**
 * Authentification de l'espace administrateur.
 *
 * - Identifiant fixe : stephanie2765.
 * - Mot de passe : jamais écrit dans le code, lu dans la variable
 *   d'environnement ADMIN_PASSWORD (définie dans Netlify).
 * - Session : jeton signé (HMAC-SHA256) placé dans un cookie httpOnly,
 *   Secure et SameSite=Strict, valable 8 heures.
 */
import 'server-only';
import { createHash, createHmac, timingSafeEqual } from 'node:crypto';
import { cookies } from 'next/headers';

export const ADMIN_USERNAME = 'stephanie2765';
export const SESSION_COOKIE = 'divina_admin';
export const SESSION_DURATION_SECONDS = 8 * 60 * 60;

function sha256(value: string): Buffer {
  return createHash('sha256').update(value, 'utf8').digest();
}

/** Comparaison à durée constante (évite les attaques par mesure du temps). */
function safeEqual(a: string, b: string): boolean {
  return timingSafeEqual(sha256(a), sha256(b));
}

export function isPasswordConfigured(): boolean {
  return Boolean(process.env.ADMIN_PASSWORD);
}

export function checkCredentials(username: string, password: string): boolean {
  const expected = process.env.ADMIN_PASSWORD;
  if (!expected) return false;
  // Les deux vérifications sont toujours exécutées pour garder un temps constant.
  const userOk = safeEqual(username.trim().toLowerCase(), ADMIN_USERNAME);
  const passOk = safeEqual(password, expected);
  return userOk && passOk;
}

/**
 * Clé de signature des sessions. Si SESSION_SECRET n'est pas défini, elle est
 * dérivée du mot de passe : changer le mot de passe déconnecte donc toutes
 * les sessions ouvertes.
 */
function signingKey(): string {
  const secret = process.env.SESSION_SECRET || process.env.ADMIN_PASSWORD;
  if (!secret) throw new Error('ADMIN_PASSWORD non configuré');
  return sha256(`salon-divina-session:${secret}`).toString('hex');
}

function sign(payload: string): string {
  return createHmac('sha256', signingKey()).update(payload).digest('base64url');
}

export function createSessionToken(): string {
  const payload = Buffer.from(
    JSON.stringify({ u: ADMIN_USERNAME, exp: Math.floor(Date.now() / 1000) + SESSION_DURATION_SECONDS }),
  ).toString('base64url');
  return `${payload}.${sign(payload)}`;
}

export function verifySessionToken(token: string | undefined): boolean {
  if (!token || !isPasswordConfigured()) return false;
  const [payload, signature] = token.split('.');
  if (!payload || !signature || !safeEqual(signature, sign(payload))) return false;
  try {
    const data = JSON.parse(Buffer.from(payload, 'base64url').toString('utf8'));
    return data.u === ADMIN_USERNAME && typeof data.exp === 'number' && data.exp > Date.now() / 1000;
  } catch {
    return false;
  }
}

/** Vrai si la requête courante provient de l'administratrice connectée. */
export async function isAdmin(): Promise<boolean> {
  const store = await cookies();
  return verifySessionToken(store.get(SESSION_COOKIE)?.value);
}

export function sessionCookieOptions(maxAge: number) {
  return {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'strict' as const,
    path: '/',
    maxAge,
  };
}

/**
 * Protection CSRF supplémentaire pour les requêtes qui modifient des données :
 * l'en-tête Origin, s'il est présent, doit correspondre au site.
 */
export function isSameOrigin(request: Request): boolean {
  const origin = request.headers.get('origin');
  if (!origin) return true;
  const host = request.headers.get('x-forwarded-host') ?? request.headers.get('host');
  try {
    return new URL(origin).host === host;
  } catch {
    return false;
  }
}
