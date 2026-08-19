import { StickyNote } from '@jobtrack/contracts';

/** Datos persistibles de una nota, sin los sellos de tiempo que pone el almacén. */
export type NewStickyNoteRecord = Omit<StickyNote, 'id' | 'createdAt' | 'updatedAt'>;

export type StickyNotePatch = Partial<Omit<StickyNote, 'id' | 'userId' | 'createdAt' | 'updatedAt'>>;

/**
 * Puerto de persistencia del mural. Igual que el de postulaciones, permite
 * sustituir Supabase por un almacén en memoria sin tocar la capa de dominio.
 */
export abstract class StickyNotesRepository {
  abstract findAllByUser(userId: string): Promise<StickyNote[]>;
  abstract findById(userId: string, noteId: string): Promise<StickyNote | null>;
  abstract create(record: NewStickyNoteRecord): Promise<StickyNote>;
  abstract update(userId: string, noteId: string, patch: StickyNotePatch): Promise<StickyNote | null>;
  abstract remove(userId: string, noteId: string): Promise<boolean>;
}
