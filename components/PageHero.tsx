import Link from 'next/link';
import type { PageIntro } from '@/lib/content';
import RichTitle from './RichTitle';

/** Bandeau sombre en haut des pages intérieures. */
export default function PageHero({ intro, action }: { intro: PageIntro; action?: { href: string; label: string } }) {
  return (
    <section className="page-hero">
      <div className="shell">
        <p className="eyebrow">{intro.eyebrow}</p>
        <h1>
          <RichTitle text={intro.title} />
        </h1>
        {intro.text && <p>{intro.text}</p>}
        {action && (
          <Link className="button" href={action.href}>
            {action.label}
          </Link>
        )}
      </div>
    </section>
  );
}
