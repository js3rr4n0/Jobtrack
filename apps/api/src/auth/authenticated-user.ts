/** Identidad mínima extraida del JWT emitido por Supabase Auth. */
export interface AuthenticatedUser {
  readonly id: string;
  readonly email: string | null;
}
