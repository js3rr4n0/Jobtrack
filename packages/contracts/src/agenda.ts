import { ApplicationStatus, JobApplication } from './job-application';

/**
 * Agenda de lo que toca hacer pronto. Reune en una sola lista las entrevistas
 * agendadas y los seguimientos pendientes de todo el tablero, porque quien
 * busca trabajo no piensa por columnas sino por fechas: lo que importa el lunes
 * por la manana es que hay una entrevista el martes, no en que etapa esta.
 *
 * Es una funcion pura sobre el estado del tablero, asi que la misma lista sale
 * igual en el telefono y en la computadora sin guardar nada aparte.
 */

export type AgendaKind = 'interview' | 'follow-up';

export interface AgendaEntry {
  readonly applicationId: string;
  readonly company: string;
  readonly position: string;
  readonly kind: AgendaKind;
  /** Momento de la cita en ISO 8601. */
  readonly at: string;
  /** Dias civiles hasta la cita. Negativo si ya paso. */
  readonly daysUntil: number;
  readonly isOverdue: boolean;
}

/** Dias hacia adelante que abarca la agenda. Mas alla deja de ser un recordatorio. */
export const AGENDA_HORIZON_DAYS = 30;

/** Un proceso cerrado ya no pide nada, aunque conserve sus fechas. */
const CLOSED_STATUSES: readonly ApplicationStatus[] = ['hired', 'rejected'];

const DAY_IN_MS = 86_400_000;

/** Medianoche local del dia al que pertenece un instante. */
function startOfDay(moment: Date): number {
  return new Date(moment.getFullYear(), moment.getMonth(), moment.getDate()).getTime();
}

/**
 * Diferencia en dias civiles, no en periodos de veinticuatro horas. Una cita
 * esta noche y otra manana temprano distan pocas horas pero no son "el mismo
 * dia", y es el dia lo que se lee en la agenda.
 */
function daysBetween(from: Date, to: Date): number {
  return Math.round((startOfDay(to) - startOfDay(from)) / DAY_IN_MS);
}

function parseMoment(value: string | null): Date | null {
  if (!value) {
    return null;
  }

  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function byDate(first: AgendaEntry, second: AgendaEntry): number {
  return first.at.localeCompare(second.at) || first.position.localeCompare(second.position);
}

/**
 * Construye la agenda ordenada de lo mas urgente a lo mas lejano. Lo vencido
 * encabeza la lista a proposito: es lo unico que ya deberia estar hecho.
 */
export function buildAgenda(
  applications: readonly JobApplication[],
  referenceDate: Date = new Date(),
  horizonDays: number = AGENDA_HORIZON_DAYS,
): AgendaEntry[] {
  const entries: AgendaEntry[] = [];

  for (const application of applications) {
    if (CLOSED_STATUSES.includes(application.status)) {
      continue;
    }

    const citas: readonly { kind: AgendaKind; at: string | null }[] = [
      { kind: 'interview', at: application.interviewAt },
      { kind: 'follow-up', at: application.followUpAt },
    ];

    for (const cita of citas) {
      const moment = parseMoment(cita.at);

      if (!moment) {
        continue;
      }

      const daysUntil = daysBetween(referenceDate, moment);

      if (daysUntil > horizonDays) {
        continue;
      }

      entries.push({
        applicationId: application.id,
        company: application.company,
        position: application.position,
        kind: cita.kind,
        at: moment.toISOString(),
        daysUntil,
        isOverdue: daysUntil < 0,
      });
    }
  }

  return entries.sort(byDate);
}
