import { describe, expect, it } from 'vitest';

import { describeCallbackError, hasAuthResult, readCallbackParams } from './auth-callback';

const BASE = 'https://jobtrack.test/auth/callback';

describe('readCallbackParams', () => {
  it('lee el codigo desde la cadena de consulta', () => {
    expect(readCallbackParams(`${BASE}?code=abc123`).code).toBe('abc123');
  });

  it('lee el error desde el fragmento de la URL', () => {
    const params = readCallbackParams(
      `${BASE}#error=access_denied&error_code=otp_expired&error_description=Email+link+is+invalid`,
    );

    expect(params.errorCode).toBe('otp_expired');
    expect(params.errorDescription).toBe('Email link is invalid');
  });

  it('combina consulta y fragmento cuando Supabase repite los datos', () => {
    const params = readCallbackParams(
      `${BASE}?error=access_denied&error_code=otp_expired#error_description=Email+link+has+expired`,
    );

    expect(params.errorCode).toBe('otp_expired');
    expect(params.errorDescription).toBe('Email link has expired');
  });

  it('devuelve nulos cuando la URL no trae parametros', () => {
    expect(readCallbackParams(BASE)).toEqual({
      code: null,
      errorCode: null,
      errorDescription: null,
    });
  });
});

describe('hasAuthResult', () => {
  it('reconoce un codigo en la raiz, como cuando Supabase cae al Site URL', () => {
    expect(hasAuthResult('https://jobtrack.test/?code=abc123')).toBe(true);
  });

  it('reconoce un error en el fragmento', () => {
    expect(hasAuthResult('https://jobtrack.test/#error_code=otp_expired')).toBe(true);
  });

  it('no confunde una visita normal con una confirmacion', () => {
    expect(hasAuthResult('https://jobtrack.test/')).toBe(false);
    expect(hasAuthResult('https://jobtrack.test/?utm_source=correo')).toBe(false);
  });
});

describe('describeCallbackError', () => {
  it('explica un enlace vencido y como pedir otro', () => {
    expect(describeCallbackError('Email link is invalid or has expired')).toMatch(
      /vencio o se abrio antes/,
    );
  });

  it('reconoce el codigo otp_expired', () => {
    expect(describeCallbackError('otp_expired')).toMatch(/vencio/);
  });

  it('explica el acceso denegado', () => {
    expect(describeCallbackError('access_denied')).toMatch(/no es valido/);
  });

  it('advierte que el enlace esta ligado al navegador de origen', () => {
    expect(describeCallbackError('code verifier should be non-empty')).toMatch(
      /mismo navegador/,
    );
  });

  it('usa un mensaje generico ante motivos desconocidos o ausentes', () => {
    expect(describeCallbackError(null)).toMatch(/No fue posible confirmar tu correo/);
    expect(describeCallbackError('algo inesperado')).toMatch(/No fue posible confirmar tu correo/);
  });
});
