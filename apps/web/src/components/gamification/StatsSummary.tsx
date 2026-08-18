'use client';

import { STATUS_CATALOG, type PlayerStats } from '@jobtrack/contracts';

export interface StatsSummaryProps {
  stats: PlayerStats;
}

/** Resumen numerico del avance real detras de la capa de juego. */
export function StatsSummary({ stats }: StatsSummaryProps) {
  const entries = [
    { label: 'Postulaciones', value: stats.totalApplications },
    { label: STATUS_CATALOG.interview.label, value: stats.byStatus.interview },
    { label: STATUS_CATALOG.offer.label, value: stats.byStatus.offer },
    { label: 'Racha mas larga', value: `${stats.longestStreakDays} d` },
  ];

  return (
    <section className="surface-card p-4" aria-label="Resumen de actividad">
      <h3 className="mb-3 font-display text-sm font-semibold uppercase tracking-wide text-primary">
        Resumen
      </h3>
      <dl className="grid grid-cols-2 gap-3">
        {entries.map((entry) => (
          <div key={entry.label} className="rounded-control border border-subtle bg-base p-3">
            <dt className="text-xs text-secondary [overflow-wrap:anywhere]">{entry.label}</dt>
            <dd className="font-display text-xl font-semibold text-primary">{entry.value}</dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
