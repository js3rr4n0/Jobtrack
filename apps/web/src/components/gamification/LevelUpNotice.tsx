'use client';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Button } from '@/components/ui/Button';

export interface LevelUpNoticeProps {
  level: number;
  title: string;
  onDismiss: () => void;
}

/** Aviso de ascenso de nivel: el refuerzo positivo del ciclo de juego. */
export function LevelUpNotice({ level, title, onDismiss }: LevelUpNoticeProps) {
  const { iconPack } = usePreferences();

  return (
    <div
      role="status"
      aria-live="polite"
      className="fixed inset-x-4 bottom-4 z-30 mx-auto max-w-md rounded-card border border-accent bg-overlay p-4 shadow-raised sm:inset-x-auto sm:right-6"
    >
      <div className="flex items-center gap-3">
        <span className="flex h-11 w-11 animate-level-pulse items-center justify-center rounded-control bg-accent text-inverse">
          <Icon name="trophy" pack={iconPack} size={22} />
        </span>
        <div className="flex-1">
          <p className="font-display text-sm font-bold text-primary">
            Subiste al nivel {level}
          </p>
          <p className="text-xs text-secondary">Nuevo rango: {title}</p>
        </div>
        <Button variant="ghost" onClick={onDismiss}>
          Continuar
        </Button>
      </div>
    </div>
  );
}
