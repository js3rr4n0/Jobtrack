import { screen } from '@testing-library/react';
import { describe, expect, it, vi } from 'vitest';

import { AuthForm } from './AuthForm';
import { renderWithPreferences } from '../../../tests/render-helpers';

vi.mock('next/navigation', () => ({ useRouter: () => ({ replace: vi.fn(), push: vi.fn() }) }));

describe('AuthForm en modo registro', () => {
  it('recuerda lo que se gana al registrarse', () => {
    renderWithPreferences(<AuthForm mode="signUp" />);

    expect(screen.getByText('No se te pasa ninguna entrevista')).toBeInTheDocument();
    expect(screen.getByText('Ves dónde se te frena la búsqueda')).toBeInTheDocument();
  });

  it('responde por adelantado a las objeciones de dar un correo', () => {
    renderWithPreferences(<AuthForm mode="signUp" />);

    expect(screen.getByText('Gratis')).toBeInTheDocument();
    expect(screen.getByText('Sin tarjeta')).toBeInTheDocument();
    expect(screen.getByText('Menos de un minuto')).toBeInTheDocument();
  });

  /**
   * El consentimiento tiene que verse antes de otorgarlo. Esta prueba existe
   * para que nadie lo mueva a un pie ni lo esconda tras un desplegable.
   */
  it('muestra el consentimiento junto al boton que lo otorga', () => {
    renderWithPreferences(<AuthForm mode="signUp" />);

    expect(screen.getByText(/Al crear la cuenta aceptas/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'términos de servicio' })).toHaveAttribute(
      'href',
      '/terminos',
    );
    expect(screen.getByRole('link', { name: 'política de privacidad' })).toHaveAttribute(
      'href',
      '/privacidad',
    );
  });

  it('no repite los argumentos de venta al iniciar sesión', () => {
    // Quien vuelve ya esta convencido: ahi solo estorban.
    renderWithPreferences(<AuthForm mode="signIn" />);

    expect(screen.queryByText('No se te pasa ninguna entrevista')).not.toBeInTheDocument();
    expect(screen.queryByText(/Al crear la cuenta aceptas/)).not.toBeInTheDocument();
  });
});
