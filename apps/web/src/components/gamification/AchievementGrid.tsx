'use client';

import type { AchievementState } from '@deska/contracts';

import { Icon, type IconName } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { Accordion } from '@/components/ui/Accordion';

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
    // Los ocho logros ocupan mucho alto para ser una referencia ocasional, asi
    // que viven plegados: el recuento del encabezado basta para el vistazo
    // diario y la lista completa queda a un clic.
    <section className="surface-card px-3 py-2" aria-label="Logros">
      <Accordion title="Logros" badge={`${unlockedCount} de ${achievements.length}`}>
        <ul className="grid gap-2 pb-2">
        {achievements.map((achievement) => {
          const percent = Math.round((achievement.current / achievement.target) * 100);

          return (
            <li
              key={achievement.id}
              className={`rounded-control border p-3 ${
                achievement.unlocked ? 'border-accent bg-accent-soft shadow-card' : 'border-subtle bg-sunken'
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
                  <p className="text-sm font-semibold text-primary [overflow-wrap:anywhere]">{achievement.name}</p>
                  <p className="text-xs text-secondary [overflow-wrap:anywhere]">{achievement.description}</p>
                  <p className="mt-1 text-xs font-medium text-secondary">
                    {achievement.unlocked
                      ? `Desbloqueado. Bonificación de ${achievement.experienceBonus} puntos.`
                      : `Progreso ${achievement.current} de ${achievement.target} (${percent}%)`}
                  </p>
                </div>
              </div>
            </li>
          );
        })}
        </ul>
      </Accordion>
    </section>
  );
}
