'use client';

/** Menu mobile (même rendu que le site actuel), refermé à chaque changement de page. */
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';

export default function MobileMenu({ links }: { links: { href: string; label: string }[] }) {
  const pathname = usePathname();
  const ref = useRef<HTMLDetailsElement>(null);

  useEffect(() => {
    if (ref.current) ref.current.open = false;
  }, [pathname]);

  return (
    <details className="menu-disclosure" ref={ref}>
      <summary className="menu-toggle" aria-label="Ouvrir le menu">
        <span />
        <span />
        <span />
      </summary>
      <nav className="mobile-menu" aria-label="Navigation mobile">
        {links.map((link) => (
          <Link key={link.href} href={link.href}>
            {link.label}
          </Link>
        ))}
      </nav>
    </details>
  );
}
