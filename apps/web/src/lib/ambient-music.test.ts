import { describe, expect, it } from 'vitest';

import { frequencyForStep, soundscapeForTheme } from './ambient-music';
import { THEME_IDS } from './themes';

describe('soundscapeForTheme', () => {
  it('asigna un ambiente a cada tema disponible', () => {
    for (const theme of THEME_IDS) {
      const soundscape = soundscapeForTheme(theme);

      expect(soundscape.scale.length).toBeGreaterThan(0);
      expect(soundscape.rootFrequency).toBeGreaterThan(0);
      expect(soundscape.tempoMs).toBeGreaterThan(0);
    }
  });

  it('comparte ambiente entre los temas de la misma familia', () => {
    expect(soundscapeForTheme('pixel-pink').id).toBe(soundscapeForTheme('pixel-blue').id);
    expect(soundscapeForTheme('light').id).toBe(soundscapeForTheme('dark').id);
  });

  it('diferencia las familias creativas', () => {
    const ids = new Set(
      (['light', 'pixel-pink', 'gaming', 'anime', 'galaxy'] as const).map(
        (theme) => soundscapeForTheme(theme).id,
      ),
    );

    expect(ids.size).toBe(5);
  });

  it('usa timbres retro para los temas pixel', () => {
    expect(soundscapeForTheme('pixel-blue').waveform).toBe('square');
  });

  it('recurre al ambiente sereno ante un tema desconocido', () => {
    expect(soundscapeForTheme('inventado' as never).id).toBe('calm');
  });
});

describe('frequencyForStep', () => {
  const soundscape = soundscapeForTheme('light');

  it('el primer grado suena en la nota base', () => {
    expect(frequencyForStep(soundscape, 0)).toBeCloseTo(soundscape.rootFrequency, 5);
  });

  it('devuelve siempre una frecuencia audible', () => {
    for (let step = 0; step < 40; step += 1) {
      const frequency = frequencyForStep(soundscape, step);

      expect(frequency).toBeGreaterThan(20);
      expect(frequency).toBeLessThan(20000);
    }
  });

  it('tolera pasos negativos sin salirse de la escala', () => {
    expect(Number.isFinite(frequencyForStep(soundscape, -7))).toBe(true);
  });
});
