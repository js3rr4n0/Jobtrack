import { vi } from 'vitest';
import type { StoredDocument } from '@deska/contracts';

import type { UseDocumentsResult } from '@/hooks/use-documents';

/** Lista de archivos vacía y sin efectos, para las pruebas de formulario. */
export function emptyDocuments(
  overrides: Partial<UseDocumentsResult> = {},
): UseDocumentsResult {
  return {
    documents: [],
    isLoading: false,
    error: null,
    uploadState: 'idle',
    upload: vi.fn().mockResolvedValue(null),
    remove: vi.fn().mockResolvedValue(true),
    reload: vi.fn().mockResolvedValue(undefined),
    ...overrides,
  };
}

export function documentsWith(documents: readonly StoredDocument[]): UseDocumentsResult {
  return emptyDocuments({ documents });
}
