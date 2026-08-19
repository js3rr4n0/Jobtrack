import { describe, expect, it } from 'vitest';

import {
  MAX_DOCUMENT_BYTES,
  MAX_DOCUMENT_LABEL_LENGTH,
  buildStoragePath,
  formatFileSize,
  isAcceptedMimeType,
  isDocumentKind,
  isPathOwnedBy,
  normalizeDocumentLabel,
  rejectDocument,
} from './document';

const USUARIO = '00000000-0000-4000-8000-0000000000ff';

describe('isDocumentKind', () => {
  it('reconoce las tres clases', () => {
    expect(isDocumentKind('resume')).toBe(true);
    expect(isDocumentKind('cover-letter')).toBe(true);
    expect(isDocumentKind('note-image')).toBe(true);
  });

  it('rechaza cualquier otra cosa', () => {
    expect(isDocumentKind('contrato')).toBe(false);
    expect(isDocumentKind(null)).toBe(false);
  });
});

describe('normalizeDocumentLabel', () => {
  it('recorta los espacios', () => {
    expect(normalizeDocumentLabel('  CV backend  ')).toBe('CV backend');
  });

  it('descarta lo que queda vacío', () => {
    expect(normalizeDocumentLabel('   ')).toBeNull();
    expect(normalizeDocumentLabel(null)).toBeNull();
  });

  it('nunca supera el máximo', () => {
    expect(normalizeDocumentLabel('a'.repeat(200))).toHaveLength(MAX_DOCUMENT_LABEL_LENGTH);
  });
});

describe('isAcceptedMimeType', () => {
  it('el currículum solo acepta PDF', () => {
    expect(isAcceptedMimeType('resume', 'application/pdf')).toBe(true);
    expect(isAcceptedMimeType('resume', 'image/png')).toBe(false);
  });

  it('la imagen de nota acepta los formatos de pantalla', () => {
    expect(isAcceptedMimeType('note-image', 'image/png')).toBe(true);
    expect(isAcceptedMimeType('note-image', 'application/pdf')).toBe(false);
  });
});

describe('buildStoragePath', () => {
  it('cuelga el archivo de la carpeta de su dueño', () => {
    const path = buildStoragePath(USUARIO, 'resume', 'abc', 'application/pdf');

    expect(path).toBe(`${USUARIO}/resume/abc.pdf`);
  });

  it('usa la extensión del tipo declarado', () => {
    expect(buildStoragePath(USUARIO, 'note-image', 'x', 'image/webp')).toMatch(/\.webp$/);
    expect(buildStoragePath(USUARIO, 'note-image', 'x', 'inventado/tipo')).toMatch(/\.bin$/);
  });
});

describe('isPathOwnedBy', () => {
  it('acepta la ruta que cuelga de su dueño', () => {
    expect(isPathOwnedBy(`${USUARIO}/resume/a.pdf`, USUARIO)).toBe(true);
  });

  it('rechaza la carpeta de otra persona', () => {
    expect(isPathOwnedBy('otra-persona/resume/a.pdf', USUARIO)).toBe(false);
  });

  it('rechaza un intento de salirse de la carpeta', () => {
    expect(isPathOwnedBy(`${USUARIO}/../otra/a.pdf`, USUARIO)).toBe(false);
  });
});

describe('rejectDocument', () => {
  const valido = {
    kind: 'resume',
    label: 'CV backend v3',
    mimeType: 'application/pdf',
    sizeBytes: 1024,
  };

  it('acepta un archivo correcto', () => {
    expect(rejectDocument(valido)).toBeNull();
  });

  it('rechaza una clase inexistente', () => {
    expect(rejectDocument({ ...valido, kind: 'contrato' })?.reason).toBe('kind');
  });

  it('exige un nombre reconocible', () => {
    expect(rejectDocument({ ...valido, label: '   ' })?.reason).toBe('label');
  });

  it('rechaza un formato que no corresponde', () => {
    expect(rejectDocument({ ...valido, mimeType: 'image/png' })?.reason).toBe('mimeType');
  });

  it('rechaza un archivo vacío o demasiado pesado', () => {
    expect(rejectDocument({ ...valido, sizeBytes: 0 })?.reason).toBe('size');
    expect(rejectDocument({ ...valido, sizeBytes: MAX_DOCUMENT_BYTES + 1 })?.reason).toBe('size');
  });

  it('acepta justo el tamaño máximo', () => {
    expect(rejectDocument({ ...valido, sizeBytes: MAX_DOCUMENT_BYTES })).toBeNull();
  });
});

describe('formatFileSize', () => {
  it('describe el tamaño en la unidad que toca', () => {
    expect(formatFileSize(512)).toBe('512 B');
    expect(formatFileSize(2048)).toBe('2 kB');
    expect(formatFileSize(3 * 1024 * 1024)).toBe('3 MB');
  });
});
