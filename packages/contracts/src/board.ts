import {
  ApplicationStatus,
  JobApplication,
  ORDERED_STATUSES,
  StatusDefinition,
} from './job-application';

export interface BoardColumn {
  readonly status: ApplicationStatus;
  readonly label: string;
  readonly description: string;
  readonly applications: readonly JobApplication[];
}

const byBoardOrder = (first: JobApplication, second: JobApplication): number =>
  first.boardOrder === second.boardOrder
    ? first.createdAt.localeCompare(second.createdAt)
    : first.boardOrder - second.boardOrder;

/** Reparte las postulaciones en las columnas del tablero, en orden estable. */
export function groupIntoColumns(applications: readonly JobApplication[]): BoardColumn[] {
  return ORDERED_STATUSES.map((definition: StatusDefinition) => ({
    status: definition.id,
    label: definition.label,
    description: definition.description,
    applications: applications
      .filter((application) => application.status === definition.id)
      .sort(byBoardOrder),
  }));
}

function clamp(value: number, minimum: number, maximum: number): number {
  return Math.min(Math.max(value, minimum), maximum);
}

/**
 * Calcula el estado del tablero tras mover una tarjeta, renumerando las
 * columnas afectadas sin dejar huecos.
 *
 * Es una funcion pura compartida por la API y la interfaz: ambas obtienen
 * exactamente el mismo orden, de modo que la vista optimista del navegador
 * coincide con lo que finalmente persiste el servidor.
 */
export function reorderBoard(
  applications: readonly JobApplication[],
  applicationId: string,
  targetStatus: ApplicationStatus,
  targetIndex: number,
): JobApplication[] {
  const moved = applications.find((application) => application.id === applicationId);

  if (!moved) {
    return [...applications];
  }

  const untouched = applications.filter(
    (application) =>
      application.id !== applicationId &&
      application.status !== targetStatus &&
      application.status !== moved.status,
  );

  const destination = applications
    .filter(
      (application) => application.status === targetStatus && application.id !== applicationId,
    )
    .sort(byBoardOrder);

  destination.splice(clamp(targetIndex, 0, destination.length), 0, {
    ...moved,
    status: targetStatus,
  });

  const renumberedDestination = destination.map((application, index) => ({
    ...application,
    boardOrder: index,
  }));

  if (moved.status === targetStatus) {
    return [...untouched, ...renumberedDestination];
  }

  const renumberedOrigin = applications
    .filter(
      (application) => application.status === moved.status && application.id !== applicationId,
    )
    .sort(byBoardOrder)
    .map((application, index) => ({ ...application, boardOrder: index }));

  return [...untouched, ...renumberedOrigin, ...renumberedDestination];
}

/** Devuelve solo las postulaciones cuya posicion o estado cambio. */
export function diffBoardPositions(
  previous: readonly JobApplication[],
  next: readonly JobApplication[],
): JobApplication[] {
  const previousById = new Map(previous.map((application) => [application.id, application]));

  return next.filter((application) => {
    const before = previousById.get(application.id);
    return (
      before === undefined ||
      before.status !== application.status ||
      before.boardOrder !== application.boardOrder
    );
  });
}
