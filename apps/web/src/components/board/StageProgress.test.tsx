import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { StageProgress } from './StageProgress';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('StageProgress', () => {
  it('marca la primera etapa en una vacante solo guardada', () => {
    renderWithPreferences(<StageProgress status="wishlist" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '1');
  });

  it('avanza conforme avanza el proceso', () => {
    renderWithPreferences(<StageProgress status="interview" />);

    expect(screen.getByRole('progressbar')).toHaveAttribute('aria-valuenow', '3');
  });

  it('llega al final cuando el proceso termina en contratación', () => {
    renderWithPreferences(<StageProgress status="hired" />);

    const bar = screen.getByRole('progressbar');
    expect(bar).toHaveAttribute('aria-valuenow', '5');
    expect(bar).toHaveAttribute('aria-valuemax', '5');
  });

  it('no dibuja barra en un proceso descartado', () => {
    const { container } = renderWithPreferences(<StageProgress status="rejected" />);

    expect(container).toBeEmptyDOMElement();
  });

  it('nombra la etapa alcanzada para quien no ve la barra', () => {
    renderWithPreferences(<StageProgress status="offer" />);

    expect(screen.getByRole('progressbar')).toHaveAccessibleName(/Oferta/);
  });
});
