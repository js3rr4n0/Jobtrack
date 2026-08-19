import type {
  ApplicationStatus,
  CreateJobApplicationInput,
  JobApplication,
  Priority,
  WorkMode,
} from '@deska/contracts';

export interface ApplicationFormValues {
  company: string;
  position: string;
  status: ApplicationStatus;
  location: string;
  workMode: WorkMode | '';
  priority: Priority;
  salaryExpectation: string;
  sourceUrl: string;
  notes: string;
  category: string;
  contact: string;
  resumeId: string;
  coverLetterId: string;
  interviewAt: string;
  followUpAt: string;
  appliedAt: string;
}

export const EMPTY_FORM_VALUES: ApplicationFormValues = {
  company: '',
  position: '',
  status: 'wishlist',
  location: '',
  workMode: '',
  priority: 'medium',
  salaryExpectation: '',
  sourceUrl: '',
  notes: '',
  category: '',
  contact: '',
  resumeId: '',
  coverLetterId: '',
  interviewAt: '',
  followUpAt: '',
  appliedAt: '',
};

export type FormErrors = Partial<Record<keyof ApplicationFormValues, string>>;

const MAX_TEXT_LENGTH = 120;
const MAX_NOTES_LENGTH = 4000;
const MAX_SALARY = 100_000_000;
const MAX_CATEGORY_LENGTH = 60;
const MAX_CONTACT_LENGTH = 160;

function isBlank(value: string): boolean {
  return value.trim().length === 0;
}

function isValidUrl(value: string): boolean {
  try {
    const parsed = new URL(value);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Valida el formulario antes de tocar la red. Devuelve un mensaje por campo en
 * lenguaje claro; un objeto vacío significa que los datos son correctos.
 */
export function validateApplicationForm(values: ApplicationFormValues): FormErrors {
  const errors: FormErrors = {};

  if (isBlank(values.company)) {
    errors.company = 'Escribe el nombre de la empresa.';
  } else if (values.company.trim().length > MAX_TEXT_LENGTH) {
    errors.company = `La empresa admite hasta ${MAX_TEXT_LENGTH} caracteres.`;
  }

  if (isBlank(values.position)) {
    errors.position = 'Escribe el puesto al que postulas.';
  } else if (values.position.trim().length > MAX_TEXT_LENGTH) {
    errors.position = `El puesto admite hasta ${MAX_TEXT_LENGTH} caracteres.`;
  }

  if (!isBlank(values.location) && values.location.trim().length > MAX_TEXT_LENGTH) {
    errors.location = `La ubicación admite hasta ${MAX_TEXT_LENGTH} caracteres.`;
  }

  if (!isBlank(values.salaryExpectation)) {
    const parsed = Number(values.salaryExpectation);

    if (!Number.isFinite(parsed) || !Number.isInteger(parsed)) {
      errors.salaryExpectation = 'Usa solo números enteros, sin puntos ni comas.';
    } else if (parsed < 0) {
      errors.salaryExpectation = 'La expectativa salarial no puede ser negativa.';
    } else if (parsed > MAX_SALARY) {
      errors.salaryExpectation = 'La expectativa salarial es demasiado alta.';
    }
  }

  if (!isBlank(values.sourceUrl) && !isValidUrl(values.sourceUrl.trim())) {
    errors.sourceUrl = 'Incluye una dirección completa, por ejemplo https://empresa.com/vacante.';
  }

  if (!isBlank(values.category) && values.category.trim().length > MAX_CATEGORY_LENGTH) {
    errors.category = `El área admite hasta ${MAX_CATEGORY_LENGTH} caracteres.`;
  }

  if (!isBlank(values.contact) && values.contact.trim().length > MAX_CONTACT_LENGTH) {
    errors.contact = `El contacto admite hasta ${MAX_CONTACT_LENGTH} caracteres.`;
  }

  if (values.notes.length > MAX_NOTES_LENGTH) {
    errors.notes = `Las notas admiten hasta ${MAX_NOTES_LENGTH} caracteres.`;
  }

  if (!isBlank(values.interviewAt) && Number.isNaN(Date.parse(values.interviewAt))) {
    errors.interviewAt = 'Revisa la fecha y hora de la entrevista.';
  }

  if (!isBlank(values.followUpAt) && Number.isNaN(Date.parse(values.followUpAt))) {
    errors.followUpAt = 'Revisa la fecha de seguimiento.';
  }

  if (!isBlank(values.appliedAt) && Number.isNaN(Date.parse(values.appliedAt))) {
    errors.appliedAt = 'Revisa la fecha de postulación.';
  }

  return errors;
}

const textOrNull = (value: string): string | null => (isBlank(value) ? null : value.trim());

/** Convierte el valor local de un campo de fecha a ISO 8601 en UTC. */
export function toIsoDate(localValue: string): string | null {
  if (isBlank(localValue)) {
    return null;
  }

  const parsed = new Date(localValue);
  return Number.isNaN(parsed.getTime()) ? null : parsed.toISOString();
}

/** Convierte una fecha ISO al formato que aceptan los campos `datetime-local` y `date`. */
export function toLocalDateTimeValue(isoDate: string | null): string {
  if (!isoDate) {
    return '';
  }

  const parsed = new Date(isoDate);

  if (Number.isNaN(parsed.getTime())) {
    return '';
  }

  const pad = (value: number) => String(value).padStart(2, '0');

  return `${parsed.getFullYear()}-${pad(parsed.getMonth() + 1)}-${pad(parsed.getDate())}T${pad(
    parsed.getHours(),
  )}:${pad(parsed.getMinutes())}`;
}

export function toLocalDateValue(isoDate: string | null): string {
  return toLocalDateTimeValue(isoDate).slice(0, 10);
}

/** Traduce el formulario al contrato que espera la API. */
export function toApplicationInput(values: ApplicationFormValues): CreateJobApplicationInput {
  return {
    company: values.company.trim(),
    position: values.position.trim(),
    status: values.status,
    location: textOrNull(values.location),
    workMode: values.workMode === '' ? null : values.workMode,
    priority: values.priority,
    salaryExpectation: isBlank(values.salaryExpectation)
      ? null
      : Number(values.salaryExpectation),
    sourceUrl: textOrNull(values.sourceUrl),
    notes: textOrNull(values.notes),
    category: textOrNull(values.category),
    contact: textOrNull(values.contact),
    resumeId: textOrNull(values.resumeId),
    coverLetterId: textOrNull(values.coverLetterId),
    interviewAt: toIsoDate(values.interviewAt),
    followUpAt: toIsoDate(values.followUpAt),
    appliedAt: toIsoDate(values.appliedAt),
  };
}

/** Rellena el formulario a partir de una postulación existente. */
export function fromApplication(application: JobApplication): ApplicationFormValues {
  return {
    company: application.company,
    position: application.position,
    status: application.status,
    location: application.location ?? '',
    workMode: application.workMode ?? '',
    priority: application.priority,
    salaryExpectation:
      application.salaryExpectation === null ? '' : String(application.salaryExpectation),
    sourceUrl: application.sourceUrl ?? '',
    notes: application.notes ?? '',
    category: application.category ?? '',
    contact: application.contact ?? '',
    resumeId: application.resumeId ?? '',
    coverLetterId: application.coverLetterId ?? '',
    interviewAt: toLocalDateTimeValue(application.interviewAt),
    followUpAt: toLocalDateValue(application.followUpAt),
    appliedAt: toLocalDateValue(application.appliedAt),
  };
}
