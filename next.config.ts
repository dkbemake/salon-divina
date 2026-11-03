import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  images: {
    // Seules les images livrées avec le site (/public/img) passent par l'optimiseur.
    // Les photos téléversées par l'administratrice sont déjà compressées dans le
    // navigateur avant l'envoi, puis servies telles quelles depuis /api/images.
    localPatterns: [{ pathname: '/img/**', search: '' }],
    formats: ['image/avif', 'image/webp'],
  },
  // Anciennes adresses de la vérification d'âge (favoris, pages déjà indexées).
  async redirects() {
    return [
      { source: '/verification-age', destination: '/', permanent: true },
      { source: '/acces-refuse', destination: '/', permanent: true },
    ];
  },
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
        ],
      },
    ];
  },
};

export default nextConfig;
