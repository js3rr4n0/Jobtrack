'use client';

import type { LevelProgress } from '@jobtrack/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

export interface LevelMeterProps {
  progress: LevelProgress;
  currentStreakDays: number;
}

/** Barra de experiencia y racha: el pulso principal de la capa de juego. */
export function LevelMeter({ progress, currentStreakDays }: LevelMeterProps) {
  const { iconPack } = usePreferences();

  return (
    <section className="surface-card p-4" aria-label="Progreso de nivel">
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <span className="flex h-11 w-11 items-center justify-center rounded-control bg-accent text-inverse">
            <Icon name="award" pack={iconPack} size={22} />
          </span>
          <div>
            <p className="text-xs uppercase tracking-wide text-secondary">
              Nivel {progress.level}
            </p>
            <p className="font-display text-base font-semibold text-primary">{progress.title}</p>
          </div>
        </div>

        <div className="flex items-center gap-1.5 text-sm font-semibold text-warning">
          <Icon name="flame" pack={iconPack} size={18} />
          <span>
            {currentStreakDays} {currentStreakDays === 1 ? 'día' : 'días'}
          </span>
        </div>
      </div>

      <div className="mt-4">
        <div
          role="progressbar"
          aria-valuemin={0}
          aria-valuemax={progress.experienceForNextLevel}
          aria-valuenow={progress.experienceIntoLevel}
          aria-label={`Experiencia hacia el nivel ${progress.level + 1}`}
          className="h-3 w-full overflow-hidden rounded-control border border-subtle bg-sunken shadow-sunken"
        >
          <div
            className="h-full bg-accent transition-[width] duration-500"
            style={{ width: `${Math.min(progress.percentToNextLevel, 100)}%` }}
          />
        </div>
        <p className="mt-1.5 text-xs text-secondary">
          {progress.experienceIntoLevel} de {progress.experienceForNextLevel} puntos para el nivel{' '}
          {progress.level + 1}. Total acumulado: {progress.experience}.
        </p>
      </div>
    </section>
  );
}
