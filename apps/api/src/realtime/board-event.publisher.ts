import { BoardChangeEvent, NoteChangeEvent } from '@jobtrack/contracts';

/**
 * Puerto de notificación en tiempo real. La capa de aplicación publica cambios
 * sin conocer el transporte concreto (WebSockets, colas u otro).
 */
export abstract class BoardEventPublisher {
  abstract publish(userId: string, event: BoardChangeEvent): void;
  abstract publishNote(userId: string, event: NoteChangeEvent): void;
}

/** Implementación nula para escenarios donde el tiempo real está deshabilitado. */
export class NoopBoardEventPublisher extends BoardEventPublisher {
  publish(): void {
    // Sin transporte configurado no hay nada que emitir.
  }

  publishNote(): void {
    // Sin transporte configurado no hay nada que emitir.
  }
}
