/**
 * Proxy Next.js (anciennement « middleware ») : exécuté avant chaque page.
 * Toute page demandée sans confirmation d'âge est redirigée vers l'écran
 * de vérification, qui renverra ensuite le visiteur vers la page voulue.
 */
import { NextResponse, type NextRequest } from 'next/server';
import { AGE_COOKIE, AGE_GATE_PATH, AGE_VALUE } from './lib/age';

export function proxy(request: NextRequest) {
  if (request.cookies.get(AGE_COOKIE)?.value === AGE_VALUE) return NextResponse.next();

  const url = request.nextUrl.clone();
  const destination = request.nextUrl.pathname + request.nextUrl.search;
  url.pathname = AGE_GATE_PATH;
  url.search = destination === '/' ? '' : `?suite=${encodeURIComponent(destination)}`;
  return NextResponse.redirect(url);
}

export const config = {
  // Exclus : l'écran de vérification lui-même, la page de refus, les routes API,
  // les fichiers internes de Next.js et tout fichier avec extension (images,
  // favicon, robots.txt, sitemap.xml, formulaire Netlify __forms.html…).
  matcher: ['/((?!verification-age|acces-refuse|api/|_next/|.*\\.\\w+$).*)'],
};
