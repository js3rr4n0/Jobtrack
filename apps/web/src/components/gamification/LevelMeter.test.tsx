import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { calculateLevelProgress } from '@jobtrack/contracts';

import { LevelMeter } from '@/components/gamification/LevelMeter';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('LevelMeter', () => {
  it('muestra el nivel inicial sin experiencia acumulada', () => {
    renderWithPreferences(
      <LevelMeter progress={calculateLevelProgress(0)} currentStreakDays={0} />,
    );

    expect(screen.getByText('Nivel 1')).toBeInTheDocument();
    expect(screen.getByText('Aspirante')).toBeInTheDocument();
  });

  it('expone el progreso como barra accesible', () => {
    renderWithPreferences(
      <LevelMeter progress={calculateLevelProgress(100)} currentStreakDays={3} />,
    );

    const bar = screen.getByRole('progressbar');

    expect(bar).toHaveAttribute('aria-valuenow', '50');
    expect(bar).toHaveAttribute('aria-valuemax', '100');
  });

  it('usa el singular cuando la racha es de un solo dia', () => {
    renderWithPreferences(
      <LevelMeter progress={calculateLevelProgress(10)} currentStreakDays={1} />,
    );

    expect(screen.getByText('1 dia')).toBeInTheDocument();
  });

  it('usa el plural para rachas mayores', () => {
    renderWithPreferences(
      <LevelMeter progress={calculateLevelProgress(10)} currentStreakDays={5} />,
    );

    expect(screen.getByText('5 dias')).toBeInTheDocument();
  });
});
