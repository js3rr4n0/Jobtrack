import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ALL_CATEGORIES, UNCATEGORIZED_CATEGORY } from '@jobtrack/contracts';

import { CategoryTabs } from './CategoryTabs';

const categories = [
  { name: 'Desarrollo', total: 3 },
  { name: 'Marketing', total: 1 },
];

describe('CategoryTabs', () => {
  it('no se muestra mientras nadie haya clasificado sus postulaciones', () => {
    const { container } = render(
      <CategoryTabs
        categories={[]}
        uncategorized={4}
        total={4}
        active={ALL_CATEGORIES}
        onSelect={vi.fn()}
      />,
    );

    expect(container).toBeEmptyDOMElement();
  });

  it('lista todas las areas con su recuento', () => {
    render(
      <CategoryTabs
        categories={categories}
        uncategorized={2}
        total={6}
        active={ALL_CATEGORIES}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Todas/ })).toHaveTextContent('6');
    expect(screen.getByRole('button', { name: /Desarrollo/ })).toHaveTextContent('3');
    expect(screen.getByRole('button', { name: /Sin area/ })).toHaveTextContent('2');
  });

  it('oculta la vista sin area cuando todo esta clasificado', () => {
    render(
      <CategoryTabs
        categories={categories}
        uncategorized={0}
        total={4}
        active={ALL_CATEGORIES}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /Sin area/ })).not.toBeInTheDocument();
  });

  it('avisa del area elegida usando su identificador', () => {
    const onSelect = vi.fn();
    render(
      <CategoryTabs
        categories={categories}
        uncategorized={2}
        total={6}
        active={ALL_CATEGORIES}
        onSelect={onSelect}
      />,
    );

    fireEvent.click(screen.getByRole('button', { name: /Marketing/ }));
    fireEvent.click(screen.getByRole('button', { name: /Sin area/ }));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'Marketing');
    expect(onSelect).toHaveBeenNthCalledWith(2, UNCATEGORIZED_CATEGORY);
  });

  it('marca el area activa para los lectores de pantalla', () => {
    render(
      <CategoryTabs
        categories={categories}
        uncategorized={0}
        total={4}
        active="Desarrollo"
        onSelect={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: /Desarrollo/ })).toHaveAttribute(
      'aria-current',
      'page',
    );
    expect(screen.getByRole('button', { name: /Todas/ })).not.toHaveAttribute('aria-current');
  });
});
