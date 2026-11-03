import Link from 'next/link';
import type { Professional } from '@/lib/content';
import ProfessionalPhotos from './ProfessionalPhotos';

export default function ProfessionalCard({ professional }: { professional: Professional }) {
  return (
    <article className="professional-card">
      <ProfessionalPhotos name={professional.name} photos={professional.photos} />
      <div className="card-body">
        {professional.specialties && <p className="eyebrow">{professional.specialties}</p>}
        <h3>{professional.name}</h3>
        {professional.description && <p className="preserve-lines">{professional.description}</p>}
        <Link className="text-link" href={`/reservation?professionnelle=${encodeURIComponent(professional.id)}`}>
          Réserver avec {professional.name} <span aria-hidden="true">→</span>
        </Link>
      </div>
    </article>
  );
}
