import type { Provider } from '@supabase/supabase-js';

export interface OAuthProviderOption {
  /** Identificador que espera Supabase Auth. */
  readonly id: Provider;
  readonly label: string;
  readonly hint: string;
}

/**
 * Proveedores de acceso externo. Todos verifican el correo por su cuenta, de
 * modo que evitan el envío de mensajes de confirmación y sus límites de tasa.
 */
export const OAUTH_PROVIDERS: readonly OAuthProviderOption[] = [
  {
    id: 'google',
    label: 'Continuar con Google',
    hint: 'Sin contraseña ni correo de confirmación.',
  },
];

export function findProvider(id: string): OAuthProviderOption | undefined {
  return OAUTH_PROVIDERS.find((provider) => provider.id === id);
}
