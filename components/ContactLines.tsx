/**
 * Adresse, téléphone et courriel. Le téléphone et le courriel deviennent
 * cliquables dès qu'ils ressemblent à de vraies coordonnées.
 */
import type { SiteContent } from '@/lib/content';

export function telHref(phone: string): string | null {
  const digits = phone.replace(/[^\d+]/g, '');
  return digits.replace(/\D/g, '').length >= 7 ? `tel:${digits}` : null;
}

export function mailHref(email: string): string | null {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim()) ? `mailto:${email.trim()}` : null;
}

export default function ContactLines({ contact }: { contact: SiteContent['contact'] }) {
  const tel = telHref(contact.phone);
  const mail = mailHref(contact.email);
  return (
    <>
      {contact.address && <p className="preserve-lines">{contact.address}</p>}
      {contact.phone && <p>{tel ? <a href={tel}>{contact.phone}</a> : contact.phone}</p>}
      {contact.email && <p>{mail ? <a href={mail}>{contact.email}</a> : contact.email}</p>}
    </>
  );
}
