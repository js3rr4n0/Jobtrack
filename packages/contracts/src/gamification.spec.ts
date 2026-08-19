import { describe, expect, it } from 'vitest';

import {
  EXPERIENCE_REWARDS,
  EMPTY_STATS,
  calculateLevelProgress,
  evaluateAchievements,
  experienceForStatusChange,
  titleForLevel,
  totalExperienceForLevel,
} from './gamification';
import { PlayerStats } from './gamification';

const statsWith = (overrides: Partial<PlayerStats>): PlayerStats => ({
  ...EMPTY_STATS,
  ...overrides,
  byStatus: { ...EMPTY_STATS.byStatus, ...(overrides.byStatus ?? {}) },
});

describe('totalExperienceForLevel', () => {
  it('exige cero experiencia para el primer nivel', () => {
    expect(totalExperienceForLevel(1)).toBe(0);
  });

  it('crece de forma progresiva entre niveles', () => {
    expect(totalExperienceForLevel(2)).toBe(50);
    expect(totalExperienceForLevel(3)).toBe(150);
    expect(totalExperienceForLevel(4)).toBe(300);
  });

  it('normaliza niveles invalidos al primer nivel', () => {
    expect(totalExperienceForLevel(0)).toBe(0);
    expect(totalExperienceForLevel(-8)).toBe(0);
  });
});

describe('calculateLevelProgress', () => {
  it('devuelve el nivel uno cuando no hay experiencia', () => {
    const progress = calculateLevelProgress(0);

    expect(progress.level).toBe(1);
    expect(progress.experienceIntoLevel).toBe(0);
    expect(progress.percentToNextLevel).toBe(0);
  });

  it('sube de nivel al alcanzar exactamente el umbral', () => {
    expect(calculateLevelProgress(50).level).toBe(2);
    expect(calculateLevelProgress(149).level).toBe(2);
    expect(calculateLevelProgress(150).level).toBe(3);
  });

  it('calcula el porcentaje hacia el siguiente nivel', () => {
    const progress = calculateLevelProgress(100);

    expect(progress.level).toBe(2);
    expect(progress.experienceIntoLevel).toBe(50);
    expect(progress.experienceForNextLevel).toBe(100);
    expect(progress.percentToNextLevel).toBe(50);
  });

  it('trata valores nulos, negativos o no numéricos como cero sin fallar', () => {
    const invalidValues = [Number.NaN, Number.POSITIVE_INFINITY, -120, undefined as unknown as number];

    for (const value of invalidValues) {
      const progress = calculateLevelProgress(value);
      expect(progress.level).toBe(1);
      expect(progress.experience).toBe(0);
    }
  });

  it('asigna un título dentro del catalogo para cualquier nivel', () => {
    expect(titleForLevel(1)).toBe('Aspirante');
    expect(titleForLevel(999)).toBe('Leyenda del empleo');
    expect(titleForLevel(-3)).toBe('Aspirante');
  });
});

describe('experienceForStatusChange', () => {
  it('no otorga experiencia si el estado no cambia', () => {
    expect(experienceForStatusChange('applied', 'applied')).toBe(0);
  });

  it('no otorga experiencia al retroceder de etapa', () => {
    expect(experienceForStatusChange('interview', 'applied')).toBe(0);
  });

  it('premia el avance proporcionalmente a los escalones ganados', () => {
    const oneStep = experienceForStatusChange('wishlist', 'applied');
    const twoSteps = experienceForStatusChange('wishlist', 'interview');

    expect(oneStep).toBeGreaterThan(0);
    expect(twoSteps).toBeGreaterThan(oneStep);
  });

  it('aplica recompensas fijas a los estados de cierre', () => {
    expect(experienceForStatusChange('interview', 'offer')).toBe(EXPERIENCE_REWARDS.offer_received);
    expect(experienceForStatusChange('offer', 'hired')).toBe(EXPERIENCE_REWARDS.hired);
    expect(experienceForStatusChange('applied', 'rejected')).toBe(
      EXPERIENCE_REWARDS.rejection_registered,
    );
  });

  it('reconoce el esfuerzo aunque el proceso termine en descarte', () => {
    expect(experienceForStatusChange('wishlist', 'rejected')).toBeGreaterThan(0);
  });
});

describe('evaluateAchievements', () => {
  it('marca todos los logros como bloqueados sin actividad', () => {
    const achievements = evaluateAchievements(EMPTY_STATS);

    expect(achievements.every((achievement) => !achievement.unlocked)).toBe(true);
    expect(achievements.every((achievement) => achievement.current === 0)).toBe(true);
  });

  it('desbloquea el primer paso con una sola postulación', () => {
    const achievements = evaluateAchievements(statsWith({ totalApplications: 1 }));
    const firstStep = achievements.find((achievement) => achievement.id === 'first_step');

    expect(firstStep?.unlocked).toBe(true);
  });

  it('limita el progreso mostrado al objetivo del logro', () => {
    const achievements = evaluateAchievements(statsWith({ totalApplications: 40 }));
    const tenApplications = achievements.find((achievement) => achievement.id === 'ten_applications');

    expect(tenApplications?.current).toBe(10);
    expect(tenApplications?.target).toBe(10);
  });

  it('mide los hitos por las etapas alcanzadas, no por la columna actual', () => {
    // La tarjeta esta hoy en "me interesa", pero llego a estar contratada.
    const achievements = evaluateAchievements(
      statsWith({
        byStatus: { wishlist: 1 } as never,
        reachedByStatus: { interview: 1, offer: 1, hired: 1 } as never,
      }),
    );

    const desbloqueados = achievements
      .filter((achievement) => achievement.unlocked)
      .map((achievement) => achievement.id);

    expect(desbloqueados).toContain('first_interview');
    expect(desbloqueados).toContain('first_offer');
    expect(desbloqueados).toContain('signed');
  });
});
