'use client';

import Link from 'next/link';
import { useMemo } from 'react';
import { type AgendaEntry, type JobApplication, buildAgenda } from '@deska/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { formatDate, formatDateTime } from '@/lib/format';

export interface UpcomingAgendaProps {
  applications: readonly JobApplication[];
}

/** Cuándo es, dicho como se dice en voz alta. */
function describeWhen(entry: AgendaEntry): string {
  if (entry.daysUntil < -1) {
    return `hace ${Math.abs(entry.daysUntil)} días`;
  }

  if (entry.daysUntil === -1) {
    return 'ayer';
  }

  if (entry.daysUntil === 0) {
    return 'hoy';
  }

  return entry.daysUntil === 1 ? 'mañana' : `en ${entry.daysUntil} días`;
}

/**
 * Lo que toca hacer pronto, reunido de todo el tablero. Existe porque las
 * fechas viven repartidas por seis columnas: para saber si hay algo mañana hay
 * que repasar la lista entera, y eso es justo lo que nadie hace un lunes.
 */
export function UpcomingAgenda({ applications }: UpcomingAgendaProps) {
  const { iconPack } = usePreferences();

  // Se recalcula al cambiar el tablero. La fecha de referencia se toma en ese
  // momento, no en cada pintado, para que la lista no se reordene sola.
  const agenda = useMemo(() => buildAgenda(applications), [applications]);
  const overdue = agenda.filter((entry) => entry.isOverdue).length;

  return (
    <section className="surface-card layered p-4" aria-label="Próximas citas">
      <div className="mb-3 flex items-baseline justify-between gap-2">
        <h2 className="font-display text-sm font-semibold uppercase tracking-wide text-primary">
          Lo que viene
        </h2>
        {overdue > 0 ? (
          <span className="text-xs font-semibold text-warning">
            {overdue === 1 ? '1 vencida' : `${overdue} vencidas`}
          </span>
        ) : null}
      </div>

      {agenda.length === 0 ? (
        <p className="text-sm text-secondary">
          No tienes entrevistas ni seguimientos anotados. Ponle fecha a una vacante y aparecerá
          aquí.
        </p>
      ) : (
        <ol className="flex flex-col gap-1.5">
          {agenda.map((entry) => (
            <li key={`${entry.applicationId}-${entry.kind}`}>
              <Link
                href={`/tablero/${entry.applicationId}`}
                className="focus-ring flex items-start gap-2 rounded-control px-1.5 py-1.5 hover:bg-accent-soft"
              >
                <Icon
                  name={entry.kind === 'interview' ? 'calendar' : 'flag'}
                  pack={iconPack}
                  size={16}
                  className={`mt-0.5 shrink-0 ${entry.isOverdue ? 'text-warning' : 'text-accent'}`}
                />

                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium text-primary">
                    {entry.position}
                  </span>
                  <span className="block truncate text-xs text-secondary">{entry.company}</span>
                  <span
                    className={`block text-xs ${
                      entry.isOverdue ? 'font-semibold text-warning' : 'text-secondary'
                    }`}
                  >
                    {entry.kind === 'interview' ? 'Entrevista' : 'Seguimiento'} {describeWhen(entry)}
                    {' · '}
                    {entry.kind === 'interview' ? formatDateTime(entry.at) : formatDate(entry.at)}
                  </span>
                </span>
              </Link>
            </li>
          ))}
        </ol>
      )}
    </section>
  );
}
