/** Page affichée aux visiteurs de moins de 18 ans : aucun lien vers le contenu. */
import type { Metadata } from 'next';
import DivinaV from '@/components/DivinaV';

export const metadata: Metadata = {
  title: 'Accès refusé | Salon Divina',
  robots: { index: false },
};

export default function AccessDeniedPage() {
  return (
    <main className="gate gate-denied">
      <div className="gate-frame" aria-hidden="true" />
      <div className="gate-content">
        <p className="gate-denied-mark" aria-label="Salon Divina">
          SALON DI<DivinaV title="" />INA
        </p>
        <h1 className="gate-denied-message">
          Désolé, vous devez avoir 18&nbsp;ans ou plus pour accéder à ce site.
        </h1>
      </div>
    </main>
  );
}
