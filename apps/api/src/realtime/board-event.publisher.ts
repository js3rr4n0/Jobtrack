import { BoardChangeEvent, NoteChangeEvent } from '@jobtrack/contracts';

/**
 * Puerto de notificacion en tiempo real. La capa de aplicacion publica cambios
 * sin conocer el transporte concreto (WebSockets, colas u otro).
 */
export abstract class BoardEventPublisher {
  abstract publish(userId: string, event: BoardChangeEvent): void;
  abstract publishNote(userId: string, event: NoteChangeEvent): void;
}

/** Implementacion nula para escenarios donde el tiempo real esta deshabilitado. */
export class NoopBoardEventPublisher extends BoardEventPublisher {
  publish(): void {
    // Sin transporte configurado no hay nada que emitir.
  }

  publishNote(): void {
    // Sin transporte configurado no hay nada que emitir.
  }
}
