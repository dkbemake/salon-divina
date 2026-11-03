import type { Metadata } from 'next';
import PageHero from '@/components/PageHero';
import ProfessionalCard from '@/components/ProfessionalCard';
import { getContent } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Professionnelles | Salon Divina',
  description: 'Découvrez les professionnelles du Salon Divina et choisissez la personne qui vous accompagne.',
};

export default async function ProfessionalsPage() {
  const { pages, professionals } = await getContent();
  return (
    <>
      <PageHero intro={pages.professionnelles} action={{ href: '/reservation', label: 'Voir la réservation' }} />
      <main className="shell section">
        {professionals.length > 0 ? (
          // Même grille de cartes que la page Services.
          <div className="cards-grid professionals-grid">
            {professionals.map((professional) => (
              <ProfessionalCard key={professional.id} professional={professional} />
            ))}
          </div>
        ) : (
          <p className="section-copy">L’équipe sera présentée très bientôt.</p>
        )}
      </main>
    </>
  );
}
