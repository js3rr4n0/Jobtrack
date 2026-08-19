import { NotFoundException } from '@nestjs/common';

import { RecordingEventPublisher } from '../realtime/recording-event.publisher';
import { CreateJobApplicationDto } from './dto/create-job-application.dto';
import { JobApplicationsService } from './job-applications.service';
import { InMemoryJobApplicationsRepository } from './repositories/in-memory-job-applications.repository';

const USER_ID = 'usuario-1';
const OTHER_USER_ID = 'usuario-2';
const ORIGIN_ID = 'dispositivo-a';

const payload = (overrides: Partial<CreateJobApplicationDto> = {}): CreateJobApplicationDto =>
  ({
    company: 'Empresa Ejemplo',
    position: 'Desarrollador Frontend',
    ...overrides,
  }) as CreateJobApplicationDto;

describe('JobApplicationsService', () => {
  let repository: InMemoryJobApplicationsRepository;
  let publisher: RecordingEventPublisher;
  let service: JobApplicationsService;

  beforeEach(() => {
    repository = new InMemoryJobApplicationsRepository();
    publisher = new RecordingEventPublisher();
    service = new JobApplicationsService(repository, publisher);
  });

  describe('create', () => {
    it('usa valores por defecto cuando solo se envian los campos obligatorios', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);

      expect(created.status).toBe('wishlist');
      expect(created.priority).toBe('medium');
      expect(created.boardOrder).toBe(0);
      expect(created.notes).toBeNull();
      expect(created.interviewAt).toBeNull();
    });

    it('no fija fecha de postulación para vacantes que solo son de interes', async () => {
      const created = await service.create(USER_ID, payload({ status: 'wishlist' }), null);

      expect(created.appliedAt).toBeNull();
    });

    it('fija la fecha de postulación al registrar una vacante ya enviada', async () => {
      const created = await service.create(USER_ID, payload({ status: 'applied' }), null);

      expect(created.appliedAt).not.toBeNull();
    });

    it('apila las tarjetas nuevas al final de su columna', async () => {
      await service.create(USER_ID, payload({ company: 'Primera' }), null);
      const second = await service.create(USER_ID, payload({ company: 'Segunda' }), null);

      expect(second.boardOrder).toBe(1);
    });

    it('publica un evento de creación con el dispositivo de origen', async () => {
      const created = await service.create(USER_ID, payload(), ORIGIN_ID);

      expect(publisher.events).toHaveLength(1);
      expect(publisher.events[0].userId).toBe(USER_ID);
      expect(publisher.events[0].event.kind).toBe('created');
      expect(publisher.events[0].event.applicationId).toBe(created.id);
      expect(publisher.events[0].event.originId).toBe(ORIGIN_ID);
    });
  });

  describe('getBoard', () => {
    it('devuelve todas las columnas aunque el tablero esté vacío', async () => {
      const board = await service.getBoard(USER_ID);

      expect(board.columns).toHaveLength(6);
      expect(board.columns.every((column) => column.applications.length === 0)).toBe(true);
      expect(board.gamification.progress.level).toBe(1);
    });

    it('coloca cada postulación en la columna de su estado', async () => {
      await service.create(USER_ID, payload({ status: 'interview' }), null);

      const board = await service.getBoard(USER_ID);
      const interviewColumn = board.columns.find((column) => column.status === 'interview');

      expect(interviewColumn?.applications).toHaveLength(1);
    });

    it('nunca expone postulaciones de otro usuario', async () => {
      await service.create(OTHER_USER_ID, payload(), null);

      const board = await service.getBoard(USER_ID);

      expect(board.columns.every((column) => column.applications.length === 0)).toBe(true);
    });
  });

  describe('update', () => {
    it('modifica unicamente los campos enviados', async () => {
      const created = await service.create(USER_ID, payload({ location: 'Antigua' }), null);

      const updated = await service.update(USER_ID, created.id, { notes: 'Segunda ronda' }, null);

      expect(updated.notes).toBe('Segunda ronda');
      expect(updated.location).toBe('Antigua');
      expect(updated.company).toBe(created.company);
    });

    it('rechaza actualizar una postulación de otro usuario', async () => {
      const created = await service.create(OTHER_USER_ID, payload(), null);

      await expect(service.update(USER_ID, created.id, { notes: 'x' }, null)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });

    it('informa con claridad cuando la postulación no existe', async () => {
      await expect(
        service.update(USER_ID, '00000000-0000-4000-8000-000000000009', {}, null),
      ).rejects.toThrow('La postulación no existe o no te pertenece.');
    });
  });

  describe('move', () => {
    it('cambia el estado y renumera la columna destino', async () => {
      const first = await service.create(USER_ID, payload({ company: 'Primera' }), null);
      const second = await service.create(USER_ID, payload({ company: 'Segunda' }), null);

      const moved = await service.move(USER_ID, second.id, { status: 'applied', boardOrder: 0 }, null);

      expect(moved.status).toBe('applied');
      expect(moved.boardOrder).toBe(0);

      const board = await service.getBoard(USER_ID);
      const wishlist = board.columns.find((column) => column.status === 'wishlist');

      expect(wishlist?.applications).toHaveLength(1);
      expect(wishlist?.applications[0].id).toBe(first.id);
      expect(wishlist?.applications[0].boardOrder).toBe(0);
    });

    it('reordena dentro de la misma columna sin dejar huecos', async () => {
      const first = await service.create(USER_ID, payload({ company: 'Primera' }), null);
      const second = await service.create(USER_ID, payload({ company: 'Segunda' }), null);
      const third = await service.create(USER_ID, payload({ company: 'Tercera' }), null);

      await service.move(USER_ID, third.id, { status: 'wishlist', boardOrder: 0 }, null);

      const board = await service.getBoard(USER_ID);
      const wishlist = board.columns.find((column) => column.status === 'wishlist');

      expect(wishlist?.applications.map((application) => application.id)).toEqual([
        third.id,
        first.id,
        second.id,
      ]);
      expect(wishlist?.applications.map((application) => application.boardOrder)).toEqual([0, 1, 2]);
    });

    it('acota posiciones fuera de rango al final de la columna', async () => {
      const first = await service.create(USER_ID, payload({ company: 'Primera' }), null);
      await service.create(USER_ID, payload({ company: 'Segunda' }), null);

      const moved = await service.move(USER_ID, first.id, { status: 'wishlist', boardOrder: 99 }, null);

      expect(moved.boardOrder).toBe(1);
    });

    it('publica un evento de movimiento', async () => {
      const created = await service.create(USER_ID, payload(), null);
      publisher.events.length = 0;

      await service.move(USER_ID, created.id, { status: 'offer', boardOrder: 0 }, ORIGIN_ID);

      expect(publisher.events).toHaveLength(1);
      expect(publisher.events[0].event.kind).toBe('moved');
    });

    it('recalcula la experiencia al avanzar de etapa', async () => {
      const created = await service.create(USER_ID, payload(), null);
      const before = await service.getBoard(USER_ID);

      await service.move(USER_ID, created.id, { status: 'offer', boardOrder: 0 }, null);
      const after = await service.getBoard(USER_ID);

      expect(after.gamification.progress.experience).toBeGreaterThan(
        before.gamification.progress.experience,
      );
    });
  });

  describe('remove', () => {
    it('elimina la postulación y avisa a los demás dispositivos', async () => {
      const created = await service.create(USER_ID, payload(), null);
      publisher.events.length = 0;

      await service.remove(USER_ID, created.id, ORIGIN_ID);

      await expect(service.getById(USER_ID, created.id)).rejects.toBeInstanceOf(NotFoundException);
      expect(publisher.events[0].event.kind).toBe('deleted');
      expect(publisher.events[0].event.application).toBeNull();
    });

    it('rechaza eliminar una postulación ajena', async () => {
      const created = await service.create(OTHER_USER_ID, payload(), null);

      await expect(service.remove(USER_ID, created.id, null)).rejects.toBeInstanceOf(
        NotFoundException,
      );
    });
  });
});
