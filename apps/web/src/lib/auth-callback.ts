/**
 * Supabase devuelve el resultado de la confirmacion por correo en la cadena de
 * consulta o en el fragmento de la URL, segun el flujo. Estas utilidades
 * normalizan ambos casos para que la pantalla solo tenga que mostrar el mensaje.
 */
export interface CallbackParams {
  readonly code: string | null;
  readonly errorCode: string | null;
  readonly errorDescription: string | null;
}

/** Une los parametros de la consulta y del fragmento en una sola lectura. */
export function readCallbackParams(url: string): CallbackParams {
  const parsed = new URL(url);
  const fromQuery = parsed.searchParams;
  const fromHash = new URLSearchParams(parsed.hash.replace(/^#/, ''));

  const read = (key: string) => fromQuery.get(key) ?? fromHash.get(key);

  return {
    code: read('code'),
    errorCode: read('error_code') ?? read('error'),
    errorDescription: read('error_description'),
  };
}

const CALLBACK_MESSAGES: ReadonlyArray<{ pattern: RegExp; message: string }> = [
  {
    pattern: /otp_expired|expired/i,
    message:
      'El enlace de confirmacion ya vencio o se abrio antes. Solicita uno nuevo iniciando sesion con tu correo.',
  },
  {
    pattern: /access_denied/i,
    message: 'El enlace de confirmacion no es valido. Pide uno nuevo desde la pantalla de acceso.',
  },
  {
    pattern: /pkce|code.?verifier/i,
    message:
      'Abre el enlace de confirmacion en el mismo navegador donde creaste la cuenta; el enlace queda ligado a ese dispositivo.',
  },
];

const FALLBACK_CALLBACK_MESSAGE =
  'No fue posible confirmar tu correo. Intentalo de nuevo desde la pantalla de acceso.';

/** Traduce el motivo devuelto por Supabase a una explicacion accionable. */
export function describeCallbackError(reason: string | null | undefined): string {
  if (!reason) {
    return FALLBACK_CALLBACK_MESSAGE;
  }

  const match = CALLBACK_MESSAGES.find((entry) => entry.pattern.test(reason));
  return match ? match.message : FALLBACK_CALLBACK_MESSAGE;
}
