import { describe, expect, it } from 'vitest';

import { NOTE_HEIGHT, NOTE_WIDTH, remToPixels, trackSize } from './note-geometry';

describe('remToPixels', () => {
  it('convierte el tamaño de una nota a pixeles', () => {
    expect(remToPixels(NOTE_WIDTH, 16)).toBe(192);
    expect(remToPixels(NOTE_HEIGHT, 16)).toBe(136);
  });

  it('respeta un tamaño base distinto', () => {
    expect(remToPixels('10rem', 20)).toBe(200);
  });
});

describe('trackSize', () => {
  it('descuenta el tamaño de la nota del mural', () => {
    expect(trackSize(800, 192)).toBe(608);
  });

  it('nunca devuelve un recorrido negativo', () => {
    expect(trackSize(100, 192)).toBe(0);
  });
});
