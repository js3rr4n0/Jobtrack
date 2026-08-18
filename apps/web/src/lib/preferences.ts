import { DEFAULT_ICON_PACK, type IconPackId, isIconPackId } from '@/components/icons';
import { DEFAULT_THEME, type ThemeId, isThemeId } from '@/lib/themes';

export interface Preferences {
  readonly theme: ThemeId;
  readonly iconPack: IconPackId;
  /** La musica de fondo empieza apagada: nadie espera que una web suene sola. */
  readonly music: boolean;
}

export const DEFAULT_PREFERENCES: Preferences = {
  theme: DEFAULT_THEME,
  iconPack: DEFAULT_ICON_PACK,
  music: false,
};

export const THEME_STORAGE_KEY = 'jobtrack.theme';
export const ICON_PACK_STORAGE_KEY = 'jobtrack.iconPack';
export const MUSIC_STORAGE_KEY = 'jobtrack.music';

/**
 * Lectura tolerante a fallos: el modo privado de algunos navegadores lanza al
 * tocar `localStorage`, y un valor corrupto no debe romper el arranque.
 */
export function readStoredPreferences(storage: Storage | undefined): Preferences {
  if (!storage) {
    return DEFAULT_PREFERENCES;
  }

  try {
    const theme = storage.getItem(THEME_STORAGE_KEY);
    const iconPack = storage.getItem(ICON_PACK_STORAGE_KEY);

    return {
      theme: isThemeId(theme) ? theme : DEFAULT_PREFERENCES.theme,
      iconPack: isIconPackId(iconPack) ? iconPack : DEFAULT_PREFERENCES.iconPack,
      music: storage.getItem(MUSIC_STORAGE_KEY) === 'true',
    };
  } catch {
    return DEFAULT_PREFERENCES;
  }
}

export function writeStoredPreferences(storage: Storage | undefined, preferences: Preferences): void {
  if (!storage) {
    return;
  }

  try {
    storage.setItem(THEME_STORAGE_KEY, preferences.theme);
    storage.setItem(ICON_PACK_STORAGE_KEY, preferences.iconPack);
    storage.setItem(MUSIC_STORAGE_KEY, String(preferences.music));
  } catch {
    // Sin almacenamiento persistente la preferencia solo dura la sesion actual.
  }
}

/**
 * Script que se ejecuta antes de la hidratacion para aplicar el tema guardado
 * y evitar un parpadeo de colores al cargar la pagina.
 */
export const THEME_BOOTSTRAP_SCRIPT = `
(function () {
  try {
    var theme = window.localStorage.getItem('${THEME_STORAGE_KEY}');
    var allowed = ${JSON.stringify(['light', 'dark', 'pixel-pink', 'pixel-blue', 'gaming', 'anime', 'minimal', 'galaxy'])};
    document.documentElement.dataset.theme = allowed.indexOf(theme) >= 0 ? theme : '${DEFAULT_THEME}';
  } catch (error) {
    document.documentElement.dataset.theme = '${DEFAULT_THEME}';
  }
})();
`;
