'use client';

import { Icon, type IconName } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';

interface Highlight {
  readonly icon: IconName;
  readonly title: string;
  readonly description: string;
}

/**
 * Cada tarjeta nombra primero lo que la persona consigue y solo despues como
 * lo consigue. Todas describen algo que la aplicación hace de verdad: la fecha
 * en la tarjeta, las seis etapas, el resumen numerico y el canal en vivo.
 */
const HIGHLIGHTS: readonly Highlight[] = [
  {
    icon: 'calendar',
    title: 'No se te pasa ninguna entrevista',
    description:
      'Cada tarjeta lleva la fecha de su entrevista y las notas de ese proceso, a la vista en el tablero.',
  },
  {
    icon: 'layers',
    title: 'Ves dónde se atascan tus procesos',
    description:
      'Seis etapas, de «me interesa» a «contratado», y cada tarjeta recuerda desde cuándo está ahí.',
  },
  {
    icon: 'trophy',
    title: 'Mides lo que de verdad avanza',
    description:
      'Cuántas postulaciones enviaste, cuántas entrevistas conseguiste y cuántas ofertas siguen vivas. El nivel y los logros solo son el empujón.',
  },
  {
    icon: 'refresh',
    title: 'El mismo tablero en todas partes',
    description:
      'Anotas algo en el teléfono al salir de una entrevista y ya está en la computadora al llegar a casa.',
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
