'use client';

/**
 * Formulaire de demande de réservation.
 *
 * Les demandes sont envoyées à Netlify Forms (formulaire « reservation »
 * déclaré dans public/__forms.html) : elles apparaissent dans le tableau de
 * bord Netlify (Forms) et peuvent être transmises par courriel.
 */
import { useEffect, useState, type FormEvent } from 'react';
import { priceLabel, type Service } from '@/lib/content';
import { telHref } from './ContactLines';

type Props = {
  services: Service[];
  professionals: { id: string; name: string }[];
  initialService: string;
  initialProfessional: string;
  confirmation: string;
  phone: string;
};

type Status = 'idle' | 'sending' | 'sent' | 'error';

/** Date du jour au format AAAA-MM-JJ (heure locale), minimum du sélecteur de date. */
function today(): string {
  const now = new Date();
  now.setMinutes(now.getMinutes() - now.getTimezoneOffset());
  return now.toISOString().slice(0, 10);
}

export default function ReservationForm(props: Props) {
  const { services, professionals, confirmation, phone } = props;
  const [serviceId, setServiceId] = useState(
    services.some((s) => s.id === props.initialService) ? props.initialService : '',
  );
  const [professionalId, setProfessionalId] = useState(
    professionals.some((p) => p.id === props.initialProfessional) ? props.initialProfessional : '',
  );
  const [date, setDate] = useState('');
  const [time, setTime] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  // Calculée dans le navigateur (fuseau horaire du visiteur), après l'affichage initial.
  const [minDate, setMinDate] = useState<string>();
  useEffect(() => setMinDate(today()), []);

  const service = services.find((s) => s.id === serviceId);
  const professional = professionals.find((p) => p.id === professionalId);
  const tel = telHref(phone);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = event.currentTarget;
    const data = new FormData(form);
    // On envoie des libellés lisibles plutôt que des identifiants techniques.
    data.set('soin', service ? `${service.title} (${service.duration} min)` : '');
    data.set('professionnelle', professional?.name ?? 'Aucune préférence');

    setStatus('sending');
    try {
      const response = await fetch('/__forms.html', {
        method: 'POST',
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
        body: new URLSearchParams(data as unknown as Record<string, string>).toString(),
      });
      if (!response.ok) throw new Error(String(response.status));
      setStatus('sent');
      form.reset();
    } catch {
      setStatus('error');
    }
  }

  if (status === 'sent') {
    return (
      <section className="booking-confirmation" role="status">
        <p className="eyebrow confirmation-status">Demande envoyée</p>
        <h2>Merci, à très bientôt.</h2>
        <p className="preserve-lines">{confirmation}</p>
      </section>
    );
  }

  return (
    <div className="booking-layout">
      <section className="booking-panel">
        <p className="eyebrow">Votre demande</p>
        <h2 className="booking-title">Réserver un moment</h2>

        <form className="contact-form booking-form" name="reservation" onSubmit={handleSubmit}>
          <input type="hidden" name="form-name" value="reservation" />
          {/* Champ piège anti-robots : invisible pour les humains. */}
          <p className="visually-hidden" aria-hidden="true">
            <label>
              Ne pas remplir <input name="bot-field" tabIndex={-1} autoComplete="off" />
            </label>
          </p>

          <div className="form-row">
            <label>
              Nom
              <input name="nom" required autoComplete="name" maxLength={120} />
            </label>
            <label>
              Téléphone
              <input name="telephone" type="tel" required autoComplete="tel" maxLength={40} />
            </label>
          </div>

          <label>
            Courriel
            <input name="courriel" type="email" required autoComplete="email" maxLength={160} />
          </label>

          <div className="form-row">
            <label>
              Soin
              <select name="soin" required value={serviceId} onChange={(e) => setServiceId(e.target.value)}>
                <option value="" disabled>
                  Choisir un soin
                </option>
                {services.map((s) => (
                  <option key={s.id} value={s.id}>
                    {s.title} · {s.duration} min
                  </option>
                ))}
              </select>
            </label>
            {professionals.length > 0 && (
              <label>
                Professionnelle
                <select
                  name="professionnelle"
                  value={professionalId}
                  onChange={(e) => setProfessionalId(e.target.value)}
                >
                  <option value="">Aucune préférence</option>
                  {professionals.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.name}
                    </option>
                  ))}
                </select>
              </label>
            )}
          </div>

          <div className="form-row">
            <label>
              Date
              <input
                name="date"
                type="date"
                required
                min={minDate}
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </label>
            <label>
              Heure
              <input
                name="heure"
                type="time"
                required
                step={900}
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </label>
          </div>

          <label>
            Message <span className="optional">(facultatif)</span>
            <textarea name="message" rows={4} maxLength={2000} />
          </label>

          {status === 'error' && (
            <p className="form-error" role="alert">
              L’envoi n’a pas fonctionné. Veuillez réessayer
              {tel ? (
                <>
                  {' '}
                  ou nous appeler au <a href={tel}>{phone}</a>
                </>
              ) : null}
              .
            </p>
          )}

          <button className="button" type="submit" disabled={status === 'sending'}>
            {status === 'sending' ? 'Envoi en cours…' : 'Envoyer ma demande'}
          </button>
          <p className="fine-print">
            Votre rendez-vous sera confirmé par le salon. Vos informations servent uniquement à traiter votre demande.
          </p>
        </form>
      </section>

      <aside className="booking-aside" aria-live="polite">
        <p className="eyebrow">Récapitulatif</p>
        <h2>{service ? service.title : 'À compléter'}</h2>
        <dl>
          <div>
            <dt>Soin</dt>
            <dd>{service ? `${service.title} · ${service.duration} min` : 'À choisir'}</dd>
          </div>
          <div>
            <dt>Tarif</dt>
            <dd>{service ? priceLabel(service.price) : '—'}</dd>
          </div>
          <div>
            <dt>Professionnelle</dt>
            <dd>{professional ? professional.name : 'Aucune préférence'}</dd>
          </div>
          <div>
            <dt>Date et heure</dt>
            <dd>
              {date
                ? new Date(`${date}T12:00`).toLocaleDateString('fr-CA', {
                    weekday: 'long',
                    day: 'numeric',
                    month: 'long',
                  })
                : 'À choisir'}
              {date && time ? ` · ${time.replace(':', ' h ')}` : ''}
            </dd>
          </div>
        </dl>
        {service?.description && <p className="fine-print">{service.description}</p>}
      </aside>
    </div>
  );
}
