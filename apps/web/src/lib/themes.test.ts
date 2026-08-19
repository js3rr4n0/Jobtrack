import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, expect, it } from 'vitest';

import { DEFAULT_THEME, THEMES, THEME_FAMILIES, THEME_IDS, findTheme, isThemeId, resolveThemeId } from './themes';

// Se lee la hoja real, no una copia: la prueba debe medir lo que se publica.
const STYLESHEET = readFileSync(resolve(process.cwd(), 'src/app/globals.css'), 'utf-8');

type Channels = readonly [number, number, number];

/** Extrae las variables de color de un bloque `[data-theme='...']`. */
function readThemeTokens(theme: string): Record<string, Channels> {
  const selector = theme === 'light' ? ":root,\\s*\\[data-theme='light'\\]" : `\\[data-theme='${theme}'\\]`;
  const block = new RegExp(`${selector}\\s*\\{([\\s\\S]*?)\\n  \\}`).exec(STYLESHEET);

  if (!block) {
    throw new Error(`El tema ${theme} no tiene bloque en globals.css.`);
  }

  const tokens: Record<string, Channels> = {};

  for (const [, name, value] of block[1].matchAll(/--color-([\w-]+):\s*(\d+ \d+ \d+);/g)) {
    const [red, green, blue] = value.split(' ').map(Number);
    tokens[name] = [red, green, blue];
  }

  return tokens;
}

function luminance([red, green, blue]: Channels): number {
  const [r, g, b] = [red, green, blue].map((part) => {
    const channel = part / 255;
    return channel <= 0.04045 ? channel / 12.92 : ((channel + 0.055) / 1.055) ** 2.4;
  });

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function contrast(front: Channels, back: Channels): number {
  const [lighter, darker] = [luminance(front), luminance(back)].sort((a, b) => b - a);
  return (lighter + 0.05) / (darker + 0.05);
}

/** Superficies sobre las que se dibuja texto en toda la interfaz. */
const SURFACES = ['base', 'raised', 'sunken'] as const;
const STATUSES = ['wishlist', 'applied', 'interview', 'offer', 'hired', 'rejected'] as const;

describe('catálogo de temas', () => {
  it('declara doce temas sin identificadores repetidos', () => {
    expect(THEMES).toHaveLength(12);
    expect(new Set(THEME_IDS).size).toBe(THEME_IDS.length);
  });

  it('cada tema pertenece a una familia del selector', () => {
    for (const theme of THEMES) {
      expect(THEME_FAMILIES).toContain(theme.family);
    }
  });

  it('ninguna familia queda vacia en el selector', () => {
    for (const family of THEME_FAMILIES) {
      expect(THEMES.some((theme) => theme.family === family)).toBe(true);
    }
  });

  it('todos los temas tienen bloque propio en la hoja de estilos', () => {
    for (const id of THEME_IDS) {
      expect(Object.keys(readThemeTokens(id)).length).toBeGreaterThan(0);
    }
  });

  it('el tema por defecto pertenece al catálogo', () => {
    expect(isThemeId(DEFAULT_THEME)).toBe(true);
    expect(findTheme(DEFAULT_THEME).id).toBe(DEFAULT_THEME);
  });

  it('devuelve el primer tema ante un identificador desconocido', () => {
    expect(findTheme('inventado' as never).id).toBe(THEMES[0].id);
  });
});

describe('identificadores heredados', () => {
  it('traduce los nombres anteriores al catálogo de paletas', () => {
    expect(resolveThemeId('galaxy')).toBe('galaxia');
    expect(resolveThemeId('minimal')).toBe('minimalista');
    expect(resolveThemeId('gaming')).toBe('videojuegos');
    expect(resolveThemeId('pixel-pink')).toBe('pixeles');
    expect(resolveThemeId('pixel-blue')).toBe('pixeles');
  });

  it('deja pasar sin cambios un identificador vigente', () => {
    expect(resolveThemeId('anime')).toBe('anime');
  });

  it('descarta lo que no reconoce', () => {
    expect(resolveThemeId('inventado')).toBeNull();
    expect(resolveThemeId(null)).toBeNull();
    expect(resolveThemeId(42)).toBeNull();
  });

  it('cada equivalencia apunta a un tema que existe', () => {
    for (const legacy of ['galaxy', 'minimal', 'gaming', 'pixel-pink', 'pixel-blue']) {
      expect(isThemeId(resolveThemeId(legacy))).toBe(true);
    }
  });
});

/**
 * El pliego pedía que los temas fueran accesibles. Estas comprobaciones lo
 * vuelven verificable: recorren la hoja de estilos real y miden cada
 * combinación de texto sobre fondo contra los mínimos de la WCAG, de modo que
 * una paleta nueva no puede entrar sin cumplirlos.
 */
describe('contraste de los temas', () => {
  it.each(THEME_IDS)('%s legibiliza el texto sobre cada superficie', (id) => {
    const token = readThemeTokens(id);

    for (const surface of SURFACES) {
      expect(contrast(token['text-primary'], token[surface])).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token['text-secondary'], token[surface])).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(THEME_IDS)('%s legibiliza el texto de los botones sobre el acento', (id) => {
    const token = readThemeTokens(id);

    expect(contrast(token['text-inverse'], token.accent)).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token['text-inverse'], token['accent-strong'])).toBeGreaterThanOrEqual(4.5);
    expect(contrast(token['text-primary'], token['accent-soft'])).toBeGreaterThanOrEqual(4.5);
  });

  it.each(THEME_IDS)('%s legibiliza los colores de estado sobre fondo y tarjeta', (id) => {
    const token = readThemeTokens(id);

    for (const status of STATUSES) {
      expect(contrast(token[`status-${status}`], token.base)).toBeGreaterThanOrEqual(4.5);
      expect(contrast(token[`status-${status}`], token.raised)).toBeGreaterThanOrEqual(4.5);
    }
  });

  it.each(THEME_IDS)('%s legibiliza los avisos y separa los bordes del fondo', (id) => {
    const token = readThemeTokens(id);

    for (const role of ['success', 'warning', 'danger'] as const) {
      expect(contrast(token[role], token.raised)).toBeGreaterThanOrEqual(4.5);
    }

    expect(contrast(token['border-strong'], token.base)).toBeGreaterThanOrEqual(3);
  });

  it('la tinta del mural contrasta con sus cinco colores en cualquier tema', () => {
    const notes = /--note-([\w-]+):\s*(\d+ \d+ \d+);/g;
    const values: Record<string, Channels> = {};

    for (const [, name, value] of STYLESHEET.matchAll(notes)) {
      const [red, green, blue] = value.split(' ').map(Number);
      values[name] = [red, green, blue];
    }

    for (const color of ['amarillo', 'rosa', 'azul', 'verde', 'lila']) {
      expect(contrast(values.ink, values[color])).toBeGreaterThanOrEqual(4.5);
    }
  });
});
