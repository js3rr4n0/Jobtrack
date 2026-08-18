import type { User } from '@supabase/supabase-js';

export interface UserProfile {
  readonly name: string;
  readonly email: string | null;
  readonly avatarUrl: string | null;
  /** Letra que se muestra cuando no hay foto de perfil. */
  readonly initial: string;
}

/** Claves con las que cada proveedor publica el nombre, en orden de preferencia. */
const NAME_KEYS = ['full_name', 'name', 'user_name', 'preferred_username'] as const;
/** Claves con las que cada proveedor publica la foto. */
const AVATAR_KEYS = ['avatar_url', 'picture'] as const;

function readString(metadata: Record<string, unknown>, keys: readonly string[]): string | null {
  for (const key of keys) {
    const value = metadata[key];
    if (typeof value === 'string' && value.trim().length > 0) {
      return value.trim();
    }
  }
  return null;
}

/** Solo se aceptan fotos servidas por HTTPS, para no degradar la pagina. */
function sanitizeAvatar(url: string | null): string | null {
  if (!url) {
    return null;
  }

  try {
    return new URL(url).protocol === 'https:' ? url : null;
  } catch {
    return null;
  }
}

/**
 * Extrae los datos de presentacion del usuario. Cada proveedor los publica bajo
 * claves distintas, y quien entra con correo y contrasena no aporta ninguna, de
 * modo que siempre hay que poder recurrir a la direccion de correo.
 */
export function readUserProfile(user: Pick<User, 'email' | 'user_metadata'> | null): UserProfile {
  const metadata = (user?.user_metadata ?? {}) as Record<string, unknown>;
  const email = typeof user?.email === 'string' && user.email.length > 0 ? user.email : null;
  const name = readString(metadata, NAME_KEYS) ?? email?.split('@')[0] ?? 'Tu cuenta';

  return {
    name,
    email,
    avatarUrl: sanitizeAvatar(readString(metadata, AVATAR_KEYS)),
    initial: name.charAt(0).toUpperCase(),
  };
}
