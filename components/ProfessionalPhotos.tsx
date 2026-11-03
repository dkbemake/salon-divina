'use client';

/**
 * Photos d'une professionnelle, une à la fois dans le cadre de la carte.
 * - Clic (ou toucher) sur la photo : photo suivante, en boucle, avec un fondu.
 * - Points dorés sous la photo : position actuelle, clic pour y aller.
 * - Mobile : glisser vers la gauche ou la droite ; clavier : flèches.
 * Les photos déjà vues et la suivante restent chargées : le changement est
 * immédiat. Avec une seule photo, rien d'interactif n'est affiché.
 */
import { useRef, useState, type KeyboardEvent, type TouchEvent } from 'react';
import { photoAlt } from '@/lib/content';
import SiteImage from './SiteImage';

const SIZES = '(min-width: 960px) 33vw, (min-width: 700px) 50vw, 85vw';
/** Distance minimale (px) pour qu'un glissement change de photo. */
const SWIPE_DISTANCE = 40;

/** Les photos d'origine du site ont une marge : on les recadre un peu plus. */
const photoClass = (src: string) => (src.startsWith('/img/') ? 'is-original' : undefined);

export default function ProfessionalPhotos({ name, photos }: { name: string; photos: string[] }) {
  const [current, setCurrent] = useState(0);
  // Photos à garder dans la page : celles déjà vues + la suivante (préchargement).
  const [mounted, setMounted] = useState(() => new Set([0, 1 % photos.length]));
  const touchStart = useRef<{ x: number; y: number } | null>(null);
  const swiped = useRef(false);
  const count = photos.length;

  if (count <= 1) {
    return (
      <div className="image-frame professional-image">
        <SiteImage src={photos[0]} alt={photoAlt(name, 0)} sizes={SIZES} className={photoClass(photos[0])} />
      </div>
    );
  }

  function show(index: number) {
    const target = (index + count) % count;
    setCurrent(target);
    setMounted((previous) => new Set(previous).add(target).add((target + 1) % count));
  }

  function handleKey(event: KeyboardEvent) {
    if (event.key === 'ArrowRight') show(current + 1);
    else if (event.key === 'ArrowLeft') show(current - 1);
    else return;
    event.preventDefault();
  }

  function handleTouchStart(event: TouchEvent) {
    const touch = event.touches[0];
    touchStart.current = { x: touch.clientX, y: touch.clientY };
    swiped.current = false;
  }

  function handleTouchEnd(event: TouchEvent) {
    const start = touchStart.current;
    touchStart.current = null;
    if (!start) return;
    const touch = event.changedTouches[0];
    const dx = touch.clientX - start.x;
    const dy = touch.clientY - start.y;
    if (Math.abs(dx) < SWIPE_DISTANCE || Math.abs(dx) < Math.abs(dy)) return;
    swiped.current = true; // évite que le « clic » qui suit avance encore d'une photo
    show(dx < 0 ? current + 1 : current - 1);
  }

  return (
    <div className="professional-photos">
      <button
        type="button"
        className="image-frame professional-image photo-stack"
        aria-label={`${photoAlt(name, current)} sur ${count}. Afficher la photo suivante`}
        onClick={() => {
          if (swiped.current) swiped.current = false;
          else show(current + 1);
        }}
        onKeyDown={handleKey}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
      >
        {photos.map((src, index) =>
          mounted.has(index) ? (
            <SiteImage
              key={`${index}-${src}`}
              src={src}
              alt={photoAlt(name, index)}
              sizes={SIZES}
              loading={index === 0 ? undefined : 'eager'}
              className={[photoClass(src), index === current ? 'is-active' : ''].filter(Boolean).join(' ')}
            />
          ) : null,
        )}
      </button>

      <div className="photo-dots" role="group" aria-label={`Photos de ${name}`}>
        {photos.map((src, index) => (
          <button
            key={`${index}-${src}`}
            type="button"
            className="photo-dot"
            aria-label={`Afficher la photo ${index + 1} de ${name}`}
            aria-current={index === current ? 'true' : undefined}
            onClick={() => show(index)}
          />
        ))}
      </div>
    </div>
  );
}
