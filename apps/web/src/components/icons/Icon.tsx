import type { ReactNode } from 'react';

import { DEFAULT_ICON_PACK, type IconName, type IconPackId } from './icon-names';
import { OUTLINE_SHAPES } from './outline-pack';
import { PIXEL_SHAPES } from './pixel-pack';

const SHAPES_BY_PACK: Record<IconPackId, Record<IconName, ReactNode>> = {
  outline: OUTLINE_SHAPES,
  pixel: PIXEL_SHAPES,
};

export interface IconProps {
  name: IconName;
  pack?: IconPackId;
  size?: number;
  className?: string;
  /**
   * Texto alternativo. Sin el, el icono se marca como decorativo y los lectores
   * de pantalla lo ignoran, evitando ruido en la navegación asistida.
   */
  title?: string;
}

/**
 * Renderiza un icono del paquete activo. La forma se elige por nombre, de modo
 * que el resto de la interfaz nunca conoce los detalles del trazo.
 */
export function Icon({ name, pack = DEFAULT_ICON_PACK, size = 20, className, title }: IconProps) {
  const shapes = SHAPES_BY_PACK[pack] ?? OUTLINE_SHAPES;
  const isPixel = pack === 'pixel';
  const isDecorative = title === undefined;

  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      className={className}
      role={isDecorative ? 'presentation' : 'img'}
      aria-hidden={isDecorative || undefined}
      aria-label={title}
      focusable="false"
      fill={isPixel ? 'currentColor' : 'none'}
      stroke={isPixel ? 'none' : 'currentColor'}
      strokeWidth={isPixel ? undefined : 1.8}
      strokeLinecap={isPixel ? undefined : 'round'}
      strokeLinejoin={isPixel ? undefined : 'round'}
      shapeRendering={isPixel ? 'crispEdges' : undefined}
    >
      {title === undefined ? null : <title>{title}</title>}
      {shapes[name]}
    </svg>
  );
}
