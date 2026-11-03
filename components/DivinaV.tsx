/**
 * Logo « V » de Divina : deux avant-bras et deux mains, paumes ouvertes,
 * qui descendent l'un vers l'autre et se rejoignent du bout des doigts,
 * pouces presque joints, comme dans un geste de massage. Ligne fine dorée.
 *
 * Le bras gauche est dessiné dans un repère local (poignet à l'origine,
 * doigts vers le bas), puis incliné et placé ; le bras droit en est le
 * reflet (symétrie autour de x = 50). Avec `animate`, chaque trait se
 * dessine l'un après l'autre (voir .divina-v-animate dans globals.css).
 */
import { useId } from 'react';

type Props = {
  className?: string;
  animate?: boolean;
  /** Délai (s) avant le début du tracé, quand `animate` est actif. */
  delay?: number;
  title?: string;
};

// Traits du bras gauche (repère local), dans l'ordre du dessin.
const STROKES = [
  // Avant-bras, bord extérieur puis intérieur
  { d: 'M-8.6 -82 C-8.4 -55 -7.6 -25 -7 0', w: 1.9 },
  { d: 'M8 -82 C7.9 -55 7.4 -25 7 0', w: 1.9 },
  // Fin bracelet au poignet
  { d: 'M-7.3 -6.5 Q0 -3.6 7.2 -6.5', w: 1 },
  // Main : tranche, quatre doigts (auriculaire → index), puis pouce ouvert
  {
    d:
      'M-7 0 C-7.6 8 -8.5 15 -8.2 22 ' +
      'L-8 30 Q-7.9 32.6 -6.1 32.6 Q-4.4 32.6 -4.5 30.4 L-4.6 23.5 ' +
      'L-4.4 34 Q-4.3 36.6 -2.4 36.6 Q-0.6 36.6 -0.7 34 L-0.8 24 ' +
      'L-0.6 37 Q-0.5 39.6 1.4 39.6 Q3.3 39.6 3.2 37 L3 24 ' +
      'L3.2 34.4 Q3.4 37 5.2 36.8 Q7 36.6 6.8 34 L6.6 21 ' +
      'C7 17 8.6 14.2 10.4 12.6 Q12.2 10.6 11.6 8.6 Q10.8 6.8 9 7.8 L7.4 5 C7.1 3.2 7 1.6 7 0',
    w: 1.45,
  },
  // Pli de la paume
  { d: 'M5.2 11.5 Q0.5 13.5 -2.6 21', w: 0.8 },
];

export default function DivinaV({ className, animate = false, delay = 0, title = 'V' }: Props) {
  const gradientId = `divina-gold-${useId().replace(/:/g, '')}`;
  const classes = ['divina-v', animate ? 'divina-v-animate' : '', className ?? ''].join(' ').trim();

  // Poignet placé en (34.5, 82.2), bras incliné de 16,6° : le bout de l'index
  // arrive exactement au centre, en bas du V.
  const arm = (mirror: boolean) => (
    <g transform={mirror ? 'translate(100 0) scale(-1 1)' : undefined}>
      <g transform="translate(34.5 82.2) rotate(-16.6)">
        {STROKES.map((stroke, index) => (
          <path
            key={index}
            d={stroke.d}
            pathLength={1}
            strokeWidth={stroke.w}
            style={animate ? { animationDelay: `${delay + index * 0.3}s` } : undefined}
          />
        ))}
      </g>
    </g>
  );

  return (
    <svg
      className={classes}
      viewBox="0 0 100 120"
      {...(title ? { role: 'img', 'aria-label': title } : { 'aria-hidden': true })}
    >
      <defs>
        <linearGradient id={gradientId} x1="0" y1="0" x2="0.4" y2="1">
          <stop offset="0" stopColor="#f3dfae" />
          <stop offset="0.5" stopColor="#cba566" />
          <stop offset="1" stopColor="#a47c3f" />
        </linearGradient>
      </defs>
      <g fill="none" stroke={`url(#${gradientId})`} strokeLinecap="round" strokeLinejoin="round">
        {arm(false)}
        {arm(true)}
      </g>
      {/* Éclat doré au creux du V, au-dessus des pouces */}
      <path
        className="divina-v-spark"
        d="M50 58 L51 63 L56 64 L51 65 L50 70 L49 65 L44 64 L49 63 Z"
        fill="#f3dfae"
        style={animate ? { animationDelay: `${delay + STROKES.length * 0.3 + 0.6}s` } : undefined}
      />
    </svg>
  );
}
