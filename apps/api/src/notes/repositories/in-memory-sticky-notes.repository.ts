import { Injectable } from '@nestjs/common';
import { randomUUID } from 'node:crypto';
import { StickyNote, sortNotes } from '@jobtrack/contracts';

import {
  NewStickyNoteRecord,
  StickyNotePatch,
  StickyNotesRepository,
} from './sticky-notes.repository';

/** Almacén en memoria para desarrollo local y pruebas de integracion. */
@Injectable()
export class InMemoryStickyNotesRepository extends StickyNotesRepository {
  private readonly notes = new Map<string, StickyNote>();
  private lastTimestamp = 0;

  async findAllByUser(userId: string): Promise<StickyNote[]> {
    return sortNotes(Array.from(this.notes.values()).filter((note) => note.userId === userId));
  }

  async findById(userId: string, noteId: string): Promise<StickyNote | null> {
    const note = this.notes.get(noteId);
    return note && note.userId === userId ? note : null;
  }

  async create(record: NewStickyNoteRecord): Promise<StickyNote> {
    const now = this.nextTimestamp();
    const note: StickyNote = { ...record, id: randomUUID(), createdAt: now, updatedAt: now };

    this.notes.set(note.id, note);
    return note;
  }

  async update(userId: string, noteId: string, patch: StickyNotePatch): Promise<StickyNote | null> {
    const existing = await this.findById(userId, noteId);

    if (!existing) {
      return null;
    }

    const updated: StickyNote = { ...existing, ...patch, updatedAt: this.nextTimestamp() };
    this.notes.set(noteId, updated);
    return updated;
  }

  async remove(userId: string, noteId: string): Promise<boolean> {
    const existing = await this.findById(userId, noteId);

    if (!existing) {
      return false;
    }

    this.notes.delete(noteId);
    return true;
  }

  /** Utilidad para pruebas: vacía el almacenamiento entre casos. */
  clear(): void {
    this.notes.clear();
  }

  /**
   * Marca de tiempo estrictamente creciente. PostgreSQL distingue inserciones
   * consecutivas por su reloj de microsegundos; este almacén solo dispone de
   * milisegundos, así que avanza el suyo para no repetir el mismo instante y
   * conservar el orden de creación.
   */
  private nextTimestamp(): string {
    this.lastTimestamp = Math.max(Date.now(), this.lastTimestamp + 1);
    return new Date(this.lastTimestamp).toISOString();
  }
}
