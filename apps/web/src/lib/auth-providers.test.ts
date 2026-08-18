import { describe, expect, it } from 'vitest';

import { OAUTH_PROVIDERS, findProvider } from './auth-providers';

describe('OAUTH_PROVIDERS', () => {
  it('ofrece al menos Google y LinkedIn', () => {
    const ids = OAUTH_PROVIDERS.map((provider) => provider.id);

    expect(ids).toContain('google');
    expect(ids).toContain('linkedin_oidc');
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

  it('usa el identificador OIDC de LinkedIn, no el heredado', () => {
    expect(findProvider('linkedin_oidc')).toBeDefined();
    expect(findProvider('linkedin')).toBeUndefined();
  });

  it('devuelve indefinido para un proveedor desconocido', () => {
    expect(findProvider('myspace')).toBeUndefined();
  });
});
