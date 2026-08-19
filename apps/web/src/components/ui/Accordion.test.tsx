import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Accordion } from './Accordion';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('Accordion', () => {
  it('empieza plegado y no expone su contenido', () => {
    renderWithPreferences(
      <Accordion title="Logros">
        <p>Primer paso</p>
      </Accordion>,
    );

    expect(screen.getByRole('button', { name: /Logros/ })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.queryByText('Primer paso')).not.toBeInTheDocument();
  });

  it('despliega y vuelve a plegar el contenido', () => {
    renderWithPreferences(
      <Accordion title="Logros">
        <p>Primer paso</p>
      </Accordion>,
    );

    const header = screen.getByRole('button', { name: /Logros/ });

    fireEvent.click(header);
    expect(screen.getByText('Primer paso')).toBeInTheDocument();
    expect(header).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(header);
    expect(screen.queryByText('Primer paso')).not.toBeInTheDocument();
  });

  it('puede nacer desplegado', () => {
    renderWithPreferences(
      <Accordion title="Logros" defaultOpen>
        <p>Primer paso</p>
      </Accordion>,
    );

    expect(screen.getByText('Primer paso')).toBeInTheDocument();
  });

  it('mantiene visible el resumen aunque este plegado', () => {
    renderWithPreferences(
      <Accordion title="Logros" badge="4 de 8">
        <p>Primer paso</p>
      </Accordion>,
    );

    expect(screen.getByText('4 de 8')).toBeInTheDocument();
  });
});
