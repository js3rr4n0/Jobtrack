import { describe, expect, it } from 'vitest';
import type { BoardChangeEvent } from '@deska/contracts';
import { buildJobApplication } from '@deska/contracts';

import { applyRemoteChange, isOwnEcho, replaceApplication } from './board-state';

const event = (overrides: Partial<BoardChangeEvent>): BoardChangeEvent => ({
  kind: 'created',
  applicationId: 'nueva',
  application: buildJobApplication({ id: 'nueva' }),
  emittedAt: '2026-02-10T10:00:00.000Z',
  originId: null,
  ...overrides,
});

describe('applyRemoteChange', () => {
  it('agrega una postulación creada en otro dispositivo', () => {
    const result = applyRemoteChange([], event({}));

    expect(result).toHaveLength(1);
    expect(result[0].id).toBe('nueva');
  });

  it('reemplaza la versión local cuando la postulación ya existe', () => {
    const existing = buildJobApplication({ id: 'nueva', company: 'Versión antigua' });
    const incoming = buildJobApplication({ id: 'nueva', company: 'Versión nueva' });

    const result = applyRemoteChange([existing], event({ kind: 'updated', application: incoming }));

    expect(result).toHaveLength(1);
    expect(result[0].company).toBe('Versión nueva');
  });

  it('elimina la postulación borrada en otro dispositivo', () => {
    const existing = buildJobApplication({ id: 'nueva' });

    const result = applyRemoteChange(
      [existing],
      event({ kind: 'deleted', applicationId: 'nueva', application: null }),
    );

    expect(result).toHaveLength(0);
  });

  it('ignora un evento sin datos en lugar de corromper el tablero', () => {
    const existing = buildJobApplication({ id: 'nueva' });

    const result = applyRemoteChange([existing], event({ kind: 'updated', application: null }));

    expect(result).toEqual([existing]);
  });

  it('no muta el arreglo original', () => {
    const applications = [buildJobApplication({ id: 'a' })];

    applyRemoteChange(applications, event({}));

    expect(applications).toHaveLength(1);
  });
});

describe('replaceApplication', () => {
  it('sustituye la postulación conservando el orden', () => {
    const applications = [
      buildJobApplication({ id: 'a' }),
      buildJobApplication({ id: 'b', company: 'Antes' }),
    ];

    const result = replaceApplication(applications, buildJobApplication({ id: 'b', company: 'Después' }));

    expect(result.map((application) => application.id)).toEqual(['a', 'b']);
    expect(result[1].company).toBe('Después');
  });
});

describe('isOwnEcho', () => {
  it('reconoce los eventos originados en este dispositivo', () => {
    expect(isOwnEcho(event({ originId: 'dispositivo-a' }), 'dispositivo-a')).toBe(true);
  });

  it('no descarta eventos de otros dispositivos', () => {
    expect(isOwnEcho(event({ originId: 'dispositivo-b' }), 'dispositivo-a')).toBe(false);
  });

  it('no descarta eventos sin origen declarado', () => {
    expect(isOwnEcho(event({ originId: null }), 'dispositivo-a')).toBe(false);
  });
});
