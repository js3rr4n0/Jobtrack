'use client';

import { STATUS_CATALOG, type ApplicationStatus } from '@deska/contracts';

/** Etapas que recorre un proceso vivo, en orden. */
const STAGES: readonly ApplicationStatus[] = ['wishlist', 'applied', 'interview', 'offer', 'hired'];

export interface StageProgressProps {
  status: ApplicationStatus;
}

/**
 * Cuánto ha avanzado un proceso, de un vistazo. Los procesos descartados no
 * muestran barra: no quedaron a medias, se cerraron, y pintar una barra a medio
 * llenar sugeriría que aún pueden avanzar.
 */
export function StageProgress({ status }: StageProgressProps) {
  if (status === 'rejected') {
    return null;
  }

  const reached = STAGES.indexOf(status);
  const label = `Etapa ${reached + 1} de ${STAGES.length}: ${STATUS_CATALOG[status].label}`;

  return (
    <div
      className="mt-2 flex items-center gap-1"
      role="progressbar"
      aria-valuemin={1}
      aria-valuemax={STAGES.length}
      aria-valuenow={reached + 1}
      aria-label={label}
      title={label}
    >
      {STAGES.map((stage, index) => (
        <span
          key={stage}
          className={`h-1 flex-1 rounded-full ${index <= reached ? 'bg-accent' : 'bg-sunken'}`}
        />
      ))}
    </div>
  );
}
