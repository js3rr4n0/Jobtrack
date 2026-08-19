'use client';

import { useEffect, useState } from 'react';
import type { BoardChangeEvent, NoteChangeEvent } from '@deska/contracts';

import { getApiBaseUrl } from '@/lib/config';
import { type RealtimeStatus, subscribeToBoardChanges } from '@/lib/realtime-client';

export interface RealtimeChannelOptions {
  readonly accessToken: string | null;
  readonly onBoardChange: (event: BoardChangeEvent) => void;
  /** Puede omitirse en las pantallas que no muestran el mural de notas. */
  readonly onNoteChange?: (event: NoteChangeEvent) => void;
}

/** Constante, no una funcion nueva por renderizado: si cambiara de identidad
 *  el canal se cerraria y se volveria a abrir en cada pintado. */
const IGNORE_NOTES = () => undefined;

/**
 * Abre una única conexión de tiempo real para toda la pantalla y reparte los
 * eventos entre el tablero y el mural. Un solo canal evita que un dispositivo
 * abra dos sockets para la misma sesión.
 */
export function useRealtimeChannel({
  accessToken,
  onBoardChange,
  onNoteChange = IGNORE_NOTES,
}: RealtimeChannelOptions): RealtimeStatus {
  const [status, setStatus] = useState<RealtimeStatus>('disconnected');

  useEffect(() => {
    if (!accessToken) {
      return;
    }

    const subscription = subscribeToBoardChanges({
      baseUrl: getApiBaseUrl(),
      accessToken,
      onStatusChange: setStatus,
      onChange: onBoardChange,
      onNoteChange,
    });

    return subscription.close;
  }, [accessToken, onBoardChange, onNoteChange]);

  return status;
}
