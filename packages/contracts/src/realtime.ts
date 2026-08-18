import { JobApplication } from './job-application';
import { StickyNote } from './sticky-note';

/** Nombre del evento que la API emite a todos los dispositivos de un usuario. */
export const BOARD_EVENT = 'board:changed';

export const BOARD_CHANGE_KINDS = ['created', 'updated', 'moved', 'deleted'] as const;
export type BoardChangeKind = (typeof BOARD_CHANGE_KINDS)[number];

export interface BoardChangeEvent {
  readonly kind: BoardChangeKind;
  readonly applicationId: string;
  /** Ausente cuando la postulacion fue eliminada. */
  readonly application: JobApplication | null;
  readonly emittedAt: string;
  /**
   * Identificador del cliente que origino el cambio. Permite que el dispositivo
   * emisor ignore su propio eco y evite renderizados redundantes.
   */
  readonly originId: string | null;
}

/** Nombre del evento que la API emite cuando cambia el mural de notas. */
export const NOTE_EVENT = 'note:changed';

export const NOTE_CHANGE_KINDS = ['created', 'updated', 'moved', 'deleted'] as const;
export type NoteChangeKind = (typeof NOTE_CHANGE_KINDS)[number];

export interface NoteChangeEvent {
  readonly kind: NoteChangeKind;
  readonly noteId: string;
  /** Ausente cuando la nota fue eliminada. */
  readonly note: StickyNote | null;
  readonly emittedAt: string;
  readonly originId: string | null;
}
