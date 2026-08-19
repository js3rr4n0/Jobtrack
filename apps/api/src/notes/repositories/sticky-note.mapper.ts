import {
  DEFAULT_NOTE_COLOR,
  StickyNote,
  clampNotePosition,
  isNoteColor,
} from '@deska/contracts';

import { NewStickyNoteRecord, StickyNotePatch } from './sticky-notes.repository';

/** Fila tal como la devuelve PostgreSQL, con nombres en snake_case. */
export interface StickyNoteRow {
  id: string;
  user_id: string;
  text: string;
  color: string;
  image_id: string | null;
  position_x: number | string | null;
  position_y: number | string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Traduce una fila al modelo de dominio. Sanea color y posición porque la fila
 * puede venir de una versión anterior del esquema o de una edición manual.
 */
export function toDomain(row: StickyNoteRow): StickyNote {
  const position = clampNotePosition(row.position_x, row.position_y);

  return {
    id: row.id,
    userId: row.user_id,
    text: row.text,
    color: isNoteColor(row.color) ? row.color : DEFAULT_NOTE_COLOR,
    imageId: row.image_id,
    x: position.x,
    y: position.y,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

export function toInsertRow(record: NewStickyNoteRecord): Omit<StickyNoteRow, 'id' | 'created_at' | 'updated_at'> {
  return {
    user_id: record.userId,
    text: record.text,
    color: record.color,
    image_id: record.imageId,
    position_x: record.x,
    position_y: record.y,
  };
}

const COLUMN_BY_FIELD: Record<keyof StickyNotePatch, keyof StickyNoteRow> = {
  text: 'text',
  color: 'color',
  imageId: 'image_id',
  x: 'position_x',
  y: 'position_y',
};

export function toUpdateRow(patch: StickyNotePatch): Record<string, unknown> {
  const row: Record<string, unknown> = {};

  for (const [field, column] of Object.entries(COLUMN_BY_FIELD)) {
    const value = patch[field as keyof StickyNotePatch];

    if (value !== undefined) {
      row[column] = value;
    }
  }

  return row;
}
