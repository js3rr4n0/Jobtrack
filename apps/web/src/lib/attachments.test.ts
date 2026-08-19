import { describe, expect, it } from 'vitest';
import { MAX_DOCUMENT_LABEL_LENGTH } from '@deska/contracts';

import { labelForPastedImage, labelFromFileName } from './attachments';

describe('labelFromFileName', () => {
  it('quita la extensión para quedarse con el nombre', () => {
    expect(labelFromFileName('oferta-backend.pdf')).toBe('oferta-backend');
  });

  it('conserva los puntos interiores del nombre', () => {
    expect(labelFromFileName('correo.rrhh.acme.png')).toBe('correo.rrhh.acme');
  });

  it('acepta un nombre sin extensión', () => {
    expect(labelFromFileName('captura')).toBe('captura');
  });

  it('recorta al tope que admite la API', () => {
    const largo = `${'a'.repeat(MAX_DOCUMENT_LABEL_LENGTH + 40)}.png`;

    expect(labelFromFileName(largo)).toHaveLength(MAX_DOCUMENT_LABEL_LENGTH);
  });
});

describe('labelForPastedImage', () => {
  it('firma la captura con el momento en que se pegó', () => {
    expect(labelForPastedImage(new Date(2026, 7, 14, 9, 5))).toBe('Captura 2026-08-14 09.05');
  });

  it('distingue dos capturas pegadas en minutos distintos', () => {
    const primera = labelForPastedImage(new Date(2026, 7, 14, 9, 5));
    const segunda = labelForPastedImage(new Date(2026, 7, 14, 9, 6));

    expect(primera).not.toBe(segunda);
  });
});
