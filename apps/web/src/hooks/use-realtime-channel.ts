'use client';

import { useEffect, useState } from 'react';
import type { BoardChangeEvent, NoteChangeEvent } from '@jobtrack/contracts';

import { getApiBaseUrl } from '@/lib/config';
import { type RealtimeStatus, subscribeToBoardChanges } from '@/lib/realtime-client';

export interface RealtimeChannelOptions {
  readonly accessToken: string | null;
  readonly onBoardChange: (event: BoardChangeEvent) => void;
  readonly onNoteChange: (event: NoteChangeEvent) => void;
}

/**
 * Abre una única conexión de tiempo real para toda la pantalla y reparte los
 * eventos entre el tablero y el mural. Un solo canal evita que un dispositivo
 * abra dos sockets para la misma sesión.
 */
export function useRealtimeChannel({
  accessToken,
  onBoardChange,
  onNoteChange,
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
