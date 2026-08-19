import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const ADMIN_ID = '55555555-5555-4555-8555-555555555555';
const OTRO_ID = '66666666-6666-4666-8666-666666666666';
const ADMIN_EMAIL = `${ADMIN_ID}@ejemplo.test`;

const url = (path: string) => `/${API_PREFIX}${path}`;

describe('Panel de administración (integración)', () => {
  describe('con administrador configurado', () => {
    let context: TestContext;
    let app: INestApplication;
    let adminToken: string;
    let otroToken: string;

    beforeAll(async () => {
      context = await createTestApplication({ adminEmail: ADMIN_EMAIL });
      app = context.app;
      adminToken = await context.issueToken(ADMIN_ID);
      otroToken = await context.issueToken(OTRO_ID);
    });

    afterAll(async () => {
      await app.close();
    });

    const crear = (token: string, payload: Record<string, unknown>) =>
      request(app.getHttpServer())
        .post(url('/applications'))
        .set('Authorization', `Bearer ${token}`)
        .send(payload);

    it('rechaza el acceso sin token', async () => {
      await request(app.getHttpServer()).get(url('/admin/overview')).expect(401);
    });

    it('rechaza a una cuenta que no es la del administrador', async () => {
      await request(app.getHttpServer())
        .get(url('/admin/overview'))
        .set('Authorization', `Bearer ${otroToken}`)
        .expect(403);
    });

    it('deja entrar al administrador', async () => {
      const response = await request(app.getHttpServer())
        .get(url('/admin/overview'))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body).toHaveProperty('totalUsers');
      expect(response.body).toHaveProperty('generatedAt');
    });

    it('resume las postulaciones de todas las personas, no solo las propias', async () => {
      await crear(adminToken, { company: 'Acme', position: 'Backend' });
      await crear(otroToken, { company: 'Acme', position: 'Frontend' });
      await crear(otroToken, { company: 'Globex', position: 'Datos' });

      const response = await request(app.getHttpServer())
        .get(url('/admin/overview'))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(response.body.totalUsers).toBe(2);
      expect(response.body.totalApplications).toBe(3);
      expect(response.body.mostApplied[0]).toMatchObject({ company: 'Acme', total: 2 });
    });

    it('el informe no expone notas, contactos ni identificadores de personas', async () => {
      await crear(otroToken, {
        company: 'Privada',
        position: 'Analista',
        notes: 'Secreto de la entrevista',
        contact: 'Marta Ruiz',
      });

      const response = await request(app.getHttpServer())
        .get(url('/admin/overview'))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const cuerpo = JSON.stringify(response.body);
      expect(cuerpo).not.toContain('Secreto de la entrevista');
      expect(cuerpo).not.toContain('Marta Ruiz');
      expect(cuerpo).not.toContain(OTRO_ID);
    });
  });

  describe('sin administrador configurado', () => {
    let context: TestContext;
    let app: INestApplication;

    beforeAll(async () => {
      context = await createTestApplication();
      app = context.app;
    });

    afterAll(async () => {
      await app.close();
    });

    it('el panel queda cerrado incluso para una sesión válida', async () => {
      const token = await context.issueToken(ADMIN_ID);

      await request(app.getHttpServer())
        .get(url('/admin/overview'))
        .set('Authorization', `Bearer ${token}`)
        .expect(403);
    });
  });
});
