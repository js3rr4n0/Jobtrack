import { describe, expect, it } from 'vitest';

import {
  DEFAULT_PREFERENCES,
  ICON_PACK_STORAGE_KEY,
  MUSIC_STORAGE_KEY,
  THEME_STORAGE_KEY,
  THEME_BOOTSTRAP_SCRIPT,
  prefersDarkScheme,
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
    throw new Error('El almacenamiento no está disponible.');
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

    expect(readStoredPreferences(storage)).toEqual({
      theme: 'galaxy',
      iconPack: 'pixel',
      music: false,
    });
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

  it('adopta el tema oscuro del sistema mientras nadie haya elegido uno', () => {
    expect(readStoredPreferences(createMemoryStorage(), true).theme).toBe('dark');
    expect(readStoredPreferences(undefined, true).theme).toBe('dark');
  });

  it('recurre al sistema tambien cuando el almacenamiento esta bloqueado', () => {
    expect(readStoredPreferences(createFailingStorage(), true).theme).toBe('dark');
  });

  it('la eleccion guardada pesa mas que la preferencia del sistema', () => {
    const storage = createMemoryStorage({ [THEME_STORAGE_KEY]: 'light' });

    expect(readStoredPreferences(storage, true).theme).toBe('light');
  });

  it('descarta un tema corrupto y cae en el del sistema, no en el claro', () => {
    const storage = createMemoryStorage({ [THEME_STORAGE_KEY]: 'tema-inexistente' });

    expect(readStoredPreferences(storage, true).theme).toBe('dark');
  });
});

describe('prefersDarkScheme', () => {
  const viewWith = (matches: boolean) =>
    ({ matchMedia: () => ({ matches }) }) as unknown as Window;

  it('reconoce un sistema en modo oscuro', () => {
    expect(prefersDarkScheme(viewWith(true))).toBe(true);
    expect(prefersDarkScheme(viewWith(false))).toBe(false);
  });

  it('devuelve falso donde no existe matchMedia, como en el servidor', () => {
    expect(prefersDarkScheme(undefined)).toBe(false);
    expect(prefersDarkScheme({} as Window)).toBe(false);
  });

  it('no propaga el fallo de un entorno que restringe matchMedia', () => {
    const view = {
      matchMedia: () => {
        throw new Error('Consulta no permitida en este contexto.');
      },
    } as unknown as Window;

    expect(() => prefersDarkScheme(view)).not.toThrow();
    expect(prefersDarkScheme(view)).toBe(false);
  });
});

describe('THEME_BOOTSTRAP_SCRIPT', () => {
  /** Ejecuta el script de arranque sobre un entorno simulado. */
  const run = (options: { stored?: string | null; prefersDark?: boolean; throws?: boolean }) => {
    const root = { dataset: {} as Record<string, string> };
    const view = {
      matchMedia: (query: string) => ({ matches: Boolean(options.prefersDark) && query.includes('dark') }),
      localStorage: {
        getItem: () => {
          if (options.throws) {
            throw new Error('El almacenamiento no está disponible.');
          }
          return options.stored ?? null;
        },
      },
    };

    new Function('window', 'document', THEME_BOOTSTRAP_SCRIPT)(view, { documentElement: root });
    return root.dataset.theme;
  };

  it('aplica el tema guardado', () => {
    expect(run({ stored: 'galaxy' })).toBe('galaxy');
  });

  it('cae en el tema del sistema cuando no hay nada guardado', () => {
    expect(run({ stored: null, prefersDark: true })).toBe('dark');
    expect(run({ stored: null, prefersDark: false })).toBe('light');
  });

  it('conserva la preferencia del sistema aunque el almacenamiento falle', () => {
    expect(run({ throws: true, prefersDark: true })).toBe('dark');
  });

  it('ignora un tema que no pertenece al catalogo', () => {
    expect(run({ stored: 'tema-inexistente' })).toBe('light');
  });

  it('resuelve igual que readStoredPreferences, para no cambiar tras hidratar', () => {
    expect(run({ stored: null, prefersDark: true })).toBe(
      readStoredPreferences(createMemoryStorage(), true).theme,
    );
  });
});

describe('writeStoredPreferences', () => {
  it('persiste tema y paquete de iconos', () => {
    const storage = createMemoryStorage();

    writeStoredPreferences(storage, { theme: 'anime', iconPack: 'pixel', music: true });

    expect(storage.getItem(THEME_STORAGE_KEY)).toBe('anime');
    expect(storage.getItem(ICON_PACK_STORAGE_KEY)).toBe('pixel');
    expect(storage.getItem(MUSIC_STORAGE_KEY)).toBe('true');
  });

  it('la música queda apagada salvo que se haya activado explicitamente', () => {
    expect(readStoredPreferences(createMemoryStorage()).music).toBe(false);
    expect(
      readStoredPreferences(createMemoryStorage({ [MUSIC_STORAGE_KEY]: 'true' })).music,
    ).toBe(true);
  });

  it('ignora en silencio un almacenamiento bloqueado', () => {
    expect(() =>
      writeStoredPreferences(createFailingStorage(), DEFAULT_PREFERENCES),
    ).not.toThrow();
  });
});
