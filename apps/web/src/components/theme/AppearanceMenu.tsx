'use client';

import { useState } from 'react';

import { Icon } from '@/components/icons';
import { AppearanceSettings } from '@/components/theme/AppearanceSettings';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Modal } from '@/components/ui/Modal';
import { findTheme } from '@/lib/themes';

/** Acceso a la apariencia en las pantallas donde todavia no hay sesion. */
export function AppearanceMenu() {
  const { theme, iconPack } = usePreferences();
  const [isOpen, setIsOpen] = useState(false);
  const activeTheme = findTheme(theme);

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
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
        <AppearanceSettings />
      </Modal>
    </>
  );
}
