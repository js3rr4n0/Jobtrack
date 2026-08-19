import { describe, expect, it } from 'vitest';

import {
  frequencyForSemitone,
  loopDurationSeconds,
  secondsPerBeat,
  soundscapeForTheme,
} from './ambient-music';
import { THEME_IDS } from './themes';

const ALL_SOUNDSCAPES = THEME_IDS.map((theme) => soundscapeForTheme(theme));

describe('soundscapeForTheme', () => {
  it('asigna una pieza completa a cada tema disponible', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      expect(soundscape.melody.length).toBeGreaterThan(0);
      expect(soundscape.bass.length).toBeGreaterThan(0);
      expect(soundscape.bpm).toBeGreaterThan(0);
      expect(soundscape.rootFrequency).toBeGreaterThan(0);
    }
  });

  it('comparte pieza entre los temas del mismo carácter', () => {
    expect(soundscapeForTheme('pixeles').id).toBe(soundscapeForTheme('retro').id);
    expect(soundscapeForTheme('light').id).toBe(soundscapeForTheme('dark').id);
    expect(soundscapeForTheme('galaxia').id).toBe(soundscapeForTheme('naturaleza-nocturna').id);
  });

  it('diferencia las cinco piezas', () => {
    const ids = new Set(
      (['light', 'pixeles', 'videojuegos', 'anime', 'galaxia'] as const).map(
        (theme) => soundscapeForTheme(theme).id,
      ),
    );

    expect(ids.size).toBe(5);
  });

  it('usa timbre de consola en los temas de juego retro', () => {
    expect(soundscapeForTheme('pixeles').leadWaveform).toBe('square');
  });

  it('recurre al ambiente sereno ante un tema desconocido', () => {
    expect(soundscapeForTheme('inventado' as never).id).toBe('calm');
  });
});

describe('melodias', () => {
  it('toda nota dura un número positivo de tiempos', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      for (const item of [...soundscape.melody, ...soundscape.bass]) {
        expect(item.beats).toBeGreaterThan(0);
      }
    }
  });

  it('melodia y bajo cubren la misma duracion, para que el bucle encaje', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      const melodyBeats = soundscape.melody.reduce((total, item) => total + item.beats, 0);
      const bassBeats = soundscape.bass.reduce((total, item) => total + item.beats, 0);

      expect(bassBeats).toBeCloseTo(melodyBeats, 5);
    }
  });

  it('el ataque es breve, para que las notas suenen definidas y no como barridos', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      expect(soundscape.attackSeconds).toBeLessThanOrEqual(0.05);
      expect(soundscape.sustainRatio).toBeGreaterThan(0.5);
    }
  });

  it('mantiene todas las notas dentro del rango audible', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      for (const item of [...soundscape.melody, ...soundscape.bass]) {
        if (item.semitone === null) {
          continue;
        }
        const frequency = frequencyForSemitone(soundscape.rootFrequency, item.semitone);
        expect(frequency).toBeGreaterThan(40);
        expect(frequency).toBeLessThan(5000);
      }
    }
  });

  it('cada pieza dura lo suficiente para reconocerse y repetirse', () => {
    for (const soundscape of ALL_SOUNDSCAPES) {
      const duration = loopDurationSeconds(soundscape);
      expect(duration).toBeGreaterThan(4);
      expect(duration).toBeLessThan(60);
    }
  });
});

describe('utilidades de tempo', () => {
  it('convierte pulsaciones por minuto en segundos por tiempo', () => {
    expect(secondsPerBeat(120)).toBeCloseTo(0.5, 5);
    expect(secondsPerBeat(60)).toBeCloseTo(1, 5);
  });

  it('el semitono cero suena en la nota base y doce la duplican', () => {
    expect(frequencyForSemitone(440, 0)).toBeCloseTo(440, 5);
    expect(frequencyForSemitone(440, 12)).toBeCloseTo(880, 5);
    expect(frequencyForSemitone(440, -12)).toBeCloseTo(220, 5);
  });
});
