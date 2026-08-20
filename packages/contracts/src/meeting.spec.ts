import { describe, expect, it } from 'vitest';

import {
  JOIN_CLOSES_MINUTES_AFTER,
  JOIN_OPENS_MINUTES_BEFORE,
  detectMeetingPlatform,
  isJoinWindowOpen,
  normalizeMeetingUrl,
} from './meeting';

const HORA = new Date('2026-08-20T15:00:00.000Z');
const minutosDesdeLaHora = (minutos: number) =>
  new Date(HORA.getTime() + minutos * 60_000);

describe('normalizeMeetingUrl', () => {
  it('acepta http y https', () => {
    expect(normalizeMeetingUrl('https://zoom.us/j/123')).toBe('https://zoom.us/j/123');
    expect(normalizeMeetingUrl('http://meet.google.com/abc')).toBe('http://meet.google.com/abc');
  });

  it('rechaza esquemas que abrirían algo inesperado', () => {
    expect(normalizeMeetingUrl('javascript:alert(1)')).toBeNull();
    expect(normalizeMeetingUrl('file:///etc/passwd')).toBeNull();
    expect(normalizeMeetingUrl('zoommtg://zoom.us/join?confno=1')).toBeNull();
  });

  it('devuelve nulo ante vacíos y texto que no es una dirección', () => {
    expect(normalizeMeetingUrl(null)).toBeNull();
    expect(normalizeMeetingUrl('   ')).toBeNull();
    expect(normalizeMeetingUrl('la sala de siempre')).toBeNull();
  });
});

describe('detectMeetingPlatform', () => {
  it('reconoce las plataformas habituales', () => {
    expect(detectMeetingPlatform('https://us02web.zoom.us/j/8412')).toBe('zoom');
    expect(detectMeetingPlatform('https://meet.google.com/abc-defg-hij')).toBe('meet');
    expect(detectMeetingPlatform('https://teams.microsoft.com/l/meetup-join/x')).toBe('teams');
    expect(detectMeetingPlatform('https://whereby.com/sala')).toBe('whereby');
    expect(detectMeetingPlatform('https://meet.jit.si/DeskaEntrevista')).toBe('jitsi');
  });

  it('reconoce un subdominio de la plataforma', () => {
    expect(detectMeetingPlatform('https://empresa.zoom.us/j/99')).toBe('zoom');
  });

  it('no se deja enganar por un dominio que solo contiene el nombre', () => {
    // El caso peligroso: parece Zoom y no lo es.
    expect(detectMeetingPlatform('https://zoom.empresa-falsa.com/j/1')).toBe('otra');
    expect(detectMeetingPlatform('https://notzoom.us/j/1')).toBe('otra');
  });

  it('una plataforma desconocida sigue siendo una videollamada', () => {
    expect(detectMeetingPlatform('https://videollamadas.empresa.com/sala/9')).toBe('otra');
  });

  it('ignora el prefijo www', () => {
    expect(detectMeetingPlatform('https://www.whereby.com/sala')).toBe('whereby');
  });

  it('devuelve nulo si no hay enlace utilizable', () => {
    expect(detectMeetingPlatform(null)).toBeNull();
    expect(detectMeetingPlatform('javascript:alert(1)')).toBeNull();
  });
});

describe('isJoinWindowOpen', () => {
  const iso = HORA.toISOString();

  it('se abre justo en el margen previo', () => {
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(-JOIN_OPENS_MINUTES_BEFORE))).toBe(true);
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(-JOIN_OPENS_MINUTES_BEFORE - 1))).toBe(false);
  });

  it('sigue abierta mientras la entrevista transcurre', () => {
    expect(isJoinWindowOpen(iso, HORA)).toBe(true);
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(30))).toBe(true);
  });

  it('se cierra pasada la ventana posterior', () => {
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(JOIN_CLOSES_MINUTES_AFTER))).toBe(true);
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(JOIN_CLOSES_MINUTES_AFTER + 1))).toBe(false);
  });

  it('no se abre el dia anterior ni el siguiente', () => {
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(-60 * 24))).toBe(false);
    expect(isJoinWindowOpen(iso, minutosDesdeLaHora(60 * 24))).toBe(false);
  });

  it('tolera fechas ausentes o ilegibles', () => {
    expect(isJoinWindowOpen(null, HORA)).toBe(false);
    expect(isJoinWindowOpen('no-es-una-fecha', HORA)).toBe(false);
  });

  it('mide el instante, no el dia: es igual en cualquier huso', () => {
    // El mismo momento escrito con dos desplazamientos distintos.
    expect(isJoinWindowOpen('2026-08-20T09:00:00.000-06:00', HORA)).toBe(true);
    expect(isJoinWindowOpen('2026-08-21T00:00:00.000+09:00', HORA)).toBe(true);
  });
});
