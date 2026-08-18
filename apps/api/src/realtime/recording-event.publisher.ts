import { BoardChangeEvent, NoteChangeEvent } from '@jobtrack/contracts';

import { BoardEventPublisher } from './board-event.publisher';

/**
 * Doble de pruebas que guarda lo publicado en lugar de emitirlo. Vive junto al
 * puerto para que cualquier modulo que lo use comparta la misma version.
 */
export class RecordingEventPublisher extends BoardEventPublisher {
  readonly events: Array<{ userId: string; event: BoardChangeEvent }> = [];
  readonly noteEvents: Array<{ userId: string; event: NoteChangeEvent }> = [];

  publish(userId: string, event: BoardChangeEvent): void {
    this.events.push({ userId, event });
  }

  publishNote(userId: string, event: NoteChangeEvent): void {
    this.noteEvents.push({ userId, event });
  }
}
