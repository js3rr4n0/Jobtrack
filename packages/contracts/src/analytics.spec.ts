import { describe, expect, it } from 'vitest';

import {
  buildGamificationProfile,
  buildPlayerStats,
  calculateBaseExperience,
  calculateStreaks,
  isFollowUpDue,
} from './analytics';
import { EXPERIENCE_REWARDS } from './gamification';
import type { JobApplication } from './job-application';
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

  it('cuenta días consecutivos una sola vez por día', () => {
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

  it('mantiene la racha viva si la última actividad fue ayer', () => {
    const streaks = calculateStreaks(
      ['2026-02-08T08:00:00.000Z', '2026-02-09T08:00:00.000Z'],
      REFERENCE_DATE,
    );

    expect(streaks.currentStreakDays).toBe(2);
  });

  it('rompe la racha actual tras más de un día sin actividad', () => {
    const streaks = calculateStreaks(
      ['2026-02-01T08:00:00.000Z', '2026-02-02T08:00:00.000Z'],
      REFERENCE_DATE,
    );

    expect(streaks.currentStreakDays).toBe(0);
    expect(streaks.longestStreakDays).toBe(2);
  });
});

describe('buildPlayerStats', () => {
  it('devuelve estadisticas vacías sin postulaciones', () => {
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

  it('otorga la recompensa de creación a una postulación recien guardada', () => {
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
  it('produce un perfil consistente para un tablero vacío', () => {
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

describe('isFollowUpDue', () => {
  const hoy = new Date('2026-03-10T12:00:00.000Z');
  const conSeguimiento = (followUpAt: string | null, status: JobApplication['status'] = 'applied') =>
    buildJobApplication({ followUpAt, status });

  it('reclama el seguimiento cuando la fecha ya pasó', () => {
    expect(isFollowUpDue(conSeguimiento('2026-03-01T00:00:00.000Z'), hoy)).toBe(true);
  });

  it('reclama el seguimiento el mismo día', () => {
    expect(isFollowUpDue(conSeguimiento('2026-03-10T09:00:00.000Z'), hoy)).toBe(true);
  });

  it('no reclama nada si la fecha aún no llega', () => {
    expect(isFollowUpDue(conSeguimiento('2026-03-20T00:00:00.000Z'), hoy)).toBe(false);
  });

  it('no reclama nada sin fecha de seguimiento', () => {
    expect(isFollowUpDue(conSeguimiento(null), hoy)).toBe(false);
  });

  it('deja en paz los procesos ya cerrados', () => {
    expect(isFollowUpDue(conSeguimiento('2026-03-01T00:00:00.000Z', 'hired'), hoy)).toBe(false);
    expect(isFollowUpDue(conSeguimiento('2026-03-01T00:00:00.000Z', 'rejected'), hoy)).toBe(false);
  });

  it('ignora una fecha ilegible en lugar de fallar', () => {
    expect(isFollowUpDue(conSeguimiento('no-es-una-fecha'), hoy)).toBe(false);
    expect(isFollowUpDue(conSeguimiento('   '), hoy)).toBe(false);
  });
});

describe('seguimientos pendientes en las estadísticas', () => {
  const hoy = new Date('2026-03-10T12:00:00.000Z');

  it('cuenta solo los vencidos de procesos vivos', () => {
    const stats = buildPlayerStats(
      [
        buildJobApplication({ id: 'a', followUpAt: '2026-03-01T00:00:00.000Z', status: 'applied' }),
        buildJobApplication({ id: 'b', followUpAt: '2026-03-02T00:00:00.000Z', status: 'interview' }),
        buildJobApplication({ id: 'c', followUpAt: '2026-03-30T00:00:00.000Z', status: 'applied' }),
        buildJobApplication({ id: 'd', followUpAt: '2026-03-01T00:00:00.000Z', status: 'rejected' }),
        buildJobApplication({ id: 'e', followUpAt: null, status: 'applied' }),
      ],
      hoy,
    );

    expect(stats.pendingFollowUps).toBe(2);
  });

  it('un tablero vacío no tiene seguimientos pendientes', () => {
    expect(buildPlayerStats([], hoy).pendingFollowUps).toBe(0);
  });
});
