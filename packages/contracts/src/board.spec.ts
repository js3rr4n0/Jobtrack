import { describe, expect, it } from 'vitest';

import {
  ALL_CATEGORIES,
  countUncategorized,
  diffBoardPositions,
  filterByCategory,
  groupIntoColumns,
  listCategories,
  reorderBoard,
  UNCATEGORIZED_CATEGORY,
} from './board';
import { APPLICATION_STATUSES } from './job-application';
import { buildJobApplication } from './test-factories';

const wishlistCard = (id: string, boardOrder: number) =>
  buildJobApplication({ id, status: 'wishlist', boardOrder });

describe('groupIntoColumns', () => {
  it('devuelve una columna por estado incluso sin postulaciones', () => {
    const columns = groupIntoColumns([]);

    expect(columns).toHaveLength(APPLICATION_STATUSES.length);
    expect(columns.every((column) => column.applications.length === 0)).toBe(true);
  });

  it('ordena cada columna por su posición en el tablero', () => {
    const columns = groupIntoColumns([wishlistCard('c', 2), wishlistCard('a', 0), wishlistCard('b', 1)]);
    const wishlist = columns.find((column) => column.status === 'wishlist');

    expect(wishlist?.applications.map((application) => application.id)).toEqual(['a', 'b', 'c']);
  });

  it('desempata posiciones iguales por fecha de creación', () => {
    const columns = groupIntoColumns([
      buildJobApplication({ id: 'nueva', boardOrder: 0, createdAt: '2026-02-02T00:00:00.000Z' }),
      buildJobApplication({ id: 'antigua', boardOrder: 0, createdAt: '2026-01-01T00:00:00.000Z' }),
    ]);
    const wishlist = columns.find((column) => column.status === 'wishlist');

    expect(wishlist?.applications.map((application) => application.id)).toEqual([
      'antigua',
      'nueva',
    ]);
  });
});

describe('reorderBoard', () => {
  it('devuelve el tablero intacto si la tarjeta no existe', () => {
    const applications = [wishlistCard('a', 0)];

    expect(reorderBoard(applications, 'inexistente', 'applied', 0)).toEqual(applications);
  });

  it('renumera la columna destino sin dejar huecos', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1), wishlistCard('c', 2)];

    const result = reorderBoard(applications, 'c', 'wishlist', 0);
    const wishlist = groupIntoColumns(result)[0];

    expect(wishlist.applications.map((application) => application.id)).toEqual(['c', 'a', 'b']);
    expect(wishlist.applications.map((application) => application.boardOrder)).toEqual([0, 1, 2]);
  });

  it('renumera también la columna de origen al cambiar de estado', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1), wishlistCard('c', 2)];

    const result = reorderBoard(applications, 'a', 'applied', 0);
    const columns = groupIntoColumns(result);
    const wishlist = columns.find((column) => column.status === 'wishlist');
    const applied = columns.find((column) => column.status === 'applied');

    expect(wishlist?.applications.map((application) => application.boardOrder)).toEqual([0, 1]);
    expect(applied?.applications.map((application) => application.id)).toEqual(['a']);
    expect(applied?.applications[0].status).toBe('applied');
  });

  it('acota indices fuera de rango al final de la columna', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1)];

    const result = reorderBoard(applications, 'a', 'wishlist', 50);
    const wishlist = groupIntoColumns(result)[0];

    expect(wishlist.applications.map((application) => application.id)).toEqual(['b', 'a']);
  });

  it('trata indices negativos como el inicio de la columna', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1)];

    const result = reorderBoard(applications, 'b', 'wishlist', -5);
    const wishlist = groupIntoColumns(result)[0];

    expect(wishlist.applications.map((application) => application.id)).toEqual(['b', 'a']);
  });

  it('no pierde postulaciones de columnas ajenas al movimiento', () => {
    const applications = [
      wishlistCard('a', 0),
      buildJobApplication({ id: 'x', status: 'offer', boardOrder: 0 }),
      buildJobApplication({ id: 'y', status: 'hired', boardOrder: 0 }),
    ];

    const result = reorderBoard(applications, 'a', 'applied', 0);

    expect(result).toHaveLength(3);
    expect(result.map((application) => application.id).sort()).toEqual(['a', 'x', 'y']);
  });

  it('es idempotente al mover una tarjeta a su posición actual', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1)];

    const result = reorderBoard(applications, 'a', 'wishlist', 0);

    expect(groupIntoColumns(result)[0].applications.map((application) => application.id)).toEqual([
      'a',
      'b',
    ]);
  });
});

describe('diffBoardPositions', () => {
  it('no reporta cambios cuando el tablero no se movio', () => {
    const applications = [wishlistCard('a', 0), wishlistCard('b', 1)];

    expect(diffBoardPositions(applications, applications)).toHaveLength(0);
  });

  it('reporta unicamente las tarjetas cuya posición o estado cambio', () => {
    const before = [wishlistCard('a', 0), wishlistCard('b', 1), wishlistCard('c', 2)];
    const after = reorderBoard(before, 'c', 'wishlist', 0);

    const changed = diffBoardPositions(before, after).map((application) => application.id).sort();

    expect(changed).toEqual(['a', 'b', 'c']);
  });
});

describe('categorías', () => {
  const withCategory = (id: string, category: string | null) =>
    buildJobApplication({ id, category });

  it('no encuentra áreas en un tablero sin clasificar', () => {
    expect(listCategories([withCategory('a', null)])).toEqual([]);
  });

  it('agrupa y cuenta cada área', () => {
    const categories = listCategories([
      withCategory('a', 'Desarrollo'),
      withCategory('b', 'Marketing'),
      withCategory('c', 'Desarrollo'),
    ]);

    expect(categories).toEqual([
      { name: 'Desarrollo', total: 2 },
      { name: 'Marketing', total: 1 },
    ]);
  });

  it('trata los espacios sobrantes como parte del mismo área', () => {
    expect(listCategories([withCategory('a', 'Diseño'), withCategory('b', '  Diseño  ')])).toEqual([
      { name: 'Diseño', total: 2 },
    ]);
  });

  it('descarta áreas en blanco', () => {
    expect(listCategories([withCategory('a', '   ')])).toEqual([]);
    expect(countUncategorized([withCategory('a', '   ')])).toBe(1);
  });

  it('filtra por área y devuelve el tablero completo con todas', () => {
    const applications = [withCategory('a', 'Marketing'), withCategory('b', 'Desarrollo')];

    expect(filterByCategory(applications, 'Marketing').map((item) => item.id)).toEqual(['a']);
    expect(filterByCategory(applications, ALL_CATEGORIES)).toHaveLength(2);
  });

  it('devuelve vacío para un área inexistente', () => {
    expect(filterByCategory([withCategory('a', 'Marketing')], 'Ventas')).toEqual([]);
  });

  it('reúne lo que no tiene área en su propia vista', () => {
    const applications = [
      withCategory('a', 'Marketing'),
      withCategory('b', null),
      withCategory('c', '   '),
    ];

    expect(filterByCategory(applications, UNCATEGORIZED_CATEGORY).map((item) => item.id)).toEqual([
      'b',
      'c',
    ]);
  });

  it('usa identificadores que ningún área escrita puede suplantar', () => {
    // Las áreas se recortan antes de guardarse, así que un área no puede
    // empezar por espacio y colisionar con las vistas especiales.
    for (const sentinel of [ALL_CATEGORIES, UNCATEGORIZED_CATEGORY]) {
      expect(sentinel.trim()).not.toBe(sentinel);
      expect(listCategories([withCategory('a', sentinel)])).toEqual([
        { name: sentinel.trim(), total: 1 },
      ]);
    }
  });
});

describe('la marca de avance al reordenar', () => {
  it('sube cuando la tarjeta pasa a una etapa mas adelantada', () => {
    const tablero = reorderBoard(
      [buildJobApplication({ id: 'a', status: 'applied', furthestStatus: 'applied' })],
      'a',
      'interview',
      0,
    );

    expect(tablero[0].furthestStatus).toBe('interview');
  });

  it('no baja cuando la tarjeta vuelve a una etapa anterior', () => {
    const tablero = reorderBoard(
      [buildJobApplication({ id: 'a', status: 'hired', furthestStatus: 'hired' })],
      'a',
      'wishlist',
      0,
    );

    expect(tablero[0].status).toBe('wishlist');
    expect(tablero[0].furthestStatus).toBe('hired');
  });
});
