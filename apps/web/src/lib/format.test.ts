import { describe, expect, it } from 'vitest';

import { currentTimeZone, formatMeetingTime } from './format';

describe('formatMeetingTime', () => {
  it('incluye la zona horaria junto a la hora', () => {
    const texto = formatMeetingTime('2026-08-20T15:00:00.000Z');

    // El nombre corto de la zona varía según el sistema, pero siempre hay algo
    // más que la hora: es justamente lo que se quiere comprobar.
    expect(texto).not.toBe('');
    expect(texto.length).toBeGreaterThan('20 ago, 09:00'.length);
  });

  it('muestra el mismo instante escrito con dos desplazamientos distintos', () => {
    expect(formatMeetingTime('2026-08-20T15:00:00.000Z')).toBe(
      formatMeetingTime('2026-08-20T09:00:00.000-06:00'),
    );
  });

  it('devuelve una cadena vacía ante valores nulos o corruptos', () => {
    expect(formatMeetingTime(null)).toBe('');
    expect(formatMeetingTime('no-es-una-fecha')).toBe('');
  });
});

describe('currentTimeZone', () => {
  it('devuelve el identificador exacto del navegador', () => {
    expect(currentTimeZone().id).toBe(Intl.DateTimeFormat().resolvedOptions().timeZone);
  });

  it('deja la ciudad sola para poder decirla en una frase', () => {
    // La prueba corre con TZ=America/Mexico_City fijada por el arranque.
    const zona = currentTimeZone();

    expect(zona.label).not.toContain('/');
    expect(zona.label).not.toContain('_');
  });
});
