'use client';

import { useState } from 'react';

import { ICON_PACKS, Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Modal } from '@/components/ui/Modal';
import { soundscapeForTheme } from '@/lib/ambient-music';
import { THEMES, THEME_FAMILIES, findTheme } from '@/lib/themes';

/** Selector de tema visual y de paquete de iconos. */
export function AppearanceMenu() {
  const { theme, iconPack, music, setTheme, setIconPack, setMusic } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = findTheme(theme);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        data-tour="apariencia"
        className="focus-ring flex items-center gap-2 rounded-control border border-subtle bg-raised px-3 py-2 text-sm text-primary hover:border-strong"
      >
        <Icon name="palette" pack={iconPack} size={18} />
        <span className="hidden sm:inline">{activeTheme.label}</span>
        <span className="sm:hidden">Apariencia</span>
      </button>

      <Modal
        isOpen={isOpen}
        title="Apariencia"
        description="Elige el tema visual y el estilo de iconos. La preferencia se guarda en este dispositivo."
        onClose={() => setIsOpen(false)}
      >
        <div className="flex flex-col gap-6">
          {THEME_FAMILIES.map((family) => (
            <fieldset key={family}>
              <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
                {family}
              </legend>
              <div className="grid gap-2 sm:grid-cols-2">
                {THEMES.filter((definition) => definition.family === family).map((definition) => (
                  <label
                    key={definition.id}
                    className={`focus-within:ring-2 focus-within:ring-accent-strong flex cursor-pointer items-start gap-3 rounded-control border p-3 ${
                      theme === definition.id ? 'border-accent bg-accent-soft' : 'border-subtle'
                    }`}
                  >
                    <input
                      type="radio"
                      name="theme"
                      value={definition.id}
                      checked={theme === definition.id}
                      onChange={() => setTheme(definition.id)}
                      className="sr-only"
                    />
                    <span className="mt-0.5 flex shrink-0 gap-1" aria-hidden="true">
                      {definition.swatches.map((color) => (
                        <span
                          key={color}
                          style={{ backgroundColor: color }}
                          className="h-4 w-4 rounded-full border border-subtle"
                        />
                      ))}
                    </span>
                    <span className="min-w-0">
                      <span className="block text-sm font-semibold text-primary">
                        {definition.label}
                      </span>
                      <span className="block text-xs text-secondary">{definition.description}</span>
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
          ))}

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
              Iconos
            </legend>
            <div className="grid gap-2 sm:grid-cols-2">
              {ICON_PACKS.map((pack) => (
                <label
                  key={pack.id}
                  className={`focus-within:ring-2 focus-within:ring-accent-strong flex cursor-pointer items-start gap-3 rounded-control border p-3 ${
                    iconPack === pack.id ? 'border-accent bg-accent-soft' : 'border-subtle'
                  }`}
                >
                  <input
                    type="radio"
                    name="iconPack"
                    value={pack.id}
                    checked={iconPack === pack.id}
                    onChange={() => setIconPack(pack.id)}
                    className="sr-only"
                  />
                  <span className="mt-0.5 flex shrink-0 gap-1.5 text-primary" aria-hidden="true">
                    <Icon name="trophy" pack={pack.id} size={18} />
                    <Icon name="flame" pack={pack.id} size={18} />
                    <Icon name="calendar" pack={pack.id} size={18} />
                  </span>
                  <span className="min-w-0">
                    <span className="block text-sm font-semibold text-primary">{pack.label}</span>
                    <span className="block text-xs text-secondary">{pack.description}</span>
                  </span>
                </label>
              ))}
            </div>
          </fieldset>

          <fieldset>
            <legend className="mb-2 text-xs font-semibold uppercase tracking-wide text-secondary">
              Musica de fondo
            </legend>
            <label className="flex cursor-pointer items-start gap-3 rounded-control border border-subtle p-3 focus-within:ring-2 focus-within:ring-accent-strong">
              <input
                type="checkbox"
                checked={music}
                onChange={(event) => setMusic(event.target.checked)}
                className="mt-1 h-4 w-4 accent-accent"
              />
              <span className="min-w-0">
                <span className="block text-sm font-semibold text-primary">
                  Reproducir un ambiente suave
                </span>
                <span className="block text-xs text-secondary">
                  Se sintetiza en tu navegador, a volumen bajo y sin descargar ningun archivo.
                  Con el tema actual suena: {soundscapeForTheme(theme).label}.
                </span>
              </span>
            </label>
          </fieldset>
        </div>
      </Modal>
    </>
  );
}
