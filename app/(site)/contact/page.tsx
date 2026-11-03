import type { Metadata } from 'next';
import Link from 'next/link';
import ContactLines, { mailHref, telHref } from '@/components/ContactLines';
import PageHero from '@/components/PageHero';
import RichTitle from '@/components/RichTitle';
import { getContent } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Contact | Salon Divina',
  description: 'Adresse, téléphone, courriel et heures d’ouverture du Salon Divina.',
};

/** Accepte « @compte », « compte » ou une adresse complète Instagram. */
function instagramLink(value: string): { href: string; label: string } | null {
  const handle = value
    .trim()
    .replace(/^https?:\/\/(www\.)?instagram\.com\//i, '')
    .replace(/^@/, '')
    .replace(/\/.*$/, '');
  return /^[\w.]{1,30}$/.test(handle) ? { href: `https://www.instagram.com/${handle}/`, label: `@${handle}` } : null;
}

export default async function ContactPage() {
  const { pages, contact } = await getContent();
  const tel = telHref(contact.phone);
  const mail = mailHref(contact.email);
  const instagram = instagramLink(contact.instagram);
  // La carte n'est affichée que lorsqu'une vraie adresse a été saisie.
  const hasAddress = contact.address.trim() !== '' && !/à confirmer/i.test(contact.address);

  return (
    <>
      <PageHero intro={pages.contact} />
      <main className="shell section contact-layout">
        <section className="contact-card">
          <p className="eyebrow">Coordonnées</p>
          <h2>Salon Divina</h2>
          <ContactLines contact={contact} />
          {instagram && (
            <p>
              <a href={instagram.href} target="_blank" rel="noopener noreferrer">
                Instagram · {instagram.label}
              </a>
            </p>
          )}
          <Link className="button" href="/reservation">
            Réserver une séance
          </Link>
        </section>

        <section className="contact-card">
          <p className="eyebrow">Heures</p>
          <h2>
            <RichTitle text={contact.hoursTitle} />
          </h2>
          <dl className="hours-list">
            {contact.hours.map((row, index) => (
              <div key={index}>
                <dt>{row.days}</dt>
                <dd>{row.hours}</dd>
              </div>
            ))}
          </dl>
        </section>

        {hasAddress && (
          <section className="map-frame full-span">
            <iframe
              title={`Carte : ${contact.address}`}
              src={`https://www.google.com/maps?q=${encodeURIComponent(contact.address)}&output=embed`}
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </section>
        )}

        <section className="contact-card full-span">
          <p className="eyebrow">Écrire</p>
          <h2>
            <RichTitle text={pages.contact.writeTitle} />
          </h2>
          <p className="preserve-lines">{pages.contact.writeText}</p>
          <div className="button-row">
            {tel && (
              <a className="button" href={tel}>
                Appeler le salon
              </a>
            )}
            {mail && (
              <a className="button button-light" href={mail}>
                Envoyer un courriel
              </a>
            )}
            <Link className="text-link" href="/reservation">
              Demander un rendez-vous <span aria-hidden="true">→</span>
            </Link>
          </div>
        </section>
      </main>
    </>
  );
}
