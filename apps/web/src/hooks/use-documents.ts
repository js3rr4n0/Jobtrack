'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import {
  type DocumentKind,
  type StoredDocument,
  buildStoragePath,
  rejectDocument,
} from '@deska/contracts';

import { ApiClient, ApiError } from '@/lib/api-client';
import { DOCUMENTS_BUCKET, getSupabaseClient } from '@/lib/supabase/browser-client';

export type UploadState = 'idle' | 'uploading' | 'registering';

export interface UseDocumentsResult {
  readonly documents: readonly StoredDocument[];
  readonly isLoading: boolean;
  readonly error: string | null;
  /** Estado de la subida en curso, para dibujar el avance. */
  readonly uploadState: UploadState;
  readonly upload: (file: File, label: string) => Promise<StoredDocument | null>;
  readonly remove: (documentId: string) => Promise<boolean>;
  readonly reload: () => Promise<void>;
}

/** Identificador del archivo dentro del almacén. */
function createFileId(): string {
  const source = globalThis.crypto;

  return typeof source?.randomUUID === 'function'
    ? source.randomUUID()
    : `${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 10)}`;
}

/**
 * Archivos de una clase concreta. El binario viaja del navegador a Supabase
 * Storage sin pasar por la API —que no tendría por qué reenviar megas— y solo
 * después se registran los metadatos, de modo que una fila nunca apunta a un
 * archivo que no llegó a subirse.
 */
export function useDocuments(
  client: ApiClient | null,
  kind: DocumentKind,
  userId: string | null,
): UseDocumentsResult {
  const [documents, setDocuments] = useState<StoredDocument[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadState, setUploadState] = useState<UploadState>('idle');

  const reload = useCallback(async () => {
    if (!client) {
      return;
    }

    setIsLoading(true);

    try {
      setDocuments(await client.getDocuments(kind));
      setError(null);
    } catch (failure) {
      setError(failure instanceof ApiError ? failure.message : 'No fue posible leer tus archivos.');
    } finally {
      setIsLoading(false);
    }
  }, [client, kind]);

  useEffect(() => {
    void reload();
  }, [reload]);

  const upload = useCallback(
    async (file: File, label: string): Promise<StoredDocument | null> => {
      const supabase = getSupabaseClient();

      if (!client || !supabase || !userId) {
        setError('Inicia sesión para subir archivos.');
        return null;
      }

      // Las mismas reglas que aplica el servidor, para avisar antes de gastar
      // la subida en un archivo que se va a rechazar igualmente.
      const rejection = rejectDocument({
        kind,
        label,
        mimeType: file.type,
        sizeBytes: file.size,
      });

      if (rejection) {
        setError(rejection.message);
        return null;
      }

      const storagePath = buildStoragePath(userId, kind, createFileId(), file.type);
      setUploadState('uploading');
      setError(null);

      try {
        const { error: uploadError } = await supabase.storage
          .from(DOCUMENTS_BUCKET)
          .upload(storagePath, file, { contentType: file.type, upsert: false });

        if (uploadError) {
          setError('No fue posible subir el archivo. Revisa tu conexión e intentalo de nuevo.');
          return null;
        }

        setUploadState('registering');

        const registered = await client.registerDocument({
          kind,
          label,
          storagePath,
          mimeType: file.type,
          sizeBytes: file.size,
        });

        setDocuments((current) => [registered, ...current]);
        return registered;
      } catch (failure) {
        // El binario ya está arriba pero no quedó registrado: se retira para no
        // dejar basura invisible en el almacén.
        await supabase.storage.from(DOCUMENTS_BUCKET).remove([storagePath]);
        setError(
          failure instanceof ApiError ? failure.message : 'No fue posible registrar el archivo.',
        );
        return null;
      } finally {
        setUploadState('idle');
      }
    },
    [client, kind, userId],
  );

  const remove = useCallback(
    async (documentId: string) => {
      if (!client) {
        return false;
      }

      try {
        await client.deleteDocument(documentId);
        setDocuments((current) => current.filter((item) => item.id !== documentId));
        return true;
      } catch (failure) {
        setError(
          failure instanceof ApiError ? failure.message : 'No fue posible eliminar el archivo.',
        );
        return false;
      }
    },
    [client],
  );

  return useMemo(
    () => ({ documents, isLoading, error, uploadState, upload, remove, reload }),
    [documents, isLoading, error, uploadState, upload, remove, reload],
  );
}
