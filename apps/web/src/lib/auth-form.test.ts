import { describe, expect, it } from 'vitest';

import { describeAuthError, validateCredentials } from './auth-form';

describe('validateCredentials', () => {
  it('exige correo y contraseña', () => {
    const errors = validateCredentials({ email: '', password: '' });

    expect(errors.email).toBe('Escribe tu correo electrónico.');
    expect(errors.password).toBe('Escribe tu contraseña.');
  });

  it('rechaza correos con formato invalido', () => {
    expect(validateCredentials({ email: 'correo-sin-arroba', password: 'clave1234' }).email).toBe(
      'El correo no tiene un formato válido.',
    );
  });

  it('exige una longitud mínima de contraseña', () => {
    expect(validateCredentials({ email: 'persona@ejemplo.com', password: 'corta' }).password).toContain(
      '8 caracteres',
    );
  });

  it('acepta credenciales validas', () => {
    expect(validateCredentials({ email: 'persona@ejemplo.com', password: 'clave-segura' })).toEqual({});
  });
});

describe('describeAuthError', () => {
  it('traduce credenciales invalidas', () => {
    expect(describeAuthError('Invalid login credentials')).toMatch(/no coinciden/);
  });

  it('traduce un correo sin confirmar', () => {
    expect(describeAuthError('Email not confirmed')).toMatch(/Confirma tu correo/);
  });

  it('traduce un correo ya registrado', () => {
    expect(describeAuthError('User already registered')).toMatch(/ya tiene una cuenta/);
  });

  it('traduce un fallo de red', () => {
    expect(describeAuthError('Failed to fetch')).toMatch(/No hay conexión/);
  });

  it('explica que el proveedor de Google no está habilitado', () => {
    expect(describeAuthError('Unsupported provider: provider is not enabled')).toMatch(
      /no está habilitado/,
    );
  });

  it('sugiere Google cuando el correo alcanza su límite de envíos', () => {
    expect(describeAuthError('email rate limit exceeded')).toMatch(/Entra con Google/);
  });

  it('usa un mensaje genérico ante errores desconocidos o ausentes', () => {
    expect(describeAuthError(null)).toMatch(/No fue posible completar la operación/);
    expect(describeAuthError('algo raro paso')).toMatch(/No fue posible completar la operación/);
  });
});
