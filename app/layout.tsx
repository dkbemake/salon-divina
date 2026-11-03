import type { Metadata, Viewport } from 'next';
import './globals.css';

const SITE_URL = process.env.URL ?? 'https://salon-divina.netlify.app';

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: 'Salon Divina | Beauté, Désir et Divinité',
  description:
    'Salon Divina, salon de massage à Montréal : massage relaxant, massage suédois et massage aux huiles dans une ambiance élégante et dorée.',
  // Site prêt pour le lancement : indexation autorisée (plus de balise noindex).
  robots: { index: true, follow: true },
  openGraph: {
    type: 'website',
    locale: 'fr_CA',
    siteName: 'Salon Divina',
    title: 'Salon Divina | Beauté, Désir et Divinité',
    description: 'Une expérience de massage personnalisée dans une ambiance élégante, chaleureuse et apaisante.',
  },
};

export const viewport: Viewport = {
  themeColor: '#161412',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="fr">
      <body>{children}</body>
    </html>
  );
}
