import { describe, expect, it } from 'vitest';
import { buildJobApplication, groupIntoColumns } from '@deska/contracts';

import { columnDroppableId, resolveDropTarget } from './drag-and-drop';

const columns = groupIntoColumns([
  buildJobApplication({ id: 'a', status: 'wishlist', boardOrder: 0 }),
  buildJobApplication({ id: 'b', status: 'wishlist', boardOrder: 1 }),
  buildJobApplication({ id: 'c', status: 'applied', boardOrder: 0 }),
]);

describe('resolveDropTarget', () => {
  it('ignora un arrastre soltado fuera del tablero', () => {
    expect(resolveDropTarget(columns, 'a', null)).toBeNull();
  });

  it('ignora soltar una tarjeta sobre si misma', () => {
    expect(resolveDropTarget(columns, 'a', 'a')).toBeNull();
  });

  it('ignora una tarjeta que no pertenece al tablero', () => {
    expect(resolveDropTarget(columns, 'desconocida', 'c')).toBeNull();
  });

  it('coloca la tarjeta en la posición de la tarjeta destino', () => {
    expect(resolveDropTarget(columns, 'b', 'a')).toEqual({ status: 'wishlist', boardOrder: 0 });
  });

  it('mueve a otra columna al soltar sobre una tarjeta ajena', () => {
    expect(resolveDropTarget(columns, 'a', 'c')).toEqual({ status: 'applied', boardOrder: 0 });
  });

  it('anexa al final al soltar sobre el área vacía de otra columna', () => {
    expect(resolveDropTarget(columns, 'a', columnDroppableId('interview'))).toEqual({
      status: 'interview',
      boardOrder: 0,
    });
  });

  it('no genera movimiento al soltar en la propia columna sin cambiar de posición', () => {
    expect(resolveDropTarget(columns, 'b', columnDroppableId('wishlist'))).toBeNull();
  });

  it('descarta identificadores de columna que no existen', () => {
    expect(resolveDropTarget(columns, 'a', 'columna:inventada')).toBeNull();
  });
});
