import type { ReactNode } from 'react';

import type { IconName } from './icon-names';

/** Cada bloque es una tupla [x, y, ancho, alto] sobre la reticula de 24 unidades. */
type PixelBlock = readonly [number, number, number, number];

const blocks = (...cells: PixelBlock[]): ReactNode => (
  <>
    {cells.map(([x, y, width, height]) => (
      <rect key={`${x}-${y}-${width}-${height}`} x={x} y={y} width={width} height={height} />
    ))}
  </>
);

/**
 * Set retro dibujado con bloques alineados a la reticula. Se renderiza con
 * relleno solido y sin suavizado para conservar el aspecto de pixel art.
 */
export const PIXEL_SHAPES: Record<IconName, ReactNode> = {
  plus: blocks([9, 3, 6, 18], [3, 9, 18, 6]),
  close: blocks(
    [3, 3, 4, 4],
    [7, 7, 4, 4],
    [10, 10, 4, 4],
    [14, 14, 4, 4],
    [17, 17, 4, 4],
    [17, 3, 4, 4],
    [14, 7, 4, 4],
    [7, 14, 4, 4],
    [3, 17, 4, 4],
  ),
  check: blocks([3, 11, 4, 4], [7, 15, 4, 4], [11, 15, 4, 4], [14, 10, 4, 4], [17, 5, 4, 4]),
  trash: blocks([10, 2, 4, 3], [5, 5, 14, 3], [7, 8, 10, 13], [10, 11, 1, 7], [13, 11, 1, 7]),
  edit: blocks([15, 3, 6, 6], [12, 9, 3, 3], [9, 12, 3, 3], [6, 15, 3, 3], [3, 18, 3, 3]),
  link: blocks([3, 9, 8, 3], [3, 12, 3, 3], [8, 12, 3, 3], [13, 9, 8, 3], [13, 12, 3, 3], [18, 12, 3, 3], [10, 10, 4, 3]),
  calendar: blocks(
    [3, 5, 18, 4],
    [3, 9, 3, 12],
    [18, 9, 3, 12],
    [3, 18, 18, 3],
    [7, 2, 3, 3],
    [14, 2, 3, 3],
    [8, 12, 3, 3],
    [13, 12, 3, 3],
  ),
  location: blocks([9, 2, 6, 3], [6, 5, 12, 4], [10, 9, 4, 3], [6, 9, 3, 3], [15, 9, 3, 3], [9, 12, 6, 3], [10, 15, 4, 6]),
  briefcase: blocks([9, 3, 6, 4], [2, 7, 20, 5], [2, 14, 20, 7], [10, 12, 4, 2]),
  trophy: blocks([6, 3, 12, 9], [3, 3, 3, 6], [18, 3, 3, 6], [10, 12, 4, 5], [6, 18, 12, 3]),
  flame: blocks([10, 2, 4, 4], [8, 6, 8, 4], [6, 10, 12, 6], [8, 16, 8, 5]),
  flag: blocks([4, 3, 4, 18], [8, 3, 12, 8]),
  layers: blocks([8, 3, 8, 4], [4, 9, 16, 4], [2, 15, 20, 4]),
  mic: blocks([10, 2, 4, 10], [7, 11, 3, 4], [14, 11, 3, 4], [10, 15, 4, 4], [7, 19, 10, 2]),
  award: blocks([8, 2, 8, 9], [8, 11, 3, 10], [13, 11, 3, 10]),
  shield: blocks([6, 2, 12, 4], [4, 6, 16, 8], [6, 14, 12, 4], [9, 18, 6, 3]),
  notebook: blocks([5, 3, 3, 18], [9, 3, 10, 18], [11, 8, 6, 2], [11, 13, 6, 2]),
  sun: blocks([9, 9, 6, 6], [11, 3, 2, 4], [11, 17, 2, 4], [3, 11, 4, 2], [17, 11, 4, 2]),
  moon: blocks([9, 2, 8, 3], [6, 5, 6, 14], [9, 19, 8, 3], [12, 5, 4, 3], [12, 16, 4, 3]),
  palette: blocks([5, 5, 14, 3], [3, 8, 18, 10], [5, 18, 10, 3], [8, 10, 2, 2], [12, 10, 2, 2], [15, 13, 2, 2]),
  grip: blocks([8, 5, 3, 3], [13, 5, 3, 3], [8, 11, 3, 3], [13, 11, 3, 3], [8, 17, 3, 3], [13, 17, 3, 3]),
  offline: blocks(
    [3, 7, 5, 3],
    [16, 7, 5, 3],
    [7, 12, 3, 3],
    [14, 12, 3, 3],
    [10, 17, 4, 4],
    [3, 3, 3, 3],
    [8, 8, 3, 3],
    [13, 13, 3, 3],
    [18, 18, 3, 3],
  ),
  refresh: blocks([6, 4, 12, 3], [3, 7, 3, 10], [18, 7, 3, 10], [6, 17, 12, 3], [15, 1, 3, 3], [15, 4, 6, 3]),
  logout: blocks([4, 3, 9, 3], [4, 3, 3, 18], [4, 18, 9, 3], [13, 10, 6, 3], [16, 7, 3, 3], [16, 13, 3, 3]),
  chevron: blocks([3, 7, 4, 4], [7, 11, 4, 4], [10, 14, 4, 4], [13, 11, 4, 4], [17, 7, 4, 4]),
};
