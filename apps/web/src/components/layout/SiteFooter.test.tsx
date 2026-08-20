import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';

import { SiteFooter } from './SiteFooter';
import { renderWithPreferences } from '../../../tests/render-helpers';

describe('SiteFooter', () => {
  it('ofrece los tres enlaces legales exigibles', () => {
    renderWithPreferences(<SiteFooter />);

    expect(screen.getByRole('link', { name: 'Términos de servicio' })).toHaveAttribute(
      'href',
      '/terminos',
    );
    expect(screen.getByRole('link', { name: 'Política de privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
    expect(screen.getByRole('link', { name: 'Contacto y soporte' })).toBeInTheDocument();
  });

  /**
   * El contacto es una pantalla del propio sitio, no un enlace a un perfil
   * externo: quien opera el proyecto no publica correo ni perfil personal.
   */
  it('lleva el contacto a una pantalla propia, no a un sitio externo', () => {
    renderWithPreferences(<SiteFooter />);
    const contacto = screen.getByRole('link', { name: 'Contacto y soporte' });

    expect(contacto).toHaveAttribute('href', '/contacto');
    expect(contacto).not.toHaveAttribute('target');
  });

  it('no expone ningún perfil ni dirección personal', () => {
    const { container } = renderWithPreferences(<SiteFooter />);

    expect(container.innerHTML).not.toMatch(/github|mailto:|@gmail/i);
  });

  it('agrupa los enlaces en una navegación con nombre', () => {
    renderWithPreferences(<SiteFooter />);

    expect(screen.getByRole('navigation', { name: 'Enlaces legales' })).toBeInTheDocument();
  });
});
