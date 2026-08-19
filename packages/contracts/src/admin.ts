import { ApplicationStatus, JobApplication, APPLICATION_STATUSES } from './job-application';

/**
 * Panel de administración: mide el uso del producto en conjunto, nunca a una
 * persona concreta. Todo lo que sale de aquí son recuentos agregados, de modo
 * que responder "qué empresas contratan más" no obliga a exponer las notas ni
 * los contactos de nadie.
 */

/** Días sin tocar una postulación viva tras los que se considera abandonada. */
export const STALLED_AFTER_DAYS = 30;

/**
 * Postulaciones mínimas para calcular un porcentaje por empresa. Con una o dos
 * muestras, "100 % de contratación" no significa nada.
 */
export const MIN_SAMPLE_FOR_RATE = 3;

const DAY_IN_MS = 86_400_000;

export interface CompanyStat {
  readonly company: string;
  readonly total: number;
  readonly hired: number;
  readonly rejected: number;
  /** Porcentaje entero de contratación sobre el total de esa empresa. */
  readonly hiredRate: number;
  readonly rejectedRate: number;
}

export interface AreaStat {
  readonly name: string;
  readonly total: number;
}

export interface AdminOverview {
  readonly totalUsers: number;
  readonly totalApplications: number;
  readonly byStatus: Readonly<Record<ApplicationStatus, number>>;
  /** Personas con alguna postulación creada o tocada en los últimos 30 días. */
  readonly activeUsers: number;
  readonly averagePerUser: number;
  /** Procesos vivos sin movimiento durante más de 30 días. */
  readonly stalledApplications: number;
  readonly mostApplied: readonly CompanyStat[];
  readonly bestHiring: readonly CompanyStat[];
  readonly worstHiring: readonly CompanyStat[];
  readonly topAreas: readonly AreaStat[];
}

export const EMPTY_ADMIN_OVERVIEW: AdminOverview = {
  totalUsers: 0,
  totalApplications: 0,
  byStatus: { wishlist: 0, applied: 0, interview: 0, offer: 0, hired: 0, rejected: 0 },
  activeUsers: 0,
  averagePerUser: 0,
  stalledApplications: 0,
  mostApplied: [],
  bestHiring: [],
  worstHiring: [],
  topAreas: [],
};

/** Estados en los que el proceso sigue esperando respuesta. */
const OPEN_STATUSES: readonly ApplicationStatus[] = ['wishlist', 'applied', 'interview', 'offer'];

function parseTime(value: string | null): number | null {
  if (!value) {
    return null;
  }

  const time = new Date(value).getTime();
  return Number.isNaN(time) ? null : time;
}

/** Nombre de empresa normalizado, para que "Acme" y " acme " no se separen. */
function normalizeCompany(value: string): string {
  return value.trim().replace(/\s+/g, ' ');
}

function isStalled(application: JobApplication, reference: number): boolean {
  if (!OPEN_STATUSES.includes(application.status)) {
    return false;
  }

  const updated = parseTime(application.updatedAt);
  return updated !== null && reference - updated > STALLED_AFTER_DAYS * DAY_IN_MS;
}

function percentage(part: number, total: number): number {
  return total === 0 ? 0 : Math.round((part / total) * 100);
}

interface CompanyTally {
  company: string;
  total: number;
  hired: number;
  rejected: number;
}

/**
 * Ordena de mayor a menor y desempata por nombre, de modo que dos consultas
 * seguidas sobre los mismos datos devuelven exactamente la misma lista.
 */
function byCountThenName(first: CompanyStat, second: CompanyStat): number {
  return second.total - first.total || first.company.localeCompare(second.company);
}

function byRateThenName(
  key: 'hiredRate' | 'rejectedRate',
): (first: CompanyStat, second: CompanyStat) => number {
  return (first, second) =>
    second[key] - first[key] ||
    second.total - first.total ||
    first.company.localeCompare(second.company);
}

/**
 * Resume el uso del producto. Es una función pura: recibe el conjunto de
 * postulaciones y la fecha de referencia, así que el mismo tablero produce
 * siempre el mismo informe y puede probarse sin base de datos.
 */
export function buildAdminOverview(
  applications: readonly JobApplication[],
  referenceDate: Date = new Date(),
  limit = 5,
): AdminOverview {
  if (applications.length === 0) {
    return EMPTY_ADMIN_OVERVIEW;
  }

  const reference = referenceDate.getTime();
  const recentThreshold = reference - STALLED_AFTER_DAYS * DAY_IN_MS;

  const byStatus = APPLICATION_STATUSES.reduce(
    (accumulator, status) => ({ ...accumulator, [status]: 0 }),
    {} as Record<ApplicationStatus, number>,
  );

  const users = new Set<string>();
  const activeUsers = new Set<string>();
  const companies = new Map<string, CompanyTally>();
  const areas = new Map<string, number>();
  let stalledApplications = 0;

  for (const application of applications) {
    byStatus[application.status] += 1;
    users.add(application.userId);

    const updated = parseTime(application.updatedAt);
    if (updated !== null && updated >= recentThreshold) {
      activeUsers.add(application.userId);
    }

    if (isStalled(application, reference)) {
      stalledApplications += 1;
    }

    const company = normalizeCompany(application.company);
    if (company) {
      const tally = companies.get(company) ?? { company, total: 0, hired: 0, rejected: 0 };
      tally.total += 1;
      if (application.status === 'hired') {
        tally.hired += 1;
      }
      if (application.status === 'rejected') {
        tally.rejected += 1;
      }
      companies.set(company, tally);
    }

    const area = application.category?.trim();
    if (area) {
      areas.set(area, (areas.get(area) ?? 0) + 1);
    }
  }

  const stats: CompanyStat[] = Array.from(companies.values(), (tally) => ({
    company: tally.company,
    total: tally.total,
    hired: tally.hired,
    rejected: tally.rejected,
    hiredRate: percentage(tally.hired, tally.total),
    rejectedRate: percentage(tally.rejected, tally.total),
  }));

  const comparable = stats.filter((stat) => stat.total >= MIN_SAMPLE_FOR_RATE);

  return {
    totalUsers: users.size,
    totalApplications: applications.length,
    byStatus,
    activeUsers: activeUsers.size,
    averagePerUser: users.size === 0 ? 0 : Math.round((applications.length / users.size) * 10) / 10,
    stalledApplications,
    mostApplied: [...stats].sort(byCountThenName).slice(0, limit),
    bestHiring: [...comparable].sort(byRateThenName('hiredRate')).slice(0, limit),
    worstHiring: [...comparable].sort(byRateThenName('rejectedRate')).slice(0, limit),
    topAreas: Array.from(areas, ([name, total]) => ({ name, total }))
      .sort((first, second) => second.total - first.total || first.name.localeCompare(second.name))
      .slice(0, limit),
  };
}
