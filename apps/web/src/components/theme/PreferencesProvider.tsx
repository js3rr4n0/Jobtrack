'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';

import type { IconPackId } from '@/components/icons';
import {
  DEFAULT_PREFERENCES,
  type Preferences,
  readStoredPreferences,
  writeStoredPreferences,
} from '@/lib/preferences';
import type { ThemeId } from '@/lib/themes';

interface PreferencesContextValue extends Preferences {
  setTheme: (theme: ThemeId) => void;
  setIconPack: (iconPack: IconPackId) => void;
}

const PreferencesContext = createContext<PreferencesContextValue | null>(null);

export function PreferencesProvider({ children }: { children: ReactNode }) {
  const [preferences, setPreferences] = useState<Preferences>(DEFAULT_PREFERENCES);

  // El estado inicial se lee tras montar para que el HTML del servidor y el del
  // cliente coincidan; el parpadeo lo evita el script de arranque del layout.
  useEffect(() => {
    setPreferences(readStoredPreferences(window.localStorage));
  }, []);

  useEffect(() => {
    document.documentElement.dataset.theme = preferences.theme;
    writeStoredPreferences(window.localStorage, preferences);
  }, [preferences]);

  const setTheme = useCallback((theme: ThemeId) => {
    setPreferences((current) => ({ ...current, theme }));
  }, []);

  const setIconPack = useCallback((iconPack: IconPackId) => {
    setPreferences((current) => ({ ...current, iconPack }));
  }, []);

  const value = useMemo<PreferencesContextValue>(
    () => ({ ...preferences, setTheme, setIconPack }),
    [preferences, setTheme, setIconPack],
  );

  return <PreferencesContext.Provider value={value}>{children}</PreferencesContext.Provider>;
}

export function usePreferences(): PreferencesContextValue {
  const context = useContext(PreferencesContext);

  if (!context) {
    throw new Error('usePreferences debe usarse dentro de PreferencesProvider.');
  }

  return context;
}
