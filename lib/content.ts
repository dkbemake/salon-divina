/**
 * Modèle de contenu du site.
 *
 * Tout le texte modifiable par l'administratrice vit dans un seul objet
 * `SiteContent`, enregistré en JSON dans Netlify Blobs (voir lib/store.ts).
 * Les valeurs ci-dessous servent de contenu initial et de filet de sécurité :
 * si un champ manque dans le JSON enregistré, la valeur par défaut est utilisée.
 */

export type Service = {
  id: string;
  title: string;
  /** Durée en minutes. */
  duration: number;
  /** Texte libre, ex. « 95 $ ». Vide = « Tarif à confirmer ». */
  price: string;
  description: string;
  image: string;
  imageAlt: string;
};

export type Professional = {
  id: string;
  name: string;
  /** Ligne courte au-dessus du prénom, ex. « Relaxation · Massage aux huiles ». */
  specialties: string;
  description: string;
  /** Photos dans l'ordre d'affichage (la première est montrée d'abord). */
  photos: string[];
};

/** Nombre maximal de photos par professionnelle. */
export const MAX_PHOTOS = 10;

export type PageIntro = { eyebrow: string; title: string; text: string };

export type HoursRow = { days: string; hours: string };

export type SiteContent = {
  home: {
    heroEyebrow: string;
    /** Les mots entre *astérisques* sont affichés en doré italique. */
    heroTitle: string;
    heroText: string;
    heroImage: string;
    heroImageAlt: string;
    introEyebrow: string;
    introTitle: string;
    introText: string;
    prosEyebrow: string;
    prosTitle: string;
    prosText: string;
    servicesEyebrow: string;
    servicesTitle: string;
    servicesText: string;
    atmosphereEyebrow: string;
    atmosphereTitle: string;
    atmosphereText: string;
    atmosphereImage: string;
    atmosphereImageAlt: string;
    ctaEyebrow: string;
    ctaTitle: string;
    ctaText: string;
  };
  pages: {
    services: PageIntro;
    professionnelles: PageIntro;
    reservation: PageIntro & { confirmation: string };
    contact: PageIntro & { writeTitle: string; writeText: string };
  };
  contact: {
    address: string;
    phone: string;
    email: string;
    instagram: string;
    hoursTitle: string;
    hours: HoursRow[];
  };
  footer: {
    intro: string;
    bottomNote: string;
  };
  services: Service[];
  professionals: Professional[];
};

export const DEFAULT_CONTENT: SiteContent = {
  home: {
    heroEyebrow: 'Salon Divina Massage · Rouyn-Noranda, QC',
    heroTitle: 'Beauté, *Désir* et Divinité.',
    heroText:
      'Découvrez une expérience de massage personnalisée dans une ambiance élégante, chaleureuse et apaisante.',
    heroImage: '/img/Banner.png',
    heroImageAlt: 'Identité visuelle dorée de Salon Divina',
    introEyebrow: "L'expérience Divina",
    introTitle: 'Un moment pensé pour vous, du début à la fin.',
    introText:
      "Chez Salon Divina, chaque rendez-vous est une invitation à ralentir. Nous prenons le temps d'écouter vos besoins afin de vous offrir une expérience de détente personnalisée, dans un cadre chaleureux et raffiné.",
    prosEyebrow: 'Les professionnelles',
    prosTitle: 'Choisissez la personne qui vous accompagne.',
    prosText: 'Découvrez chaque professionnelle avant de réserver votre moment.',
    servicesEyebrow: 'Les soins',
    servicesTitle: 'Une parenthèse bien à vous.',
    servicesText: 'Une sélection de soins présentés avec des informations simples et transparentes.',
    atmosphereEyebrow: 'Un lieu à ressentir',
    atmosphereTitle: "La beauté d'un moment sans hâte.",
    atmosphereText:
      'Lumière tamisée, huiles chaudes et douceur dorée : tout est pensé pour que le temps ralentisse dès votre arrivée.',
    atmosphereImage: '/img/Product.png',
    atmosphereImageAlt: 'Huiles de massage et pierres dans une ambiance dorée au Salon Divina',
    ctaEyebrow: 'Votre prochain moment',
    ctaTitle: 'Prête à prendre soin de vous?',
    ctaText: 'Choisissez votre soin et envoyez votre demande de rendez-vous en quelques instants.',
  },
  pages: {
    services: {
      eyebrow: 'Les soins',
      title: 'Un moment choisi pour vous.',
      text: 'Chaque soin est adapté à votre rythme et à votre niveau de confort.',
    },
    professionnelles: {
      eyebrow: "L'équipe",
      title: 'Choisissez votre professionnelle.',
      text: 'Prenez le temps de découvrir chaque univers avant de réserver.',
    },
    reservation: {
      eyebrow: 'Réservation',
      title: 'Votre séance, en toute simplicité.',
      text: 'Remplissez le formulaire : nous vous recontactons rapidement pour confirmer votre rendez-vous.',
      confirmation:
        'Merci! Votre demande a bien été envoyée. Nous vous contacterons sous peu pour confirmer votre rendez-vous.',
    },
    contact: {
      eyebrow: 'Nous joindre',
      title: 'Un accueil à votre rythme.',
      text: 'Une question, une demande particulière? Écrivez-nous ou appelez-nous.',
      writeTitle: 'Écrivez-nous',
      writeText: 'Pour toute question, joignez-nous par téléphone ou par courriel. Nous répondons avec plaisir.',
    },
  },
  contact: {
    address: 'Adresse à confirmer par le salon',
    phone: 'Téléphone à confirmer',
    email: 'Courriel à confirmer',
    instagram: '',
    hoursTitle: 'Votre moment, votre temps.',
    hours: [
      { days: 'Lundi au vendredi', hours: 'Heures à confirmer' },
      { days: 'Samedi', hours: 'Heures à confirmer' },
      { days: 'Dimanche', hours: 'Fermé ou sur rendez-vous' },
    ],
  },
  footer: {
    intro: 'Beauté, Désir et Divinité.',
    bottomNote: 'Site réservé aux personnes de 18 ans et plus',
  },
  services: [
    {
      id: 'massage-relaxant',
      title: 'Massage relaxant',
      duration: 60,
      price: '',
      description: 'Une pause lente et enveloppante pensée pour relâcher les tensions du quotidien.',
      image: '/img/massage.png',
      imageAlt: 'Massage relaxant dans une ambiance dorée',
    },
    {
      id: 'massage-suedois',
      title: 'Massage suédois',
      duration: 60,
      price: '',
      description: 'Un massage dynamique adapté à votre niveau de confort et à vos objectifs de détente.',
      image: '/img/Services_2.png',
      imageAlt: 'Massage suédois dans une ambiance chaleureuse',
    },
    {
      id: 'massage-aux-huiles',
      title: 'Massage aux huiles',
      duration: 90,
      price: '',
      description: 'Une expérience sensorielle douce, aux huiles chaudes, pour un lâcher-prise complet.',
      image: '/img/Product.png',
      imageAlt: 'Huiles et pierres de massage dans une ambiance dorée',
    },
  ],
  professionals: [
    {
      id: 'emma',
      name: 'Emma',
      specialties: 'Relaxation · Massage aux huiles',
      description: 'Des gestes lents et enveloppants pour une détente profonde, du premier au dernier instant.',
      photos: ['/img/employee/Emma.png'],
    },
    {
      id: 'jessica',
      name: 'Jessica',
      specialties: 'Massage suédois · Détente musculaire',
      description: 'Une approche attentive qui s’ajuste à vos tensions et à votre niveau de confort.',
      photos: ['/img/employee/Jessica.png'],
    },
    {
      id: 'rebecca',
      name: 'Rebecca',
      specialties: 'Rituel détente · Massage aux huiles',
      description: 'Un rituel chaleureux et sensoriel, pensé pour vous faire oublier le temps.',
      photos: ['/img/employee/Rebecca.png'],
    },
  ],
};

/* ------------------------------------------------------------------------ */
/* Validation : tout contenu reçu (fichier enregistré ou requête admin) est  */
/* ramené à la forme attendue. Les champs inconnus sont ignorés.            */
/* ------------------------------------------------------------------------ */

const MAX_TEXT = 4000;
const MAX_ITEMS = 40;

function str(value: unknown, fallback: string): string {
  return typeof value === 'string' ? value.slice(0, MAX_TEXT) : fallback;
}

/** Les images doivent provenir du site lui-même (dossier /img ou téléversements). */
function imagePath(value: unknown, fallback: string): string {
  if (typeof value !== 'string') return fallback;
  return /^\/(img|api\/images)\/[\w\-./%]+$/.test(value) && !value.includes('..') ? value : fallback;
}

export function slugify(text: string): string {
  return (
    text
      .normalize('NFD')
      .replace(/[̀-ͯ]/g, '')
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, '-')
      .replace(/^-+|-+$/g, '')
      .slice(0, 60) || 'element'
  );
}

/** Garantit des identifiants uniques et utilisables dans une URL. */
function uniqueIds<T extends { id: string }>(items: T[], labelOf: (item: T) => string): T[] {
  const seen = new Set<string>();
  return items.map((item) => {
    let base = slugify(item.id || labelOf(item));
    let id = base;
    for (let n = 2; seen.has(id); n++) id = `${base}-${n}`;
    seen.add(id);
    return { ...item, id };
  });
}

function obj(value: unknown): Record<string, unknown> {
  return value && typeof value === 'object' && !Array.isArray(value) ? (value as Record<string, unknown>) : {};
}

/** Fusionne un objet de textes avec ses valeurs par défaut (mêmes clés). */
function texts<T extends Record<string, string>>(value: unknown, defaults: T): T {
  const source = obj(value);
  const result = { ...defaults };
  for (const key of Object.keys(defaults) as (keyof T)[]) {
    const fallback = defaults[key];
    result[key] = (key.toString().toLowerCase().endsWith('image')
      ? imagePath(source[key as string], fallback)
      : str(source[key as string], fallback)) as T[keyof T];
  }
  return result;
}

export function normalizeContent(input: unknown): SiteContent {
  const d = DEFAULT_CONTENT;
  const source = obj(input);
  const pages = obj(source.pages);
  const contact = obj(source.contact);

  const services = Array.isArray(source.services)
    ? source.services.slice(0, MAX_ITEMS).map((raw) => {
        const s = obj(raw);
        const duration = Number(s.duration);
        return {
          id: str(s.id, ''),
          title: str(s.title, 'Nouveau soin'),
          duration: Number.isFinite(duration) && duration > 0 ? Math.min(Math.round(duration), 600) : 60,
          price: str(s.price, ''),
          description: str(s.description, ''),
          image: imagePath(s.image, '/img/massage.png'),
          imageAlt: str(s.imageAlt, ''),
        };
      })
    : d.services;

  const professionals = Array.isArray(source.professionals)
    ? source.professionals.slice(0, MAX_ITEMS).map((raw) => {
        const p = obj(raw);
        // Ancien format (une seule photo dans `image`) repris automatiquement.
        const list = Array.isArray(p.photos) ? p.photos : [p.image];
        const photos = list
          .map((photo) => imagePath(photo, ''))
          .filter(Boolean)
          .slice(0, MAX_PHOTOS);
        return {
          id: str(p.id, ''),
          name: str(p.name, 'Nouvelle professionnelle'),
          specialties: str(p.specialties, ''),
          description: str(p.description, ''),
          photos: photos.length > 0 ? photos : ['/img/employee/Emma.png'],
        };
      })
    : d.professionals;

  const hours = Array.isArray(contact.hours)
    ? contact.hours.slice(0, 14).map((raw) => texts(raw, { days: '', hours: '' }))
    : d.contact.hours;

  return {
    home: texts(source.home, d.home),
    pages: {
      services: texts(pages.services, d.pages.services),
      professionnelles: texts(pages.professionnelles, d.pages.professionnelles),
      reservation: texts(pages.reservation, d.pages.reservation),
      contact: texts(pages.contact, d.pages.contact),
    },
    contact: {
      address: str(contact.address, d.contact.address),
      phone: str(contact.phone, d.contact.phone),
      email: str(contact.email, d.contact.email),
      instagram: str(contact.instagram, d.contact.instagram),
      hoursTitle: str(contact.hoursTitle, d.contact.hoursTitle),
      hours,
    },
    footer: texts(source.footer, d.footer),
    services: uniqueIds(services, (s) => s.title),
    professionals: uniqueIds(professionals, (p) => p.name),
  };
}

/** Texte alternatif d'une photo de professionnelle, ex. « Photo 2 de Stéphanie ». */
export function photoAlt(name: string, index: number): string {
  return `Photo ${index + 1} de ${name.trim() || 'la professionnelle'}`;
}

/** Texte affiché pour le prix d'un soin. */
export function priceLabel(price: string): string {
  return price.trim() || 'Tarif à confirmer';
}
