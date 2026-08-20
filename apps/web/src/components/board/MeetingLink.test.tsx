import { screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { MeetingLink } from './MeetingLink';
import { renderWithPreferences } from '../../../tests/render-helpers';

const ENTREVISTA = '2026-08-20T15:00:00.000Z';
const ENLACE = 'https://meet.google.com/abc-defg-hij';

/** Coloca el reloj a los minutos indicados respecto de la entrevista. */
const relojEn = (minutos: number) =>
  vi.setSystemTime(new Date(new Date(ENTREVISTA).getTime() + minutos * 60_000));

describe('MeetingLink', () => {
  beforeEach(() => vi.useFakeTimers({ shouldAdvanceTime: true }));
  afterEach(() => vi.useRealTimers());

  it('nombra la plataforma cuando aún falta para la entrevista', () => {
    relojEn(-120);
    renderWithPreferences(
      <MeetingLink meetingUrl={ENLACE} platform="meet" interviewAt={ENTREVISTA} />,
    );

    expect(screen.getByRole('link', { name: /Google Meet/ })).toHaveAttribute('href', ENLACE);
  });

  it('pasa a invitar a unirse cuando llega el momento', () => {
    relojEn(-5);
    renderWithPreferences(
      <MeetingLink meetingUrl={ENLACE} platform="meet" interviewAt={ENTREVISTA} />,
    );

    expect(screen.getByRole('link', { name: /Unirse por Google Meet/ })).toBeInTheDocument();
  });

  it('abre el enlace en otra pestaña sin ceder la ventana de origen', () => {
    relojEn(0);
    renderWithPreferences(
      <MeetingLink meetingUrl={ENLACE} platform="zoom" interviewAt={ENTREVISTA} />,
    );

    const enlace = screen.getByRole('link');
    expect(enlace).toHaveAttribute('target', '_blank');
    expect(enlace).toHaveAttribute('rel', expect.stringContaining('noopener'));
  });

  it('dice la hora y de qué zona horaria es', () => {
    relojEn(-120);
    renderWithPreferences(
      <MeetingLink
        meetingUrl={ENLACE}
        platform="teams"
        interviewAt={ENTREVISTA}
        variant="completa"
      />,
    );

    expect(screen.getByText(/tu zona horaria/)).toBeInTheDocument();
    expect(screen.getByText('Microsoft Teams')).toBeInTheDocument();
  });

  it('explica cuándo se destacará el botón si aún no toca', () => {
    relojEn(-120);
    renderWithPreferences(
      <MeetingLink
        meetingUrl={ENLACE}
        platform="meet"
        interviewAt={ENTREVISTA}
        variant="completa"
      />,
    );

    expect(screen.getByRole('link', { name: /Abrir la sala/ })).toBeInTheDocument();
    expect(screen.getByText(/15 minutos antes/)).toBeInTheDocument();
  });

  it('deja entrar a la sala aunque la entrevista no tenga hora', () => {
    relojEn(0);
    renderWithPreferences(
      <MeetingLink meetingUrl={ENLACE} platform="otra" interviewAt={null} variant="completa" />,
    );

    expect(screen.getByRole('link', { name: /Abrir la sala/ })).toBeInTheDocument();
  });
});
