'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { StatusBanner } from '@/components/ui/StatusBanner';
import { describeCallbackError, readCallbackParams } from '@/lib/auth-callback';
import { MISSING_SUPABASE_MESSAGE, getSupabaseClient } from '@/lib/supabase/browser-client';

type CallbackState = { status: 'working' } | { status: 'failed'; message: string };

/**
 * Recibe el enlace de confirmacion de correo. Supabase usa el flujo PKCE, en el
 * que el enlace entrega un codigo que hay que canjear por una sesion desde el
 * mismo navegador que inicio el registro.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: 'working' });

  useEffect(() => {
    const { code, errorCode, errorDescription } = readCallbackParams(window.location.href);

    if (errorCode) {
      setState({ status: 'failed', message: describeCallbackError(errorDescription ?? errorCode) });
      return;
    }

    const client = getSupabaseClient();

    if (!client) {
      setState({ status: 'failed', message: MISSING_SUPABASE_MESSAGE });
      return;
    }

    if (!code) {
      router.replace('/acceso');
      return;
    }

    client.auth
      .exchangeCodeForSession(code)
      .then(({ error }) => {
        if (error) {
          setState({ status: 'failed', message: describeCallbackError(error.message) });
          return;
        }
        router.replace('/tablero');
      })
      .catch((error: unknown) => {
        setState({
          status: 'failed',
          message: describeCallbackError(error instanceof Error ? error.message : null),
        });
      });
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-4 py-10">
      <h1 className="font-display text-xl font-semibold text-primary">Confirmando tu cuenta</h1>

      {state.status === 'working' ? (
        <p className="text-sm text-secondary">Validando el enlace del correo...</p>
      ) : (
        <>
          <StatusBanner tone="error" message={state.message} />
          <Link
            href="/acceso"
            className="focus-ring inline-flex items-center justify-center rounded-control bg-accent px-5 py-2.5 text-sm font-semibold text-inverse hover:bg-accent-strong"
          >
            Ir a iniciar sesion
          </Link>
        </>
      )}
    </main>
  );
}
