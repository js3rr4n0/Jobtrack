import {
  EXPERIENCE_REWARDS,
  EMPTY_STATS,
  GamificationProfile,
  PlayerStats,
  ACHIEVEMENTS,
  calculateLevelProgress,
  evaluateAchievements,
  experienceForStatusChange,
} from './gamification';
import { ApplicationStatus, JobApplication, APPLICATION_STATUSES } from './job-application';

const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

function toDayKey(isoDate: string): string | null {
  const parsed = new Date(isoDate);
  if (Number.isNaN(parsed.getTime())) {
    return null;
  }
  return parsed.toISOString().slice(0, 10);
}

function daysBetween(earlierDayKey: string, laterDayKey: string): number {
  const earlier = Date.parse(`${earlierDayKey}T00:00:00.000Z`);
  const later = Date.parse(`${laterDayKey}T00:00:00.000Z`);
  return Math.round((later - earlier) / MILLISECONDS_PER_DAY);
}

/**
 * Calcula la racha actual y la más larga a partir de los días con actividad.
 * La racha actual solo cuenta si la última actividad fue hoy o ayer.
 */
export function calculateStreaks(
  activityDates: readonly string[],
  referenceDate: Date = new Date(),
): { currentStreakDays: number; longestStreakDays: number } {
  const uniqueDays = Array.from(
    new Set(activityDates.map(toDayKey).filter((day): day is string => day !== null)),
  ).sort();

  if (uniqueDays.length === 0) {
    return { currentStreakDays: 0, longestStreakDays: 0 };
  }

  let longestStreakDays = 1;
  let runLength = 1;

  for (let index = 1; index < uniqueDays.length; index += 1) {
    const isConsecutive = daysBetween(uniqueDays[index - 1], uniqueDays[index]) === 1;
    runLength = isConsecutive ? runLength + 1 : 1;
    longestStreakDays = Math.max(longestStreakDays, runLength);
  }

  const todayKey = referenceDate.toISOString().slice(0, 10);
  const lastActivityDay = uniqueDays[uniqueDays.length - 1];
  const distanceFromToday = daysBetween(lastActivityDay, todayKey);
  const currentStreakDays = distanceFromToday <= 1 ? runLength : 0;

  return { currentStreakDays, longestStreakDays };
}

function hasText(value: string | null | undefined): boolean {
  return typeof value === 'string' && value.trim().length > 0;
}

/** Estados en los que ya no tiene sentido insistir: el proceso está cerrado. */
const CLOSED_STATUSES: readonly ApplicationStatus[] = ['hired', 'rejected'];

/**
 * Decide si a una postulación le toca seguimiento. Solo cuenta si el proceso
 * sigue vivo y la fecha ya llegó; una fecha ilegible se ignora en lugar de
 * romper el cálculo, porque puede venir de un dato corrupto.
 */
export function isFollowUpDue(
  application: JobApplication,
  referenceDate: Date = new Date(),
): boolean {
  if (!hasText(application.followUpAt) || CLOSED_STATUSES.includes(application.status)) {
    return false;
  }

  const due = new Date(application.followUpAt as string);

  return !Number.isNaN(due.getTime()) && due.getTime() <= referenceDate.getTime();
}

/** Agrega las postulaciones en estadisticas de jugador. Tolera arreglos vacíos. */
export function buildPlayerStats(
  applications: readonly JobApplication[],
  referenceDate: Date = new Date(),
): PlayerStats {
  if (applications.length === 0) {
    return EMPTY_STATS;
  }

  const byStatus = APPLICATION_STATUSES.reduce(
    (accumulator, status) => ({ ...accumulator, [status]: 0 }),
    {} as Record<ApplicationStatus, number>,
  );

  let notesWritten = 0;
  let interviewsScheduled = 0;
  let pendingFollowUps = 0;
  const activityDates: string[] = [];

  for (const application of applications) {
    byStatus[application.status] += 1;

    if (hasText(application.notes)) {
      notesWritten += 1;
    }

    if (hasText(application.interviewAt)) {
      interviewsScheduled += 1;
    }

    if (isFollowUpDue(application, referenceDate)) {
      pendingFollowUps += 1;
    }

    activityDates.push(application.createdAt, application.updatedAt);
  }

  const { currentStreakDays, longestStreakDays } = calculateStreaks(activityDates, referenceDate);

  return {
    totalApplications: applications.length,
    byStatus,
    notesWritten,
    interviewsScheduled,
    pendingFollowUps,
    currentStreakDays,
    longestStreakDays,
  };
}

/**
 * Recalcula la experiencia base a partir del estado actual de las postulaciones.
 * Al derivarse del estado y no de un historial de eventos, el resultado es
 * determinista y reproducible en cualquier dispositivo.
 */
export function calculateBaseExperience(applications: readonly JobApplication[]): number {
  return applications.reduce((total, application) => {
    let earned = EXPERIENCE_REWARDS.application_created;
    earned += experienceForStatusChange('wishlist', application.status);

    if (hasText(application.notes)) {
      earned += EXPERIENCE_REWARDS.note_written;
    }

    if (hasText(application.interviewAt)) {
      earned += EXPERIENCE_REWARDS.interview_scheduled;
    }

    return total + earned;
  }, 0);
}

/** Construye el perfil completo de gamificación listo para la interfaz. */
export function buildGamificationProfile(
  applications: readonly JobApplication[],
  referenceDate: Date = new Date(),
): GamificationProfile {
  const stats = buildPlayerStats(applications, referenceDate);
  const achievements = evaluateAchievements(stats);
  const baseExperience = calculateBaseExperience(applications);
  const bonusExperience = achievements
    .filter((achievement) => achievement.unlocked)
    .reduce((total, achievement) => total + achievement.experienceBonus, 0);

  return {
    stats,
    progress: calculateLevelProgress(baseExperience + bonusExperience),
    achievements,
    baseExperience,
    bonusExperience,
  };
}

export const TOTAL_ACHIEVEMENTS = ACHIEVEMENTS.length;
