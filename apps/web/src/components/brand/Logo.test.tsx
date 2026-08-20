import { render, screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { Logo, TAMANO_MINIMO } from './Logo';

/** Azul de marca, el unico color que no cambia con el tema. */
const AZUL = '#2563EB';

const svgDe = (contenedor: HTMLElement) => contenedor.querySelector('svg') as SVGElement;

describe('Logo', () => {
  it('se anuncia con el nombre de la marca una sola vez', () => {
    render(<Logo />);

    expect(screen.getByRole('img', { name: 'Deska' })).toBeInTheDocument();
  });

  it('escribe la palabra con el peso y el interletraje del logotipo', () => {
    const { container } = render(<Logo size={40} />);
    const palabra = screen.getByText('Deska');

    expect(palabra).toHaveStyle({ fontWeight: '800', letterSpacing: '-0.035em' });
    // El cuerpo se deriva de la altura del simbolo, no se fija a mano.
    expect(palabra).toHaveStyle({ fontSize: `${40 * 0.72}px` });
    expect(svgDe(container)).toHaveAttribute('height', '40');
  });

  it('separa simbolo y palabra segun la proporcion del manual', () => {
    const { container: horizontal } = render(<Logo size={50} />);
    const { container: vertical } = render(<Logo variante="vertical" size={50} />);

    expect(horizontal.firstElementChild).toHaveStyle({ gap: `${50 * 0.42}px` });
    expect(vertical.firstElementChild).toHaveStyle({ gap: `${50 * 0.3}px` });
  });

  it('conserva el azul de marca sobre fondo claro y sobre fondo oscuro', () => {
    for (const fondo of ['claro', 'oscuro'] as const) {
      const { container } = render(<Logo fondo={fondo} />);

      expect(svgDe(container).querySelector('rect')).toHaveAttribute('fill', AZUL);
    }
  });

  it('invierte el simbolo sobre el propio azul para que no desaparezca', () => {
    const { container } = render(<Logo fondo="sobre-acento" />);
    const rects = svgDe(container).querySelectorAll('rect');

    expect(rects[0]).toHaveAttribute('fill', '#FFFFFF');
    expect(rects[1]).toHaveAttribute('fill', AZUL);
  });

  it('la palabra pasa a blanco sobre fondo oscuro', () => {
    render(<Logo fondo="oscuro" />);

    expect(screen.getByText('Deska')).toHaveStyle({ color: '#FFFFFF' });
  });

  it('dibuja las tres barras crecientes apoyadas en la misma linea', () => {
    const { container } = render(<Logo variante="simbolo" />);
    const barras = Array.from(svgDe(container).querySelectorAll('rect')).slice(1);

    expect(barras).toHaveLength(3);
    expect(barras.map((b) => Number(b.getAttribute('height')))).toEqual([20, 28, 36]);
    // Todas terminan en y = 50: crecen hacia arriba, no hacia los lados.
    expect(barras.map((b) => Number(b.getAttribute('y')) + Number(b.getAttribute('height')))).toEqual([
      50, 50, 50,
    ]);
  });

  it('escala sin deformarse: el simbolo siempre es cuadrado', () => {
    for (const size of [16, 30, 96]) {
      const { container } = render(<Logo variante="simbolo" size={size} />);
      const svg = svgDe(container);

      expect(svg).toHaveAttribute('width', String(size));
      expect(svg).toHaveAttribute('height', String(size));
      expect(svg).toHaveAttribute('viewBox', '0 0 64 64');
    }
  });

  it('la version de una tinta cala las barras en lugar de pintarlas', () => {
    const { container } = render(<Logo variante="simbolo" fondo="una-tinta" />);
    const trazado = svgDe(container).querySelector('path');

    expect(trazado).toHaveAttribute('fill-rule', 'evenodd');
    expect(trazado).toHaveAttribute('fill', 'currentColor');
  });

  it('recuerda los tamaños minimos del manual', () => {
    expect(TAMANO_MINIMO.simbolo).toBe(16);
    expect(TAMANO_MINIMO.horizontal).toBe(24);
  });
});
