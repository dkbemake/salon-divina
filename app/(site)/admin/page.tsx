import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import AdminEditor from '@/components/admin/AdminEditor';
import { isAdmin } from '@/lib/auth';
import { getContent } from '@/lib/store';

export const metadata: Metadata = {
  title: 'Modifier le site | Salon Divina',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  // Protection côté serveur : sans session valide, retour à la connexion.
  if (!(await isAdmin())) redirect('/connexion');
  return <AdminEditor initialContent={await getContent()} />;
}
