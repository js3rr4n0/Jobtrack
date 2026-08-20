'use client';

import { STATUS_CATALOG, type PlayerStats } from '@deska/contracts';

export interface StatsSummaryProps {
  stats: PlayerStats;
}

/** Resumen numérico del avance real detras de la capa de juego. */
export function StatsSummary({ stats }: StatsSummaryProps) {
  const entries = [
    { label: 'Postulaciones', value: stats.totalApplications, urgent: false },
    { label: STATUS_CATALOG.interview.label, value: stats.byStatus.interview, urgent: false },
    { label: STATUS_CATALOG.offer.label, value: stats.byStatus.offer, urgent: false },
    // Lo unico del resumen que reclama una accion hoy, asi que se destaca
    // cuando hay algo pendiente y se apaga cuando no queda nada por hacer.
    { label: 'Seguimientos', value: stats.pendingFollowUps, urgent: stats.pendingFollowUps > 0 },
  ];

  return (
    <section className="surface-card p-4" aria-label="Resumen de actividad">
      <h3 className="mb-3 font-display text-sm font-bold uppercase tracking-wide text-primary">
        Resumen
      </h3>
      <dl className="grid grid-cols-2 gap-3">
        {entries.map((entry) => (
          <div key={entry.label} className="rounded-control border border-subtle bg-sunken p-3 shadow-sunken">
            <dt className="text-xs text-secondary [overflow-wrap:anywhere]">{entry.label}</dt>
            <dd
              className={`font-display text-xl font-semibold ${entry.urgent ? 'text-warning' : 'text-primary'}`}
            >
              {entry.value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}
