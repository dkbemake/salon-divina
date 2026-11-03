import type { Professional } from '@/lib/content';
import ProfessionalCard from './ProfessionalCard';

/** Cartes des professionnelles : défilement horizontal sur mobile, grille sur ordinateur. */
export default function ProfessionalRail({ professionals }: { professionals: Professional[] }) {
  if (professionals.length === 0) return <p className="section-copy">L’équipe sera présentée très bientôt.</p>;
  return (
    <>
      <p className="swipe-prompt">
        Glissez pour découvrir l’équipe <span aria-hidden="true">→</span>
      </p>
      <div className="cards-grid professionals-grid professional-rail" aria-label="Professionnelles disponibles">
        {professionals.map((professional) => (
          <ProfessionalCard key={professional.id} professional={professional} />
        ))}
      </div>
    </>
  );
}
