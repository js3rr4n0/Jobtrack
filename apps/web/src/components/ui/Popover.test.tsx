import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { Popover } from './Popover';

describe('Popover', () => {
  it('no dibuja nada mientras esta cerrado', () => {
    render(
      <Popover isOpen={false} label="Tu cuenta" onClose={vi.fn()}>
        <p>Ajustes</p>
      </Popover>,
    );

    expect(screen.queryByText('Ajustes')).not.toBeInTheDocument();
  });

  it('muestra su contenido con un nombre accesible', () => {
    render(
      <Popover isOpen label="Tu cuenta" onClose={vi.fn()}>
        <p>Ajustes</p>
      </Popover>,
    );

    expect(screen.getByRole('dialog', { name: 'Tu cuenta' })).toBeInTheDocument();
  });

  it('se cierra al pulsar fuera de si mismo', () => {
    const onClose = vi.fn();
    render(
      <div>
        <button type="button">Fuera</button>
        <Popover isOpen label="Tu cuenta" onClose={onClose}>
          <p>Ajustes</p>
        </Popover>
      </div>,
    );

    fireEvent.mouseDown(screen.getByRole('button', { name: 'Fuera' }));

    expect(onClose).toHaveBeenCalled();
  });

  it('no se cierra al pulsar dentro', () => {
    const onClose = vi.fn();
    render(
      <Popover isOpen label="Tu cuenta" onClose={onClose}>
        <p>Ajustes</p>
      </Popover>,
    );

    fireEvent.mouseDown(screen.getByText('Ajustes'));

    expect(onClose).not.toHaveBeenCalled();
  });

  it('se cierra con la tecla Escape', () => {
    const onClose = vi.fn();
    render(
      <Popover isOpen label="Tu cuenta" onClose={onClose}>
        <p>Ajustes</p>
      </Popover>,
    );

    fireEvent.keyDown(document, { key: 'Escape' });

    expect(onClose).toHaveBeenCalled();
  });
});
