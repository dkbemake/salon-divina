'use client';

/**
 * Écran plein de vérification d'âge, affiché avant tout accès au site.
 * « SALON DIVINA » apparaît lettre par lettre ; le V de DIVINA est remplacé
 * par le logo des mains, qui se dessine trait par trait.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import DivinaV from './DivinaV';
import Sparkles from './Sparkles';
import { AGE_COOKIE, AGE_DENIED_PATH, AGE_STORAGE_KEY, AGE_VALUE, safeNextPath } from '@/lib/age';

const ONE_YEAR = 60 * 60 * 24 * 365;

function rememberConfirmation() {
  try {
    localStorage.setItem(AGE_STORAGE_KEY, AGE_VALUE);
  } catch {
    // Navigation privée ou stockage bloqué : le cookie suffit pour la visite.
  }
  const secure = location.protocol === 'https:' ? '; Secure' : '';
  document.cookie = `${AGE_COOKIE}=${AGE_VALUE}; Max-Age=${ONE_YEAR}; Path=/; SameSite=Lax${secure}`;
}

/** Découpe un mot en lettres animées, avec un délai croissant. */
function Letters({ text, start, step }: { text: string; start: number; step: number }) {
  return (
    <>
      {[...text].map((letter, index) => (
        <span key={index} className="gate-letter" style={{ animationDelay: `${start + index * step}s` }}>
          {letter}
        </span>
      ))}
    </>
  );
}

export default function AgeGate({ next, replay = false }: { next?: string; replay?: boolean }) {
  const router = useRouter();
  const destination = safeNextPath(next);
  const [leaving, setLeaving] = useState(false);

  useEffect(() => {
    // Rejouer l'écran : on efface la confirmation mémorisée.
    if (replay) {
      try {
        localStorage.removeItem(AGE_STORAGE_KEY);
      } catch {}
      document.cookie = `${AGE_COOKIE}=; Max-Age=0; Path=/`;
      return;
    }
    // Visiteur déjà confirmé (localStorage) mais cookie expiré ou effacé :
    // on rétablit le cookie et on entre directement, sans redemander.
    let confirmed = false;
    try {
      confirmed = localStorage.getItem(AGE_STORAGE_KEY) === AGE_VALUE;
    } catch {}
    if (confirmed) {
      rememberConfirmation();
      router.replace(destination);
    }
  }, [router, destination, replay]);

  function enter() {
    rememberConfirmation();
    setLeaving(true);
    // Laisse le fondu de sortie se jouer avant de changer de page.
    setTimeout(() => router.replace(destination), 450);
  }

  return (
    <main className={`gate${leaving ? ' gate-leaving' : ''}`}>
      <div className="gate-frame" aria-hidden="true" />
      <Sparkles />

      <div className="gate-content">
        <h1 className="gate-title" aria-label="Salon Divina">
          <span className="gate-salon" aria-hidden="true">
            <Letters text="SALON" start={0.5} step={0.09} />
          </span>
          <span className="gate-divina" aria-hidden="true">
            <Letters text="DI" start={1.0} step={0.14} />
            <span className="gate-letter gate-letter-v" style={{ animationDelay: '1.28s' }}>
              <DivinaV animate delay={1.3} title="" />
            </span>
            <Letters text="INA" start={1.42} step={0.14} />
          </span>
        </h1>

        <p className="gate-slogan">Beauté, Désir et Divinité.</p>
        <p className="gate-notice">Ce site est réservé aux personnes de 18&nbsp;ans et plus.</p>

        <div className="gate-actions">
          <button type="button" className="button gate-enter" onClick={enter}>
            J&apos;ai 18 ans ou plus – Entrer
          </button>
          <button type="button" className="gate-minor" onClick={() => router.replace(AGE_DENIED_PATH)}>
            J&apos;ai moins de 18 ans
          </button>
        </div>
      </div>
    </main>
  );
}
