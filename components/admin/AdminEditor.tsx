'use client';

/**
 * Espace de modification du site (réservé à l'administratrice connectée).
 *
 * Toutes les modifications sont faites localement, puis envoyées en une fois
 * avec « Enregistrer » (PUT /api/content). Le contenu est alors enregistré
 * dans Netlify Blobs et visible immédiatement par les visiteurs.
 */
import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import type { PageIntro, Professional, Service, SiteContent } from '@/lib/content';
import ImageField from './ImageField';
import PhotoGallery from './PhotoGallery';

type Tab = 'soins' | 'professionnelles' | 'textes' | 'coordonnees';

const TABS: { id: Tab; label: string }[] = [
  { id: 'soins', label: 'Soins' },
  { id: 'professionnelles', label: 'Professionnelles' },
  { id: 'textes', label: 'Textes des pages' },
  { id: 'coordonnees', label: 'Coordonnées et pied de page' },
];

type SaveState = { kind: 'idle' | 'saving' | 'saved' | 'error'; message?: string };

/* ------------------------------ Champs simples ---------------------------- */

function TextField(props: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  multiline?: boolean;
  hint?: string;
  type?: string;
}) {
  const { label, value, onChange, multiline, hint, type = 'text' } = props;
  return (
    <label className="admin-field">
      <span>{label}</span>
      {multiline ? (
        <textarea value={value} rows={3} onChange={(e) => onChange(e.target.value)} />
      ) : (
        <input type={type} value={value} onChange={(e) => onChange(e.target.value)} />
      )}
      {hint && <small>{hint}</small>}
    </label>
  );
}

const TITLE_HINT = 'Astuce : entourez un mot d’astérisques (*Désir*) pour l’afficher en doré italique.';

/** Les trois champs d'introduction communs aux pages intérieures. */
function IntroFields({ intro, onChange }: { intro: PageIntro; onChange: (intro: PageIntro) => void }) {
  return (
    <>
      <TextField label="Petit titre (au-dessus)" value={intro.eyebrow} onChange={(eyebrow) => onChange({ ...intro, eyebrow })} />
      <TextField label="Grand titre" value={intro.title} hint={TITLE_HINT} onChange={(title) => onChange({ ...intro, title })} />
      <TextField label="Texte d’introduction" multiline value={intro.text} onChange={(text) => onChange({ ...intro, text })} />
    </>
  );
}

/** Boutons monter / descendre / supprimer d'un élément de liste. */
function ItemActions(props: {
  index: number;
  count: number;
  onMove: (from: number, to: number) => void;
  onDelete: () => void;
  label: string;
}) {
  const { index, count, onMove, onDelete, label } = props;
  const [confirming, setConfirming] = useState(false);
  return (
    <div className="admin-item-actions">
      <button type="button" disabled={index === 0} onClick={() => onMove(index, index - 1)} aria-label={`Monter ${label}`}>
        ↑
      </button>
      <button
        type="button"
        disabled={index === count - 1}
        onClick={() => onMove(index, index + 1)}
        aria-label={`Descendre ${label}`}
      >
        ↓
      </button>
      {confirming ? (
        <>
          <button type="button" className="danger" onClick={onDelete}>
            Confirmer la suppression
          </button>
          <button type="button" onClick={() => setConfirming(false)}>
            Annuler
          </button>
        </>
      ) : (
        <button type="button" className="danger-outline" onClick={() => setConfirming(true)}>
          Supprimer
        </button>
      )}
    </div>
  );
}

function move<T>(list: T[], from: number, to: number): T[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

/* --------------------------------- Éditeur -------------------------------- */

export default function AdminEditor({ initialContent }: { initialContent: SiteContent }) {
  const router = useRouter();
  const [content, setContent] = useState(initialContent);
  const [saved, setSaved] = useState(() => JSON.stringify(initialContent));
  const [tab, setTab] = useState<Tab>('soins');
  const [save, setSave] = useState<SaveState>({ kind: 'idle' });
  const dirty = JSON.stringify(content) !== saved;

  // Avertit avant de quitter la page avec des modifications non enregistrées.
  useEffect(() => {
    if (!dirty) return;
    const warn = (event: BeforeUnloadEvent) => event.preventDefault();
    window.addEventListener('beforeunload', warn);
    return () => window.removeEventListener('beforeunload', warn);
  }, [dirty]);

  /** Applique une modification sur une copie du contenu. */
  function edit(change: (draft: SiteContent) => void) {
    setContent((previous) => {
      const draft = structuredClone(previous);
      change(draft);
      return draft;
    });
    setSave({ kind: 'idle' });
  }

  async function handleSave() {
    setSave({ kind: 'saving' });
    try {
      const response = await fetch('/api/content', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(content),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) {
        setSave({ kind: 'error', message: body.error ?? 'Enregistrement impossible.' });
        return;
      }
      setContent(body);
      setSaved(JSON.stringify(body));
      setSave({ kind: 'saved', message: 'Modifications enregistrées et publiées.' });
      router.refresh();
    } catch {
      setSave({ kind: 'error', message: 'Enregistrement impossible. Vérifiez votre connexion Internet.' });
    }
  }

  function handleCancel() {
    setContent(JSON.parse(saved));
    setSave({ kind: 'idle' });
  }

  const setService = (index: number, patch: Partial<Service>) =>
    edit((d) => Object.assign(d.services[index], patch));
  const setProfessional = (index: number, patch: Partial<Professional>) =>
    edit((d) => Object.assign(d.professionals[index], patch));

  return (
    <main className="admin">
      <section className="page-hero admin-hero">
        <div className="shell">
          <p className="eyebrow">Espace administrateur</p>
          <h1>Modifier le site</h1>
          <p>
            Modifiez les contenus ci-dessous puis cliquez sur « Enregistrer ». Les changements sont visibles
            immédiatement par les visiteurs.
          </p>
          <form action="/api/auth/logout" method="post">
            <button className="button button-light" type="submit">
              Déconnexion
            </button>
          </form>
        </div>
      </section>

      <div className="shell admin-body">
        <nav className="admin-tabs" aria-label="Sections à modifier">
          {TABS.map((t) => (
            <button
              key={t.id}
              type="button"
              className={tab === t.id ? 'active' : ''}
              aria-pressed={tab === t.id}
              onClick={() => setTab(t.id)}
            >
              {t.label}
            </button>
          ))}
        </nav>

        {/* ------------------------------- Soins ------------------------------- */}
        {tab === 'soins' && (
          <section className="admin-section">
            <h2>Soins</h2>
            {content.services.map((service, index) => (
              <article key={`${index}-${content.services.length}`} className="admin-item">
                <header>
                  <h3>{service.title || 'Nouveau soin'}</h3>
                  <ItemActions
                    index={index}
                    count={content.services.length}
                    label={service.title}
                    onMove={(from, to) => edit((d) => (d.services = move(d.services, from, to)))}
                    onDelete={() => edit((d) => d.services.splice(index, 1))}
                  />
                </header>
                <div className="admin-item-grid">
                  <ImageField
                    image={service.image}
                    alt={service.imageAlt}
                    onImage={(image) => setService(index, { image })}
                    onAlt={(imageAlt) => setService(index, { imageAlt })}
                  />
                  <div className="admin-fields">
                    <TextField label="Titre" value={service.title} onChange={(title) => setService(index, { title })} />
                    <div className="admin-row">
                      <TextField
                        label="Durée (minutes)"
                        type="number"
                        value={String(service.duration)}
                        onChange={(value) => setService(index, { duration: Number(value) || 0 })}
                      />
                      <TextField
                        label="Prix"
                        value={service.price}
                        hint="Ex. : 95 $. Laissez vide pour « Tarif à confirmer »."
                        onChange={(price) => setService(index, { price })}
                      />
                    </div>
                    <TextField
                      label="Description"
                      multiline
                      value={service.description}
                      onChange={(description) => setService(index, { description })}
                    />
                  </div>
                </div>
              </article>
            ))}
            <button
              type="button"
              className="button button-light admin-add"
              onClick={() =>
                edit((d) =>
                  d.services.push({
                    id: '',
                    title: 'Nouveau soin',
                    duration: 60,
                    price: '',
                    description: '',
                    image: '/img/massage.png',
                    imageAlt: '',
                  }),
                )
              }
            >
              + Ajouter un soin
            </button>
          </section>
        )}

        {/* -------------------------- Professionnelles -------------------------- */}
        {tab === 'professionnelles' && (
          <section className="admin-section">
            <h2>Professionnelles</h2>
            {content.professionals.map((pro, index) => (
              <article key={`${index}-${content.professionals.length}`} className="admin-item">
                <header>
                  <h3>{pro.name || 'Nouvelle professionnelle'}</h3>
                  <ItemActions
                    index={index}
                    count={content.professionals.length}
                    label={pro.name}
                    onMove={(from, to) => edit((d) => (d.professionals = move(d.professionals, from, to)))}
                    onDelete={() => edit((d) => d.professionals.splice(index, 1))}
                  />
                </header>
                <div className="admin-item-grid admin-item-grid-wide">
                  <PhotoGallery
                    name={pro.name}
                    photos={pro.photos}
                    onChange={(update) =>
                      edit((d) => (d.professionals[index].photos = update(d.professionals[index].photos)))
                    }
                  />
                  <div className="admin-fields">
                    <TextField label="Prénom" value={pro.name} onChange={(name) => setProfessional(index, { name })} />
                    <TextField
                      label="Spécialités (petite ligne dorée)"
                      value={pro.specialties}
                      hint="Ex. : Relaxation · Massage aux huiles"
                      onChange={(specialties) => setProfessional(index, { specialties })}
                    />
                    <TextField
                      label="Courte présentation"
                      multiline
                      value={pro.description}
                      onChange={(description) => setProfessional(index, { description })}
                    />
                  </div>
                </div>
              </article>
            ))}
            <button
              type="button"
              className="button button-light admin-add"
              onClick={() =>
                edit((d) =>
                  d.professionals.push({
                    id: '',
                    name: 'Nouvelle professionnelle',
                    specialties: '',
                    description: '',
                    photos: ['/img/employee/Emma.png'],
                  }),
                )
              }
            >
              + Ajouter une professionnelle
            </button>
          </section>
        )}

        {/* ------------------------------- Textes ------------------------------ */}
        {tab === 'textes' && (
          <section className="admin-section">
            <h2>Textes des pages</h2>

            <details className="admin-group" open>
              <summary>Accueil</summary>
              <TextField label="Petit titre du bandeau" value={content.home.heroEyebrow} onChange={(v) => edit((d) => (d.home.heroEyebrow = v))} />
              <TextField label="Grand titre" hint={TITLE_HINT} value={content.home.heroTitle} onChange={(v) => edit((d) => (d.home.heroTitle = v))} />
              <TextField label="Texte du bandeau" multiline value={content.home.heroText} onChange={(v) => edit((d) => (d.home.heroText = v))} />
              <ImageField
                image={content.home.heroImage}
                alt={content.home.heroImageAlt}
                label="Image du bandeau"
                onImage={(v) => edit((d) => (d.home.heroImage = v))}
                onAlt={(v) => edit((d) => (d.home.heroImageAlt = v))}
              />
              <hr />
              <TextField label="Expérience — petit titre" value={content.home.introEyebrow} onChange={(v) => edit((d) => (d.home.introEyebrow = v))} />
              <TextField label="Expérience — titre" value={content.home.introTitle} onChange={(v) => edit((d) => (d.home.introTitle = v))} />
              <TextField label="Expérience — texte" multiline value={content.home.introText} onChange={(v) => edit((d) => (d.home.introText = v))} />
              <hr />
              <TextField label="Professionnelles — petit titre" value={content.home.prosEyebrow} onChange={(v) => edit((d) => (d.home.prosEyebrow = v))} />
              <TextField label="Professionnelles — titre" value={content.home.prosTitle} onChange={(v) => edit((d) => (d.home.prosTitle = v))} />
              <TextField label="Professionnelles — texte" multiline value={content.home.prosText} onChange={(v) => edit((d) => (d.home.prosText = v))} />
              <hr />
              <TextField label="Soins — petit titre" value={content.home.servicesEyebrow} onChange={(v) => edit((d) => (d.home.servicesEyebrow = v))} />
              <TextField label="Soins — titre" value={content.home.servicesTitle} onChange={(v) => edit((d) => (d.home.servicesTitle = v))} />
              <TextField label="Soins — texte" multiline value={content.home.servicesText} onChange={(v) => edit((d) => (d.home.servicesText = v))} />
              <hr />
              <TextField label="Ambiance — petit titre" value={content.home.atmosphereEyebrow} onChange={(v) => edit((d) => (d.home.atmosphereEyebrow = v))} />
              <TextField label="Ambiance — titre" value={content.home.atmosphereTitle} onChange={(v) => edit((d) => (d.home.atmosphereTitle = v))} />
              <TextField label="Ambiance — texte" multiline value={content.home.atmosphereText} onChange={(v) => edit((d) => (d.home.atmosphereText = v))} />
              <ImageField
                image={content.home.atmosphereImage}
                alt={content.home.atmosphereImageAlt}
                label="Image de l’ambiance"
                onImage={(v) => edit((d) => (d.home.atmosphereImage = v))}
                onAlt={(v) => edit((d) => (d.home.atmosphereImageAlt = v))}
              />
              <hr />
              <TextField label="Appel final — petit titre" value={content.home.ctaEyebrow} onChange={(v) => edit((d) => (d.home.ctaEyebrow = v))} />
              <TextField label="Appel final — titre" value={content.home.ctaTitle} onChange={(v) => edit((d) => (d.home.ctaTitle = v))} />
              <TextField label="Appel final — texte" multiline value={content.home.ctaText} onChange={(v) => edit((d) => (d.home.ctaText = v))} />
            </details>

            <details className="admin-group">
              <summary>Page Services</summary>
              <IntroFields intro={content.pages.services} onChange={(v) => edit((d) => (d.pages.services = v))} />
            </details>

            <details className="admin-group">
              <summary>Page Professionnelles</summary>
              <IntroFields
                intro={content.pages.professionnelles}
                onChange={(v) => edit((d) => (d.pages.professionnelles = v))}
              />
            </details>

            <details className="admin-group">
              <summary>Page Réservation</summary>
              <IntroFields
                intro={content.pages.reservation}
                onChange={(v) => edit((d) => Object.assign(d.pages.reservation, v))}
              />
              <TextField
                label="Message affiché après l’envoi d’une demande"
                multiline
                value={content.pages.reservation.confirmation}
                onChange={(v) => edit((d) => (d.pages.reservation.confirmation = v))}
              />
            </details>

            <details className="admin-group">
              <summary>Page Contact</summary>
              <IntroFields intro={content.pages.contact} onChange={(v) => edit((d) => Object.assign(d.pages.contact, v))} />
              <TextField label="Bloc « Écrire » — titre" value={content.pages.contact.writeTitle} onChange={(v) => edit((d) => (d.pages.contact.writeTitle = v))} />
              <TextField label="Bloc « Écrire » — texte" multiline value={content.pages.contact.writeText} onChange={(v) => edit((d) => (d.pages.contact.writeText = v))} />
            </details>
          </section>
        )}

        {/* ---------------------------- Coordonnées ---------------------------- */}
        {tab === 'coordonnees' && (
          <section className="admin-section">
            <h2>Coordonnées</h2>
            <p className="fine-print">Affichées sur la page Contact et dans le pied de page.</p>
            <div className="admin-group admin-group-static">
              <TextField label="Adresse" multiline value={content.contact.address} hint="La carte Google Maps s’affiche automatiquement dès qu’une adresse est saisie." onChange={(v) => edit((d) => (d.contact.address = v))} />
              <div className="admin-row">
                <TextField label="Téléphone" type="tel" value={content.contact.phone} onChange={(v) => edit((d) => (d.contact.phone = v))} />
                <TextField label="Courriel" type="email" value={content.contact.email} onChange={(v) => edit((d) => (d.contact.email = v))} />
              </div>
              <TextField label="Instagram (facultatif)" value={content.contact.instagram} hint="Ex. : @salondivina" onChange={(v) => edit((d) => (d.contact.instagram = v))} />
            </div>

            <h2>Heures d’ouverture</h2>
            <div className="admin-group admin-group-static">
              <TextField label="Titre du bloc Heures" value={content.contact.hoursTitle} onChange={(v) => edit((d) => (d.contact.hoursTitle = v))} />
              {content.contact.hours.map((row, index) => (
                <div key={index} className="admin-row admin-hours-row">
                  <TextField label="Jours" value={row.days} onChange={(v) => edit((d) => (d.contact.hours[index].days = v))} />
                  <TextField label="Heures" value={row.hours} onChange={(v) => edit((d) => (d.contact.hours[index].hours = v))} />
                  <button
                    type="button"
                    className="admin-remove-row"
                    aria-label={`Retirer la ligne ${row.days}`}
                    onClick={() => edit((d) => d.contact.hours.splice(index, 1))}
                  >
                    ✕
                  </button>
                </div>
              ))}
              <button
                type="button"
                className="text-link admin-link-button"
                onClick={() => edit((d) => d.contact.hours.push({ days: '', hours: '' }))}
              >
                + Ajouter une ligne
              </button>
            </div>

            <h2>Pied de page</h2>
            <div className="admin-group admin-group-static">
              <TextField label="Phrase d’introduction" value={content.footer.intro} onChange={(v) => edit((d) => (d.footer.intro = v))} />
              <TextField label="Mention en bas de page" value={content.footer.bottomNote} onChange={(v) => edit((d) => (d.footer.bottomNote = v))} />
            </div>
          </section>
        )}
      </div>

      {/* Barre d'enregistrement toujours visible en bas de l'écran */}
      <div className={`admin-savebar${dirty ? ' is-dirty' : ''}`}>
        <div className="shell admin-savebar-inner">
          <p role="status" className={`admin-status admin-status-${save.kind}`}>
            {save.kind === 'saving'
              ? 'Enregistrement…'
              : save.message ?? (dirty ? 'Modifications non enregistrées.' : 'Tout est enregistré.')}
            {save.kind === 'error' && save.message?.includes('reconnecter') && (
              <>
                {' '}
                <a href="/connexion" target="_blank" rel="noopener">
                  Se reconnecter
                </a>
              </>
            )}
          </p>
          <div className="admin-savebar-actions">
            <button type="button" className="admin-cancel" disabled={!dirty || save.kind === 'saving'} onClick={handleCancel}>
              Annuler
            </button>
            <button type="button" className="button" disabled={!dirty || save.kind === 'saving'} onClick={handleSave}>
              Enregistrer
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
