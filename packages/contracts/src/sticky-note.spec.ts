import { describe, expect, it } from 'vitest';

import {
  MAX_NOTE_LENGTH,
  applyNoteMove,
  clampNotePosition,
  isNoteColor,
  nextNotePosition,
  normalizeNoteText,
  sortNotes,
  translateNotePosition,
} from './sticky-note';
import { buildStickyNote } from './test-factories';

describe('clampNotePosition', () => {
  it('deja intactas las posiciones dentro del mural', () => {
    expect(clampNotePosition(25.5, 70)).toEqual({ x: 25.5, y: 70 });
  });

  it('encierra lo que se sale por cualquier borde', () => {
    expect(clampNotePosition(-40, 180)).toEqual({ x: 0, y: 100 });
  });

  it('convierte valores nulos o corruptos en el origen', () => {
    expect(clampNotePosition(null, undefined)).toEqual({ x: 0, y: 0 });
    expect(clampNotePosition('hola', Number.NaN)).toEqual({ x: 0, y: 0 });
    expect(clampNotePosition(Number.POSITIVE_INFINITY, -Number.POSITIVE_INFINITY)).toEqual({
      x: 0,
      y: 0,
    });
  });

  it('acepta numeros en texto, como los que llegan de un formulario', () => {
    expect(clampNotePosition('30', '45.678')).toEqual({ x: 30, y: 45.68 });
  });
});

describe('normalizeNoteText', () => {
  it('recorta los espacios sobrantes', () => {
    expect(normalizeNoteText('  llamar el martes  ')).toBe('llamar el martes');
  });

  it('descarta el texto vacio o ausente', () => {
    expect(normalizeNoteText('   ')).toBeNull();
    expect(normalizeNoteText(null)).toBeNull();
    expect(normalizeNoteText(undefined)).toBeNull();
  });

  it('nunca devuelve mas del maximo permitido', () => {
    expect(normalizeNoteText('a'.repeat(MAX_NOTE_LENGTH + 50))).toHaveLength(MAX_NOTE_LENGTH);
  });
});

describe('isNoteColor', () => {
  it('reconoce los colores del catalogo', () => {
    expect(isNoteColor('rosa')).toBe(true);
  });

  it('rechaza cualquier otro valor', () => {
    expect(isNoteColor('turquesa')).toBe(false);
    expect(isNoteColor(null)).toBe(false);
    expect(isNoteColor(7)).toBe(false);
  });
});

describe('sortNotes', () => {
  it('ordena de la mas antigua a la mas reciente', () => {
    const notes = [
      buildStickyNote({ id: 'b', createdAt: '2026-02-01T00:00:00.000Z' }),
      buildStickyNote({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];

    expect(sortNotes(notes).map((note) => note.id)).toEqual(['a', 'b']);
  });

  it('desempata por identificador para que el orden sea igual en todos lados', () => {
    const notes = [
      buildStickyNote({ id: 'z', createdAt: '2026-01-01T00:00:00.000Z' }),
      buildStickyNote({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
    ];

    expect(sortNotes(notes).map((note) => note.id)).toEqual(['a', 'z']);
  });

  it('no modifica la lista recibida', () => {
    const notes = [buildStickyNote({ id: 'b' }), buildStickyNote({ id: 'a' })];
    sortNotes(notes);

    expect(notes.map((note) => note.id)).toEqual(['b', 'a']);
  });
});

describe('nextNotePosition', () => {
  it('coloca la primera nota cerca de la esquina', () => {
    expect(nextNotePosition([])).toEqual({ x: 4, y: 4 });
  });

  it('escalona cada nota nueva para que no se tapen', () => {
    const first = nextNotePosition([]);
    const second = nextNotePosition([buildStickyNote()]);

    expect(second).not.toEqual(first);
  });

  it('se mantiene dentro del mural por muchas notas que haya', () => {
    const notes = Array.from({ length: 40 }, (_, index) =>
      buildStickyNote({ id: `nota-${index}` }),
    );

    for (let count = 0; count <= notes.length; count += 1) {
      const position = nextNotePosition(notes.slice(0, count));
      expect(position.x).toBeGreaterThanOrEqual(0);
      expect(position.x).toBeLessThanOrEqual(100);
      expect(position.y).toBeGreaterThanOrEqual(0);
      expect(position.y).toBeLessThanOrEqual(100);
    }
  });
});

describe('applyNoteMove', () => {
  const movedAt = '2026-03-01T10:00:00.000Z';

  it('reubica solo la nota indicada', () => {
    const notes = [
      buildStickyNote({ id: 'a', createdAt: '2026-01-01T00:00:00.000Z' }),
      buildStickyNote({ id: 'b', createdAt: '2026-01-02T00:00:00.000Z', x: 50, y: 50 }),
    ];

    const moved = applyNoteMove(notes, 'a', 80, 20, movedAt);

    expect(moved.find((note) => note.id === 'a')).toMatchObject({ x: 80, y: 20, updatedAt: movedAt });
    expect(moved.find((note) => note.id === 'b')).toMatchObject({ x: 50, y: 50 });
  });

  it('encierra el destino dentro del mural', () => {
    const moved = applyNoteMove([buildStickyNote({ id: 'a' })], 'a', 400, -30, movedAt);

    expect(moved[0]).toMatchObject({ x: 100, y: 0 });
  });

  it('ignora un identificador desconocido en lugar de fallar', () => {
    const notes = [buildStickyNote({ id: 'a', x: 10, y: 10 })];

    expect(applyNoteMove(notes, 'inexistente', 90, 90, movedAt)).toEqual(notes);
  });

  it('no modifica la lista recibida', () => {
    const notes = [buildStickyNote({ id: 'a', x: 10, y: 10 })];
    applyNoteMove(notes, 'a', 90, 90, movedAt);

    expect(notes[0]).toMatchObject({ x: 10, y: 10 });
  });
});

describe('translateNotePosition', () => {
  const track = { width: 1000, height: 500 };

  it('traduce el arrastre en pixeles a porcentaje del recorrido', () => {
    const moved = translateNotePosition({ x: 10, y: 10 }, 100, 50, track.width, track.height);

    expect(moved).toEqual({ x: 20, y: 20 });
  });

  it('mantiene la nota dentro del mural al arrastrar mas alla del borde', () => {
    const moved = translateNotePosition({ x: 90, y: 90 }, 900, 900, track.width, track.height);

    expect(moved).toEqual({ x: 100, y: 100 });
  });

  it('conserva la posicion cuando el mural aun no tiene tamano', () => {
    expect(translateNotePosition({ x: 30, y: 40 }, 100, 100, 0, 0)).toEqual({ x: 30, y: 40 });
  });
});
