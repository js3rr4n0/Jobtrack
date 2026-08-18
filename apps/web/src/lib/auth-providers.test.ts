import { describe, expect, it } from 'vitest';

import { OAUTH_PROVIDERS, findProvider } from './auth-providers';

describe('OAUTH_PROVIDERS', () => {
  it('ofrece el acceso con Google', () => {
    expect(OAUTH_PROVIDERS.map((provider) => provider.id)).toContain('google');
  });

  it('describe cada proveedor con etiqueta y explicacion', () => {
    for (const provider of OAUTH_PROVIDERS) {
      expect(provider.label.length).toBeGreaterThan(0);
      expect(provider.hint.length).toBeGreaterThan(0);
    }
  });

  it('no repite identificadores', () => {
    const ids = OAUTH_PROVIDERS.map((provider) => provider.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('no ofrece proveedores sin configurar', () => {
    expect(findProvider('linkedin_oidc')).toBeUndefined();
  });

  it('devuelve indefinido para un proveedor desconocido', () => {
    expect(findProvider('myspace')).toBeUndefined();
  });
});
