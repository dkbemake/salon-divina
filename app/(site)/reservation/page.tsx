import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ReservationForm from '@/components/ReservationForm';
import { getContent } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Réservation | Salon Divina',
  description: 'Demandez votre rendez-vous au Salon Divina en quelques instants.',
};

export default async function ReservationPage({
  searchParams,
}: {
  searchParams: Promise<{ service?: string | string[]; professionnelle?: string | string[] }>;
}) {
  const [{ pages, services, professionals, contact }, params] = await Promise.all([getContent(), searchParams]);
  const first = (value?: string | string[]) => (Array.isArray(value) ? value[0] : value) ?? '';

  return (
    <>
      <PageHero intro={pages.reservation} />
      <main className="shell section">
        <ReservationForm
          services={services}
          professionals={professionals.map(({ id, name }) => ({ id, name }))}
          initialService={first(params.service)}
          initialProfessional={first(params.professionnelle)}
          confirmation={pages.reservation.confirmation}
          phone={contact.phone}
        />
      </main>
    </>
  );
}
