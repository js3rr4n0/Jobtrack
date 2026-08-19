import { Injectable, NotFoundException } from '@nestjs/common';
import {
  DEFAULT_NOTE_COLOR,
  NoteChangeEvent,
  NoteChangeKind,
  StickyNote,
  clampNotePosition,
  nextNotePosition,
  normalizeNoteText,
} from '@deska/contracts';

import { BoardEventPublisher } from '../realtime/board-event.publisher';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { UpdateStickyNoteDto } from './dto/update-sticky-note.dto';
import { StickyNotePatch, StickyNotesRepository } from './repositories/sticky-notes.repository';

const MISSING_NOTE = 'La nota no existe o no te pertenece.';

@Injectable()
export class StickyNotesService {
  constructor(
    private readonly repository: StickyNotesRepository,
    private readonly eventPublisher: BoardEventPublisher,
  ) {}

  async listByUser(userId: string): Promise<StickyNote[]> {
    return this.repository.findAllByUser(userId);
  }

  /**
   * Crea una nota. Si no se indica posición, se escalona respecto a las
   * existentes para que nunca quede oculta bajo otra.
   */
  async create(
    userId: string,
    payload: CreateStickyNoteDto,
    originId: string | null,
  ): Promise<StickyNote> {
    const existing = await this.repository.findAllByUser(userId);
    const fallback = nextNotePosition(existing);
    const position = clampNotePosition(payload.x ?? fallback.x, payload.y ?? fallback.y);

    const created = await this.repository.create({
      userId,
      text: normalizeNoteText(payload.text) ?? '',
      color: payload.color ?? DEFAULT_NOTE_COLOR,
      ...position,
    });

    this.notify(userId, 'created', created.id, created, originId);
    return created;
  }

  async update(
    userId: string,
    noteId: string,
    payload: UpdateStickyNoteDto,
    originId: string | null,
  ): Promise<StickyNote> {
    const patch = buildPatch(payload);
    const updated = await this.repository.update(userId, noteId, patch);

    if (!updated) {
      throw new NotFoundException(MISSING_NOTE);
    }

    // Mover y editar comparten endpoint, pero se anuncian distinto para que la
    // interfaz pueda reaccionar solo al arrastre cuando le interese.
    const kind: NoteChangeKind = patch.text === undefined && patch.color === undefined
      ? 'moved'
      : 'updated';

    this.notify(userId, kind, updated.id, updated, originId);
    return updated;
  }

  async remove(userId: string, noteId: string, originId: string | null): Promise<void> {
    const wasRemoved = await this.repository.remove(userId, noteId);

    if (!wasRemoved) {
      throw new NotFoundException(MISSING_NOTE);
    }

    this.notify(userId, 'deleted', noteId, null, originId);
  }

  private notify(
    userId: string,
    kind: NoteChangeKind,
    noteId: string,
    note: StickyNote | null,
    originId: string | null,
  ): void {
    const event: NoteChangeEvent = {
      kind,
      noteId,
      note,
      emittedAt: new Date().toISOString(),
      originId,
    };

    this.eventPublisher.publishNote(userId, event);
  }
}

/** Traduce el DTO en un parche que solo contiene los campos enviados. */
function buildPatch(payload: UpdateStickyNoteDto): StickyNotePatch {
  const patch: StickyNotePatch = {};
  const position = clampNotePosition(payload.x, payload.y);

  if (payload.text !== undefined) {
    Object.assign(patch, { text: normalizeNoteText(payload.text) ?? '' });
  }

  if (payload.color !== undefined) {
    Object.assign(patch, { color: payload.color });
  }

  if (payload.x !== undefined) {
    Object.assign(patch, { x: position.x });
  }

  if (payload.y !== undefined) {
    Object.assign(patch, { y: position.y });
  }

  return patch;
}
