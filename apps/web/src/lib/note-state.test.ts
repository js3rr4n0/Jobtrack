import { describe, expect, it } from 'vitest';
import { buildStickyNote, type NoteChangeEvent } from '@jobtrack/contracts';

import { applyRemoteNoteChange, replaceNote } from './note-state';

const event = (overrides: Partial<NoteChangeEvent>): NoteChangeEvent => ({
  kind: 'updated',
  noteId: 'nota-1',
  note: null,
  emittedAt: '2026-03-01T10:00:00.000Z',
  originId: null,
  ...overrides,
});

describe('applyRemoteNoteChange', () => {
  it('agrega una nota creada en otro dispositivo', () => {
    const incoming = buildStickyNote({ id: 'nota-2' });
    const result = applyRemoteNoteChange([buildStickyNote({ id: 'nota-1' })], {
      ...event({ kind: 'created', noteId: incoming.id, note: incoming }),
    });

    expect(result.map((note) => note.id)).toEqual(['nota-1', 'nota-2']);
  });

  it('reemplaza una nota movida sin duplicarla', () => {
    const original = buildStickyNote({ id: 'nota-1', x: 10, y: 10 });
    const moved = { ...original, x: 60, y: 40 };

    const result = applyRemoteNoteChange([original], event({ kind: 'moved', note: moved }));

    expect(result).toHaveLength(1);
    expect(result[0]).toMatchObject({ x: 60, y: 40 });
  });

  it('quita la nota eliminada', () => {
    const result = applyRemoteNoteChange(
      [buildStickyNote({ id: 'nota-1' }), buildStickyNote({ id: 'nota-2' })],
      event({ kind: 'deleted', noteId: 'nota-1' }),
    );

    expect(result.map((note) => note.id)).toEqual(['nota-2']);
  });

  it('ignora un evento sin nota en lugar de romper el mural', () => {
    const notes = [buildStickyNote({ id: 'nota-1' })];

    expect(applyRemoteNoteChange(notes, event({ note: null }))).toEqual(notes);
  });

  it('no modifica la lista recibida', () => {
    const notes = [buildStickyNote({ id: 'nota-1' })];
    applyRemoteNoteChange(notes, event({ kind: 'deleted', noteId: 'nota-1' }));

    expect(notes).toHaveLength(1);
  });
});

describe('replaceNote', () => {
  it('sustituye solo la nota indicada', () => {
    const notes = [buildStickyNote({ id: 'a', text: 'Uno' }), buildStickyNote({ id: 'b', text: 'Dos' })];
    const result = replaceNote(notes, { ...notes[0], text: 'Editado' });

    expect(result.map((note) => note.text)).toEqual(['Editado', 'Dos']);
  });

  it('deja el mural intacto si la nota no está', () => {
    const notes = [buildStickyNote({ id: 'a' })];

    expect(replaceNote(notes, buildStickyNote({ id: 'z' }))).toEqual(notes);
  });
});
