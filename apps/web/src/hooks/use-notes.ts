'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  CreateStickyNoteInput,
  NoteChangeEvent,
  StickyNote,
  UpdateStickyNoteInput,
} from '@deska/contracts';
import { applyNoteMove, sortNotes } from '@deska/contracts';

import { ApiClient, ApiError, type ApiErrorKind } from '@/lib/api-client';
import { isOwnEcho } from '@/lib/board-state';
import { applyRemoteNoteChange, replaceNote } from '@/lib/note-state';

export type NotesStatus = 'loading' | 'ready' | 'error';

export interface NotesFeedback {
  readonly kind: ApiErrorKind | null;
  readonly message: string;
  readonly details: readonly string[];
}

export interface UseNotesResult {
  readonly notes: readonly StickyNote[];
  readonly status: NotesStatus;
  readonly error: NotesFeedback | null;
  readonly reload: () => Promise<void>;
  readonly createNote: (input: CreateStickyNoteInput) => Promise<boolean>;
  readonly updateNote: (id: string, input: UpdateStickyNoteInput) => Promise<boolean>;
  readonly moveNote: (id: string, x: number, y: number) => Promise<boolean>;
  readonly deleteNote: (id: string) => Promise<boolean>;
  /** Punto de entrada de los eventos del mural recibidos por el canal comun. */
  readonly applyRemoteEvent: (event: NoteChangeEvent) => void;
}

const GENERIC_ERROR = 'No fue posible completar la operación sobre tus notas.';

function describeError(error: unknown): NotesFeedback {
  return error instanceof ApiError
    ? { kind: error.kind, message: error.message, details: error.details }
    : { kind: null, message: GENERIC_ERROR, details: [] };
}

/**
 * Estado del mural de notas. Sigue el mismo patron que el tablero: carga
 * inicial, mutaciones optimistas con restauracion si el servidor falla y
 * eventos remotos que llegan por el canal de tiempo real.
 */
export function useNotes(client: ApiClient | null, originId: string): UseNotesResult {
  const [notes, setNotes] = useState<StickyNote[]>([]);
  const [status, setStatus] = useState<NotesStatus>('loading');
  const [error, setError] = useState<NotesFeedback | null>(null);

  // El arrastre necesita leer el mural más reciente sin volver a suscribirse.
  const latestNotes = useRef<StickyNote[]>(notes);
  latestNotes.current = notes;

  const reload = useCallback(async () => {
    if (!client) {
      return;
    }

    setStatus('loading');

    try {
      setNotes(sortNotes(await client.getNotes()));
      setStatus('ready');
      setError(null);
    } catch (failure) {
      setStatus('error');
      setError(describeError(failure));
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const runMutation = useCallback(
    async (mutation: () => Promise<void>): Promise<boolean> => {
      if (!client) {
        return false;
      }

      try {
        await mutation();
        setError(null);
        return true;
      } catch (failure) {
        setError(describeError(failure));
        return false;
      }
    },
    [client],
  );

  const createNote = useCallback(
    (input: CreateStickyNoteInput) =>
      runMutation(async () => {
        const created = await client!.createNote(input);
        setNotes((current) => sortNotes([...current, created]));
      }),
    [client, runMutation],
  );

  const updateNote = useCallback(
    (id: string, input: UpdateStickyNoteInput) =>
      runMutation(async () => {
        const updated = await client!.updateNote(id, input);
        setNotes((current) => replaceNote(current, updated));
      }),
    [client, runMutation],
  );

  const deleteNote = useCallback(
    (id: string) =>
      runMutation(async () => {
        await client!.deleteNote(id);
        setNotes((current) => current.filter((note) => note.id !== id));
      }),
    [client, runMutation],
  );

  /**
   * El arrastre se refleja de inmediato con la misma funcion que aplica el
   * servidor; si la petición falla, el mural vuelve a su estado anterior.
   */
  const moveNote = useCallback(
    async (id: string, x: number, y: number) => {
      if (!client) {
        return false;
      }

      const previous = latestNotes.current;
      const moved = applyNoteMove(previous, id, x, y, new Date().toISOString());
      const target = moved.find((note) => note.id === id);

      if (!target) {
        return false;
      }

      setNotes(moved);

      try {
        await client.updateNote(id, { x: target.x, y: target.y });
        setError(null);
        return true;
      } catch (failure) {
        setNotes(previous);
        setError(describeError(failure));
        return false;
      }
    },
    [client],
  );

  const applyRemoteEvent = useCallback(
    (event: NoteChangeEvent) => {
      if (isOwnEcho(event, originId)) {
        return;
      }

      setNotes((current) => applyRemoteNoteChange(current, event));
    },
    [originId],
  );

  return useMemo(
    () => ({
      notes,
      status,
      error,
      reload,
      createNote,
      updateNote,
      moveNote,
      deleteNote,
      applyRemoteEvent,
    }),
    [notes, status, error, reload, createNote, updateNote, moveNote, deleteNote, applyRemoteEvent],
  );
}
