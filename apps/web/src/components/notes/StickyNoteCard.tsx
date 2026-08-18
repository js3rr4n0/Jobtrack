'use client';

import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import type { StickyNote } from '@jobtrack/contracts';

import { Icon } from '@/components/icons';
import { usePreferences } from '@/components/theme/PreferencesProvider';
import { NOTE_HEIGHT, NOTE_WIDTH } from '@/components/notes/note-geometry';

export interface StickyNoteCardProps {
  note: StickyNote;
  onEdit: (note: StickyNote) => void;
}

/**
 * Nota arrastrable. La posicion se expresa en porcentaje del recorrido util
 * (el mural menos la propia nota), asi que la nota nunca sobresale por ningun
 * borde por estrecha que sea la pantalla.
 */
export function StickyNoteCard({ note, onEdit }: StickyNoteCardProps) {
  const { iconPack } = usePreferences();
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: note.id,
  });

  return (
    <article
      ref={setNodeRef}
      data-color={note.color}
      className="sticky-note absolute flex flex-col gap-1 p-3"
      style={{
        width: NOTE_WIDTH,
        height: NOTE_HEIGHT,
        left: `calc(${note.x} * (100% - ${NOTE_WIDTH}) / 100)`,
        top: `calc(${note.y} * (100% - ${NOTE_HEIGHT}) / 100)`,
        transform: CSS.Translate.toString(transform),
        zIndex: isDragging ? 20 : 10,
        opacity: isDragging ? 0.85 : 1,
      }}
      aria-label={`Nota: ${note.text}`}
    >
      <div className="flex items-center justify-between">
        <button
          type="button"
          className="focus-ring cursor-grab rounded-control p-1"
          aria-label={`Mover la nota: ${note.text}`}
          {...attributes}
          {...listeners}
        >
          <Icon name="grip" pack={iconPack} size={16} />
        </button>
        <button
          type="button"
          className="focus-ring rounded-control p-1"
          aria-label={`Editar la nota: ${note.text}`}
          onClick={() => onEdit(note)}
        >
          <Icon name="edit" pack={iconPack} size={16} />
        </button>
      </div>

      {/* La nota tiene un tamano fijo para que el arrastre sea predecible; un
          texto mas largo se recorta con puntos suspensivos y se lee completo al
          abrir el editor. */}
      <p className="line-clamp-4 break-words text-sm leading-snug">{note.text}</p>
    </article>
  );
}
