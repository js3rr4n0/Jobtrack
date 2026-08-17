/**
 * Estados por los que atraviesa una postulacion. El orden del arreglo define
 * el orden de las columnas del tablero kanban.
 */
export const APPLICATION_STATUSES = [
  'wishlist',
  'applied',
  'interview',
  'offer',
  'hired',
  'rejected',
] as const;

export type ApplicationStatus = (typeof APPLICATION_STATUSES)[number];

export interface StatusDefinition {
  readonly id: ApplicationStatus;
  readonly label: string;
  readonly description: string;
  /** Posicion de la columna en el tablero, empezando en cero. */
  readonly order: number;
  /** Peso usado por las reglas de experiencia: avanzar a etapas altas da mas puntos. */
  readonly progressWeight: number;
  /** Indica si el estado cierra el ciclo de vida de la postulacion. */
  readonly isTerminal: boolean;
}

export const STATUS_CATALOG: Readonly<Record<ApplicationStatus, StatusDefinition>> = {
  wishlist: {
    id: 'wishlist',
    label: 'Interesa',
    description: 'Vacantes guardadas que todavia no has postulado.',
    order: 0,
    progressWeight: 0,
    isTerminal: false,
  },
  applied: {
    id: 'applied',
    label: 'Postulado',
    description: 'Ya enviaste tu candidatura y esperas respuesta.',
    order: 1,
    progressWeight: 1,
    isTerminal: false,
  },
  interview: {
    id: 'interview',
    label: 'Entrevista',
    description: 'Tienes al menos un proceso de entrevista en curso.',
    order: 2,
    progressWeight: 2,
    isTerminal: false,
  },
  offer: {
    id: 'offer',
    label: 'Oferta',
    description: 'Recibiste una propuesta formal de contratacion.',
    order: 3,
    progressWeight: 3,
    isTerminal: false,
  },
  hired: {
    id: 'hired',
    label: 'Contratado',
    description: 'Aceptaste la oferta y cerraste el proceso con exito.',
    order: 4,
    progressWeight: 4,
    isTerminal: true,
  },
  rejected: {
    id: 'rejected',
    label: 'Descartado',
    description: 'El proceso termino sin oferta. Cada intento suma experiencia.',
    order: 5,
    progressWeight: 0,
    isTerminal: true,
  },
};

export const ORDERED_STATUSES: readonly StatusDefinition[] = APPLICATION_STATUSES.map(
  (status) => STATUS_CATALOG[status],
).sort((first, second) => first.order - second.order);

export function isApplicationStatus(value: unknown): value is ApplicationStatus {
  return typeof value === 'string' && (APPLICATION_STATUSES as readonly string[]).includes(value);
}

export const WORK_MODES = ['onsite', 'hybrid', 'remote'] as const;
export type WorkMode = (typeof WORK_MODES)[number];

export const WORK_MODE_LABELS: Readonly<Record<WorkMode, string>> = {
  onsite: 'Presencial',
  hybrid: 'Hibrido',
  remote: 'Remoto',
};

export const PRIORITIES = ['low', 'medium', 'high'] as const;
export type Priority = (typeof PRIORITIES)[number];

export const PRIORITY_LABELS: Readonly<Record<Priority, string>> = {
  low: 'Baja',
  medium: 'Media',
  high: 'Alta',
};

export interface JobApplication {
  readonly id: string;
  readonly userId: string;
  readonly company: string;
  readonly position: string;
  readonly status: ApplicationStatus;
  readonly location: string | null;
  readonly workMode: WorkMode | null;
  readonly priority: Priority;
  readonly salaryExpectation: number | null;
  readonly sourceUrl: string | null;
  readonly notes: string | null;
  /** Fecha ISO 8601 de la entrevista agendada, si existe. */
  readonly interviewAt: string | null;
  readonly appliedAt: string | null;
  /** Posicion vertical dentro de su columna kanban. */
  readonly boardOrder: number;
  readonly createdAt: string;
  readonly updatedAt: string;
}

export interface CreateJobApplicationInput {
  company: string;
  position: string;
  status?: ApplicationStatus;
  location?: string | null;
  workMode?: WorkMode | null;
  priority?: Priority;
  salaryExpectation?: number | null;
  sourceUrl?: string | null;
  notes?: string | null;
  interviewAt?: string | null;
  appliedAt?: string | null;
}

export type UpdateJobApplicationInput = Partial<CreateJobApplicationInput> & {
  boardOrder?: number;
};

export interface MoveJobApplicationInput {
  status: ApplicationStatus;
  boardOrder: number;
}
