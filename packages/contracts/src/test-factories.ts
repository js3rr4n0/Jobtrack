import { JobApplication } from './job-application';
import { StickyNote } from './sticky-note';

/**
 * Constructor de postulaciones para pruebas. Mantener la fabrica junto al
 * contrato evita duplicar datos de ejemplo en cada paquete.
 */
export function buildJobApplication(overrides: Partial<JobApplication> = {}): JobApplication {
  const timestamp = '2026-01-10T12:00:00.000Z';

  return {
    id: '00000000-0000-4000-8000-000000000001',
    userId: '00000000-0000-4000-8000-0000000000ff',
    company: 'Empresa Ejemplo',
    position: 'Desarrollador Frontend',
    status: 'wishlist',
    location: 'Ciudad de Guatemala',
    workMode: 'remote',
    priority: 'medium',
    salaryExpectation: null,
    sourceUrl: null,
    notes: null,
    category: null,
    interviewAt: null,
    appliedAt: null,
    boardOrder: 0,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}

/** Constructor de notas adhesivas para pruebas. */
export function buildStickyNote(overrides: Partial<StickyNote> = {}): StickyNote {
  const timestamp = '2026-01-10T12:00:00.000Z';

  return {
    id: '00000000-0000-4000-8000-00000000000a',
    userId: '00000000-0000-4000-8000-0000000000ff',
    text: 'Preparar portafolio',
    color: 'amarillo',
    x: 10,
    y: 10,
    createdAt: timestamp,
    updatedAt: timestamp,
    ...overrides,
  };
}
