'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import type {
  ApplicationStatus,
  BoardChangeEvent,
  CreateJobApplicationInput,
  JobApplication,
  UpdateJobApplicationInput,
} from '@jobtrack/contracts';
import {
  ALL_CATEGORIES,
  buildGamificationProfile,
  countUncategorized,
  filterByCategory,
  groupIntoColumns,
  listCategories,
  reorderBoard,
} from '@jobtrack/contracts';

import { useNetworkStatus } from '@/hooks/use-network-status';
import { ApiClient, ApiError } from '@/lib/api-client';
import { applyRemoteChange, isOwnEcho, replaceApplication } from '@/lib/board-state';

export type BoardStatus = 'loading' | 'ready' | 'error';

export interface BoardFeedback {
  readonly tone: 'error' | 'success';
  readonly message: string;
  readonly details: readonly string[];
}

export interface UseBoardResult {
  readonly columns: ReturnType<typeof groupIntoColumns>;
  readonly categories: ReturnType<typeof listCategories>;
  readonly uncategorized: number;
  readonly totalApplications: number;
  readonly activeCategory: string;
  readonly selectCategory: (category: string) => void;
  readonly gamification: ReturnType<typeof buildGamificationProfile>;
  readonly status: BoardStatus;
  readonly feedback: BoardFeedback | null;
  readonly isOnline: boolean;
  /** Nivel recien alcanzado, para celebrarlo una sola vez en la interfaz. */
  readonly celebratedLevel: number | null;
  readonly dismissFeedback: () => void;
  readonly dismissCelebration: () => void;
  readonly reload: () => Promise<void>;
  readonly createApplication: (input: CreateJobApplicationInput) => Promise<boolean>;
  readonly updateApplication: (id: string, input: UpdateJobApplicationInput) => Promise<boolean>;
  readonly moveApplication: (
    id: string,
    status: ApplicationStatus,
    boardOrder: number,
  ) => Promise<boolean>;
  readonly deleteApplication: (id: string) => Promise<boolean>;
  /** Punto de entrada de los eventos del tablero recibidos por el canal comun. */
  readonly applyRemoteEvent: (event: BoardChangeEvent) => void;
}

const GENERIC_ERROR = 'No fue posible completar la operacion. Intentalo de nuevo.';

function describeError(error: unknown): BoardFeedback {
  if (error instanceof ApiError) {
    return { tone: 'error', message: error.message, details: error.details };
  }

  return { tone: 'error', message: GENERIC_ERROR, details: [] };
}

/**
 * Estado del tablero: carga inicial, mutaciones optimistas, sincronizacion en
 * tiempo real y traduccion de fallos a mensajes legibles.
 */
export function useBoard(client: ApiClient | null, originId: string): UseBoardResult {
  const [applications, setApplications] = useState<JobApplication[]>([]);
  const [status, setStatus] = useState<BoardStatus>('loading');
  const [feedback, setFeedback] = useState<BoardFeedback | null>(null);
  const [celebratedLevel, setCelebratedLevel] = useState<number | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>(ALL_CATEGORIES);

  const isOnline = useNetworkStatus();
  const lastLevel = useRef<number | null>(null);

  const gamification = useMemo(() => buildGamificationProfile(applications), [applications]);
  const categories = useMemo(() => listCategories(applications), [applications]);
  const uncategorized = useMemo(() => countUncategorized(applications), [applications]);

  // El tablero muestra solo el area elegida; la capa de juego sigue midiendo
  // todo el progreso, porque el nivel es de la persona, no de un area.
  const visible = useMemo(
    () => filterByCategory(applications, activeCategory),
    [applications, activeCategory],
  );

  const columns = useMemo(() => groupIntoColumns(visible), [visible]);

  const reload = useCallback(async () => {
    if (!client) {
      return;
    }

    setStatus('loading');

    try {
      const snapshot = await client.getBoard();
      setApplications(snapshot.columns.flatMap((column) => column.applications));
      setStatus('ready');
      setFeedback(null);
    } catch (error) {
      setStatus('error');
      setFeedback(describeError(error));
    }
  }, [client]);

  useEffect(() => {
    void reload();
  }, [reload]);

  // Celebra el ascenso de nivel una unica vez por cambio.
  useEffect(() => {
    if (status !== 'ready') {
      return;
    }

    const currentLevel = gamification.progress.level;

    if (lastLevel.current !== null && currentLevel > lastLevel.current) {
      setCelebratedLevel(currentLevel);
    }

    lastLevel.current = currentLevel;
  }, [gamification.progress.level, status]);

  // Al recuperar la conexion, el tablero se recarga para descartar divergencias.
  useEffect(() => {
    if (isOnline && status === 'error') {
      void reload();
    }
  }, [isOnline, status, reload]);

  const runMutation = useCallback(
    async (mutation: () => Promise<void>, successMessage?: string): Promise<boolean> => {
      if (!client) {
        return false;
      }

      try {
        await mutation();
        setFeedback(successMessage ? { tone: 'success', message: successMessage, details: [] } : null);
        return true;
      } catch (error) {
        setFeedback(describeError(error));
        return false;
      }
    },
    [client],
  );

  const createApplication = useCallback(
    (input: CreateJobApplicationInput) =>
      runMutation(async () => {
        const created = await client!.createApplication(input);
        setApplications((current) => [...current, created]);
      }, 'Postulacion registrada.'),
    [client, runMutation],
  );

  const updateApplication = useCallback(
    (id: string, input: UpdateJobApplicationInput) =>
      runMutation(async () => {
        const updated = await client!.updateApplication(id, input);
        setApplications((current) => replaceApplication(current, updated));
      }, 'Cambios guardados.'),
    [client, runMutation],
  );

  const deleteApplication = useCallback(
    (id: string) =>
      runMutation(async () => {
        await client!.deleteApplication(id);
        setApplications((current) => current.filter((application) => application.id !== id));
      }, 'Postulacion eliminada.'),
    [client, runMutation],
  );

  /**
   * El movimiento se refleja de inmediato con el mismo algoritmo que usa el
   * servidor; si la peticion falla, se restaura el tablero anterior.
   */
  const moveApplication = useCallback(
    async (id: string, targetStatus: ApplicationStatus, boardOrder: number) => {
      if (!client) {
        return false;
      }

      const previous = applications;
      setApplications(reorderBoard(previous, id, targetStatus, boardOrder));

      try {
        await client.moveApplication(id, { status: targetStatus, boardOrder });
        setFeedback(null);
        return true;
      } catch (error) {
        setApplications(previous);
        setFeedback(describeError(error));
        return false;
      }
    },
    [applications, client],
  );

  const applyRemoteEvent = useCallback(
    (event: BoardChangeEvent) => {
      if (isOwnEcho(event, originId)) {
        return;
      }

      setApplications((current) => applyRemoteChange(current, event));
    },
    [originId],
  );

  return {
    columns,
    categories,
    uncategorized,
    totalApplications: applications.length,
    activeCategory,
    selectCategory: setActiveCategory,
    gamification,
    status,
    feedback,
    isOnline,
    celebratedLevel,
    dismissFeedback: useCallback(() => setFeedback(null), []),
    dismissCelebration: useCallback(() => setCelebratedLevel(null), []),
    reload,
    createApplication,
    updateApplication,
    moveApplication,
    deleteApplication,
    applyRemoteEvent,
  };
}
