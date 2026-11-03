/** Gabarit des pages du site : bandeau, en-tête, contenu et pied de page. */
import Footer from '@/components/Footer';
import Header from '@/components/Header';
import { isAdmin } from '@/lib/auth';
import { getContent } from '@/lib/store';

export default async function SiteLayout({ children }: { children: React.ReactNode }) {
  const [content, admin] = await Promise.all([getContent(), isAdmin()]);
  return (
    <>
      <Header isAdmin={admin} />
      <div className="site-content">{children}</div>
      <Footer content={content} />
    </>
  );
}
