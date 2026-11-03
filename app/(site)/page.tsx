/** Accueil — même structure que la page d'accueil du site actuel. */
import Link from 'next/link';
import ProfessionalRail from '@/components/ProfessionalRail';
import RichTitle from '@/components/RichTitle';
import ServiceCard from '@/components/ServiceCard';
import SiteImage from '@/components/SiteImage';
import { getContent } from '@/lib/store';

export default async function HomePage() {
  const { home, services, professionals } = await getContent();

  return (
    <main>
      <section className="hero">
        <div className="shell hero-grid">
          <div className="hero-copy">
            <p className="eyebrow">{home.heroEyebrow}</p>
            <h1>
              <RichTitle text={home.heroTitle} />
            </h1>
            <p>{home.heroText}</p>
            <div className="hero-actions">
              <Link className="button" href="/reservation">
                Réserver une séance
              </Link>
              <Link className="text-link" href="/professionnelles">
                Rencontrer l&apos;équipe <span aria-hidden="true">→</span>
              </Link>
            </div>
          </div>
          <div className="hero-art">
            <SiteImage src={home.heroImage} alt={home.heroImageAlt} sizes="(min-width: 700px) 50vw, 100vw" priority />
          </div>
        </div>
      </section>

      <section className="shell section intro-section">
        <div>
          <p className="eyebrow">{home.introEyebrow}</p>
          <h2>
            <RichTitle text={home.introTitle} />
          </h2>
        </div>
        <p className="section-copy preserve-lines">{home.introText}</p>
      </section>

      <section className="shell section section-tight-top">
        <div className="section-heading">
          <p className="eyebrow">{home.prosEyebrow}</p>
          <h2>
            <RichTitle text={home.prosTitle} />
          </h2>
          <p className="section-copy">{home.prosText}</p>
        </div>
        <ProfessionalRail professionals={professionals} />
      </section>

      <section className="cream-section">
        <div className="shell section">
          <div className="section-heading">
            <p className="eyebrow">{home.servicesEyebrow}</p>
            <h2>
              <RichTitle text={home.servicesTitle} />
            </h2>
            <p className="section-copy">{home.servicesText}</p>
          </div>
          <div className="cards-grid">
            {services.slice(0, 3).map((service) => (
              <ServiceCard key={service.id} service={service} />
            ))}
          </div>
          <Link className="text-link section-link" href="/services">
            Voir tous les soins <span aria-hidden="true">→</span>
          </Link>
        </div>
      </section>

      <section className="atmosphere">
        <div className="shell atmosphere-grid">
          <div>
            <p className="eyebrow">{home.atmosphereEyebrow}</p>
            <h2>
              <RichTitle text={home.atmosphereTitle} />
            </h2>
            <p className="preserve-lines">{home.atmosphereText}</p>
            <Link className="button button-light" href="/contact">
              Nous trouver
            </Link>
          </div>
          <div className="atmosphere-art">
            <SiteImage src={home.atmosphereImage} alt={home.atmosphereImageAlt} sizes="(min-width: 700px) 50vw, 100vw" />
          </div>
        </div>
      </section>

      <section className="shell cta-section">
        <p className="eyebrow">{home.ctaEyebrow}</p>
        <h2>
          <RichTitle text={home.ctaTitle} />
        </h2>
        <p>{home.ctaText}</p>
        <Link className="button" href="/reservation">
          Réserver une séance
        </Link>
      </section>
    </main>
  );
}
