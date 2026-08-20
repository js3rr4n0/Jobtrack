import { describe, expect, it } from 'vitest';

import {
  MAX_SUPPORT_BODY_LENGTH,
  MIN_SUPPORT_BODY_LENGTH,
  isSupportTopic,
  rejectSupportMessage,
} from './support';

const valido = { topic: 'soporte', body: 'El tablero no carga en mi teléfono desde ayer.' };

describe('rejectSupportMessage', () => {
  it('acepta un mensaje correcto', () => {
    expect(rejectSupportMessage(valido)).toBeNull();
  });

  it('acepta que no haya correo de respuesta', () => {
    expect(rejectSupportMessage({ ...valido, replyTo: null })).toBeNull();
    expect(rejectSupportMessage({ ...valido, replyTo: '   ' })).toBeNull();
  });

  it('rechaza un motivo inventado', () => {
    expect(rejectSupportMessage({ ...valido, topic: 'inventado' })?.field).toBe('topic');
  });

  it('avisa de una errata en el correo en lugar de guardarlo mal', () => {
    expect(rejectSupportMessage({ ...valido, replyTo: 'sin-arroba' })?.field).toBe('replyTo');
  });

  it('pide algo mas que una palabra suelta', () => {
    expect(rejectSupportMessage({ ...valido, body: 'hola' })?.field).toBe('body');
    expect(rejectSupportMessage({ ...valido, body: 'a'.repeat(MIN_SUPPORT_BODY_LENGTH) })).toBeNull();
  });

  it('pone tope al mensaje', () => {
    const largo = 'a'.repeat(MAX_SUPPORT_BODY_LENGTH + 1);

    expect(rejectSupportMessage({ ...valido, body: largo })?.field).toBe('body');
  });

  it('no cuenta los espacios de los extremos', () => {
    expect(rejectSupportMessage({ ...valido, body: `   hola   ` })?.field).toBe('body');
  });
});

describe('isSupportTopic', () => {
  it('reconoce los motivos del catálogo y rechaza el resto', () => {
    expect(isSupportTopic('privacidad')).toBe(true);
    expect(isSupportTopic('legal')).toBe(true);
    expect(isSupportTopic('cualquiera')).toBe(false);
    expect(isSupportTopic(null)).toBe(false);
  });
});
