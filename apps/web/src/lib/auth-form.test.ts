import { describe, expect, it } from 'vitest';

import { describeAuthError, validateCredentials } from './auth-form';

describe('validateCredentials', () => {
  it('exige correo y contrasena', () => {
    const errors = validateCredentials({ email: '', password: '' });

    expect(errors.email).toBe('Escribe tu correo electronico.');
    expect(errors.password).toBe('Escribe tu contrasena.');
  });

  it('rechaza correos con formato invalido', () => {
    expect(validateCredentials({ email: 'correo-sin-arroba', password: 'clave1234' }).email).toBe(
      'El correo no tiene un formato valido.',
    );
  });

  it('exige una longitud minima de contrasena', () => {
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
    expect(describeAuthError('Failed to fetch')).toMatch(/No hay conexion/);
  });

  it('usa un mensaje generico ante errores desconocidos o ausentes', () => {
    expect(describeAuthError(null)).toMatch(/No fue posible completar la operacion/);
    expect(describeAuthError('algo raro paso')).toMatch(/No fue posible completar la operacion/);
  });
});
