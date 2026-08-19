import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { buildJobApplication } from '@deska/contracts';

import { UpcomingAgenda } from './UpcomingAgenda';
import { renderWithPreferences } from '../../../tests/render-helpers';

const HOY = new Date(2026, 7, 19, 10, 0);

/** Fecha local a los días indicados de hoy, para no depender del huso. */
const enDias = (days: number) => new Date(2026, 7, 19 + days, 10, 0).toISOString();

describe('UpcomingAgenda', () => {
  beforeEach(() => {
    vi.useFakeTimers();
    vi.setSystemTime(HOY);
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('invita a poner una fecha cuando no hay ninguna', () => {
    renderWithPreferences(<UpcomingAgenda applications={[buildJobApplication()]} />);

    expect(screen.getByText(/No tienes entrevistas ni seguimientos/)).toBeInTheDocument();
  });

  it('dice cuándo es cada cita en el lenguaje de todos los días', () => {
    renderWithPreferences(
      <UpcomingAgenda
        applications={[
          buildJobApplication({ id: 'a', status: 'interview', interviewAt: enDias(1) }),
        ]}
      />,
    );

    expect(screen.getByText(/Entrevista mañana/)).toBeInTheDocument();
  });

  it('avisa de lo que ya venció', () => {
    renderWithPreferences(
      <UpcomingAgenda
        applications={[buildJobApplication({ id: 'a', status: 'applied', followUpAt: enDias(-3) })]}
      />,
    );

    expect(screen.getByText('1 vencida')).toBeInTheDocument();
    expect(screen.getByText(/Seguimiento hace 3 días/)).toBeInTheDocument();
  });

  it('cada cita enlaza con la ficha de su vacante', () => {
    renderWithPreferences(
      <UpcomingAgenda
        applications={[
          buildJobApplication({ id: 'abc', status: 'interview', interviewAt: enDias(2) }),
        ]}
      />,
    );

    expect(screen.getByRole('link')).toHaveAttribute('href', '/tablero/abc');
  });

  it('no muestra las fechas de un proceso ya cerrado', () => {
    renderWithPreferences(
      <UpcomingAgenda
        applications={[buildJobApplication({ status: 'hired', interviewAt: enDias(2) })]}
      />,
    );

    expect(screen.queryByRole('link')).not.toBeInTheDocument();
  });
});
