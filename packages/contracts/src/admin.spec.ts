import { describe, expect, it } from 'vitest';

import { MIN_SAMPLE_FOR_RATE, buildAdminOverview } from './admin';
import { buildJobApplication } from './test-factories';

const HOY = new Date('2026-06-01T12:00:00.000Z');
const hace = (dias: number) => new Date(HOY.getTime() - dias * 86_400_000).toISOString();

describe('buildAdminOverview', () => {
  it('devuelve un informe vacío sin postulaciones', () => {
    const overview = buildAdminOverview([], HOY);

    expect(overview.totalUsers).toBe(0);
    expect(overview.totalApplications).toBe(0);
    expect(overview.mostApplied).toEqual([]);
  });

  it('cuenta las personas distintas, no las postulaciones', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', userId: 'ana' }),
        buildJobApplication({ id: '2', userId: 'ana' }),
        buildJobApplication({ id: '3', userId: 'luis' }),
      ],
      HOY,
    );

    expect(overview.totalUsers).toBe(2);
    expect(overview.totalApplications).toBe(3);
    expect(overview.averagePerUser).toBe(1.5);
  });

  it('ordena las empresas por número de postulaciones', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', company: 'Acme' }),
        buildJobApplication({ id: '2', company: 'Acme' }),
        buildJobApplication({ id: '3', company: 'Globex' }),
      ],
      HOY,
    );

    expect(overview.mostApplied[0]).toMatchObject({ company: 'Acme', total: 2 });
    expect(overview.mostApplied[1]).toMatchObject({ company: 'Globex', total: 1 });
  });

  it('trata como una sola empresa los nombres con espacios sobrantes', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', company: 'Acme' }),
        buildJobApplication({ id: '2', company: '  Acme  ' }),
        buildJobApplication({ id: '3', company: 'Acme   Corp' }),
      ],
      HOY,
    );

    expect(overview.mostApplied[0]).toMatchObject({ company: 'Acme', total: 2 });
    expect(overview.mostApplied[1]).toMatchObject({ company: 'Acme Corp', total: 1 });
  });

  it('no calcula porcentajes con muestras demasiado pequeñas', () => {
    const overview = buildAdminOverview(
      [buildJobApplication({ id: '1', company: 'Diminuta', status: 'hired' })],
      HOY,
    );

    expect(overview.bestHiring).toEqual([]);
  });

  it('ordena por tasa de contratación a partir del mínimo de muestras', () => {
    const contratadas = Array.from({ length: MIN_SAMPLE_FOR_RATE }, (_, index) =>
      buildJobApplication({ id: `buena-${index}`, company: 'Contrata', status: 'hired' }),
    );
    const descartadas = Array.from({ length: MIN_SAMPLE_FOR_RATE }, (_, index) =>
      buildJobApplication({ id: `mala-${index}`, company: 'Descarta', status: 'rejected' }),
    );

    const overview = buildAdminOverview([...contratadas, ...descartadas], HOY);

    expect(overview.bestHiring[0]).toMatchObject({ company: 'Contrata', hiredRate: 100 });
    expect(overview.worstHiring[0]).toMatchObject({ company: 'Descarta', rejectedRate: 100 });
  });

  it('cuenta como abandonadas las vivas sin movimiento en más de un mes', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', status: 'applied', updatedAt: hace(45) }),
        buildJobApplication({ id: '2', status: 'applied', updatedAt: hace(5) }),
        buildJobApplication({ id: '3', status: 'rejected', updatedAt: hace(90) }),
        buildJobApplication({ id: '4', status: 'hired', updatedAt: hace(90) }),
      ],
      HOY,
    );

    expect(overview.stalledApplications).toBe(1);
  });

  it('considera activa a quien movió algo en el último mes', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', userId: 'ana', updatedAt: hace(3) }),
        buildJobApplication({ id: '2', userId: 'luis', updatedAt: hace(120) }),
      ],
      HOY,
    );

    expect(overview.activeUsers).toBe(1);
    expect(overview.totalUsers).toBe(2);
  });

  it('resume las áreas más usadas y descarta las vacías', () => {
    const overview = buildAdminOverview(
      [
        buildJobApplication({ id: '1', category: 'Desarrollo' }),
        buildJobApplication({ id: '2', category: 'Desarrollo' }),
        buildJobApplication({ id: '3', category: '   ' }),
        buildJobApplication({ id: '4', category: null }),
      ],
      HOY,
    );

    expect(overview.topAreas).toEqual([{ name: 'Desarrollo', total: 2 }]);
  });

  it('tolera fechas corruptas sin romper el informe', () => {
    const overview = buildAdminOverview(
      [buildJobApplication({ id: '1', status: 'applied', updatedAt: 'no-es-una-fecha' })],
      HOY,
    );

    expect(overview.stalledApplications).toBe(0);
    expect(overview.totalApplications).toBe(1);
  });

  it('produce el mismo informe ante los mismos datos', () => {
    const datos = [
      buildJobApplication({ id: '1', company: 'Acme' }),
      buildJobApplication({ id: '2', company: 'Globex' }),
    ];

    expect(buildAdminOverview(datos, HOY)).toEqual(buildAdminOverview(datos, HOY));
  });

  it('respeta el límite de filas pedido', () => {
    const muchas = Array.from({ length: 12 }, (_, index) =>
      buildJobApplication({ id: `a-${index}`, company: `Empresa ${index}` }),
    );

    expect(buildAdminOverview(muchas, HOY, 3).mostApplied).toHaveLength(3);
  });
});
