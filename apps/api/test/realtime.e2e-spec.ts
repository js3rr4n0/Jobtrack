import { INestApplication } from '@nestjs/common';
import { AddressInfo } from 'node:net';
import { Socket, io } from 'socket.io-client';
import request from 'supertest';
import { BOARD_EVENT, BoardChangeEvent } from '@jobtrack/contracts';

import { API_PREFIX } from '../src/bootstrap';
import { TestContext, createTestApplication } from './test-application';

const USER_ID = '44444444-4444-4444-8444-444444444444';
const INTRUDER_ID = '55555555-5555-4555-8555-555555555555';
const EVENT_TIMEOUT_MS = 5000;

/** Espera un evento del tablero o falla con un mensaje explicito al agotar el tiempo. */
function waitForBoardEvent(socket: Socket): Promise<BoardChangeEvent> {
  return new Promise((resolve, reject) => {
    const timer = setTimeout(() => {
      socket.off(BOARD_EVENT, onEvent);
      reject(new Error('El evento del tablero no llego dentro del tiempo esperado.'));
    }, EVENT_TIMEOUT_MS);

    function onEvent(event: BoardChangeEvent) {
      clearTimeout(timer);
      socket.off(BOARD_EVENT, onEvent);
      resolve(event);
    }

    socket.on(BOARD_EVENT, onEvent);
  });
}

function connect(baseUrl: string, token: string | null): Promise<Socket> {
  return new Promise((resolve, reject) => {
    const socket = io(`${baseUrl}/realtime`, {
      transports: ['websocket'],
      auth: token ? { token } : {},
      reconnection: false,
    });

    const timer = setTimeout(() => {
      socket.close();
      reject(new Error('La conexión de tiempo real no se establecio a tiempo.'));
    }, EVENT_TIMEOUT_MS);

    socket.on('connection:ready', () => {
      clearTimeout(timer);
      resolve(socket);
    });

    socket.on('connection:rejected', (payload: { reason: string }) => {
      clearTimeout(timer);
      socket.close();
      reject(new Error(payload.reason));
    });

    socket.on('connect_error', (error: Error) => {
      clearTimeout(timer);
      reject(error);
    });
  });
}

describe('Sincronización en tiempo real (integracion)', () => {
  let context: TestContext;
  let app: INestApplication;
  let baseUrl: string;
  let token: string;
  const openSockets: Socket[] = [];

  beforeAll(async () => {
    context = await createTestApplication();
    app = context.app;
    await app.listen(0);

    const address = app.getHttpServer().address() as AddressInfo;
    baseUrl = `http://127.0.0.1:${address.port}`;
    token = await context.issueToken(USER_ID);
  });

  afterEach(() => {
    while (openSockets.length > 0) {
      openSockets.pop()?.close();
    }
  });

  afterAll(async () => {
    await app.close();
  });

  const openSocket = async (authToken: string | null) => {
    const socket = await connect(baseUrl, authToken);
    openSockets.push(socket);
    return socket;
  };

  it('rechaza la conexión sin token de sesión', async () => {
    await expect(connect(baseUrl, null)).rejects.toThrow(/Token de sesión invalido o ausente/);
  });

  it('rechaza la conexión con un token manipulado', async () => {
    await expect(connect(baseUrl, 'token.falsificado')).rejects.toThrow(
      /Token de sesión invalido o ausente/,
    );
  });

  it('replica en un segundo dispositivo la postulación creada en el primero', async () => {
    const secondDevice = await openSocket(token);
    const incomingEvent = waitForBoardEvent(secondDevice);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/applications`)
      .set('Authorization', `Bearer ${token}`)
      .set('X-Jobtrack-Origin', 'dispositivo-escritorio')
      .send({ company: 'Estudio Galaxy', position: 'Disenador de Producto' })
      .expect(201);

    const event = await incomingEvent;

    expect(event.kind).toBe('created');
    expect(event.applicationId).toBe(created.body.id);
    expect(event.application?.company).toBe('Estudio Galaxy');
    expect(event.originId).toBe('dispositivo-escritorio');
  });

  it('propaga los movimientos del tablero entre dispositivos', async () => {
    const secondDevice = await openSocket(token);
    const creationEvent = waitForBoardEvent(secondDevice);

    const created = await request(app.getHttpServer())
      .post(`/${API_PREFIX}/applications`)
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'Empresa Móvil', position: 'Ingeniero Android' })
      .expect(201);

    await creationEvent;
    const movementEvent = waitForBoardEvent(secondDevice);

    await request(app.getHttpServer())
      .patch(`/${API_PREFIX}/applications/${created.body.id}/move`)
      .set('Authorization', `Bearer ${token}`)
      .send({ status: 'interview', boardOrder: 0 })
      .expect(200);

    const event = await movementEvent;

    expect(event.kind).toBe('moved');
    expect(event.application?.status).toBe('interview');
  });

  it('no filtra eventos a los dispositivos de otras cuentas', async () => {
    const intruderDevice = await openSocket(await context.issueToken(INTRUDER_ID));
    let receivedEvents = 0;
    intruderDevice.on(BOARD_EVENT, () => {
      receivedEvents += 1;
    });

    const ownDevice = await openSocket(token);
    const ownEvent = waitForBoardEvent(ownDevice);

    await request(app.getHttpServer())
      .post(`/${API_PREFIX}/applications`)
      .set('Authorization', `Bearer ${token}`)
      .send({ company: 'Empresa Reservada', position: 'Analista' })
      .expect(201);

    await ownEvent;

    expect(receivedEvents).toBe(0);
  });
});
