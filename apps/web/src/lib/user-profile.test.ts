import { describe, expect, it } from 'vitest';

import { readUserProfile } from './user-profile';

const user = (email: string | null, metadata: Record<string, unknown> = {}) =>
  ({ email, user_metadata: metadata }) as Parameters<typeof readUserProfile>[0];

describe('readUserProfile', () => {
  it('lee el nombre y la foto que publica Google', () => {
    const profile = readUserProfile(
      user('persona@gmail.com', {
        full_name: 'Julio Serrano',
        avatar_url: 'https://lh3.googleusercontent.com/foto',
      }),
    );

    expect(profile.name).toBe('Julio Serrano');
    expect(profile.avatarUrl).toBe('https://lh3.googleusercontent.com/foto');
    expect(profile.initial).toBe('J');
  });

  it('acepta las claves alternativas de otros proveedores', () => {
    const profile = readUserProfile(
      user('persona@ejemplo.com', { name: 'Ana Lopez', picture: 'https://cdn.ejemplo.com/a.png' }),
    );

    expect(profile.name).toBe('Ana Lopez');
    expect(profile.avatarUrl).toBe('https://cdn.ejemplo.com/a.png');
  });

  it('usa la parte local del correo cuando no hay nombre', () => {
    expect(readUserProfile(user('jserrano@gmail.com')).name).toBe('jserrano');
  });

  it('descarta nombres vacios o en blanco', () => {
    expect(readUserProfile(user('persona@ejemplo.com', { full_name: '   ' })).name).toBe('persona');
  });

  it('rechaza fotos que no viajan por HTTPS', () => {
    expect(readUserProfile(user('a@b.com', { avatar_url: 'http://inseguro/foto' })).avatarUrl).toBeNull();
    expect(readUserProfile(user('a@b.com', { avatar_url: 'no-es-una-url' })).avatarUrl).toBeNull();
  });

  it('sobrevive a una sesion ausente', () => {
    const profile = readUserProfile(null);

    expect(profile.name).toBe('Tu cuenta');
    expect(profile.email).toBeNull();
    expect(profile.avatarUrl).toBeNull();
    expect(profile.initial).toBe('T');
  });
});
