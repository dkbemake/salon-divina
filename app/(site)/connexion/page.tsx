import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import LoginForm from '@/components/admin/LoginForm';
import { isAdmin, isPasswordConfigured } from '@/lib/auth';

export const metadata: Metadata = {
  title: 'Connexion | Salon Divina',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  if (await isAdmin()) redirect('/admin');

  return (
    <main className="shell section login-section">
      <section className="login-card">
        <p className="eyebrow">Espace administrateur</p>
        <h1 className="login-title">Connexion</h1>
        {isPasswordConfigured() ? (
          <LoginForm />
        ) : (
          <p className="form-error" role="alert">
            L’espace administrateur n’est pas encore activé : la variable d’environnement ADMIN_PASSWORD doit être
            définie dans Netlify (voir le fichier README).
          </p>
        )}
      </section>
    </main>
  );
}
