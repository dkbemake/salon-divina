/**
 * Image remplissant son cadre (.image-frame).
 * - Images du dossier /img : optimisées par next/image (AVIF/WebP, tailles adaptées).
 * - Photos téléversées (/api/images/…) : déjà compressées à l'envoi, servies telles quelles.
 */
import Image from 'next/image';

type Props = {
  src: string;
  alt: string;
  sizes: string;
  priority?: boolean;
  /** « eager » : charge tout de suite, même hors de vue (préchargement). */
  loading?: 'eager' | 'lazy';
  className?: string;
};

export default function SiteImage({ src, alt, sizes, priority, loading, className }: Props) {
  return (
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      loading={loading}
      className={className}
      unoptimized={!src.startsWith('/img/')}
    />
  );
}
