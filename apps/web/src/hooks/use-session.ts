'use client';

import type { Session } from '@supabase/supabase-js';
import { useEffect, useState } from 'react';

import { getSupabaseClient } from '@/lib/supabase/browser-client';

export type SessionStatus = 'loading' | 'authenticated' | 'anonymous' | 'unconfigured';

export interface SessionState {
  readonly session: Session | null;
  readonly status: SessionStatus;
}

/** Observa la sesion de Supabase y la mantiene sincronizada entre pestanas. */
export function useSession(): SessionState {
  const [state, setState] = useState<SessionState>({ session: null, status: 'loading' });

  useEffect(() => {
    const client = getSupabaseClient();

    if (!client) {
      setState({ session: null, status: 'unconfigured' });
      return;
    }

    let isMounted = true;

    client.auth
      .getSession()
      .then(({ data }) => {
        if (isMounted) {
          setState({
            session: data.session,
            status: data.session ? 'authenticated' : 'anonymous',
          });
        }
      })
      .catch(() => {
        if (isMounted) {
          setState({ session: null, status: 'anonymous' });
        }
      });

    const { data: subscription } = client.auth.onAuthStateChange((_event, session) => {
      setState({ session, status: session ? 'authenticated' : 'anonymous' });
    });

    return () => {
      isMounted = false;
      subscription.subscription.unsubscribe();
    };
  }, []);

  return state;
}
