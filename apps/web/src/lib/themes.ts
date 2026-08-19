export const THEME_IDS = [
  'light',
  'dark',
  'minimalista',
  'videojuegos',
  'pixeles',
  'retro',
  'anime',
  'anime-urbano',
  'series',
  'naturaleza',
  'naturaleza-nocturna',
  'galaxia',
] as const;

export type ThemeId = (typeof THEME_IDS)[number];

export type ThemeFamily = 'Básicos' | 'Juegos' | 'Historias' | 'Ambientes';

export interface ThemeDefinition {
  readonly id: ThemeId;
  readonly label: string;
  readonly description: string;
  /** Agrupa los temas en el selector para facilitar la elección. */
  readonly family: ThemeFamily;
  /** Muestras usadas en la vista previa del selector: fondo, acento y texto. */
  readonly swatches: readonly [string, string, string];
}

/**
 * Catálogo de temas. Cada uno nace de una paleta de cinco colores y redefine
 * el mismo conjunto de variables en `globals.css`, de modo que añadir un tema
 * no obliga a tocar ningún componente. Todas las combinaciones de texto sobre
 * fondo cumplen los mínimos de contraste de la WCAG.
 */
export const THEMES: readonly ThemeDefinition[] = [
  {
    id: 'light',
    label: 'Claro',
    description: 'Fondo luminoso y alto contraste para trabajar de día.',
    family: 'Básicos',
    swatches: ['#f8fafc', '#2563eb', '#0f172a'],
  },
  {
    id: 'dark',
    label: 'Oscuro',
    description: 'Superficies profundas que reducen el cansancio visual.',
    family: 'Básicos',
    swatches: ['#0f172a', '#60a5fa', '#f1f5f9'],
  },
  {
    id: 'minimalista',
    label: 'Minimalista',
    description: 'Blanco, negro y un dorado que solo aparece donde hace falta.',
    family: 'Básicos',
    swatches: ['#fafafa', '#222222', '#c9a227'],
  },
  {
    id: 'videojuegos',
    label: 'Videojuegos',
    description: 'Neón cian y violeta sobre una noche azul, con brillos de arcade.',
    family: 'Juegos',
    swatches: ['#111222', '#00d9ff', '#ff3d81'],
  },
  {
    id: 'pixeles',
    label: 'Píxeles',
    description: 'Tipografía monoespaciada, esquinas duras y sombras sólidas.',
    family: 'Juegos',
    swatches: ['#fff1e8', '#ff004d', '#1d2b53'],
  },
  {
    id: 'retro',
    label: 'Videojuego retro',
    description: 'Verde azulado y arenas cálidas, como una consola de los noventa.',
    family: 'Juegos',
    swatches: ['#264653', '#2a9d8f', '#e9c46a'],
  },
  {
    id: 'anime',
    label: 'Anime',
    description: 'Rosa pastel, índigo y un amarillo suave de fondo luminoso.',
    family: 'Historias',
    swatches: ['#fff4f7', '#6c63ff', '#ff6b9a'],
  },
  {
    id: 'anime-urbano',
    label: 'Anime urbano',
    description: 'Noche de ciudad en azul marino con letreros ámbar.',
    family: 'Historias',
    swatches: ['#14213d', '#fca311', '#e63946'],
  },
  {
    id: 'series',
    label: 'Series',
    description: 'Papel cálido y tipografía con serifas, de sobremesa editorial.',
    family: 'Historias',
    swatches: ['#f4f1ea', '#3d405b', '#b76e79'],
  },
  {
    id: 'naturaleza',
    label: 'Naturaleza',
    description: 'Verdes de bosque sobre un fondo de papel reciclado.',
    family: 'Ambientes',
    swatches: ['#f2e8cf', '#386641', '#a7c957'],
  },
  {
    id: 'naturaleza-nocturna',
    label: 'Naturaleza nocturna',
    description: 'Azules profundos con turquesa, como un lago de madrugada.',
    family: 'Ambientes',
    swatches: ['#0b132b', '#5bc0be', '#f0f3bd'],
  },
  {
    id: 'galaxia',
    label: 'Galaxia',
    description: 'Violetas de nebulosa con destellos lavanda.',
    family: 'Ambientes',
    swatches: ['#10002b', '#b06be8', '#e0aaff'],
  },
];

export const DEFAULT_THEME: ThemeId = 'light';

/** Orden en que el selector presenta las familias. */
export const THEME_FAMILIES = ['Básicos', 'Juegos', 'Historias', 'Ambientes'] as const;

export function isThemeId(value: unknown): value is ThemeId {
  return typeof value === 'string' && (THEME_IDS as readonly string[]).includes(value);
}

/**
 * Equivalencias de los identificadores anteriores al catálogo de paletas. Sin
 * esto, quien ya había elegido un tema perdería su elección al actualizar,
 * porque el valor guardado dejaría de pertenecer al catálogo.
 */
export const RENAMED_THEME_ENTRIES: Readonly<Record<string, ThemeId>> = {
  minimal: 'minimalista',
  gaming: 'videojuegos',
  'pixel-pink': 'pixeles',
  'pixel-blue': 'pixeles',
  galaxy: 'galaxia',
};

/** Traduce un identificador guardado al del catálogo actual, si existe. */
export function resolveThemeId(value: unknown): ThemeId | null {
  if (isThemeId(value)) {
    return value;
  }

  return typeof value === 'string' ? (RENAMED_THEME_ENTRIES[value] ?? null) : null;
}

export function findTheme(id: ThemeId): ThemeDefinition {
  return THEMES.find((theme) => theme.id === id) ?? THEMES[0];
}
