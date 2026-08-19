import type { BoardChangeEvent, JobApplication } from '@jobtrack/contracts';

/**
 * Aplica al listado local un cambio recibido por el canal de tiempo real.
 * Es una funcion pura: no muta la entrada y siempre devuelve un arreglo nuevo,
 * lo que mantiene predecible el renderizado de React.
 */
export function applyRemoteChange(
  applications: readonly JobApplication[],
  event: BoardChangeEvent,
): JobApplication[] {
  if (event.kind === 'deleted') {
    return applications.filter((application) => application.id !== event.applicationId);
  }

  if (!event.application) {
    return [...applications];
  }

  const incoming = event.application;
  const exists = applications.some((application) => application.id === incoming.id);

  return exists
    ? applications.map((application) => (application.id === incoming.id ? incoming : application))
    : [...applications, incoming];
}

/** Reemplaza una postulación existente conservando el orden del arreglo. */
export function replaceApplication(
  applications: readonly JobApplication[],
  updated: JobApplication,
): JobApplication[] {
  return applications.map((application) =>
    application.id === updated.id ? updated : application,
  );
}

/**
 * Decide si un evento remoto debe ignorarse por provenir de este mismo
 * dispositivo, evitando renderizados redundantes tras un cambio optimista.
 * Sirve para cualquier evento del canal, sea del tablero o del mural.
 */
export function isOwnEcho(event: { readonly originId: string | null }, originId: string): boolean {
  return event.originId !== null && event.originId === originId;
}
