import { JobApplication } from './job-application';

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
