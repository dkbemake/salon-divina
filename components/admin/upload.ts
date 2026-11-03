/**
 * Envoi d'une photo depuis l'espace administrateur.
 * Avant l'envoi, la photo est redimensionnée (1600 px max) et compressée en
 * WebP (ou JPEG) directement dans le navigateur : le site reste rapide même
 * si la photo d'origine sort d'un téléphone.
 */

const MAX_SIDE = 1600;
const QUALITY = 0.84;

function canvasToBlob(canvas: HTMLCanvasElement, type: string): Promise<Blob | null> {
  return new Promise((resolve) => canvas.toBlob(resolve, type, QUALITY));
}

async function compressImage(file: File): Promise<Blob> {
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_SIDE / Math.max(bitmap.width, bitmap.height));
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  bitmap.close();

  // Certains navigateurs (anciens Safari) ne savent pas produire de WebP :
  // ils renvoient alors un PNG, et on se rabat sur le JPEG.
  const webp = await canvasToBlob(canvas, 'image/webp');
  if (webp && webp.type === 'image/webp') return webp;
  const jpeg = await canvasToBlob(canvas, 'image/jpeg');
  if (!jpeg) throw new Error('Compression impossible');
  return jpeg;
}

/** Compresse puis téléverse une photo ; renvoie son adresse sur le site. */
export async function uploadPhoto(file: File): Promise<string> {
  if (!file.type.startsWith('image/')) throw new Error('Veuillez choisir une image (JPG, PNG, WebP…).');
  const blob = await compressImage(file);
  const extension = blob.type === 'image/webp' ? 'webp' : 'jpg';
  const form = new FormData();
  form.append('file', new File([blob], `photo.${extension}`, { type: blob.type }));
  const response = await fetch('/api/upload', { method: 'POST', body: form });
  const body = await response.json().catch(() => ({}));
  if (!response.ok) throw new Error(body.error ?? 'Téléversement impossible.');
  return body.url;
}
