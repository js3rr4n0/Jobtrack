import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  ICON_PACK_STORAGE_KEY,
  THEME_STORAGE_KEY,
  readStoredPreferences,
  writeStoredPreferences,
} from './preferences';

function createMemoryStorage(initial: Record<string, string> = {}): Storage {
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

function createFailingStorage(): Storage {
  const fail = () => {
    throw new Error('El almacenamiento no esta disponible.');
  };

  return {
    length: 0,
    clear: fail,
    getItem: fail,
    key: fail,
    removeItem: fail,
    setItem: fail,
  };
}

describe('readStoredPreferences', () => {
  it('usa los valores por defecto sin almacenamiento disponible', () => {
    expect(readStoredPreferences(undefined)).toEqual(DEFAULT_PREFERENCES);
  });

  it('usa los valores por defecto cuando no hay nada guardado', () => {
    expect(readStoredPreferences(createMemoryStorage())).toEqual(DEFAULT_PREFERENCES);
  });

  it('recupera las preferencias guardadas', () => {
    const storage = createMemoryStorage({
      [THEME_STORAGE_KEY]: 'galaxy',
      [ICON_PACK_STORAGE_KEY]: 'pixel',
    });

    expect(readStoredPreferences(storage)).toEqual({ theme: 'galaxy', iconPack: 'pixel' });
  });

  it('descarta valores corruptos en lugar de propagarlos', () => {
    const storage = createMemoryStorage({
      [THEME_STORAGE_KEY]: 'tema-inexistente',
      [ICON_PACK_STORAGE_KEY]: '{}',
    });

    expect(readStoredPreferences(storage)).toEqual(DEFAULT_PREFERENCES);
  });

  it('no falla si el navegador bloquea el almacenamiento', () => {
    expect(readStoredPreferences(createFailingStorage())).toEqual(DEFAULT_PREFERENCES);
  });
});

describe('writeStoredPreferences', () => {
  it('persiste tema y paquete de iconos', () => {
    const storage = createMemoryStorage();

    writeStoredPreferences(storage, { theme: 'anime', iconPack: 'pixel' });

    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('anime');
    expect(storage.getItem(ICON_PACK_STORAGE_KEY)).toBe('pixel');
  });

  it('ignora en silencio un almacenamiento bloqueado', () => {
    expect(() =>
      writeStoredPreferences(createFailingStorage(), DEFAULT_PREFERENCES),
    ).not.toThrow();
  });
});
