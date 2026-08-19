import { DEFAULT_ICON_PACK, type IconPackId, isIconPackId } from '@/components/icons';
import { DEFAULT_THEME, RENAMED_THEME_ENTRIES, THEME_IDS, type ThemeId, resolveThemeId } from '@/lib/themes';

export interface Preferences {
  readonly theme: ThemeId;
  readonly iconPack: IconPackId;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: DEFAULT_THEME,
  iconPack: DEFAULT_ICON_PACK,
};

export const THEME_STORAGE_KEY = 'deska.theme';
export const ICON_PACK_STORAGE_KEY = 'deska.iconPack';

/**
 * Claves usadas antes de que el producto se llamara Deska. Se leen como
 * respaldo para que el cambio de nombre no borre las preferencias de quien ya
 * tenía la aplicación abierta; al guardar se escriben ya con la clave nueva.
 */
export const LEGACY_STORAGE_KEYS: Readonly<Record<string, string>> = {
  [THEME_STORAGE_KEY]: 'jobtrack.theme',
  [ICON_PACK_STORAGE_KEY]: 'jobtrack.iconPack',
};

/** Lee una clave y, si no existe, su equivalente anterior. */
function readWithFallback(storage: Storage, key: string): string | null {
  const current = storage.getItem(key);

  if (current !== null) {
    return current;
  }

  const legacy = LEGACY_STORAGE_KEYS[key];
  return legacy ? storage.getItem(legacy) : null;
}

/**
 * Consulta la preferencia de color del sistema. `matchMedia` no existe en el
 * servidor ni en algunos contextos empotrados, y puede lanzar donde el acceso
 * esta restringido, asi que la consulta va protegida y cae al tema claro.
 */
export function prefersDarkScheme(view: Window | undefined): boolean {
  try {
    return view?.matchMedia?.('(prefers-color-scheme: dark)').matches ?? false;
  } catch {
    return false;
  }
}

/**
 * Lectura tolerante a fallos: el modo privado de algunos navegadores lanza al
 * tocar `localStorage`, y un valor corrupto no debe romper el arranque. Cuando
 * no hay una eleccion guardada manda la preferencia del sistema, de modo que
 * quien tiene el equipo en oscuro no recibe una pantalla blanca de golpe.
 */
export function readStoredPreferences(
  storage: Storage | undefined,
  prefersDark = false,
): Preferences {
  const fallback: Preferences = {
    ...DEFAULT_PREFERENCES,
    theme: prefersDark ? 'dark' : DEFAULT_PREFERENCES.theme,
  };

  if (!storage) {
    return fallback;
  }

  try {
    const theme = resolveThemeId(readWithFallback(storage, THEME_STORAGE_KEY));
    const iconPack = readWithFallback(storage, ICON_PACK_STORAGE_KEY);

    return {
      theme: theme ?? fallback.theme,
      iconPack: isIconPackId(iconPack) ? iconPack : fallback.iconPack,
    };
  } catch {
    return fallback;
  }
}

export function writeStoredPreferences(storage: Storage | undefined, preferences: Preferences): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, preferences.theme);
    storage.setItem(ICON_PACK_STORAGE_KEY, preferences.iconPack);
  } catch {
    // Sin almacenamiento persistente la preferencia solo dura la sesión actual.
  }
}

/**
 * Script que se ejecuta antes de la hidratación para aplicar el tema y evitar
 * un parpadeo de colores al cargar la página.
 *
 * Las dos consultas van en bloques `try` separados a proposito: si el
 * almacenamiento esta bloqueado, la preferencia del sistema que ya se resolvio
 * sigue en pie en lugar de perderse junto con ella. Resuelve el tema igual que
 * `readStoredPreferences`, de modo que la hidratación no lo cambia despues.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  var theme = '${DEFAULT_THEME}';

  try {
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      theme = 'dark';
    }
  } catch (error) {
    // Sin matchMedia se conserva el tema claro.
  }

  try {
    var allowed = ${JSON.stringify(THEME_IDS)};
    var renamed = ${JSON.stringify(RENAMED_THEME_ENTRIES)};
    var stored =
      window.localStorage.getItem('${THEME_STORAGE_KEY}') ||
      window.localStorage.getItem('${LEGACY_STORAGE_KEYS[THEME_STORAGE_KEY]}');
    if (allowed.indexOf(stored) >= 0) {
      theme = stored;
    } else if (renamed[stored]) {
      theme = renamed[stored];
    }
  } catch (error) {
    // Sin almacenamiento manda la preferencia del sistema resuelta arriba.
  }

  document.documentElement.dataset.theme = theme;
})();
`;
