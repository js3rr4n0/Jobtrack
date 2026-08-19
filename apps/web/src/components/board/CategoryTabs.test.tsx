import { fireEvent, render, screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';
import { ALL_CATEGORIES, UNCATEGORIZED_CATEGORY } from '@deska/contracts';

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

  it('lista todas las áreas con su recuento', () => {
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
    expect(screen.getByRole('button', { name: /Sin área/ })).toHaveTextContent('2');
  });

  it('oculta la vista sin área cuando todo está clasificado', () => {
    render(
      <CategoryTabs
        categories={categories}
        uncategorized={0}
        total={4}
        active={ALL_CATEGORIES}
        onSelect={vi.fn()}
      />,
    );

    expect(screen.queryByRole('button', { name: /Sin área/ })).not.toBeInTheDocument();
  });

  it('avisa del área elegida usando su identificador', () => {
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
    fireEvent.click(screen.getByRole('button', { name: /Sin área/ }));

    expect(onSelect).toHaveBeenNthCalledWith(1, 'Marketing');
    expect(onSelect).toHaveBeenNthCalledWith(2, UNCATEGORIZED_CATEGORY);
  });

  it('marca el área activa para los lectores de pantalla', () => {
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
