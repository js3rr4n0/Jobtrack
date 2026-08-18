import { describe, expect, it } from 'vitest';

import { NOTE_HEIGHT, NOTE_WIDTH, remToPixels, trackSize } from './note-geometry';

describe('remToPixels', () => {
  it('convierte el tamano de una nota a pixeles', () => {
    expect(remToPixels(NOTE_WIDTH, 16)).toBe(176);
    expect(remToPixels(NOTE_HEIGHT, 16)).toBe(120);
  });

  it('respeta un tamano base distinto', () => {
    expect(remToPixels('10rem', 20)).toBe(200);
  });
});

describe('trackSize', () => {
  it('descuenta el tamano de la nota del mural', () => {
    expect(trackSize(800, 176)).toBe(624);
  });

  it('nunca devuelve un recorrido negativo', () => {
    expect(trackSize(100, 176)).toBe(0);
  });
});
