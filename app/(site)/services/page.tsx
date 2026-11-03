import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ServiceCard from '@/components/ServiceCard';
import { getContent } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Services | Salon Divina',
  description: 'Massage relaxant, massage suédois et massage aux huiles au Salon Divina.',
};

export default async function ServicesPage() {
  const { pages, services } = await getContent();
  return (
    <>
      <PageHero intro={pages.services} action={{ href: '/reservation', label: 'Voir la réservation' }} />
      <main className="shell section">
        {services.length > 0 ? (
          <div className="cards-grid">
            {services.map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
        ) : (
          <p className="section-copy">Nos soins seront présentés très bientôt.</p>
        )}
      </main>
    </>
  );
}
