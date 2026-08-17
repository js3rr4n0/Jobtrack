'use client';

import { Icon, type IconName } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

interface Highlight {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
}

const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: 'layers',
    title: 'Tablero kanban',
    description: 'Seis columnas de seguimiento y arrastre para mover cada oferta de etapa.',
  },
  {
    icon: 'trophy',
    title: 'Progreso jugable',
    description: 'Cada avance suma experiencia, sube tu nivel y desbloquea logros.',
  },
  {
    icon: 'refresh',
    title: 'Sincronizacion en vivo',
    description: 'Los cambios llegan al instante a todos tus dispositivos conectados.',
  },
  {
    icon: 'palette',
    title: 'Ocho temas',
    description: 'Claro, oscuro, minimalista, pixel, gaming, anime y galaxy.',
  },
];

export function LandingHighlights() {
  const { iconPack } = usePreferences();

  return (
    <ul className="grid gap-3 sm:grid-cols-2">
      {HIGHLIGHTS.map((highlight) => (
        <li key={highlight.title} className="surface-card flex items-start gap-3 p-4">
          <span className="mt-0.5 text-accent">
            <Icon name={highlight.icon} pack={iconPack} size={20} />
          </span>
          <div>
            <p className="text-sm font-semibold text-primary">{highlight.title}</p>
            <p className="text-sm text-secondary">{highlight.description}</p>
          </div>
        </li>
      ))}
    </ul>
  );
}
