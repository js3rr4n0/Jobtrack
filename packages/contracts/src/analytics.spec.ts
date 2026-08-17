import { describe, expect, it } from 'vitest';

import {
  buildGamificationProfile,
  buildPlayerStats,
  calculateBaseExperience,
  calculateStreaks,
} from './analytics';
import { EXPERIENCE_REWARDS } from './gamification';
import { buildJobApplication } from './test-factories';

const REFERENCE_DATE = new Date('2026-02-10T09:00:00.000Z');

describe('calculateStreaks', () => {
  it('devuelve cero cuando no hay actividad', () => {
    expect(calculateStreaks([], REFERENCE_DATE)).toEqual({
      currentStreakDays: 0,
      longestStreakDays: 0,
    });
  });

  it('ignora fechas invalidas en lugar de fallar', () => {
    const streaks = calculateStreaks(['no-es-una-fecha', ''], REFERENCE_DATE);

    expect(streaks.currentStreakDays).toBe(0);
    expect(streaks.longestStreakDays).toBe(0);
  });

  it('cuenta dias consecutivos una sola vez por dia', () => {
    const streaks = calculateStreaks(
      [
        '2026-02-08T08:00:00.000Z',
        '2026-02-08T20:00:00.000Z',
        '2026-02-09T10:00:00.000Z',
        '2026-02-10T07:00:00.000Z',
      ],
      REFERENCE_DATE,
    );

    expect(streaks.currentStreakDays).toBe(3);
    expect(streaks.longestStreakDays).toBe(3);
  });

  it('mantiene la racha viva si la ultima actividad fue ayer', () => {
    const streaks = calculateStreaks(
      ['2026-02-08T08:00:00.000Z', '2026-02-09T08:00:00.000Z'],
      REFERENCE_DATE,
    );

    expect(streaks.currentStreakDays).toBe(2);
  });

  it('rompe la racha actual tras mas de un dia sin actividad', () => {
    const streaks = calculateStreaks(
      ['2026-02-01T08:00:00.000Z', '2026-02-02T08:00:00.000Z'],
      REFERENCE_DATE,
    );

    expect(streaks.currentStreakDays).toBe(0);
    expect(streaks.longestStreakDays).toBe(2);
  });
});

describe('buildPlayerStats', () => {
  it('devuelve estadisticas vacias sin postulaciones', () => {
    const stats = buildPlayerStats([], REFERENCE_DATE);

    expect(stats.totalApplications).toBe(0);
    expect(stats.byStatus.applied).toBe(0);
  });

  it('agrupa las postulaciones por estado', () => {
    const stats = buildPlayerStats(
      [
        buildJobApplication({ id: 'a', status: 'applied' }),
        buildJobApplication({ id: 'b', status: 'applied' }),
        buildJobApplication({ id: 'c', status: 'interview' }),
      ],
      REFERENCE_DATE,
    );

    expect(stats.totalApplications).toBe(3);
    expect(stats.byStatus.applied).toBe(2);
    expect(stats.byStatus.interview).toBe(1);
  });

  it('no cuenta notas compuestas solo por espacios', () => {
    const stats = buildPlayerStats(
      [
        buildJobApplication({ id: 'a', notes: '   ' }),
        buildJobApplication({ id: 'b', notes: 'Contactar al reclutador' }),
        buildJobApplication({ id: 'c', notes: null }),
      ],
      REFERENCE_DATE,
    );

    expect(stats.notesWritten).toBe(1);
  });

  it('cuenta las entrevistas agendadas', () => {
    const stats = buildPlayerStats(
      [
        buildJobApplication({ id: 'a', interviewAt: '2026-02-20T15:00:00.000Z' }),
        buildJobApplication({ id: 'b', interviewAt: null }),
      ],
      REFERENCE_DATE,
    );

    expect(stats.interviewsScheduled).toBe(1);
  });
});

describe('calculateBaseExperience', () => {
  it('es cero sin postulaciones', () => {
    expect(calculateBaseExperience([])).toBe(0);
  });

  it('otorga la recompensa de creacion a una postulacion recien guardada', () => {
    const experience = calculateBaseExperience([buildJobApplication({ status: 'wishlist' })]);

    expect(experience).toBe(EXPERIENCE_REWARDS.application_created);
  });

  it('suma las recompensas de notas y entrevista agendada', () => {
    const experience = calculateBaseExperience([
      buildJobApplication({
        status: 'wishlist',
        notes: 'Preparar portafolio',
        interviewAt: '2026-02-20T15:00:00.000Z',
      }),
    ]);

    expect(experience).toBe(
      EXPERIENCE_REWARDS.application_created +
        EXPERIENCE_REWARDS.note_written +
        EXPERIENCE_REWARDS.interview_scheduled,
    );
  });

  it('es determinista: el mismo estado produce siempre el mismo total', () => {
    const applications = [
      buildJobApplication({ id: 'a', status: 'offer' }),
      buildJobApplication({ id: 'b', status: 'rejected' }),
    ];

    expect(calculateBaseExperience(applications)).toBe(calculateBaseExperience(applications));
  });
});

describe('buildGamificationProfile', () => {
  it('produce un perfil consistente para un tablero vacio', () => {
    const profile = buildGamificationProfile([], REFERENCE_DATE);

    expect(profile.progress.level).toBe(1);
    expect(profile.baseExperience).toBe(0);
    expect(profile.bonusExperience).toBe(0);
    expect(profile.achievements.length).toBeGreaterThan(0);
  });

  it('suma los bonos de los logros desbloqueados a la experiencia total', () => {
    const profile = buildGamificationProfile(
      [buildJobApplication({ id: 'a', status: 'hired' })],
      REFERENCE_DATE,
    );

    const unlockedBonus = profile.achievements
      .filter((achievement) => achievement.unlocked)
      .reduce((total, achievement) => total + achievement.experienceBonus, 0);

    expect(profile.bonusExperience).toBe(unlockedBonus);
    expect(profile.progress.experience).toBe(profile.baseExperience + profile.bonusExperience);
  });
});
