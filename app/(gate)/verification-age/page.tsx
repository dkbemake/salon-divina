import type { Metadata } from 'next';
import AgeGate from '@/components/AgeGate';

export const metadata: Metadata = {
  title: 'Salon Divina | Beauté, Désir et Divinité',
};

export default async function AgeVerificationPage({
  searchParams,
}: {
  searchParams: Promise<{ suite?: string | string[]; revoir?: string | string[] }>;
}) {
  const { suite, revoir } = await searchParams;
  // ?revoir : oublie la confirmation déjà donnée et rejoue l'écran d'entrée.
  return <AgeGate next={typeof suite === 'string' ? suite : undefined} replay={revoir !== undefined} />;
}
