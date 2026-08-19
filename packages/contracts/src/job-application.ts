/**
 * Estados por los que atraviesa una postulación. El orden del arreglo define
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
  /** Posición de la columna en el tablero, empezando en cero. */
  readonly order: number;
  /** Peso usado por las reglas de experiencia: avanzar a etapas altas da más puntos. */
  readonly progressWeight: number;
  /** Indica si el estado cierra el ciclo de vida de la postulación. */
  readonly isTerminal: boolean;
}

export const STATUS_CATALOG: Readonly<Record<ApplicationStatus, StatusDefinition>> = {
  wishlist: {
    id: 'wishlist',
    label: 'Interesa',
    description: 'Vacantes guardadas que todavía no has postulado.',
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
    description: 'Recibiste una propuesta formal de contratación.',
    order: 3,
    progressWeight: 3,
    isTerminal: false,
  },
  hired: {
    id: 'hired',
    label: 'Contratado',
    description: 'Aceptaste la oferta y cerraste el proceso con éxito.',
    order: 4,
    progressWeight: 4,
    isTerminal: true,
  },
  rejected: {
    id: 'rejected',
    label: 'Descartado',
    description: 'El proceso terminó sin oferta. Cada intento suma experiencia.',
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
  hybrid: 'Híbrido',
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
  /**
   * Etapa mas avanzada por la que ha pasado esta postulacion. Solo avanza:
   * mover una tarjeta hacia atras corrige donde esta, no borra que llegara a
   * estar en una entrevista. La capa de juego cuenta desde aqui para que los
   * puntos ganados no se pierdan al reorganizar el tablero.
   */
  readonly furthestStatus: ApplicationStatus;
  readonly location: string | null;
  readonly workMode: WorkMode | null;
  readonly priority: Priority;
  readonly salaryExpectation: number | null;
  readonly sourceUrl: string | null;
  /** Notas del proceso: preguntas de la entrevista, impresiones, siguientes pasos. */
  readonly notes: string | null;
  /** Área a la que pertenece la vacante, definida libremente por el usuario. */
  readonly category: string | null;
  /** Persona de contacto dentro de la empresa, con su correo o teléfono. */
  readonly contact: string | null;
  /** Etiqueta libre del currículum enviado. Anterior a la subida de archivos. */
  readonly resumeVersion: string | null;
  /** Etiqueta libre de la carta enviada. Anterior a la subida de archivos. */
  readonly coverLetterVersion: string | null;
  /** Currículum subido que se envió a esta vacante. */
  readonly resumeId: string | null;
  /** Carta de presentación subida que se envió a esta vacante. */
  readonly coverLetterId: string | null;
  /** Fecha ISO 8601 de la entrevista agendada, si existe. */
  readonly interviewAt: string | null;
  /** Día en que toca volver a escribir si no hay respuesta. */
  readonly followUpAt: string | null;
  readonly appliedAt: string | null;
  /** Posición vertical dentro de su columna kanban. */
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
  category?: string | null;
  contact?: string | null;
  resumeVersion?: string | null;
  coverLetterVersion?: string | null;
  resumeId?: string | null;
  coverLetterId?: string | null;
  interviewAt?: string | null;
  followUpAt?: string | null;
  appliedAt?: string | null;
}

export type UpdateJobApplicationInput = Partial<CreateJobApplicationInput> & {
  boardOrder?: number;
};

export interface MoveJobApplicationInput {
  status: ApplicationStatus;
  boardOrder: number;
}

/**
 * Combina la marca de avance con una etapa nueva y devuelve la mas avanzada de
 * las dos. El descarte no cuenta como avance —su peso es cero—, de modo que
 * cerrar un proceso sin oferta no borra que llego a la entrevista.
 */
export function mergeFurthestStatus(
  furthest: ApplicationStatus,
  next: ApplicationStatus,
): ApplicationStatus {
  return STATUS_CATALOG[next].progressWeight > STATUS_CATALOG[furthest].progressWeight
    ? next
    : furthest;
}
