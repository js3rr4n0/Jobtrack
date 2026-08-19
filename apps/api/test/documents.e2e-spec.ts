import { INestApplication } from '@nestjs/common';
import request from 'supertest';
import { MAX_DOCUMENT_BYTES } from '@deska/contracts';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const USUARIO = '77777777-7777-4777-8777-777777777777';
const OTRO = '88888888-8888-4888-8888-888888888888';

const url = (path: string) => `/${API_PREFIX}${path}`;

describe('Archivos (integración)', () => {
  let context: TestContext;
  let app: INestApplication;
  let token: string;
  let otroToken: string;

  beforeAll(async () => {
    context = await createTestApplication();
    app = context.app;
    token = await context.issueToken(USUARIO);
    otroToken = await context.issueToken(OTRO);
  });

  afterAll(async () => {
    await app.close();
  });

  const registrar = (payload: Record<string, unknown>, autor = token) =>
    request(app.getHttpServer())
      .post(url('/documents'))
      .set('Authorization', `Bearer ${autor}`)
      .send(payload);

  const curriculum = (overrides: Record<string, unknown> = {}) => ({
    kind: 'resume',
    label: 'CV backend v3',
    storagePath: `${USUARIO}/resume/abc.pdf`,
    mimeType: 'application/pdf',
    sizeBytes: 2048,
    ...overrides,
  });

  it('rechaza el acceso sin token', async () => {
    await request(app.getHttpServer()).get(url('/documents')).expect(401);
  });

  it('registra un currículum y lo devuelve en el listado', async () => {
    const creado = await registrar(curriculum()).expect(201);

    expect(creado.body).toMatchObject({ kind: 'resume', label: 'CV backend v3' });

    const listado = await request(app.getHttpServer())
      .get(url('/documents?kind=resume'))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);

    expect(listado.body.map((item: { id: string }) => item.id)).toContain(creado.body.id);
  });

  it('rechaza una ruta que cuelga de la carpeta de otra persona', async () => {
    const respuesta = await registrar(
      curriculum({ storagePath: `${OTRO}/resume/robado.pdf` }),
    ).expect(400);

    expect(respuesta.body.message).toMatch(/no corresponde a tu cuenta/);
  });

  it('rechaza un intento de salirse de la carpeta propia', async () => {
    await registrar(curriculum({ storagePath: `${USUARIO}/../${OTRO}/x.pdf` })).expect(400);
  });

  it('rechaza un formato que no corresponde a la clase', async () => {
    await registrar(curriculum({ mimeType: 'image/png' })).expect(400);
  });

  it('rechaza un archivo por encima del tamaño permitido', async () => {
    await registrar(curriculum({ sizeBytes: MAX_DOCUMENT_BYTES + 1 })).expect(400);
  });

  it('exige un nombre reconocible', async () => {
    await registrar(curriculum({ label: '   ' })).expect(400);
  });

  it('no muestra los archivos de otra persona', async () => {
    const mio = await registrar(curriculum({ storagePath: `${USUARIO}/resume/privado.pdf` })).expect(201);

    const ajeno = await request(app.getHttpServer())
      .get(url('/documents'))
      .set('Authorization', `Bearer ${otroToken}`)
      .expect(200);

    expect(ajeno.body.map((item: { id: string }) => item.id)).not.toContain(mio.body.id);
  });

  it('no deja borrar el archivo de otra persona', async () => {
    const mio = await registrar(curriculum({ storagePath: `${USUARIO}/resume/otro.pdf` })).expect(201);

    await request(app.getHttpServer())
      .delete(url(`/documents/${mio.body.id}`))
      .set('Authorization', `Bearer ${otroToken}`)
      .expect(404);
  });

  it('elimina un archivo propio', async () => {
    const mio = await registrar(curriculum({ storagePath: `${USUARIO}/resume/temporal.pdf` })).expect(201);

    await request(app.getHttpServer())
      .delete(url(`/documents/${mio.body.id}`))
      .set('Authorization', `Bearer ${token}`)
      .expect(204);

    await request(app.getHttpServer())
      .delete(url(`/documents/${mio.body.id}`))
      .set('Authorization', `Bearer ${token}`)
      .expect(404);
  });

  it('un filtro desconocido devuelve el listado completo en lugar de fallar', async () => {
    await request(app.getHttpServer())
      .get(url('/documents?kind=inventado'))
      .set('Authorization', `Bearer ${token}`)
      .expect(200);
  });

  describe('adjuntos de una vacante', () => {
    const crearVacante = (autor = token) =>
      request(app.getHttpServer())
        .post(url('/applications'))
        .set('Authorization', `Bearer ${autor}`)
        .send({ company: 'Acme', position: 'Backend' })
        .expect(201);

    const captura = (applicationId: string, storagePath: string) => ({
      kind: 'attachment',
      label: 'Captura del anuncio',
      storagePath: `${USUARIO}/attachment/${storagePath}`,
      mimeType: 'image/png',
      sizeBytes: 4096,
      applicationId,
    });

    it('guarda una captura junto a su vacante y la devuelve al filtrar por ella', async () => {
      const vacante = await crearVacante();
      const otra = await crearVacante();

      const adjunto = await registrar(captura(vacante.body.id, 'anuncio.png')).expect(201);
      await registrar(captura(otra.body.id, 'otra.png')).expect(201);

      expect(adjunto.body.applicationId).toBe(vacante.body.id);

      const listado = await request(app.getHttpServer())
        .get(url(`/documents?applicationId=${vacante.body.id}`))
        .set('Authorization', `Bearer ${token}`)
        .expect(200);

      expect(listado.body.map((item: { id: string }) => item.id)).toEqual([adjunto.body.id]);
    });

    it('no deja colgar un archivo de la vacante de otra persona', async () => {
      const ajena = await crearVacante(otroToken);

      await registrar(captura(ajena.body.id, 'ajena.png')).expect(404);
    });

    it('un curriculum sigue viviendo suelto, sin vacante', async () => {
      const creado = await registrar(
        curriculum({ storagePath: `${USUARIO}/resume/suelto.pdf` }),
      ).expect(201);

      expect(creado.body.applicationId).toBeNull();
    });

    it('acepta un PDF como adjunto, no solo imagenes', async () => {
      const vacante = await crearVacante();

      await registrar({
        ...captura(vacante.body.id, 'prueba.pdf'),
        mimeType: 'application/pdf',
      }).expect(201);
    });
  });
});
