'use client';

import {
  DndContext,
  type DragEndEvent,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import { useRef } from 'react';
import { type StickyNote, translateNotePosition } from '@deska/contracts';

import { NOTE_HEIGHT, NOTE_WIDTH, remToPixels, trackSize } from '@/components/notes/note-geometry';
import { StickyNoteCard } from '@/components/notes/StickyNoteCard';

export interface NoteWallProps {
  notes: readonly StickyNote[];
  onMove: (noteId: string, x: number, y: number) => void;
  onEdit: (note: StickyNote) => void;
}

const ROOT_FONT_SIZE = 16;

/**
 * Mural de notas adhesivas con arrastre libre por puntero y por teclado. El
 * gesto se mide en pixeles y se guarda en porcentaje, de modo que la misma nota
 * ocupa el mismo lugar relativo en la computadora y en el teléfono.
 */
export function NoteWall({ notes, onMove, onEdit }: NoteWallProps) {
  const mural = useRef<HTMLDivElement | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } }),
    useSensor(KeyboardSensor),
  );

  const handleDragEnd = (event: DragEndEvent) => {
    const note = notes.find((candidate) => candidate.id === String(event.active.id));
    const bounds = mural.current?.getBoundingClientRect();

    if (!note || !bounds) {
      return;
    }

    const moved = translateNotePosition(
      note,
      event.delta.x,
      event.delta.y,
      trackSize(bounds.width, remToPixels(NOTE_WIDTH, ROOT_FONT_SIZE)),
      trackSize(bounds.height, remToPixels(NOTE_HEIGHT, ROOT_FONT_SIZE)),
    );

    if (moved.x !== note.x || moved.y !== note.y) {
      onMove(note.id, moved.x, moved.y);
    }
  };

  return (
    <DndContext sensors={sensors} onDragEnd={handleDragEnd}>
      <div
        ref={mural}
        aria-label="Mural de notas"
        className="relative h-72 w-full overflow-hidden rounded-card border border-subtle bg-sunken shadow-sunken sm:h-80"
      >
        {notes.length === 0 ? (
          <p className="absolute inset-0 flex items-center justify-center px-6 text-center text-sm text-secondary">
            Aun no tienes notas. Crea una para anotar recordatorios sueltos y arrastrala donde
            quieras.
          </p>
        ) : (
          notes.map((note) => <StickyNoteCard key={note.id} note={note} onEdit={onEdit} />)
        )}
      </div>
    </DndContext>
  );
}
