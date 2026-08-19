import { describe, expect, it, vi } from 'vitest';

import { ApiClient, ApiError } from './api-client';

const jsonResponse = (status: number, body: unknown) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { 'Content-Type': 'application/json' },
  });

const buildClient = (
  fetchImplementation: typeof fetch,
  options: { isOnline?: () => boolean } = {},
) =>
  new ApiClient({
    baseUrl: 'https://api.deska.test/api',
    accessToken: 'token-de-prueba',
    originId: 'dispositivo-prueba',
    fetchImplementation,
    isOnline: options.isOnline ?? (() => true),
  });

describe('ApiClient', () => {
  it('adjunta la autorizacion y el identificador de dispositivo', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, { columns: [] }));

    await buildClient(fetchMock).getBoard();

    const [, init] = fetchMock.mock.calls[0];
    const headers = init.headers as Record<string, string>;

    expect(headers.Authorization).toBe('Bearer token-de-prueba');
    expect(headers['X-Deska-Origin']).toBe('dispositivo-prueba');
  });

  it('no llama a la red cuando el dispositivo está sin conexión', async () => {
    const fetchMock = vi.fn();
    const client = buildClient(fetchMock, { isOnline: () => false });

    await expect(client.getBoard()).rejects.toMatchObject({ kind: 'offline' });
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it('describe el fallo de conexión con un mensaje accionable', async () => {
    const client = buildClient(vi.fn(), { isOnline: () => false });

    await expect(client.getBoard()).rejects.toThrow(/Sin conexión a internet/);
  });

  it('traduce un 401 en una sesión expirada', async () => {
    const client = buildClient(vi.fn().mockResolvedValue(jsonResponse(401, { message: 'Unauthorized' })));

    await expect(client.getBoard()).rejects.toMatchObject({
      kind: 'unauthorized',
      statusCode: 401,
    });
  });

  it('conserva el detalle de las validaciones del servidor', async () => {
    const client = buildClient(
      vi.fn().mockResolvedValue(
        jsonResponse(400, {
          message: 'Revisa los datos ingresados.',
          details: ['La empresa es obligatoria.'],
        }),
      ),
    );

    const failure = await client
      .createApplication({ company: '', position: '' })
      .catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).kind).toBe('validation');
    expect((failure as ApiError).details).toEqual(['La empresa es obligatoria.']);
  });

  it('sobrevive a un cuerpo de error que no es JSON', async () => {
    const client = buildClient(
      vi.fn().mockResolvedValue(new Response('<html>error</html>', { status: 500 })),
    );

    await expect(client.getBoard()).rejects.toMatchObject({ kind: 'server' });
  });

  it('interpreta una respuesta 204 como operación sin contenido', async () => {
    const client = buildClient(vi.fn().mockResolvedValue(new Response(null, { status: 204 })));

    await expect(client.deleteApplication('id-1')).resolves.toBeUndefined();
  });

  it('distingue un servidor inalcanzable de la falta de conexión', async () => {
    const client = buildClient(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')));

    const failure = await client.getBoard().catch((error: unknown) => error);

    expect(failure).toBeInstanceOf(ApiError);
    expect((failure as ApiError).kind).toBe('unreachable');
    expect((failure as ApiError).message).toMatch(/No se pudo contactar con el servidor/);
  });

  it('reporta falta de conexión cuando el dispositivo está sin red', async () => {
    const client = buildClient(vi.fn().mockRejectedValue(new TypeError('Failed to fetch')), {
      isOnline: () => false,
    });

    const failure = await client.getBoard().catch((error: unknown) => error);

    expect((failure as ApiError).kind).toBe('offline');
  });

  it('reporta un tiempo de espera agotado cuando la petición se aborta', async () => {
    const client = buildClient(
      vi.fn().mockRejectedValue(new DOMException('Abortada', 'AbortError')),
    );

    await expect(client.getBoard()).rejects.toMatchObject({ kind: 'timeout' });
  });

  it('reintenta una lectura que expira, para tolerar un servidor que despierta', async () => {
    const fetchMock = vi
      .fn()
      .mockRejectedValueOnce(new DOMException('Abortada', 'AbortError'))
      .mockResolvedValueOnce(jsonResponse(200, { columns: [] }));

    await expect(buildClient(fetchMock).getBoard()).resolves.toEqual({ columns: [] });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('no reintenta una escritura que expira, para no duplicar la operación', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('Abortada', 'AbortError'));

    await expect(
      buildClient(fetchMock).createApplication({ company: 'Empresa', position: 'Puesto' }),
    ).rejects.toMatchObject({ kind: 'timeout' });
    expect(fetchMock).toHaveBeenCalledTimes(1);
  });

  it('propaga el fallo si el reintento tampoco responde', async () => {
    const fetchMock = vi.fn().mockRejectedValue(new DOMException('Abortada', 'AbortError'));

    await expect(buildClient(fetchMock).getBoard()).rejects.toMatchObject({ kind: 'timeout' });
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  it('normaliza la barra final de la URL base', async () => {
    const fetchMock = vi.fn().mockResolvedValue(jsonResponse(200, {}));

    await new ApiClient({
      baseUrl: 'https://api.deska.test/api/',
      accessToken: null,
      originId: 'dispositivo',
      fetchImplementation: fetchMock,
      isOnline: () => true,
    }).getBoard();

    expect(fetchMock.mock.calls[0][0]).toBe('https://api.deska.test/api/applications/board');
  });
});
