import { INestApplication } from '@nestjs/common';
import request from 'supertest';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const ADMIN_ID = '99999999-9999-4999-8999-999999999999';
const OTRO_ID = 'aaaaaaaa-aaaa-4aaa-8aaa-aaaaaaaaaaaa';
const ADMIN_EMAIL = `${ADMIN_ID}@ejemplo.test`;

const url = (path: string) => `/${API_PREFIX}${path}`;

describe('Canal de contacto (integración)', () => {
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

  const enviar = (payload: Record<string, unknown>, token?: string) => {
    const peticion = request(app.getHttpServer()).post(url('/support')).send(payload);
    return token ? peticion.set('Authorization', `Bearer ${token}`) : peticion;
  };

  /**
   * La prueba que sostiene todo lo demas: quien no puede entrar en su cuenta
   * es justamente quien necesita escribir para pedir que borren sus datos.
   */
  it('acepta un mensaje sin sesión iniciada', async () => {
    const respuesta = await enviar({
      topic: 'privacidad',
      body: 'Quiero que borren mi cuenta y todos mis datos, por favor.',
    }).expect(201);

    expect(respuesta.body.received).toBe(true);
    expect(respuesta.body.id).toEqual(expect.any(String));
  });

  it('no devuelve el contenido del mensaje en el recibo', async () => {
    const respuesta = await enviar({
      topic: 'soporte',
      body: 'El tablero no carga en mi teléfono desde ayer.',
    }).expect(201);

    expect(respuesta.body.body).toBeUndefined();
    expect(respuesta.body.replyTo).toBeUndefined();
  });

  it('acepta un correo de respuesta pero no lo exige', async () => {
    await enviar({
      topic: 'soporte',
      replyTo: 'alguien@ejemplo.test',
      body: 'Escribo dejando un correo para que me respondan.',
    }).expect(201);

    await enviar({ topic: 'otro', body: 'Escribo sin dejar ningún correo.' }).expect(201);
  });

  it('rechaza un correo con errata en lugar de guardarlo mal', async () => {
    await enviar({
      topic: 'soporte',
      replyTo: 'esto-no-es-un-correo',
      body: 'Un mensaje con el correo mal escrito.',
    }).expect(400);
  });

  it('rechaza un motivo inventado y un mensaje demasiado corto', async () => {
    await enviar({ topic: 'inventado', body: 'Un mensaje bastante largo.' }).expect(400);
    await enviar({ topic: 'soporte', body: 'corto' }).expect(400);
  });

  describe('lectura de los mensajes', () => {
    it('exige sesión para leerlos', async () => {
      await request(app.getHttpServer()).get(url('/support')).expect(401);
    });

    it('no deja leerlos a una cuenta cualquiera', async () => {
      await request(app.getHttpServer())
        .get(url('/support'))
        .set('Authorization', `Bearer ${otroToken}`)
        .expect(403);
    });

    it('la cuenta administradora los lee y puede marcarlos atendidos', async () => {
      await enviar({ topic: 'legal', body: 'Una duda sobre los términos de servicio.' }).expect(201);

      const listado = await request(app.getHttpServer())
        .get(url('/support'))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(listado.body.length).toBeGreaterThan(0);
      expect(listado.body[0].handledAt).toBeNull();

      const atendido = await request(app.getHttpServer())
        .patch(url(`/support/${listado.body[0].id}/atendido`))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      expect(atendido.body.handledAt).toEqual(expect.any(String));
    });

    it('anota la cuenta cuando el mensaje llega con sesión, y la deja nula si no', async () => {
      await enviar({ topic: 'soporte', body: 'Escribo con mi sesión abierta.' }, otroToken).expect(
        201,
      );

      const listado = await request(app.getHttpServer())
        .get(url('/support'))
        .set('Authorization', `Bearer ${adminToken}`)
        .expect(200);

      const conSesion = listado.body.find((m: { body: string }) =>
        m.body.includes('con mi sesión abierta'),
      );
      const sinSesion = listado.body.find((m: { body: string }) =>
        m.body.includes('sin dejar ningún correo'),
      );

      expect(conSesion.userId).toBe(OTRO_ID);
      expect(sinSesion.userId).toBeNull();
    });
  });
});
