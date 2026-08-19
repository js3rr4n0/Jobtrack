import { describe, expect, it } from 'vitest';

import { AGENDA_HORIZON_DAYS, buildAgenda } from './agenda';
import { buildJobApplication } from './test-factories';

const HOY = new Date(2026, 7, 19, 10, 0);

/** Fecha local a los días indicados de hoy, para no depender del huso. */
const enDias = (days: number, hour = 10) =>
  new Date(2026, 7, 19 + days, hour, 0).toISOString();

describe('buildAgenda', () => {
  it('devuelve una lista vacía cuando no hay fechas', () => {
    expect(buildAgenda([buildJobApplication()], HOY)).toEqual([]);
  });

  it('reúne entrevistas y seguimientos en una sola lista', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({ id: 'a', status: 'interview', interviewAt: enDias(2) }),
        buildJobApplication({ id: 'b', status: 'applied', followUpAt: enDias(5) }),
      ],
      HOY,
    );

    expect(agenda.map((entry) => entry.kind)).toEqual(['interview', 'follow-up']);
  });

  it('ordena de lo más urgente a lo más lejano', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({ id: 'a', status: 'applied', followUpAt: enDias(9) }),
        buildJobApplication({ id: 'b', status: 'interview', interviewAt: enDias(1) }),
        buildJobApplication({ id: 'c', status: 'applied', followUpAt: enDias(4) }),
      ],
      HOY,
    );

    expect(agenda.map((entry) => entry.applicationId)).toEqual(['b', 'c', 'a']);
  });

  it('pone lo vencido al principio y lo marca', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({ id: 'a', status: 'interview', interviewAt: enDias(3) }),
        buildJobApplication({ id: 'b', status: 'applied', followUpAt: enDias(-2) }),
      ],
      HOY,
    );

    expect(agenda[0].applicationId).toBe('b');
    expect(agenda[0].isOverdue).toBe(true);
    expect(agenda[0].daysUntil).toBe(-2);
    expect(agenda[1].isOverdue).toBe(false);
  });

  it('cuenta los días por el calendario, no por periodos de veinticuatro horas', () => {
    // Mañana a primera hora está a menos de veinticuatro horas, pero es mañana.
    const agenda = buildAgenda(
      [buildJobApplication({ status: 'interview', interviewAt: enDias(1, 8) })],
      new Date(2026, 7, 19, 23, 0),
    );

    expect(agenda[0].daysUntil).toBe(1);
  });

  it('una cita de hoy no cuenta como vencida', () => {
    const agenda = buildAgenda(
      [buildJobApplication({ status: 'interview', interviewAt: enDias(0, 8) })],
      HOY,
    );

    expect(agenda[0].daysUntil).toBe(0);
    expect(agenda[0].isOverdue).toBe(false);
  });

  it('ignora los procesos ya cerrados', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({ id: 'a', status: 'hired', interviewAt: enDias(1) }),
        buildJobApplication({ id: 'b', status: 'rejected', followUpAt: enDias(1) }),
      ],
      HOY,
    );

    expect(agenda).toEqual([]);
  });

  it('no mira más allá del horizonte', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({ id: 'a', status: 'applied', followUpAt: enDias(AGENDA_HORIZON_DAYS) }),
        buildJobApplication({
          id: 'b',
          status: 'applied',
          followUpAt: enDias(AGENDA_HORIZON_DAYS + 1),
        }),
      ],
      HOY,
    );

    expect(agenda.map((entry) => entry.applicationId)).toEqual(['a']);
  });

  it('ignora las fechas ilegibles en lugar de fallar', () => {
    const agenda = buildAgenda(
      [buildJobApplication({ status: 'applied', followUpAt: 'no-es-una-fecha' })],
      HOY,
    );

    expect(agenda).toEqual([]);
  });

  it('una vacante con las dos fechas aparece dos veces', () => {
    const agenda = buildAgenda(
      [
        buildJobApplication({
          id: 'a',
          status: 'interview',
          interviewAt: enDias(1),
          followUpAt: enDias(6),
        }),
      ],
      HOY,
    );

    expect(agenda).toHaveLength(2);
    expect(agenda.every((entry) => entry.applicationId === 'a')).toBe(true);
  });
});
