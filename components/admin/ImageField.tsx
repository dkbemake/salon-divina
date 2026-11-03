'use client';

/**
 * Champ photo de l'espace administrateur : aperçu, téléversement et texte
 * alternatif. La photo est compressée avant l'envoi (voir upload.ts).
 */
import { useRef, useState } from 'react';
import { uploadPhoto } from './upload';

type Props = {
  image: string;
  alt: string;
  onImage: (url: string) => void;
  onAlt: (alt: string) => void;
  label?: string;
  portrait?: boolean;
};

export default function ImageField({ image, alt, onImage, onAlt, label = 'Photo', portrait }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState('');

  async function handleFile(file: File | undefined) {
    if (!file) return;
    setBusy(true);
    setError('');
    try {
      onImage(await uploadPhoto(file));
    } catch (err) {
      setError(err instanceof Error && err.message ? err.message : 'Téléversement impossible.');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  }

  return (
    <div className="admin-image">
      <span className="admin-image-label">{label}</span>
      <div className={`admin-image-preview${portrait ? ' portrait' : ''}`}>
        {/* Aperçu simple : l'image finale est optimisée à l'affichage public. */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img src={image} alt={alt || 'Aperçu de la photo'} />
        {busy && <span className="admin-image-busy">Téléversement…</span>}
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="visually-hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
        tabIndex={-1}
      />
      <button type="button" className="admin-upload" disabled={busy} onClick={() => inputRef.current?.click()}>
        {busy ? 'Patientez…' : 'Téléverser une nouvelle photo'}
      </button>
      {error && (
        <p className="form-error" role="alert">
          {error}
        </p>
      )}
      <label className="admin-field">
        <span>Texte alternatif</span>
        <input value={alt} onChange={(e) => onAlt(e.target.value)} placeholder="Décrivez la photo en quelques mots" />
        <small>Lu par les lecteurs d’écran et utile au référencement.</small>
      </label>
    </div>
  );
}
