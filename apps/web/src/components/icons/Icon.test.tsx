import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Icon } from '@/components/icons/Icon';
import { ICON_NAMES, ICON_PACK_IDS } from '@/components/icons/icon-names';

describe('Icon', () => {
  it('cubre todo el catalogo en cada paquete sin dejar huecos', () => {
    for (const pack of ICON_PACK_IDS) {
      for (const name of ICON_NAMES) {
        const { container, unmount } = render(<Icon name={name} pack={pack} />);

        expect(container.querySelector('svg')?.children.length ?? 0).toBeGreaterThan(0);
        unmount();
      }
    }
  });

  it('se marca como decorativo cuando no recibe texto alternativo', () => {
    const { container } = render(<Icon name="trophy" />);

    expect(container.querySelector('svg')).toHaveAttribute('aria-hidden', 'true');
  });

  it('se expone a los lectores de pantalla cuando recibe título', () => {
    render(<Icon name="trophy" title="Logro obtenido" />);

    expect(screen.getByRole('img', { name: 'Logro obtenido' })).toBeInTheDocument();
  });

  it('usa trazo en el paquete de contorno y relleno en el de pixel', () => {
    const outline = render(<Icon name="flame" pack="outline" />);
    expect(outline.container.querySelector('svg')).toHaveAttribute('stroke', 'currentColor');
    outline.unmount();

    const pixel = render(<Icon name="flame" pack="pixel" />);
    expect(pixel.container.querySelector('svg')).toHaveAttribute('fill', 'currentColor');
  });

  it('respeta el tamaño solicitado', () => {
    const { container } = render(<Icon name="plus" size={32} />);

    expect(container.querySelector('svg')).toHaveAttribute('width', '32');
  });
});
