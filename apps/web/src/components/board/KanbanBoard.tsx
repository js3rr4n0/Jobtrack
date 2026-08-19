'use client';

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  closestCorners,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { sortableKeyboardCoordinates } from '@dnd-kit/sortable';
import type { ApplicationStatus, BoardColumn as BoardColumnModel, JobApplication } from '@jobtrack/contracts';

import { BoardColumn } from '@/components/board/BoardColumn';
import { resolveDropTarget } from '@/lib/drag-and-drop';

export interface KanbanBoardProps {
  columns: readonly BoardColumnModel[];
  onMove: (applicationId: string, status: ApplicationStatus, boardOrder: number) => void;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  onStatusChange: (application: JobApplication, status: ApplicationStatus) => void;
}

/** Tablero kanban con arrastre por puntero y por teclado. */
export function KanbanBoard({
  columns,
  onMove,
  onEdit,
  onDelete,
  onStatusChange,
}: KanbanBoardProps) {
  const sensors = useSensors(
    // Un umbral corto evita que un toque para editar se interprete como arrastre.
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const target = resolveDropTarget(
      columns,
      String(event.active.id),
      event.over ? String(event.over.id) : null,
    );

    if (target) {
      onMove(String(event.active.id), target.status, target.boardOrder);
    }
  };

  return (
    <DndContext sensors={sensors} collisionDetection={closestCorners} onDragEnd={handleDragEnd}>
      {/* Rejilla en lugar de fila desplazable: las seis columnas siempre caben
          en pantalla y solo cambia cuántas entran por fila según el ancho. */}
      <div className="grid grid-cols-1 items-start gap-4 sm:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6">
        {columns.map((column) => (
          <BoardColumn
            key={column.status}
            column={column}
            onEdit={onEdit}
            onDelete={onDelete}
            onStatusChange={onStatusChange}
          />
        ))}
      </div>
    </DndContext>
  );
}
