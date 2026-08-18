import type { Provider } from '@supabase/supabase-js';

export interface OAuthProviderOption {
  /** Identificador que espera Supabase Auth. */
  readonly id: Provider;
  readonly label: string;
  readonly hint: string;
}

/**
 * Proveedores de acceso externo. Todos verifican el correo por su cuenta, de
 * modo que evitan el envio de mensajes de confirmacion y sus limites de tasa.
 */
export const OAUTH_PROVIDERS: readonly OAuthProviderOption[] = [
  {
    id: 'google',
    label: 'Continuar con Google',
    hint: 'Sin contrasena ni correo de confirmacion.',
  },
];

export function findProvider(id: string): OAuthProviderOption | undefined {
  return OAUTH_PROVIDERS.find((provider) => provider.id === id);
}
