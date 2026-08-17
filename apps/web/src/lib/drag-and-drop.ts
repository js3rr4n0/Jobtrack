import type { ApplicationStatus, BoardColumn } from '@jobtrack/contracts';
import { isApplicationStatus } from '@jobtrack/contracts';

/** Prefijo que identifica a una columna como zona de destino. */
export const COLUMN_DROPPABLE_PREFIX = 'columna:';

export function columnDroppableId(status: ApplicationStatus): string {
  return `${COLUMN_DROPPABLE_PREFIX}${status}`;
}

export interface DropTarget {
  readonly status: ApplicationStatus;
  readonly boardOrder: number;
}

function statusFromDroppableId(droppableId: string): ApplicationStatus | null {
  if (!droppableId.startsWith(COLUMN_DROPPABLE_PREFIX)) {
    return null;
  }

  const status = droppableId.slice(COLUMN_DROPPABLE_PREFIX.length);
  return isApplicationStatus(status) ? status : null;
}

/**
 * Traduce el resultado de un arrastre a la columna y posicion de destino.
 * Devuelve `null` cuando la tarjeta se suelta fuera del tablero o cuando el
 * destino coincide con la posicion actual, evitando peticiones inutiles.
 */
export function resolveDropTarget(
  columns: readonly BoardColumn[],
  activeId: string,
  overId: string | null,
): DropTarget | null {
  if (!overId || activeId === overId) {
    return null;
  }

  const sourceColumn = columns.find((column) =>
    column.applications.some((application) => application.id === activeId),
  );

  if (!sourceColumn) {
    return null;
  }

  const sourceIndex = sourceColumn.applications.findIndex(
    (application) => application.id === activeId,
  );

  const targetStatus = statusFromDroppableId(overId);

  if (targetStatus) {
    const targetColumn = columns.find((column) => column.status === targetStatus);
    const isSameColumn = targetStatus === sourceColumn.status;
    const boardOrder = isSameColumn
      ? Math.max((targetColumn?.applications.length ?? 1) - 1, 0)
      : (targetColumn?.applications.length ?? 0);

    if (isSameColumn && boardOrder === sourceIndex) {
      return null;
    }

    return { status: targetStatus, boardOrder };
  }

  const destinationColumn = columns.find((column) =>
    column.applications.some((application) => application.id === overId),
  );

  if (!destinationColumn) {
    return null;
  }

  const overIndex = destinationColumn.applications.findIndex(
    (application) => application.id === overId,
  );

  if (destinationColumn.status === sourceColumn.status && overIndex === sourceIndex) {
    return null;
  }

  return { status: destinationColumn.status, boardOrder: overIndex };
}
