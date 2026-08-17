/** Identidad minima extraida del JWT emitido por Supabase. */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string | null;
}

/** Claims relevantes del token de Supabase. */
export interface SupabaseJwtPayload {
  sub?: string;
  email?: string;
  role?: string;
  exp?: number;
}
