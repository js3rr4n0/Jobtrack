import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MAX_NOTE_LENGTH } from '@jobtrack/contracts';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const USER_ID = '33333333-3333-4333-8333-333333333333';
const OTHER_USER_ID = '44444444-4444-4444-8444-444444444444';

const url = (path: string) => `/${API_PREFIX}${path}`;

describe('Notas del mural (integracion)', () => {
  let context: TestContext;
  let app: INestApplication;
  let token: string;
  let otherToken: string;

  beforeAll(async () => {
    context = await createTestApplication();
    app = context.app;
    token = await context.issueToken(USER_ID);
    otherToken = await context.issueToken(OTHER_USER_ID);
  });

  afterAll(async () => {
    await app.close();
  });

  const createNote = (payload: Record<string, unknown>, authToken = token) =>
    request(app.getHttpServer())
      .post(url('/notes'))
      .set('Authorization', `Bearer ${authToken}`)
      .send(payload);

  it('rechaza el acceso sin token', async () => {
    await request(app.getHttpServer()).get(url('/notes')).expect(401);
  });

  it('crea una nota y la devuelve en el listado', async () => {
    const created = await createNote({ text: 'Actualizar el curriculum' }).expect(201);

    expect(created.body).toMatchObject({ text: 'Actualizar el curriculum', color: 'amarillo' });

    const listed = await request(app.getHttpServer())
      .get(url('/notes'))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listed.body.map((note: { id: string }) => note.id)).toContain(created.body.id);
  });

  it('rechaza una nota vacía con un mensaje legible', async () => {
    const response = await createNote({ text: '   ' }).expect(400);

    expect(response.body.details.join(' ')).toContain('vacía');
  });

  it('rechaza un texto más largo que el máximo', async () => {
    await createNote({ text: 'a'.repeat(MAX_NOTE_LENGTH + 1) }).expect(400);
  });

  it('rechaza un color que no existe', async () => {
    await createNote({ text: 'Nota', color: 'turquesa' }).expect(400);
  });

  it('rechaza una posición fuera del mural', async () => {
    await createNote({ text: 'Nota', x: 140, y: 10 }).expect(400);
  });

  it('mueve una nota y conserva su texto', async () => {
    const created = await createNote({ text: 'Mover esta' }).expect(201);

    const moved = await request(app.getHttpServer())
      .patch(url(`/notes/${created.body.id}`))
      .set('Authorization', `Bearer ${token}`)
      .send({ x: 80, y: 25 })
      .expect(200);

    expect(moved.body).toMatchObject({ text: 'Mover esta', x: 80, y: 25 });
  });

  it('no deja ver ni tocar las notas de otra persona', async () => {
    const created = await createNote({ text: 'Privada' }).expect(201);

    const listed = await request(app.getHttpServer())
      .get(url('/notes'))
      .set('Authorization', `Bearer ${otherToken}`)
      .expect(200);

    expect(listed.body.map((note: { id: string }) => note.id)).not.toContain(created.body.id);

    await request(app.getHttpServer())
      .patch(url(`/notes/${created.body.id}`))
      .set('Authorization', `Bearer ${otherToken}`)
      .send({ text: 'Ajena' })
      .expect(404);
  });

  it('elimina una nota propia', async () => {
    const created = await createNote({ text: 'Temporal' }).expect(201);

    await request(app.getHttpServer())
      .delete(url(`/notes/${created.body.id}`))
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(url(`/notes/${created.body.id}`))
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('rechaza un identificador que no es un UUID', async () => {
    await request(app.getHttpServer())
      .patch(url('/notes/no-es-uuid'))
      .set('Authorization', `Bearer ${token}`)
      .send({ text: 'Nota' })
      .expect(400);
  });
});
