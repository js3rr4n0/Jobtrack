/**
 * Tamano de una nota en el mural. Vive aparte porque lo necesitan tanto la
 * nota (para dibujarse) como el mural (para convertir un arrastre en pixeles a
 * la posicion porcentual que se guarda).
 */
export const NOTE_WIDTH = '11rem';
export const NOTE_HEIGHT = '7.5rem';

/** Convierte una medida en `rem` a pixeles usando el tamano base del documento. */
export function remToPixels(value: string, rootFontSize: number): number {
  return Number.parseFloat(value) * rootFontSize;
}

/**
 * Recorrido util del mural: lo que puede desplazarse una nota sin salirse.
 * Nunca es negativo, de modo que un mural mas estrecho que una nota no invierte
 * el sentido del arrastre.
 */
export function trackSize(muralSize: number, noteSize: number): number {
  return Math.max(muralSize - noteSize, 0);
}
