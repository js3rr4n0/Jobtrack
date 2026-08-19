/**
 * Tamaño de una nota en el mural. Vive aparte porque lo necesitan tanto la
 * nota (para dibujarse) como el mural (para convertir un arrastre en pixeles a
 * la posición porcentual que se guarda).
 */
export const NOTE_WIDTH = '12rem';
export const NOTE_HEIGHT = '8.5rem';

/** Convierte una medida en `rem` a pixeles usando el tamaño base del documento. */
export function remToPixels(value: string, rootFontSize: number): number {
  return Number.parseFloat(value) * rootFontSize;
}

/**
 * Recorrido útil del mural: lo que puede desplazarse una nota sin salirse.
 * Nunca es negativo, de modo que un mural más estrecho que una nota no invierte
 * el sentido del arrastre.
 */
export function trackSize(muralSize: number, noteSize: number): number {
  return Math.max(muralSize - noteSize, 0);
}
