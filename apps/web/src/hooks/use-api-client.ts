'use client';

import { useMemo, useRef } from 'react';

import { ApiClient } from '@/lib/api-client';
import { createOriginId, getApiBaseUrl } from '@/lib/config';

export interface ApiClientHandle {
  /** Nulo mientras no hay sesión: sin token no se puede pedir nada. */
  readonly client: ApiClient | null;
  /** Identifica al dispositivo durante toda la sesión, para descartar su eco. */
  readonly originId: string;
}

/**
 * Cliente HTTP único de la pantalla. Compartirlo entre el tablero y el mural
 * mantiene un solo identificador de origen, así que los ecos de tiempo real se
 * descartan igual vengan de donde vengan.
 */
export function useApiClient(accessToken: string | null): ApiClientHandle {
  const originId = useRef(createOriginId()).current;

  const client = useMemo(
    () =>
      accessToken === null
        ? null
        : new ApiClient({ baseUrl: getApiBaseUrl(), accessToken, originId }),
    [accessToken, originId],
  );

  return { client, originId };
}
