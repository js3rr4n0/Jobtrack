export interface CredentialsValues {
  email: string;
  password: string;
}

export type CredentialsErrors = Partial<Record<keyof CredentialsValues, string>>;

export const MINIMUM_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida las credenciales antes de llamar al proveedor de autenticacion. */
export function validateCredentials(values: CredentialsValues): CredentialsErrors {
  const errors: CredentialsErrors = {};

  if (values.email.trim().length === 0) {
    errors.email = 'Escribe tu correo electronico.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El correo no tiene un formato valido.';
  }

  if (values.password.length === 0) {
    errors.password = 'Escribe tu contrasena.';
  } else if (values.password.length < MINIMUM_PASSWORD_LENGTH) {
    errors.password = `La contrasena necesita al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
  }

  return errors;
}

const AUTH_MESSAGES: ReadonlyArray<{ pattern: RegExp; message: string }> = [
  {
    pattern: /invalid login credentials/i,
    message: 'El correo o la contrasena no coinciden. Verificalos e intentalo de nuevo.',
  },
  {
    pattern: /email not confirmed/i,
    message: 'Confirma tu correo desde el enlace que te enviamos antes de iniciar sesion.',
  },
  {
    pattern: /user already registered/i,
    message: 'Ese correo ya tiene una cuenta. Inicia sesion en lugar de registrarte.',
  },
  {
    pattern: /password/i,
    message: `La contrasena no cumple los requisitos minimos de ${MINIMUM_PASSWORD_LENGTH} caracteres.`,
  },
  {
    pattern: /provider is not enabled|unsupported provider/i,
    message:
      'El acceso con Google no esta habilitado en este proyecto. Actívalo en Supabase, en Authentication y Providers.',
  },
  {
    pattern: /email rate limit|over_email_send/i,
    message:
      'El servicio de correo alcanzo su limite de envios. Entra con Google o intentalo mas tarde.',
  },
  {
    pattern: /rate limit|too many/i,
    message: 'Demasiados intentos seguidos. Espera un momento antes de reintentar.',
  },
  {
    pattern: /fetch|network|failed to fetch/i,
    message: 'No hay conexion con el servicio de autenticacion. Revisa tu red e intentalo de nuevo.',
  },
];

const FALLBACK_AUTH_MESSAGE =
  'No fue posible completar la operacion. Intentalo de nuevo en unos momentos.';

/** Traduce el error del proveedor a un mensaje comprensible para la persona usuaria. */
export function describeAuthError(rawMessage: string | null | undefined): string {
  if (!rawMessage) {
    return FALLBACK_AUTH_MESSAGE;
  }

  const match = AUTH_MESSAGES.find((entry) => entry.pattern.test(rawMessage));
  return match ? match.message : FALLBACK_AUTH_MESSAGE;
}
