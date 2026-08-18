import { type NoteChangeEvent, type StickyNote, sortNotes } from '@jobtrack/contracts';

/**
 * Aplica al mural local un cambio recibido por el canal de tiempo real. Es una
 * funcion pura: devuelve siempre un arreglo nuevo y ya ordenado, de modo que
 * todos los dispositivos muestran el mismo mural.
 */
export function applyRemoteNoteChange(
  notes: readonly StickyNote[],
  event: NoteChangeEvent,
): StickyNote[] {
  if (event.kind === 'deleted') {
    return notes.filter((note) => note.id !== event.noteId);
  }

  if (!event.note) {
    return [...notes];
  }

  const incoming = event.note;
  const exists = notes.some((note) => note.id === incoming.id);

  return sortNotes(
    exists ? notes.map((note) => (note.id === incoming.id ? incoming : note)) : [...notes, incoming],
  );
}

/** Reemplaza una nota existente conservando el orden del mural. */
export function replaceNote(notes: readonly StickyNote[], updated: StickyNote): StickyNote[] {
  return notes.map((note) => (note.id === updated.id ? updated : note));
}
