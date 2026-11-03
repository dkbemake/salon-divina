import Link from 'next/link';
import { priceLabel, type Service } from '@/lib/content';
import SiteImage from './SiteImage';

export default function ServiceCard({ service }: { service: Service }) {
  return (
    <article className="service-card">
      <div className="image-frame service-image">
        <SiteImage
          src={service.image}
          alt={service.imageAlt || `${service.title} au Salon Divina`}
          sizes="(min-width: 700px) 33vw, 100vw"
        />
      </div>
      <div className="card-body">
        <p className="eyebrow">{service.duration} minutes</p>
        <h3>{service.title}</h3>
        <p className="preserve-lines">{service.description}</p>
        <div className="card-meta">
          <span>{priceLabel(service.price)}</span>
          <Link href={`/reservation?service=${encodeURIComponent(service.id)}`}>
            Choisir ce soin <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </article>
  );
}
