'use client';

import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

import { hasAuthResult } from '@/lib/auth-callback';

/**
 * Reencamina a la pantalla de confirmacion los enlaces de correo que aterrizan
 * en la raiz. Ocurre cuando el proyecto de Supabase no tiene esta direccion en
 * su lista de redirecciones permitidas y recurre al Site URL.
 */
export function AuthResultForwarder() {
  const router = useRouter();

  useEffect(() => {
    if (!hasAuthResult(window.location.href)) {
      return;
    }

    const { search, hash } = window.location;
    router.replace(`/auth/callback${search}${hash}`);
  }, [router]);

  return null;
}
