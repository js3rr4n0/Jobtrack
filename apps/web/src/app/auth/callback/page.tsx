'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';

import { StatusBanner } from '@/components/ui/StatusBanner';
import { describeCallbackError, readCallbackParams } from '@/lib/auth-callback';
import { MISSING_SUPABASE_MESSAGE, getSupabaseClient } from '@/lib/supabase/browser-client';

type CallbackState = { status: 'working' } | { status: 'failed'; message: string };

/** Margen para que el cliente termine de canjear el codigo por una sesion. */
const SESSION_TIMEOUT_MS = 15_000;

const TIMEOUT_MESSAGE =
  'No se pudo completar el inicio de sesion. Vuelve a intentarlo desde la pantalla de acceso.';

/**
 * Cierra el flujo de acceso externo y de confirmacion por correo.
 *
 * El cliente de Supabase canjea por su cuenta el codigo que viene en la URL, de
 * modo que aqui solo se espera a que aparezca la sesion. Hacer el canje a mano
 * ademas del automatico consumia el codigo dos veces y la segunda fallaba.
 */
export default function AuthCallbackPage() {
  const router = useRouter();
  const [state, setState] = useState<CallbackState>({ status: 'working' });

  useEffect(() => {
    const { errorCode, errorDescription } = readCallbackParams(window.location.href);

    if (errorCode) {
      setState({ status: 'failed', message: describeCallbackError(errorDescription ?? errorCode) });
      return;
    }

    const client = getSupabaseClient();

    if (!client) {
      setState({ status: 'failed', message: MISSING_SUPABASE_MESSAGE });
      return;
    }

    let settled = false;

    const enterBoard = () => {
      if (!settled) {
        settled = true;
        router.replace('/tablero');
      }
    };

    const { data } = client.auth.onAuthStateChange((_event, session) => {
      if (session) {
        enterBoard();
      }
    });

    void client.auth.getSession().then(({ data: current }) => {
      if (current.session) {
        enterBoard();
      }
    });

    const timer = setTimeout(() => {
      if (!settled) {
        settled = true;
        setState({ status: 'failed', message: TIMEOUT_MESSAGE });
      }
    }, SESSION_TIMEOUT_MS);

    return () => {
      data.subscription.unsubscribe();
      clearTimeout(timer);
    };
  }, [router]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-md flex-col justify-center gap-4 px-4 py-10">
      <h1 className="font-display text-xl font-semibold text-primary">Confirmando tu cuenta</h1>

      {state.status === 'working' ? (
        <p className="text-sm text-secondary">Validando tu acceso...</p>
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
