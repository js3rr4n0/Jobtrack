'use client';

import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import type { ApplicationStatus, BoardColumn as BoardColumnModel, JobApplication } from '@deska/contracts';

import { ApplicationCard } from '@/components/board/ApplicationCard';
import { columnDroppableId } from '@/lib/drag-and-drop';

const ACCENT_BY_STATUS: Record<ApplicationStatus, string> = {
  wishlist: 'bg-wishlist',
  applied: 'bg-applied',
  interview: 'bg-interview',
  offer: 'bg-offer',
  hired: 'bg-hired',
  rejected: 'bg-rejected',
};

export interface BoardColumnProps {
  column: BoardColumnModel;
  onEdit: (application: JobApplication) => void;
  onDelete: (application: JobApplication) => void;
  onStatusChange: (application: JobApplication, status: ApplicationStatus) => void;
}

/** Columna del tablero: recibe tarjetas soltadas y las ordena verticalmente. */
export function BoardColumn({ column, onEdit, onDelete, onStatusChange }: BoardColumnProps) {
  const { setNodeRef, isOver } = useDroppable({ id: columnDroppableId(column.status) });
  const cardIds = column.applications.map((application) => application.id);

  return (
    <section
      aria-label={`Columna ${column.label}`}
      className="flex w-full min-w-0 flex-col gap-3"
    >
      <header className="flex items-center justify-between gap-2 px-1">
        <div className="flex items-center gap-2">
          <span
            aria-hidden="true"
            className={`h-2.5 w-2.5 rounded-full ${ACCENT_BY_STATUS[column.status]}`}
          />
          <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
            {column.label}
          </h3>
        </div>
        <span className="rounded-control bg-accent-soft px-2 py-0.5 text-xs font-semibold text-primary">
          {column.applications.length}
        </span>
      </header>

      <div
        ref={setNodeRef}
        className={`flex min-h-[8rem] flex-1 flex-col gap-3 rounded-card border p-2.5 shadow-sunken transition-colors ${
          isOver ? 'border-accent bg-accent-soft' : 'border-subtle bg-sunken'
        }`}
      >
        <SortableContext items={cardIds} strategy={verticalListSortingStrategy}>
          {column.applications.map((application) => (
            <ApplicationCard
              key={application.id}
              application={application}
              onEdit={onEdit}
              onDelete={onDelete}
              onStatusChange={onStatusChange}
            />
          ))}
        </SortableContext>

        {column.applications.length === 0 ? (
          <p className="m-auto max-w-[14rem] text-center text-xs text-secondary">
            {column.description}
          </p>
        ) : null}
      </div>
    </section>
  );
}
