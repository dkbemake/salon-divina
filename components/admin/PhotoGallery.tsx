'use client';

/**
 * Galerie de photos d'une professionnelle (espace administrateur).
 * - Téléverser plusieurs photos d'un coup (10 au maximum, compressées avant l'envoi).
 * - Miniatures à réordonner par glisser-déposer (ou avec les flèches) :
 *   la première est celle affichée en premier sur le site.
 * - Remplacer ou supprimer une photo.
 * Comme le reste de l'éditeur, rien n'est publié avant « Enregistrer ».
 */
import { useRef, useState, type DragEvent } from 'react';
import { MAX_PHOTOS, photoAlt } from '@/lib/content';
import { uploadPhoto } from './upload';

type Props = {
  name: string;
  photos: string[];
  /** Reçoit une fonction de mise à jour, appliquée à la liste la plus récente. */
  onChange: (update: (photos: string[]) => string[]) => void;
};

const errorText = (err: unknown) =>
  err instanceof Error && err.message ? err.message : 'Téléversement impossible.';

function move(list: string[], from: number, to: number): string[] {
  const next = [...list];
  const [item] = next.splice(from, 1);
  next.splice(to, 0, item);
  return next;
}

export default function PhotoGallery({ name, photos, onChange }: Props) {
  const addRef = useRef<HTMLInputElement>(null);
  const replaceRef = useRef<HTMLInputElement>(null);
  const replaceTarget = useRef<string | null>(null);
  const [busy, setBusy] = useState('');
  const [error, setError] = useState('');
  const [dragged, setDragged] = useState<number | null>(null);
  const [over, setOver] = useState<number | null>(null);

  const remaining = MAX_PHOTOS - photos.length;

  async function addPhotos(fileList: FileList | null) {
    const files = Array.from(fileList ?? []);
    if (addRef.current) addRef.current.value = '';
    if (files.length === 0) return;

    const accepted = files.slice(0, Math.max(remaining, 0));
    const skipped = files.length - accepted.length;
    const problems: string[] = [];
    if (skipped > 0) {
      problems.push(
        `Maximum ${MAX_PHOTOS} photos par professionnelle : ${skipped} photo${skipped > 1 ? 's' : ''} non ajoutée${skipped > 1 ? 's' : ''}.`,
      );
    }
    setError('');

    for (const [n, file] of accepted.entries()) {
      setBusy(`Téléversement ${n + 1} sur ${accepted.length}…`);
      try {
        const url = await uploadPhoto(file);
        onChange((list) => (list.length < MAX_PHOTOS ? [...list, url] : list));
      } catch (err) {
        problems.push(`${file.name} : ${errorText(err)}`);
      }
    }
    setBusy('');
    setError(problems.join(' '));
  }

  async function replacePhoto(file: File | undefined) {
    const old = replaceTarget.current;
    replaceTarget.current = null;
    if (replaceRef.current) replaceRef.current.value = '';
    if (!file || !old) return;
    setBusy('Remplacement…');
    setError('');
    try {
      const url = await uploadPhoto(file);
      onChange((list) => list.map((photo) => (photo === old ? url : photo)));
    } catch (err) {
      setError(errorText(err));
    } finally {
      setBusy('');
    }
  }

  function removePhoto(index: number) {
    if (photos.length <= 1) return;
    const target = photos[index];
    onChange((list) => (list.length > 1 ? list.filter((photo, i) => !(i === index && photo === target)) : list));
  }

  function reorder(from: number, to: number) {
    if (from === to || to < 0 || to >= photos.length) return;
    onChange((list) => move(list, from, to));
  }

  /* Glisser-déposer (souris et trackpad) */
  function handleDrop(event: DragEvent, index: number) {
    event.preventDefault();
    if (dragged !== null) reorder(dragged, index);
    setDragged(null);
    setOver(null);
  }

  return (
    <div className="admin-image admin-gallery">
      <span className="admin-image-label">
        Photos ({photos.length}/{MAX_PHOTOS})
      </span>

      <ol className="admin-gallery-grid">
        {photos.map((src, index) => (
          <li
            key={`${index}-${src}`}
            className={[
              'admin-thumb',
              dragged === index ? 'is-dragging' : '',
              over === index && dragged !== index ? 'is-over' : '',
            ]
              .filter(Boolean)
              .join(' ')}
            draggable={!busy}
            onDragStart={(event) => {
              setDragged(index);
              event.dataTransfer.effectAllowed = 'move';
              event.dataTransfer.setData('text/plain', String(index));
            }}
            onDragOver={(event) => {
              event.preventDefault();
              if (over !== index) setOver(index);
            }}
            onDragLeave={() => setOver((value) => (value === index ? null : value))}
            onDrop={(event) => handleDrop(event, index)}
            onDragEnd={() => {
              setDragged(null);
              setOver(null);
            }}
          >
            <div className="admin-thumb-image">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={src} alt={photoAlt(name, index)} draggable={false} />
              <span className="admin-thumb-number">{index === 0 ? '1 · Principale' : index + 1}</span>
            </div>
            <div className="admin-thumb-actions">
              <button
                type="button"
                onClick={() => reorder(index, index - 1)}
                disabled={index === 0 || !!busy}
                aria-label={`Déplacer la photo ${index + 1} vers la gauche`}
              >
                ←
              </button>
              <button
                type="button"
                onClick={() => reorder(index, index + 1)}
                disabled={index === photos.length - 1 || !!busy}
                aria-label={`Déplacer la photo ${index + 1} vers la droite`}
              >
                →
              </button>
              <button
                type="button"
                disabled={!!busy}
                onClick={() => {
                  replaceTarget.current = src;
                  replaceRef.current?.click();
                }}
                aria-label={`Remplacer la photo ${index + 1}`}
              >
                Remplacer
              </button>
              <button
                type="button"
                className="admin-thumb-delete"
                onClick={() => removePhoto(index)}
                disabled={photos.length <= 1 || !!busy}
                aria-label={`Supprimer la photo ${index + 1}`}
                title={photos.length <= 1 ? 'Il faut garder au moins une photo' : undefined}
              >
                Supprimer
              </button>
            </div>
          </li>
        ))}
      </ol>

      <input
        ref={addRef}
        type="file"
        accept="image/*"
        multiple
        className="visually-hidden"
        onChange={(event) => addPhotos(event.target.files)}
        tabIndex={-1}
      />
      <input
        ref={replaceRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={(event) => replacePhoto(event.target.files?.[0])}
        tabIndex={-1}
      />

      <button
        type="button"
        className="admin-upload"
        disabled={!!busy || remaining <= 0}
        onClick={() => addRef.current?.click()}
      >
        {busy || (remaining > 0 ? 'Ajouter des photos' : `Maximum de ${MAX_PHOTOS} photos atteint`)}
      </button>
      <small className="admin-gallery-hint">
        Glissez les miniatures pour changer l’ordre. Plusieurs photos peuvent être choisies d’un coup ; elles sont
        compressées automatiquement. Textes alternatifs automatiques : « {photoAlt(name, 0)} », etc.
      </small>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
    </div>
  );
}
