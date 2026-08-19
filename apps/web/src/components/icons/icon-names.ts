/**
 * Catalogo único de iconos. Cada paquete visual debe cubrir todos estos
 * nombres, de modo que cambiar de paquete nunca deje huecos en la interfaz.
 */
export const ICON_NAMES = [
  'plus',
  'close',
  'check',
  'trash',
  'edit',
  'link',
  'calendar',
  'location',
  'briefcase',
  'trophy',
  'flame',
  'flag',
  'layers',
  'mic',
  'award',
  'shield',
  'notebook',
  'sun',
  'moon',
  'palette',
  'grip',
  'offline',
  'refresh',
  'logout',
  'chevron',
] as const;

export type IconName = (typeof ICON_NAMES)[number];

export const ICON_PACK_IDS = ['outline', 'pixel'] as const;
export type IconPackId = (typeof ICON_PACK_IDS)[number];

export interface IconPackDefinition {
  readonly id: IconPackId;
  readonly label: string;
  readonly description: string;
}

export const ICON_PACKS: readonly IconPackDefinition[] = [
  {
    id: 'outline',
    label: 'Contorno',
    description: 'Trazo fino y neutro, basado en el set libre Feather Icons.',
  },
  {
    id: 'pixel',
    label: 'Pixel',
    description: 'Bloques solidos de estilo retro, ideales para los temas pixel y gaming.',
  },
];

export const DEFAULT_ICON_PACK: IconPackId = 'outline';

export function isIconPackId(value: unknown): value is IconPackId {
  return typeof value === 'string' && (ICON_PACK_IDS as readonly string[]).includes(value);
}
