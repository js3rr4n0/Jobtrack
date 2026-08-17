import { createBrowserClient } from '@supabase/ssr';
import type { SupabaseClient } from '@supabase/supabase-js';

export interface SupabaseSettings {
  readonly url: string;
  readonly anonKey: string;
}

/**
 * Lee la configuracion publica de Supabase. Devuelve `null` cuando falta, de
 * modo que la interfaz puede mostrar un aviso claro en lugar de fallar.
 */
export function readSupabaseSettings(): SupabaseSettings | null {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  return url && anonKey ? { url, anonKey } : null;
}

let cachedClient: SupabaseClient | null = null;

/** Cliente de navegador reutilizado entre componentes para una sola sesion activa. */
export function getSupabaseClient(): SupabaseClient | null {
  if (cachedClient) {
    return cachedClient;
  }

  const settings = readSupabaseSettings();

  if (!settings) {
    return null;
  }

  cachedClient = createBrowserClient(settings.url, settings.anonKey);
  return cachedClient;
}

export const MISSING_SUPABASE_MESSAGE =
  'Falta configurar NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY para habilitar el inicio de sesion.';
