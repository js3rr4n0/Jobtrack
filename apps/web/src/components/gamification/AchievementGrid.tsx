'use client';

import type { AchievementState } from '@jobtrack/contracts';

import { Icon, type IconName } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

/** Traduce el icono declarado en el dominio a un nombre del catalogo visual. */
const ICON_BY_ACHIEVEMENT: Record<string, IconName> = {
  flag: 'flag',
  layers: 'layers',
  mic: 'mic',
  award: 'award',
  trophy: 'trophy',
  shield: 'shield',
  notebook: 'notebook',
  flame: 'flame',
};

export interface AchievementGridProps {
  achievements: readonly AchievementState[];
}

export function AchievementGrid({ achievements }: AchievementGridProps) {
  const { iconPack } = usePreferences();
  const unlockedCount = achievements.filter((achievement) => achievement.unlocked).length;

  return (
    <section className="surface-card p-4" aria-label="Logros">
      <header className="mb-3 flex items-center justify-between">
        <h3 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
          Logros
        </h3>
        <span className="text-xs text-secondary">
          {unlockedCount} de {achievements.length}
        </span>
      </header>

      <ul className="grid gap-2 sm:grid-cols-2">
        {achievements.map((achievement) => {
          const percent = Math.round((achievement.current / achievement.target) * 100);

          return (
            <li
              key={achievement.id}
              className={`rounded-control border p-3 ${
                achievement.unlocked ? 'border-accent bg-accent-soft' : 'border-subtle bg-base'
              }`}
            >
              <div className="flex items-start gap-2">
                <span
                  className={`mt-0.5 ${achievement.unlocked ? 'text-accent' : 'text-secondary'}`}
                >
                  <Icon
                    name={ICON_BY_ACHIEVEMENT[achievement.iconId] ?? 'award'}
                    pack={iconPack}
                    size={18}
                  />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm font-semibold text-primary">{achievement.name}</p>
                  <p className="text-xs text-secondary">{achievement.description}</p>
                  <p className="mt-1 text-xs font-medium text-secondary">
                    {achievement.unlocked
                      ? `Desbloqueado. Bonificacion de ${achievement.experienceBonus} puntos.`
                      : `Progreso ${achievement.current} de ${achievement.target} (${percent}%)`}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
      </ul>
    </section>
  );
}
