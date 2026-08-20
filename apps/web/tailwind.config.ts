import type { Config } from 'tailwindcss';

/**
 * Los colores se declaran como canales RGB en variables CSS para que cada tema
 * pueda redefinirlos sin duplicar clases y sin perder los modificadores de
 * opacidad de Tailwind.
 */
const withOpacity = (variable: string) => `rgb(var(${variable}) / <alpha-value>)`;

const config: Config = {
  content: ['./src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        base: withOpacity('--color-base'),
        sunken: withOpacity('--color-sunken'),
        raised: withOpacity('--color-raised'),
        overlay: withOpacity('--color-overlay'),
        subtle: withOpacity('--color-border-subtle'),
        strong: withOpacity('--color-border-strong'),
        primary: withOpacity('--color-text-primary'),
        secondary: withOpacity('--color-text-secondary'),
        inverse: withOpacity('--color-text-inverse'),
        accent: withOpacity('--color-accent'),
        'accent-strong': withOpacity('--color-accent-strong'),
        'accent-soft': withOpacity('--color-accent-soft'),
        'accent-edge': withOpacity('--color-accent-edge'),
        success: withOpacity('--color-success'),
        warning: withOpacity('--color-warning'),
        danger: withOpacity('--color-danger'),
        wishlist: withOpacity('--color-status-wishlist'),
        applied: withOpacity('--color-status-applied'),
        interview: withOpacity('--color-status-interview'),
        offer: withOpacity('--color-status-offer'),
        hired: withOpacity('--color-status-hired'),
        rejected: withOpacity('--color-status-rejected'),
      },
      fontFamily: {
        display: 'var(--font-display)',
        body: 'var(--font-body)',
      },
      /*
       * Pesos del manual de marca. Los nombres son los de Tailwind, pero los
       * valores son los de Deska: normal para leer, medio para destacar dentro
       * de una frase, y los dos superiores para titulos de bloque y de seccion.
       * Redefinirlos aqui evita que la escala se desvie clase a clase.
       */
      fontWeight: {
        normal: '400',
        medium: '650',
        semibold: '650',
        bold: '700',
        extrabold: '800',
      },
      letterSpacing: {
        // Los titulos van apretados; las etiquetas en versales, aireadas.
        tight: '-0.02em',
        wide: '0.09em',
      },
      borderRadius: {
        card: 'var(--radius-card)',
        control: 'var(--radius-control)',
      },
      boxShadow: {
        card: 'var(--shadow-card)',
        raised: 'var(--shadow-raised)',
        lifted: 'var(--shadow-lifted)',
        sunken: 'var(--shadow-sunken)',
      },
      keyframes: {
        'level-pulse': {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.06)' },
        },
        'card-drop': {
          '0%': { transform: 'translateY(-6px)', opacity: '0.6' },
          '100%': { transform: 'translateY(0)', opacity: '1' },
        },
      },
      animation: {
        'level-pulse': 'level-pulse 1.2s ease-in-out',
        'card-drop': 'card-drop 180ms ease-out',
      },
    },
  },
  plugins: [],
};

export default config;
