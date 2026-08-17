export const THEME_IDS = [
  'light',
  'dark',
  'pixel-pink',
  'pixel-blue',
  'gaming',
  'anime',
  'minimal',
  'galaxy',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export interface ThemeDefinition {
  readonly id: ThemeId;
  readonly label: string;
  readonly description: string;
  /** Agrupa los temas en el selector para facilitar la eleccion. */
  readonly family: 'Basicos' | 'Pixel' | 'Creativos';
  /** Muestras usadas en la vista previa del selector. */
  readonly swatches: readonly [string, string, string];
}

export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Fondo luminoso y alto contraste para trabajar de dia.',
    family: 'Basicos',
    swatches: ['#f8fafc', '#2563eb', '#0f172a'],
  },
  {
    id: 'dark',
    label: 'Oscuro',
    description: 'Superficies profundas que reducen el cansancio visual.',
    family: 'Basicos',
    swatches: ['#0f172a', '#60a5fa', '#f1f5f9'],
  },
  {
    id: 'minimal',
    label: 'Minimalista',
    description: 'Blanco, negro y nada mas: sin sombras ni distracciones.',
    family: 'Basicos',
    swatches: ['#ffffff', '#171717', '#525252'],
  },
  {
    id: 'pixel-pink',
    label: 'Pixel rosa',
    description: 'Bordes duros y tipografia monoespaciada en tonos rosa.',
    family: 'Pixel',
    swatches: ['#2a0c22', '#ff85c3', '#ffebf7'],
  },
  {
    id: 'pixel-blue',
    label: 'Pixel azul',
    description: 'La misma estetica retro en una paleta azul fria.',
    family: 'Pixel',
    swatches: ['#08142e', '#56c7fa', '#e2f2ff'],
  },
  {
    id: 'gaming',
    label: 'Gaming',
    description: 'Negro profundo con acentos neon de alto contraste.',
    family: 'Creativos',
    swatches: ['#0a0a10', '#00e5a0', '#ecfdf5'],
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Pasteles suaves, bordes redondeados y acento magenta.',
    family: 'Creativos',
    swatches: ['#fff7fb', '#db2777', '#3a1b2f'],
  },
  {
    id: 'galaxy',
    label: 'Galaxy',
    description: 'Cielo nocturno con nebulosas violeta y turquesa.',
    family: 'Creativos',
    swatches: ['#090818', '#9a8cff', '#eae8ff'],
  },
];

export const DEFAULT_THEME: ThemeId = 'light';

export const THEME_FAMILIES = ['Basicos', 'Pixel', 'Creativos'] as const;

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

export function findTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
