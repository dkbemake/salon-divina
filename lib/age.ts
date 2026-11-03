/**
 * Vérification d'âge (18 ans et plus).
 *
 * Le choix est mémorisé à deux endroits :
 * - localStorage (demandé) : se souvient du visiteur d'une visite à l'autre ;
 * - un cookie : permet au serveur (proxy.ts) de rediriger vers l'écran de
 *   vérification toute page demandée sans confirmation, avant même l'affichage.
 */
export const AGE_COOKIE = 'divina_age';
export const AGE_STORAGE_KEY = 'divina-age-confirme';
export const AGE_VALUE = 'oui';
export const AGE_GATE_PATH = '/verification-age';
export const AGE_DENIED_PATH = '/acces-refuse';

/** N'accepte qu'un chemin interne comme destination après la vérification. */
export function safeNextPath(value: string | null | undefined): string {
  if (!value || !value.startsWith('/') || value.startsWith('//') || value.startsWith('/\\')) return '/';
  if (value.startsWith(AGE_GATE_PATH) || value.startsWith(AGE_DENIED_PATH)) return '/';
  return value;
}
