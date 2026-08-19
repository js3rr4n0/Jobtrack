const DEFAULT_API_URL = 'http://localhost:4000/api';

/** URL base de la API de Jobtrack, configurable por entorno de despliegue. */
export function getApiBaseUrl(): string {
  return process.env.NEXT_PUBLIC_API_URL ?? DEFAULT_API_URL;
}

/**
 * Identificador efimero del dispositivo. Viaja en cada petición para que el
 * canal de tiempo real pueda descartar el eco de los cambios propios.
 */
export function createOriginId(): string {
  const randomSource = globalThis.crypto;

  return typeof randomSource?.randomUUID === 'function'
    ? randomSource.randomUUID()
    : `origen-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}
