/**
 * Petites étincelles dorées qui scintillent en arrière-plan de l'écran d'entrée.
 * Positions fixes (pas d'aléatoire) pour un rendu identique serveur / navigateur.
 */
const SPARKS = [
  { x: 12, y: 18, s: 9, d: 0.4 },
  { x: 84, y: 14, s: 7, d: 1.6 },
  { x: 22, y: 72, s: 6, d: 2.3 },
  { x: 76, y: 66, s: 10, d: 0.9 },
  { x: 50, y: 9, s: 5, d: 2.9 },
  { x: 91, y: 44, s: 6, d: 3.6 },
  { x: 7, y: 47, s: 7, d: 1.2 },
  { x: 63, y: 88, s: 5, d: 2.0 },
  { x: 34, y: 90, s: 8, d: 3.1 },
  { x: 38, y: 26, s: 4, d: 4.0 },
  { x: 68, y: 30, s: 4, d: 3.3 },
];

export default function Sparkles() {
  return (
    <div className="sparkles" aria-hidden="true">
      {SPARKS.map((spark, index) => (
        <svg
          key={index}
          viewBox="0 0 20 20"
          style={{
            left: `${spark.x}%`,
            top: `${spark.y}%`,
            width: `${spark.s * 2}px`,
            height: `${spark.s * 2}px`,
            animationDelay: `${spark.d}s`,
          }}
        >
          <path d="M10 0 L11.4 8.6 L20 10 L11.4 11.4 L10 20 L8.6 11.4 L0 10 L8.6 8.6 Z" fill="currentColor" />
        </svg>
      ))}
    </div>
  );
}
