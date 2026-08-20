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

  it('abre el contacto externo sin ceder la ventana de origen', () => {
    renderWithPreferences(<SiteFooter />);
    const contacto = screen.getByRole('link', { name: 'Contacto y soporte' });

    expect(contacto).toHaveAttribute('target', '_blank');
    expect(contacto).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('agrupa los enlaces en una navegación con nombre', () => {
    renderWithPreferences(<SiteFooter />);

    expect(screen.getByRole('navigation', { name: 'Enlaces legales' })).toBeInTheDocument();
  });
});
