'use client';

/** Formulaire de connexion : la vérification se fait côté serveur (/api/auth/login). */
import { useState, type FormEvent } from 'react';

export default function LoginForm() {
  const [error, setError] = useState('');
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const data = new FormData(event.currentTarget);
    setPending(true);
    setError('');
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: data.get('username'), password: data.get('password') }),
      });
      if (response.ok) {
        // Rechargement complet pour que l'en-tête affiche l'état connecté.
        window.location.assign('/admin');
        return;
      }
      const body = await response.json().catch(() => ({}));
      setError(body.error ?? 'Connexion impossible.');
    } catch {
      setError('Connexion impossible. Vérifiez votre connexion Internet.');
    }
    setPending(false);
  }

  return (
    <form className="contact-form" onSubmit={handleSubmit}>
      <label>
        Identifiant
        <input name="username" required autoComplete="username" autoCapitalize="none" spellCheck={false} />
      </label>
      <label>
        Mot de passe
        <input name="password" type="password" required autoComplete="current-password" />
      </label>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <button className="button" type="submit" disabled={pending}>
        {pending ? 'Vérification…' : 'Se connecter'}
      </button>
    </form>
  );
}
