import { ApplicationStatus, STATUS_CATALOG } from './job-application';

/** Acciones del usuario que otorgan experiencia. */
export const EXPERIENCE_EVENTS = [
  'application_created',
  'status_advanced',
  'interview_scheduled',
  'note_written',
  'offer_received',
  'hired',
  'rejection_registered',
] as const;

export type ExperienceEvent = (typeof EXPERIENCE_EVENTS)[number];

export const EXPERIENCE_REWARDS: Readonly<Record<ExperienceEvent, number>> = {
  application_created: 10,
  status_advanced: 15,
  interview_scheduled: 20,
  note_written: 5,
  offer_received: 60,
  hired: 150,
  rejection_registered: 8,
};

/** Puntos base que aporta cada escalon adicional de progreso al mover una tarjeta. */
const PROGRESS_WEIGHT_BONUS = 10;

/** Experiencia acumulada necesaria para alcanzar un nivel dado. */
export function totalExperienceForLevel(level: number): number {
  const normalizedLevel = Math.max(1, Math.floor(level));
  return 50 * ((normalizedLevel - 1) * normalizedLevel) / 2;
}

export interface LevelProgress {
  readonly level: number;
  readonly experience: number;
  readonly experienceIntoLevel: number;
  readonly experienceForNextLevel: number;
  readonly percentToNextLevel: number;
  readonly title: string;
}

const LEVEL_TITLES: readonly string[] = [
  'Aspirante',
  'Explorador',
  'Postulante',
  'Entrevistado',
  'Negociador',
  'Estratega',
  'Cazador de ofertas',
  'Leyenda del empleo',
];

export function titleForLevel(level: number): string {
  const index = Math.min(Math.max(level, 1), LEVEL_TITLES.length) - 1;
  return LEVEL_TITLES[index];
}

/**
 * Traduce la experiencia acumulada a nivel y progreso hacia el siguiente nivel.
 * Nunca lanza: los valores invalidos se normalizan a cero.
 */
export function calculateLevelProgress(experience: number): LevelProgress {
  const safeExperience = Number.isFinite(experience) && experience > 0 ? Math.floor(experience) : 0;

  let level = 1;
  while (safeExperience >= totalExperienceForLevel(level + 1)) {
    level += 1;
  }

  const currentThreshold = totalExperienceForLevel(level);
  const nextThreshold = totalExperienceForLevel(level + 1);
  const experienceIntoLevel = safeExperience - currentThreshold;
  const experienceForNextLevel = nextThreshold - currentThreshold;

  return {
    level,
    experience: safeExperience,
    experienceIntoLevel,
    experienceForNextLevel,
    percentToNextLevel: Math.round((experienceIntoLevel / experienceForNextLevel) * 100),
    title: titleForLevel(level),
  };
}

/**
 * Experiencia otorgada al cambiar el estado de una postulación.
 * Retroceder o quedarse en el mismo estado no otorga puntos.
 */
export function experienceForStatusChange(
  previousStatus: ApplicationStatus,
  nextStatus: ApplicationStatus,
): number {
  if (previousStatus === nextStatus) {
    return 0;
  }

  if (nextStatus === 'hired') {
    return EXPERIENCE_REWARDS.hired;
  }

  if (nextStatus === 'offer') {
    return EXPERIENCE_REWARDS.offer_received;
  }

  if (nextStatus === 'rejected') {
    return EXPERIENCE_REWARDS.rejection_registered;
  }

  const weightDelta =
    STATUS_CATALOG[nextStatus].progressWeight - STATUS_CATALOG[previousStatus].progressWeight;

  if (weightDelta <= 0) {
    return 0;
  }

  return EXPERIENCE_REWARDS.status_advanced + weightDelta * PROGRESS_WEIGHT_BONUS;
}

export interface PlayerStats {
  readonly totalApplications: number;
  readonly byStatus: Readonly<Record<ApplicationStatus, number>>;
  readonly notesWritten: number;
  readonly interviewsScheduled: number;
  readonly currentStreakDays: number;
  readonly longestStreakDays: number;
}

export const EMPTY_STATS: PlayerStats = {
  totalApplications: 0,
  byStatus: {
    wishlist: 0,
    applied: 0,
    interview: 0,
    offer: 0,
    hired: 0,
    rejected: 0,
  },
  notesWritten: 0,
  interviewsScheduled: 0,
  currentStreakDays: 0,
  longestStreakDays: 0,
};

export interface AchievementDefinition {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconId: string;
  readonly experienceBonus: number;
  readonly isUnlocked: (stats: PlayerStats) => boolean;
  readonly progress: (stats: PlayerStats) => { current: number; target: number };
}

const countReached = (current: number, target: number) => ({
  current: Math.min(current, target),
  target,
});

export const ACHIEVEMENTS: readonly AchievementDefinition[] = [
  {
    id: 'first_step',
    name: 'Primer paso',
    description: 'Registra tu primera postulación.',
    iconId: 'flag',
    experienceBonus: 20,
    isUnlocked: (stats) => stats.totalApplications >= 1,
    progress: (stats) => countReached(stats.totalApplications, 1),
  },
  {
    id: 'ten_applications',
    name: 'Sembrando oportunidades',
    description: 'Alcanza diez postulaciones registradas.',
    iconId: 'layers',
    experienceBonus: 50,
    isUnlocked: (stats) => stats.totalApplications >= 10,
    progress: (stats) => countReached(stats.totalApplications, 10),
  },
  {
    id: 'first_interview',
    name: 'Sala de entrevistas',
    description: 'Lleva una postulación hasta la etapa de entrevista.',
    iconId: 'mic',
    experienceBonus: 40,
    isUnlocked: (stats) => stats.byStatus.interview + stats.byStatus.offer + stats.byStatus.hired >= 1,
    progress: (stats) =>
      countReached(stats.byStatus.interview + stats.byStatus.offer + stats.byStatus.hired, 1),
  },
  {
    id: 'first_offer',
    name: 'Sobre la mesa',
    description: 'Recibe tu primera oferta formal.',
    iconId: 'award',
    experienceBonus: 80,
    isUnlocked: (stats) => stats.byStatus.offer + stats.byStatus.hired >= 1,
    progress: (stats) => countReached(stats.byStatus.offer + stats.byStatus.hired, 1),
  },
  {
    id: 'signed',
    name: 'Contrato firmado',
    description: 'Cierra un proceso como contratado.',
    iconId: 'trophy',
    experienceBonus: 150,
    isUnlocked: (stats) => stats.byStatus.hired >= 1,
    progress: (stats) => countReached(stats.byStatus.hired, 1),
  },
  {
    id: 'resilient',
    name: 'Resiliencia',
    description: 'Registra cinco procesos descartados y sigue adelante.',
    iconId: 'shield',
    experienceBonus: 60,
    isUnlocked: (stats) => stats.byStatus.rejected >= 5,
    progress: (stats) => countReached(stats.byStatus.rejected, 5),
  },
  {
    id: 'note_taker',
    name: 'Memoria de acero',
    description: 'Escribe notas en quince postulaciones.',
    iconId: 'notebook',
    experienceBonus: 45,
    isUnlocked: (stats) => stats.notesWritten >= 15,
    progress: (stats) => countReached(stats.notesWritten, 15),
  },
  {
    id: 'streak_seven',
    name: 'Constancia semanal',
    description: 'Manten una racha de siete días con actividad.',
    iconId: 'flame',
    experienceBonus: 70,
    isUnlocked: (stats) => stats.longestStreakDays >= 7,
    progress: (stats) => countReached(stats.longestStreakDays, 7),
  },
];

export interface AchievementState {
  readonly id: string;
  readonly name: string;
  readonly description: string;
  readonly iconId: string;
  readonly experienceBonus: number;
  readonly unlocked: boolean;
  readonly current: number;
  readonly target: number;
}

export function evaluateAchievements(stats: PlayerStats): AchievementState[] {
  return ACHIEVEMENTS.map((achievement) => {
    const { current, target } = achievement.progress(stats);
    return {
      id: achievement.id,
      name: achievement.name,
      description: achievement.description,
      iconId: achievement.iconId,
      experienceBonus: achievement.experienceBonus,
      unlocked: achievement.isUnlocked(stats),
      current,
      target,
    };
  });
}

export interface GamificationProfile {
  readonly stats: PlayerStats;
  readonly progress: LevelProgress;
  readonly achievements: readonly AchievementState[];
  readonly baseExperience: number;
  readonly bonusExperience: number;
}
