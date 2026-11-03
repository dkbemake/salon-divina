/** Pied de page, identique au site actuel ; textes et coordonnées modifiables. */
import Link from 'next/link';
import type { SiteContent } from '@/lib/content';
import { NAV_LINKS } from './Header';
import ContactLines from './ContactLines';

export default function Footer({ content }: { content: SiteContent }) {
  return (
    <footer className="site-footer">
      <div className="shell footer-grid">
        <div>
          <p className="eyebrow">Salon Divina</p>
          <p className="footer-intro">{content.footer.intro}</p>
        </div>
        <div>
          <p className="footer-title">Navigation</p>
          {NAV_LINKS.map((link) => (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          ))}
        </div>
        <div>
          <p className="footer-title">Coordonnées</p>
          <ContactLines contact={content.contact} />
        </div>
      </div>
      <div className="shell footer-bottom">
        <span>© {new Date().getFullYear()} Salon Divina</span>
        {content.footer.bottomNote && <span>{content.footer.bottomNote}</span>}
      </div>
    </footer>
  );
}
