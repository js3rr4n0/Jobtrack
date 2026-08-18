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

/**
 * Identificadores de las dos vistas especiales del selector de areas. Ambos
 * empiezan por un espacio y `normalizeCategory` recorta los extremos, asi que
 * ningun area escrita por una persona puede coincidir con ellos.
 */
export const ALL_CATEGORIES = ' todas';
export const UNCATEGORIZED_CATEGORY = ' sin-area';

export interface CategorySummary {
  readonly name: string;
  readonly total: number;
}

function normalizeCategory(value: string | null): string | null {
  const trimmed = value?.trim();
  return trimmed && trimmed.length > 0 ? trimmed : null;
}

/**
 * Areas presentes en el tablero, ordenadas alfabeticamente y con su recuento.
 * Se derivan de las propias postulaciones: no hay catalogo que mantener ni que
 * pueda quedar desincronizado con los datos.
 */
export function listCategories(applications: readonly JobApplication[]): CategorySummary[] {
  const totals = new Map<string, number>();

  for (const application of applications) {
    const category = normalizeCategory(application.category);
    if (category) {
      totals.set(category, (totals.get(category) ?? 0) + 1);
    }
  }

  return Array.from(totals, ([name, total]) => ({ name, total })).sort((first, second) =>
    first.name.localeCompare(second.name),
  );
}

/** Cuantas postulaciones no tienen area asignada. */
export function countUncategorized(applications: readonly JobApplication[]): number {
  return applications.filter((application) => normalizeCategory(application.category) === null)
    .length;
}

/**
 * Filtra por area. `ALL_CATEGORIES` devuelve el tablero completo y
 * `UNCATEGORIZED_CATEGORY` solo lo que aun no esta clasificado.
 */
export function filterByCategory(
  applications: readonly JobApplication[],
  category: string,
): JobApplication[] {
  if (category === ALL_CATEGORIES) {
    return [...applications];
  }

  if (category === UNCATEGORIZED_CATEGORY) {
    return applications.filter(
      (application) => normalizeCategory(application.category) === null,
    );
  }

  return applications.filter(
    (application) => normalizeCategory(application.category) === category,
  );
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
