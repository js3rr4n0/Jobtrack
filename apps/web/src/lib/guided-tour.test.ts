import { describe, expect, it } from 'vitest';

import {
  TOUR_STEPS,
  TOUR_STORAGE_KEY,
  padRect,
  readTourCompleted,
  shouldShowTour,
  writeTourCompleted,
} from './guided-tour';

function memoryStorage(initial: Record<string, string> = {}): Storage {
  const values = new Map(Object.entries(initial));
  return {
    get length() {
      return values.size;
    },
    clear: () => values.clear(),
    getItem: (key: string) => values.get(key) ?? null,
    key: (index: number) => Array.from(values.keys())[index] ?? null,
    removeItem: (key: string) => void values.delete(key),
    setItem: (key: string, value: string) => void values.set(key, value),
  };
}

describe('TOUR_STEPS', () => {
  it('define pasos con destino, titulo y descripcion', () => {
    expect(TOUR_STEPS.length).toBeGreaterThan(0);
    for (const step of TOUR_STEPS) {
      expect(step.target.length).toBeGreaterThan(0);
      expect(step.title.length).toBeGreaterThan(0);
      expect(step.description.length).toBeGreaterThan(0);
    }
  });

  it('no repite identificadores', () => {
    const ids = TOUR_STEPS.map((step) => step.id);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('shouldShowTour', () => {
  it('se muestra a quien no tiene postulaciones y no lo ha visto', () => {
    expect(shouldShowTour(0, false)).toBe(true);
  });

  it('no se muestra si ya hay postulaciones', () => {
    expect(shouldShowTour(3, false)).toBe(false);
  });

  it('no se repite una vez completado', () => {
    expect(shouldShowTour(0, true)).toBe(false);
  });
});

describe('persistencia del tutorial', () => {
  it('no lo muestra si no hay almacenamiento disponible', () => {
    expect(readTourCompleted(undefined)).toBe(true);
  });

  it('recuerda que ya se completo', () => {
    const storage = memoryStorage();

    expect(readTourCompleted(storage)).toBe(false);
    writeTourCompleted(storage);
    expect(storage.getItem(TOUR_STORAGE_KEY)).toBe('true');
    expect(readTourCompleted(storage)).toBe(true);
  });

  it('tolera un almacenamiento bloqueado', () => {
    const failing = {
      length: 0,
      clear: () => undefined,
      getItem: () => {
        throw new Error('bloqueado');
      },
      key: () => null,
      removeItem: () => undefined,
      setItem: () => {
        throw new Error('bloqueado');
      },
    } as Storage;

    expect(readTourCompleted(failing)).toBe(true);
    expect(() => writeTourCompleted(failing)).not.toThrow();
  });
});

describe('padRect', () => {
  it('agranda el recorte por los cuatro lados', () => {
    expect(padRect({ top: 50, left: 40, width: 100, height: 30 }, 10)).toEqual({
      top: 40,
      left: 30,
      width: 120,
      height: 50,
    });
  });

  it('nunca deja el recorte fuera de la pantalla', () => {
    const rect = padRect({ top: 4, left: 2, width: 100, height: 30 }, 10);

    expect(rect.top).toBe(0);
    expect(rect.left).toBe(0);
  });
});
