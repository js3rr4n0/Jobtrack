import { io, type Socket } from 'socket.io-client';
import {
  BOARD_EVENT,
  NOTE_EVENT,
  type BoardChangeEvent,
  type NoteChangeEvent,
} from '@jobtrack/contracts';

export type RealtimeStatus = 'connecting' | 'connected' | 'disconnected';

export interface RealtimeSubscription {
  readonly close: () => void;
}

export interface RealtimeOptions {
  readonly baseUrl: string;
  readonly accessToken: string;
  readonly onChange: (event: BoardChangeEvent) => void;
  readonly onNoteChange?: (event: NoteChangeEvent) => void;
  readonly onStatusChange: (status: RealtimeStatus) => void;
}

/**
 * Abre el canal de tiempo real del usuario. La reconexion automática de
 * socket.io cubre los cortes de red pasajeros; al recuperarse, la interfaz
 * vuelve a pedir el tablero para no quedar desincronizada.
 */
export function subscribeToBoardChanges(options: RealtimeOptions): RealtimeSubscription {
  const namespaceUrl = `${options.baseUrl.replace(/\/api\/?$/, '').replace(/\/+$/, '')}/realtime`;

  const socket: Socket = io(namespaceUrl, {
    transports: ['websocket'],
    auth: { token: options.accessToken },
    reconnectionDelay: 1000,
    reconnectionDelayMax: 8000,
  });

  options.onStatusChange('connecting');

  socket.on('connection:ready', () => options.onStatusChange('connected'));
  socket.on('disconnect', () => options.onStatusChange('disconnected'));
  socket.on('connect_error', () => options.onStatusChange('disconnected'));
  socket.on('connection:rejected', () => {
    options.onStatusChange('disconnected');
    socket.close();
  });
  socket.on(BOARD_EVENT, options.onChange);

  if (options.onNoteChange) {
    socket.on(NOTE_EVENT, options.onNoteChange);
  }

  return {
    close: () => {
      socket.removeAllListeners();
      socket.close();
    },
  };
}
