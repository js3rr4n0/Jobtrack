export interface CredentialsValues {
  email: string;
  password: string;
}

export type CredentialsErrors = Partial<Record<keyof CredentialsValues, string>>;

export const MINIMUM_PASSWORD_LENGTH = 8;

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

/** Valida las credenciales antes de llamar al proveedor de autenticación. */
export function validateCredentials(values: CredentialsValues): CredentialsErrors {
  const errors: CredentialsErrors = {};

  if (values.email.trim().length === 0) {
    errors.email = 'Escribe tu correo electronico.';
  } else if (!EMAIL_PATTERN.test(values.email.trim())) {
    errors.email = 'El correo no tiene un formato válido.';
  }

  if (values.password.length === 0) {
    errors.password = 'Escribe tu contraseña.';
  } else if (values.password.length < MINIMUM_PASSWORD_LENGTH) {
    errors.password = `La contraseña necesita al menos ${MINIMUM_PASSWORD_LENGTH} caracteres.`;
  }

  return errors;
}

const AUTH_MESSAGES: ReadonlyArray<{ pattern: RegExp; message: string }> = [
  {
    pattern: /invalid login credentials/i,
    message: 'El correo o la contraseña no coinciden. Verificalos e intentalo de nuevo.',
  },
  {
    pattern: /email not confirmed/i,
    message: 'Confirma tu correo desde el enlace que te enviamos antes de iniciar sesión.',
  },
  {
    pattern: /user already registered/i,
    message: 'Ese correo ya tiene una cuenta. Inicia sesión en lugar de registrarte.',
  },
  {
    pattern: /password/i,
    message: `La contraseña no cumple los requisitos mínimos de ${MINIMUM_PASSWORD_LENGTH} caracteres.`,
  },
  {
    pattern: /provider is not enabled|unsupported provider/i,
    message:
      'El acceso con Google no está habilitado en este proyecto. Actívalo en Supabase, en Authentication y Providers.',
  },
  {
    pattern: /email rate limit|over_email_send/i,
    message:
      'El servicio de correo alcanzo su límite de envíos. Entra con Google o intentalo más tarde.',
  },
  {
    pattern: /rate limit|too many/i,
    message: 'Demasiados intentos seguidos. Espera un momento antes de reintentar.',
  },
  {
    pattern: /fetch|network|failed to fetch/i,
    message: 'No hay conexión con el servicio de autenticación. Revisa tu red e intentalo de nuevo.',
  },
];

const FALLBACK_AUTH_MESSAGE =
  'No fue posible completar la operación. Intentalo de nuevo en unos momentos.';

/** Traduce el error del proveedor a un mensaje comprensible para la persona usuaria. */
export function describeAuthError(rawMessage: string | null | undefined): string {
  if (!rawMessage) {
    return FALLBACK_AUTH_MESSAGE;
  }

  const match = AUTH_MESSAGES.find((entry) => entry.pattern.test(rawMessage));
  return match ? match.message : FALLBACK_AUTH_MESSAGE;
}
