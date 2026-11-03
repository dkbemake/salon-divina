/**
 * En-tête : petit bandeau supérieur (slogan + lien discret « Connexion »),
 * puis barre principale collante avec le menu et le bouton « Réserver ».
 */
import Link from 'next/link';
import MobileMenu from './MobileMenu';

export const NAV_LINKS = [
  { href: '/services', label: 'Services' },
  { href: '/professionnelles', label: 'Professionnelles' },
  { href: '/reservation', label: 'Réservation' },
  { href: '/contact', label: 'Contact' },
];

export default function Header({ isAdmin }: { isAdmin: boolean }) {
  return (
    <>
      <div className="top-bar">
        <div className="shell top-bar-inner">
          <span>Beauté, Désir et Divinité.</span>
          {isAdmin ? (
            <span className="top-bar-admin">
              <Link href="/admin">Modifier le site</Link>
              <form action="/api/auth/logout" method="post">
                <button type="submit">Déconnexion</button>
              </form>
            </span>
          ) : (
            <Link href="/connexion" className="top-bar-login">
              Connexion
            </Link>
          )}
        </div>
      </div>

      <header className="site-header">
        <div className="shell header-inner">
          <Link className="wordmark" aria-label="Salon Divina, accueil" href="/">
            <span>Salon</span>
            <strong>Divina</strong>
          </Link>
          <nav className="desktop-nav" aria-label="Navigation principale">
            {NAV_LINKS.map((link) => (
              <Link key={link.href} href={link.href}>
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="header-actions">
            <Link className="button button-small" href="/reservation">
              Réserver
            </Link>
            <MobileMenu links={NAV_LINKS} />
          </div>
        </div>
      </header>
    </>
  );
}
