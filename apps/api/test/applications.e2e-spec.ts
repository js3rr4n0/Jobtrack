import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const USER_ID = '11111111-1111-4111-8111-111111111111';
const OTHER_USER_ID = '22222222-2222-4222-8222-222222222222';

const url = (path: string) => `/${API_PREFIX}${path}`;

describe('Postulaciones (integracion)', () => {
  let context: TestContext;
  let app: INestApplication;
  let token: string;
  let otherToken: string;

  beforeAll(async () => {
    context = await createTestApplication();
    app = context.app;
    token = context.issueToken(USER_ID);
    otherToken = context.issueToken(OTHER_USER_ID);
  });

  afterAll(async () => {
    await app.close();
  });

  const createApplication = (payload: Record<string, unknown>, authToken = token) =>
    request(app.getHttpServer())
      .post(url('/applications'))
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

  describe('autenticacion', () => {
    it('rechaza el acceso sin token', async () => {
      await request(app.getHttpServer()).get(url('/applications')).expect(401);
    });

    it('rechaza un token con firma invalida', async () => {
      await request(app.getHttpServer())
        .get(url('/applications'))
        .set('Authorization', 'Bearer token.no.valido')
        .expect(401);
    });

    it('rechaza un token expirado', async () => {
      const expiredToken = context.issueToken(USER_ID, { expiresIn: '-1s' });

      await request(app.getHttpServer())
        .get(url('/applications'))
        .set('Authorization', `Bearer ${expiredToken}`)
        .expect(401);
    });

    it('deja pasar el endpoint publico de salud', async () => {
      const response = await request(app.getHttpServer()).get(url('/health')).expect(200);

      expect(response.body.status).toBe('ok');
    });
  });

  describe('validacion de entrada', () => {
    it('exige empresa y puesto con mensajes legibles', async () => {
      const response = await createApplication({}).expect(400);

      expect(response.body.message).toBe('Revisa los datos ingresados.');
      expect(response.body.details).toEqual(
        expect.arrayContaining(['La empresa es obligatoria.', 'El puesto es obligatorio.']),
      );
    });

    it('rechaza valores nulos en campos obligatorios sin corromper datos', async () => {
      const response = await createApplication({ company: null, position: null }).expect(400);

      expect(response.body.details.length).toBeGreaterThan(0);

      const listed = await request(app.getHttpServer())
        .get(url('/applications'))
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listed.body).toHaveLength(0);
    });

    it('rechaza un estado inexistente', async () => {
      const response = await createApplication({
        company: 'Empresa',
        position: 'Puesto',
        status: 'contratado-ayer',
      }).expect(400);

      expect(response.body.details).toContain('El estado indicado no existe.');
    });

    it('rechaza una fecha de entrevista mal formada', async () => {
      const response = await createApplication({
        company: 'Empresa',
        position: 'Puesto',
        interviewAt: '32 de febrero',
      }).expect(400);

      expect(response.body.details).toContain('La fecha de entrevista debe tener formato ISO 8601.');
    });

    it('rechaza propiedades desconocidas en el cuerpo', async () => {
      await createApplication({
        company: 'Empresa',
        position: 'Puesto',
        campoInventado: 'valor',
      }).expect(400);
    });

    it('normaliza cadenas vacias a valores nulos', async () => {
      const response = await createApplication({
        company: '  Empresa con espacios  ',
        position: 'Puesto',
        notes: '',
        location: '',
      }).expect(201);

      expect(response.body.company).toBe('Empresa con espacios');
      expect(response.body.notes).toBeNull();
      expect(response.body.location).toBeNull();
    });

    it('rechaza identificadores que no son UUID', async () => {
      await request(app.getHttpServer())
        .get(url('/applications/no-es-uuid'))
        .set('Authorization', `Bearer ${token}`)
        .expect(400);
    });
  });

  describe('ciclo de vida completo', () => {
    it('registra, consulta, actualiza, mueve y elimina una postulacion', async () => {
      const created = await createApplication({
        company: 'Estudio Pixel',
        position: 'Ingeniero de Software',
        status: 'applied',
        priority: 'high',
        workMode: 'remote',
        notes: 'Postulacion enviada por el portal oficial.',
      }).expect(201);

      const applicationId = created.body.id as string;
      expect(created.body.status).toBe('applied');
      expect(created.body.appliedAt).not.toBeNull();

      const detail = await request(app.getHttpServer())
        .get(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(detail.body.company).toBe('Estudio Pixel');

      const updated = await request(app.getHttpServer())
        .patch(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${token}`)
        .send({ interviewAt: '2026-03-01T15:00:00.000Z', notes: 'Entrevista tecnica agendada.' })
        .expect(200);

      expect(updated.body.interviewAt).toBe('2026-03-01T15:00:00.000Z');
      expect(updated.body.position).toBe('Ingeniero de Software');

      const moved = await request(app.getHttpServer())
        .patch(url(`/applications/${applicationId}/move`))
        .set('Authorization', `Bearer ${token}`)
        .send({ status: 'interview', boardOrder: 0 })
        .expect(200);

      expect(moved.body.status).toBe('interview');
      expect(moved.body.boardOrder).toBe(0);

      await request(app.getHttpServer())
        .delete(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${token}`)
        .expect(204);

      await request(app.getHttpServer())
        .get(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${token}`)
        .expect(404);
    });
  });

  describe('aislamiento entre usuarios', () => {
    it('impide leer o modificar postulaciones de otra cuenta', async () => {
      const created = await createApplication({
        company: 'Empresa Privada',
        position: 'Analista',
      }).expect(201);

      const applicationId = created.body.id as string;

      await request(app.getHttpServer())
        .get(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);

      await request(app.getHttpServer())
        .patch(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${otherToken}`)
        .send({ notes: 'intento de escritura' })
        .expect(404);

      await request(app.getHttpServer())
        .delete(url(`/applications/${applicationId}`))
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(404);
    });
  });

  describe('tablero y gamificacion', () => {
    it('devuelve el tablero con todas las columnas y el perfil del jugador', async () => {
      const response = await request(app.getHttpServer())
        .get(url('/applications/board'))
        .set('Authorization', `Bearer ${otherToken}`)
        .expect(200);

      expect(response.body.columns).toHaveLength(6);
      expect(response.body.gamification.progress.level).toBeGreaterThanOrEqual(1);
      expect(response.body.gamification.achievements.length).toBeGreaterThan(0);
    });

    it('mantiene el perfil de gamificacion sincronizado con el tablero', async () => {
      const gamificationToken = context.issueToken('33333333-3333-4333-8333-333333333333');

      await request(app.getHttpServer())
        .post(url('/applications'))
        .set('Authorization', `Bearer ${gamificationToken}`)
        .send({ company: 'Empresa', position: 'Puesto', status: 'offer' })
        .expect(201);

      const board = await request(app.getHttpServer())
        .get(url('/applications/board'))
        .set('Authorization', `Bearer ${gamificationToken}`)
        .expect(200);

      const profile = await request(app.getHttpServer())
        .get(url('/gamification/profile'))
        .set('Authorization', `Bearer ${gamificationToken}`)
        .expect(200);

      expect(profile.body.progress.experience).toBe(board.body.gamification.progress.experience);
      expect(profile.body.stats.totalApplications).toBe(1);
    });
  });
});
