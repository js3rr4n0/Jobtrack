import { fireEvent, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { ToggleSwitch } from './ToggleSwitch';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('ToggleSwitch', () => {
  it('se expone como interruptor con su estado', () => {
    renderWithPreferences(
      <ToggleSwitch checked label="Música de fondo" onChange={vi.fn()} />,
    );

    expect(screen.getByRole('switch', { name: 'Música de fondo' })).toBeChecked();
  });

  it('anuncia el estado apagado', () => {
    renderWithPreferences(
      <ToggleSwitch checked={false} label="Música de fondo" onChange={vi.fn()} />,
    );

    expect(screen.getByRole('switch', { name: 'Música de fondo' })).not.toBeChecked();
  });

  it('entrega el valor contrario al pulsarlo', () => {
    const onChange = vi.fn();
    renderWithPreferences(
      <ToggleSwitch checked={false} label="Música de fondo" onChange={onChange} />,
    );

    fireEvent.click(screen.getByRole('switch'));

    expect(onChange).toHaveBeenCalledWith(true);
  });

  it('la descripción queda asociada al interruptor', () => {
    renderWithPreferences(
      <ToggleSwitch
        checked
        label="Música de fondo"
        description="Suena a volumen bajo."
        onChange={vi.fn()}
      />,
    );

    expect(screen.getByRole('switch')).toHaveAccessibleDescription('Suena a volumen bajo.');
  });
});
