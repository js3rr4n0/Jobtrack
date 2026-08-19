'use client';

import { useEffect, useState } from 'react';
import type { StoredDocument } from '@deska/contracts';

import { DOCUMENTS_BUCKET, getSupabaseClient } from '@/lib/supabase/browser-client';

/** Vida del enlace firmado. Se renueva al volver a montar, no se almacena. */
const SIGNED_URL_SECONDS = 60 * 60;

/**
 * Enlace temporal para ver o descargar un archivo privado. El bucket no es
 * público a propósito, así que la única forma de mostrar una imagen es pedir a
 * Supabase una firma de duración limitada; ese enlace no se guarda en ninguna
 * parte y caduca solo.
 */
export function useDocumentUrl(document: StoredDocument | null): string | null {
  const [url, setUrl] = useState<string | null>(null);

  useEffect(() => {
    const supabase = getSupabaseClient();

    if (!document || !supabase) {
      setUrl(null);
      return;
    }

    let isMounted = true;

    void supabase.storage
      .from(DOCUMENTS_BUCKET)
      .createSignedUrl(document.storagePath, SIGNED_URL_SECONDS)
      .then(({ data }) => {
        if (isMounted) {
          setUrl(data?.signedUrl ?? null);
        }
      })
      .catch(() => {
        if (isMounted) {
          setUrl(null);
        }
      });

    return () => {
      isMounted = false;
    };
  }, [document]);

  return url;
}
