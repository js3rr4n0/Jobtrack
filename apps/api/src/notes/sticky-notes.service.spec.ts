import { NotFoundException } from '@nestjs/common';

import { RecordingEventPublisher } from '../realtime/recording-event.publisher';
import { CreateStickyNoteDto } from './dto/create-sticky-note.dto';
import { InMemoryStickyNotesRepository } from './repositories/in-memory-sticky-notes.repository';
import { StickyNotesService } from './sticky-notes.service';

const USER_ID = 'usuario-1';
const OTHER_USER_ID = 'usuario-2';
const ORIGIN_ID = 'dispositivo-a';

const payload = (overrides: Partial<CreateStickyNoteDto> = {}): CreateStickyNoteDto =>
  ({ text: 'Preparar portafolio', ...overrides }) as CreateStickyNoteDto;

describe('StickyNotesService', () => {
  let repository: InMemoryStickyNotesRepository;
  let publisher: RecordingEventPublisher;
  let service: StickyNotesService;

  beforeEach(() => {
    repository = new InMemoryStickyNotesRepository();
    publisher = new RecordingEventPublisher();
    service = new StickyNotesService(repository, publisher);
  });

  describe('create', () => {
    it('guarda la nota con el color por defecto', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);

      expect(created).toMatchObject({ userId: USER_ID, text: 'Preparar portafolio', color: 'amarillo' });
    });

    it('escalona las notas nuevas para que no queden una encima de otra', async () => {
      const first = await service.create(USER_ID, payload(), ORIGIN_ID);
      const second = await service.create(USER_ID, payload({ text: 'Otra' }), ORIGIN_ID);

      expect({ x: second.x, y: second.y }).not.toEqual({ x: first.x, y: first.y });
    });

    it('respeta la posicion enviada por quien la crea', async () => {
      const created = await service.create(USER_ID, payload({ x: 42, y: 17 }), ORIGIN_ID);

      expect(created).toMatchObject({ x: 42, y: 17 });
    });

    it('anuncia la creacion con el dispositivo de origen', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);

      expect(publisher.noteEvents).toHaveLength(1);
      expect(publisher.noteEvents[0]).toMatchObject({
        userId: USER_ID,
        event: { kind: 'created', noteId: created.id, originId: ORIGIN_ID },
      });
    });
  });

  describe('update', () => {
    it('cambia el texto y lo anuncia como edicion', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);
      const updated = await service.update(USER_ID, created.id, { text: 'Llamar el martes' }, null);

      expect(updated.text).toBe('Llamar el martes');
      expect(publisher.noteEvents.at(-1)?.event.kind).toBe('updated');
    });

    it('anuncia como movimiento el cambio que solo toca la posicion', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);
      const moved = await service.update(USER_ID, created.id, { x: 70, y: 30 }, null);

      expect(moved).toMatchObject({ x: 70, y: 30 });
      expect(publisher.noteEvents.at(-1)?.event.kind).toBe('moved');
    });

    it('encierra dentro del mural una posicion fuera de rango', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);
      const moved = await service.update(USER_ID, created.id, { x: 480, y: -20 }, null);

      expect(moved).toMatchObject({ x: 100, y: 0 });
    });

    it('conserva los campos que no se envian', async () => {
      const created = await service.create(USER_ID, payload({ color: 'azul', x: 20, y: 20 }), null);
      const updated = await service.update(USER_ID, created.id, { text: 'Nuevo texto' }, null);

      expect(updated).toMatchObject({ color: 'azul', x: 20, y: 20 });
    });

    it('rechaza la nota de otra persona', async () => {
      const created = await service.create(USER_ID, payload(), null);

      await expect(service.update(OTHER_USER_ID, created.id, { text: 'Ajeno' }, null)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });

  describe('remove', () => {
    it('elimina la nota y lo anuncia', async () => {
      const created = await service.create(USER_ID, payload(), null);
      await service.remove(USER_ID, created.id, ORIGIN_ID);

      expect(await service.listByUser(USER_ID)).toEqual([]);
      expect(publisher.noteEvents.at(-1)?.event).toMatchObject({
        kind: 'deleted',
        noteId: created.id,
        note: null,
      });
    });

    it('falla al eliminar una nota inexistente', async () => {
      await expect(
        service.remove(USER_ID, '00000000-0000-4000-8000-000000000009', null),
      ).rejects.toBeInstanceOf(NotFoundException);
    });
  });

  describe('listByUser', () => {
    it('devuelve solo las notas propias, de la mas antigua a la mas reciente', async () => {
      const mine = await service.create(USER_ID, payload({ text: 'Primera' }), null);
      await service.create(OTHER_USER_ID, payload({ text: 'De otra persona' }), null);
      const second = await service.create(USER_ID, payload({ text: 'Segunda' }), null);

      expect((await service.listByUser(USER_ID)).map((note) => note.id)).toEqual([mine.id, second.id]);
    });

    it('devuelve una lista vacia cuando aun no hay notas', async () => {
      expect(await service.listByUser(USER_ID)).toEqual([]);
    });
  });
});
